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
        stakes: true,
        stakeHistory: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const activeStakes = agent.stakes.filter((s) => s.status === "ACTIVE");
    const unstakingStakes = agent.stakes.filter((s) => s.status === "UNSTAKING_REQUESTED");

    const totalBonded = activeStakes.reduce((sum, s) => sum + s.bondedAmount, 0);
    const totalPending = unstakingStakes.reduce((sum, s) => sum + s.bondedAmount, 0);
    const minRequired = 100.0;

    const formattedHistory = agent.stakeHistory.map((h) => ({
      id: h.id,
      amount: h.amount,
      type: h.actionType,
      txHash: h.txHash,
      createdAt: h.timestamp.toISOString(),
    }));

    return NextResponse.json({
      agentId: agent.id,
      agentName: agent.name,
      name: agent.name,
      bondedStake: totalBonded,
      pendingUnstake: totalPending,
      totalStaked: totalBonded + totalPending,
      minRequired,
      minStakeRequirement: minRequired,
      stakeSufficient: totalBonded >= minRequired,
      activeStakes: agent.stakes,
      history: formattedHistory,
    });
  } catch (error: any) {
    console.error(`GET /api/agents/${params.id}/stake error:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch staking info" }, { status: 500 });
  }
}
