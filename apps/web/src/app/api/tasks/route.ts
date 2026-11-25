import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTaskSchema = z.object({
  requestingAgentId: z.string().min(1),
  executingAgentId: z.string().min(1),
  title: z.string().min(3).max(128),
  description: z.string().min(5).max(1000),
  taskValue: z.number().positive(),
  deadlineHours: z.number().positive().default(48),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTaskSchema.parse(body);

    // Verify agents exist
    const [requester, executor] = await Promise.all([
      prisma.agent.findUnique({ where: { id: validated.requestingAgentId } }),
      prisma.agent.findUnique({ where: { id: validated.executingAgentId } }),
    ]);

    if (!requester || !executor) {
      return NextResponse.json({ error: "One or both agent IDs not found" }, { status: 404 });
    }

    if (requester.id === executor.id) {
      return NextResponse.json({ error: "Agent cannot assign task to itself" }, { status: 400 });
    }

    const taskId = `TSK-${Date.now().toString().slice(-6)}`;
    const deadline = new Date(Date.now() + validated.deadlineHours * 3600000);

    const task = await prisma.task.create({
      data: {
        taskId,
        requestingAgentId: requester.id,
        executingAgentId: executor.id,
        title: validated.title,
        description: validated.description,
        taskValue: validated.taskValue,
        deadline,
        status: "CREATED",
        isSimulated: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: "TASK",
        entityId: task.id,
        action: "CREATED",
        actorAddress: requester.operatorAddress,
        detailsJson: JSON.stringify({ taskId, executorId: executor.id, value: validated.taskValue }),
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/tasks error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create task" }, { status: 500 });
  }
}
