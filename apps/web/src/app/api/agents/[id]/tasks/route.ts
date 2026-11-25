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

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { executingAgentId: agent.id },
          { requestingAgentId: agent.id },
        ],
      },
      include: {
        requestingAgent: { select: { id: true, name: true } },
        executingAgent: { select: { id: true, name: true } },
        evidences: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error(`GET /api/agents/${params.id}/tasks error:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch tasks" }, { status: 500 });
  }
}
