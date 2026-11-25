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
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderAgentId: agent.id },
          { receiverAgentId: agent.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, walletAddress: true } },
        receiver: { select: { id: true, name: true, walletAddress: true } },
      },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error(`GET /api/agents/${params.id}/transactions error:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch transactions" }, { status: 500 });
  }
}
