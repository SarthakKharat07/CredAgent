import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateReputationScore } from "@cerdagent/reputation-engine";

const verifyTaskSchema = z.object({
  approved: z.boolean(),
  notes: z.string().min(1).max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskIdOrId = params.id;
    const body = await request.json();
    const validated = verifyTaskSchema.parse(body);

    const task = await prisma.task.findFirst({
      where: {
        OR: [{ id: taskIdOrId }, { taskId: taskIdOrId }],
      },
      include: {
        executingAgent: {
          include: {
            reputationProfile: true,
            executedTasks: true,
            sentTransactions: true,
            receivedTransactions: true,
            stakes: { where: { status: "ACTIVE" } },
            counterDisputes: { where: { status: "RESOLVED_REQUESTER" } },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status !== "SUBMITTED") {
      return NextResponse.json({ error: `Task status is '${task.status}', must be SUBMITTED to verify` }, { status: 400 });
    }

    const newStatus = validated.approved ? "VERIFIED" : "REJECTED";

    // 1. Update task verification status
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        status: newStatus,
        verifiedAt: new Date(),
        reviewerNotes: validated.notes,
      },
    });

    // 2. Recalculate executor agent's reputation score
    const executor = task.executingAgent;
    const allTasks = executor.executedTasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t));
    const allTx = [...executor.sentTransactions, ...executor.receivedTransactions];

    const verifiedCount = allTasks.filter((t) => t.status === "VERIFIED").length;
    const rejectedCount = allTasks.filter((t) => t.status === "REJECTED").length;
    const successfulTx = allTx.filter((t) => t.status === "COMPLETED").length;
    const failedTx = allTx.filter((t) => t.status === "FAILED").length;
    const bondedStake = executor.stakes.reduce((acc, s) => acc + s.bondedAmount, executor.bondedStake);

    const oldScore = executor.reputationScore;
    const newRep = calculateReputationScore({
      agentId: executor.id,
      totalTransactions: allTx.length,
      successfulTransactions: successfulTx,
      failedTransactions: failedTx,
      cancelledTransactions: allTx.filter((t) => t.status === "CANCELLED").length,
      disputedTransactions: allTx.filter((t) => t.status === "DISPUTED").length,
      totalVolumeCred: allTx.reduce((acc, t) => acc + t.amount, 0),
      totalTasks: allTasks.length,
      verifiedTasks: verifiedCount,
      rejectedTasks: rejectedCount,
      pendingTasks: allTasks.filter((t) => t.status === "SUBMITTED" || t.status === "ACCEPTED").length,
      totalPayments: executor.sentTransactions.length,
      settledPayments: executor.sentTransactions.filter((t) => t.status === "COMPLETED").length,
      failedPayments: executor.sentTransactions.filter((t) => t.status === "FAILED").length,
      bondedStake: bondedStake,
      minStakeRequirement: 100.0,
      substantiatedDisputes: executor.counterDisputes.length,
      resolvedDisputesInFavor: 0,
      unresolvedDisputes: 0,
      previousScore: oldScore,
    });

    const delta = newRep.score - oldScore;

    // 3. Persist new reputation score & history
    await prisma.$transaction([
      prisma.agent.update({
        where: { id: executor.id },
        data: {
          reputationScore: newRep.score,
          creditTier: newRep.creditTier,
          riskCategory: newRep.riskCategory,
        },
      }),
      prisma.reputationScore.upsert({
        where: { agentId: executor.id },
        create: {
          agentId: executor.id,
          currentScore: newRep.score,
          previousScore: oldScore,
          trend: newRep.trend,
          confidenceLevel: newRep.confidenceLevel,
          riskCategory: newRep.riskCategory,
          rawScore: newRep.rawScore,
          confidenceMultiplier: newRep.confidenceMultiplier,
          updatedAt: new Date(),
        },
        update: {
          previousScore: oldScore,
          currentScore: newRep.score,
          trend: newRep.trend,
          confidenceLevel: newRep.confidenceLevel,
          riskCategory: newRep.riskCategory,
          rawScore: newRep.rawScore,
          confidenceMultiplier: newRep.confidenceMultiplier,
          updatedAt: new Date(),
        },
      }),
      prisma.reputationHistory.create({
        data: {
          agentId: executor.id,
          score: newRep.score,
          changeDelta: delta,
          reason: `Task ${task.taskId} ${newStatus}: ${validated.notes}`,
        },
      }),
      prisma.auditLog.create({
        data: {
          entityType: "TASK",
          entityId: task.id,
          action: newStatus,
          actorAddress: "0xVerifier",
          detailsJson: JSON.stringify({ oldScore, newScore: newRep.score, delta }),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      task: updatedTask,
      reputationUpdate: {
        agentId: executor.id,
        oldScore,
        newScore: newRep.score,
        delta,
        creditTier: newRep.creditTier,
        riskCategory: newRep.riskCategory,
      },
    });
  } catch (error: any) {
    console.error(`POST /api/tasks/${params.id}/verify error:`, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to verify task" }, { status: 500 });
  }
}
