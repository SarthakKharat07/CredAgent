import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;

    const agent = await prisma.agent.findFirst({
      where: {
        OR: [{ id: agentId }, { walletAddress: agentId }],
      },
      include: {
        reputationProfile: true,
        stakes: { where: { status: "ACTIVE" } },
        sentTransactions: true,
        receivedTransactions: true,
        executedTasks: true,
        counterDisputes: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const allTx = [...agent.sentTransactions, ...agent.receivedTransactions];
    const successfulTx = allTx.filter((t) => t.status === "COMPLETED").length;
    const totalVolume = allTx.reduce((sum, t) => sum + t.amount, 0);
    const verifiedTasks = agent.executedTasks.filter((t: { status: string }) => t.status === "VERIFIED").length;
    const bondedStake = agent.stakes.reduce((sum: number, s: { bondedAmount: number }) => sum + s.bondedAmount, agent.bondedStake);

    return NextResponse.json({
      agentIdentity: {
        id: agent.id,
        name: agent.name,
        category: agent.category,
        walletAddress: agent.walletAddress,
        operatorAddress: agent.operatorAddress,
        verificationStatus: agent.verificationStatus,
        registeredAt: agent.registeredAt,
      },
      reputationScore: agent.reputationScore,
      creditTier: agent.creditTier,
      riskCategory: agent.riskCategory,
      confidence: agent.reputationProfile?.confidenceLevel || "MEDIUM",
      historicalTransactions: allTx.length,
      successfulTransactions: successfulTx,
      totalTransactionVolume: totalVolume,
      verifiedTaskCompletion: verifiedTasks,
      totalTasks: agent.executedTasks.length,
      bondedStake: bondedStake,
      disputeHistory: {
        totalDisputes: agent.counterDisputes.length,
        substantiated: agent.counterDisputes.filter((d: { status: string }) => d.status === "RESOLVED_REQUESTER").length,
      },
      reputationTrend: agent.reputationProfile?.trend || "STABLE",
      lastActivity: agent.updatedAt,
      isSimulated: agent.isSimulated,
    });
  } catch (error: any) {
    console.error(`GET /api/agents/${params.id}/credit-profile error:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch credit profile" }, { status: 500 });
  }
}
