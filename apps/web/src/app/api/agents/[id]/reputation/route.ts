import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateReputationScore } from "@cerdagent/reputation-engine";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;

    const agent = await prisma.agent.findFirst({
      where: {
        OR: [
          { id: agentId },
          { walletAddress: agentId },
        ],
      },
      include: {
        reputationProfile: true,
        reputationHistory: {
          orderBy: { timestamp: "desc" },
        },
        sentTransactions: true,
        receivedTransactions: true,
        executedTasks: true,
        stakes: { where: { status: "ACTIVE" } },
        counterDisputes: { where: { status: "RESOLVED_REQUESTER" } },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const allTx = [...agent.sentTransactions, ...agent.receivedTransactions];
    const successfulTx = allTx.filter((t) => t.status === "COMPLETED").length;
    const failedTx = allTx.filter((t) => t.status === "FAILED").length;
    const disputedTx = allTx.filter((t) => t.status === "DISPUTED").length;
    const totalVolume = allTx.reduce((acc, t) => acc + t.amount, 0);

    const verifiedTasks = agent.executedTasks.filter((t: { status: string }) => t.status === "VERIFIED").length;
    const rejectedTasks = agent.executedTasks.filter((t: { status: string }) => t.status === "REJECTED").length;

    const bondedStake = agent.stakes.reduce((acc: number, s: { bondedAmount: number }) => acc + s.bondedAmount, agent.bondedStake);

    // Calculate live deterministic score
    const computed = calculateReputationScore({
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
      pendingTasks: agent.executedTasks.filter((t: { status: string }) => t.status === "SUBMITTED" || t.status === "ACCEPTED").length,
      totalPayments: agent.sentTransactions.length,
      settledPayments: agent.sentTransactions.filter((t: { status: string }) => t.status === "COMPLETED").length,
      failedPayments: agent.sentTransactions.filter((t: { status: string }) => t.status === "FAILED").length,
      bondedStake: bondedStake,
      minStakeRequirement: 100.0,
      substantiatedDisputes: agent.counterDisputes.length,
      resolvedDisputesInFavor: 0,
      unresolvedDisputes: 0,
      previousScore: agent.reputationProfile?.previousScore ?? agent.reputationScore,
    });

    return NextResponse.json({
      agentId: agent.id,
      name: agent.name,
      reputationScore: computed.score,
      rawScore: computed.rawScore,
      previousScore: computed.previousScore,
      trend: computed.trend,
      confidence: computed.confidenceLevel,
      confidenceMultiplier: computed.confidenceMultiplier,
      creditTier: computed.creditTier,
      riskCategory: computed.riskCategory,
      verifiedTasks: verifiedTasks,
      successfulTransactions: successfulTx,
      disputedTransactions: disputedTx,
      bondedStake: bondedStake,
      breakdown: computed.breakdown,
      explanation: computed.explanation,
      history: agent.reputationHistory,
      updatedAt: agent.reputationProfile?.updatedAt ?? agent.updatedAt,
    });
  } catch (error: any) {
    console.error(`GET /api/agents/${params.id}/reputation error:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch reputation" }, { status: 500 });
  }
}
