import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createDisputeSchema = z.object({
  initiatorAgentId: z.string().min(1),
  counterpartyAgentId: z.string().min(1),
  transactionId: z.string().optional(),
  taskId: z.string().optional(),
  reason: z.string().min(5).max(500),
  evidenceUri: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createDisputeSchema.parse(body);

    const [initiator, counterparty] = await Promise.all([
      prisma.agent.findUnique({ where: { id: validated.initiatorAgentId } }),
      prisma.agent.findUnique({ where: { id: validated.counterpartyAgentId } }),
    ]);

    if (!initiator || !counterparty) {
      return NextResponse.json({ error: "One or both agents not found" }, { status: 404 });
    }

    const disputeId = `DSP-${Date.now().toString().slice(-6)}`;

    const dispute = await prisma.dispute.create({
      data: {
        disputeId,
        initiatorAgentId: initiator.id,
        counterpartyAgentId: counterparty.id,
        transactionId: validated.transactionId,
        taskId: validated.taskId,
        reason: validated.reason,
        status: "OPEN",
        evidences: {
          create: {
            submitterAgentId: initiator.id,
            evidenceUri: validated.evidenceUri,
            evidenceHash: `0x${Buffer.from(validated.evidenceUri).toString("hex").slice(0, 32)}`,
            explanation: validated.reason,
          },
        },
      },
      include: {
        evidences: true,
      },
    });

    // If transaction linked, update status to DISPUTED
    if (validated.transactionId) {
      await prisma.transaction.update({
        where: { id: validated.transactionId },
        data: { status: "DISPUTED" },
      }).catch(() => {});
    }

    await prisma.auditLog.create({
      data: {
        entityType: "DISPUTE",
        entityId: dispute.id,
        action: "RAISED",
        actorAddress: initiator.operatorAddress,
        detailsJson: JSON.stringify({ disputeId, counterparty: counterparty.id }),
      },
    });

    return NextResponse.json(dispute, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/disputes error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create dispute" }, { status: 500 });
  }
}
