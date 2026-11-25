import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const createKeySchema = z.object({
  name: z.string().min(3).max(64),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  tier: z.enum(["FREE", "DEVELOPER", "ENTERPRISE"]).default("DEVELOPER"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createKeySchema.parse(body);

    const rawKey = `cerd_${validated.tier.toLowerCase()}_${crypto.randomBytes(16).toString("hex")}`;
    const rateLimit = validated.tier === "ENTERPRISE" ? 300 : validated.tier === "DEVELOPER" ? 120 : 30;

    const apiKey = await prisma.apiKey.create({
      data: {
        keyHash: rawKey,
        name: validated.name,
        ownerAddress: validated.ownerAddress,
        tier: validated.tier,
        rateLimitPerMin: rateLimit,
        isActive: true,
      },
    });

    return NextResponse.json({
      apiKey: rawKey,
      name: apiKey.name,
      tier: apiKey.tier,
      rateLimitPerMin: apiKey.rateLimitPerMin,
      createdAt: apiKey.createdAt,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/keys error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create API key" }, { status: 500 });
  }
}
