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
        OR: [
          { id: agentId },
          { walletAddress: agentId },
        ],
      },
      include: {
        wallets: true,
        reputationProfile: true,
        reputationHistory: {
          orderBy: { timestamp: "desc" },
          take: 15,
        },
        stakes: true,
        stakeHistory: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
        sentTransactions: {
          orderBy: { timestamp: "desc" },
          take: 10,
          include: { receiver: { select: { id: true, name: true } } },
        },
        receivedTransactions: {
          orderBy: { timestamp: "desc" },
          take: 10,
          include: { sender: { select: { id: true, name: true } } },
        },
        executedTasks: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { requestingAgent: { select: { id: true, name: true } } },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error: any) {
    console.error(`GET /api/agents/${params.id} error:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch agent profile" }, { status: 500 });
  }
}
