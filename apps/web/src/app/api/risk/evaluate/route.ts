import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  calculateReputationScore,
  evaluateCounterpartyRisk,
  AgentCategory,
} from "@cerdagent/reputation-engine";

const evaluateRiskSchema = z.object({
  targetAgentId: z.string().min(1),
  proposedAmountCred: z.number().positive(),
  category: z.enum([
    "Research",
    "Trading",
    "Payment",
    "Coding",
    "DataAnalysis",
    "DeFi",
    "AutonomousService",
  ]),
  durationHours: z.number().positive().optional().default(24),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = evaluateRiskSchema.parse(body);

    const agent = await prisma.agent.findFirst({
      where: {
        OR: [
          { id: validated.targetAgentId },
          { walletAddress: validated.targetAgentId },
        ],
      },
      include: {
        reputationProfile: true,
        sentTransactions: true,
        receivedTransactions: true,
        executedTasks: true,
        stakes: { where: { status: "ACTIVE" } },
        counterDisputes: { where: { status: "RESOLVED_REQUESTER" } },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Target agent not found" }, { status: 404 });
    }

    const allTx = [...agent.sentTransactions, ...agent.receivedTransactions];
    const successfulTx = allTx.filter((t) => t.status === "COMPLETED").length;
    const failedTx = allTx.filter((t) => t.status === "FAILED").length;
    const disputedTx = allTx.filter((t) => t.status === "DISPUTED").length;
    const totalVolume = allTx.reduce((sum, t) => sum + t.amount, 0);

    const verifiedTasks = agent.executedTasks.filter((t) => t.status === "VERIFIED").length;
    const rejectedTasks = agent.executedTasks.filter((t) => t.status === "REJECTED").length;
    const bondedStake = agent.stakes.reduce((acc, s) => acc + s.bondedAmount, agent.bondedStake);

    // 1. Calculate live deterministic reputation
    const reputation = calculateReputationScore({
      agentId: agent.id,
      totalTransactions: allTx.length,
      successfulTransactions: successfulTx,
      failedTransactions: failedTx,
      cancelledTransactions: allTx.filter((t) => t.status === "CANCELLED").length,
      disputedTransactions: disputedTx,
      totalVolumeCred: totalVolume,
      totalTasks: agent.executedTasks.length,
      verifiedTasks: verifiedTasks,
      rejectedTasks: rejectedTasks,
      pendingTasks: agent.executedTasks.filter((t) => t.status === "SUBMITTED" || t.status === "ACCEPTED").length,
      totalPayments: agent.sentTransactions.length,
      settledPayments: agent.sentTransactions.filter((t) => t.status === "COMPLETED").length,
      failedPayments: agent.sentTransactions.filter((t) => t.status === "FAILED").length,
      bondedStake: bondedStake,
      minStakeRequirement: 100.0,
      substantiatedDisputes: agent.counterDisputes.length,
      resolvedDisputesInFavor: 0,
      unresolvedDisputes: 0,
      previousScore: agent.reputationScore,
    });

    // 2. Run Counterparty Risk Evaluation
    const evaluation = evaluateCounterpartyRisk(
      {
        agentId: agent.id,
        name: agent.name,
        walletAddress: agent.walletAddress,
        category: agent.category as AgentCategory,
        verificationStatus: agent.verificationStatus,
        bondedStake: bondedStake,
        totalTransactions: allTx.length,
        successfulTransactions: successfulTx,
        failedTransactions: failedTx,
        disputedTransactions: disputedTx,
        totalTasks: agent.executedTasks.length,
        verifiedTasks: verifiedTasks,
        substantiatedDisputes: agent.counterDisputes.length,
      },
      {
        targetAgentId: agent.id,
        proposedAmountCred: validated.proposedAmountCred,
        category: validated.category as AgentCategory,
        durationHours: validated.durationHours,
      },
      reputation
    );

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error("POST /api/risk/evaluate error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to evaluate risk" }, { status: 500 });
  }
}
