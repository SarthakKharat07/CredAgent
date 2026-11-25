import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const submitEvidenceSchema = z.object({
  evidenceUri: z.string().min(1),
  evidenceHash: z.string().optional(),
  description: z.string().min(3),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskIdOrId = params.id;
    const body = await request.json();
    const validated = submitEvidenceSchema.parse(body);

    const task = await prisma.task.findFirst({
      where: {
        OR: [{ id: taskIdOrId }, { taskId: taskIdOrId }],
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status === "VERIFIED" || task.status === "REJECTED") {
      return NextResponse.json({ error: `Cannot submit evidence for finalized task (${task.status})` }, { status: 400 });
    }

    const hash = validated.evidenceHash || `0x${Buffer.from(validated.evidenceUri).toString("hex").slice(0, 32)}`;

    // Create evidence record and update task status to SUBMITTED
    const [evidence, updatedTask] = await prisma.$transaction([
      prisma.taskEvidence.create({
        data: {
          taskId: task.id,
          submitterAgentId: task.executingAgentId,
          evidenceUri: validated.evidenceUri,
          evidenceHash: hash,
          description: validated.description,
        },
      }),
      prisma.task.update({
        where: { id: task.id },
        data: {
          status: "SUBMITTED",
          evidenceUri: validated.evidenceUri,
          completedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true, task: updatedTask, evidence });
  } catch (error: any) {
    console.error(`POST /api/tasks/${params.id}/submit error:`, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to submit evidence" }, { status: 500 });
  }
}
