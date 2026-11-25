import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateReputationScore } from "@cerdagent/reputation-engine";

const registerAgentSchema = z.object({
  agentId: z.string().min(3).max(32).regex(/^[A-Z0-9_-]+$/i, "Invalid agent ID format"),
  name: z.string().min(2).max(64),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"),
  operatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid operator address").optional(),
  category: z.enum([
    "Research",
    "Trading",
    "Payment",
    "Coding",
    "DataAnalysis",
    "DeFi",
    "AutonomousService",
  ]),
  description: z.string().min(5).max(1000),
  metadataUri: z.string().default("ipfs://bafybeicerdagent/default-meta.json"),
  initialStake: z.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const riskCategory = searchParams.get("riskCategory");
    const creditTier = searchParams.get("creditTier");
    const search = searchParams.get("search");

    const where: any = {};

    if (category && category !== "ALL") {
      where.category = category;
    }
    if (riskCategory && riskCategory !== "ALL") {
      where.riskCategory = riskCategory;
    }
    if (creditTier && creditTier !== "ALL") {
      where.creditTier = creditTier;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { id: { contains: search } },
        { walletAddress: { contains: search } },
      ];
    }

    const agents = await prisma.agent.findMany({
      where,
      orderBy: { reputationScore: "desc" },
      include: {
        reputationProfile: true,
        stakes: {
          where: { status: "ACTIVE" },
        },
      },
    });

    return NextResponse.json(agents);
  } catch (error: any) {
    console.error("GET /api/agents error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch agents" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerAgentSchema.parse(body);

    // Check for existing agent
    const existing = await prisma.agent.findFirst({
      where: {
        OR: [
          { id: validated.agentId },
          { walletAddress: validated.walletAddress },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Agent with this ID or wallet address already exists" },
        { status: 409 }
      );
    }

    const operatorAddress = validated.operatorAddress || validated.walletAddress;

    // Calculate baseline initial reputation using scoring engine
    const initialReputation = calculateReputationScore({
      agentId: validated.agentId,
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      cancelledTransactions: 0,
      disputedTransactions: 0,
      totalVolumeCred: 0,
      totalTasks: 0,
      verifiedTasks: 0,
      rejectedTasks: 0,
      pendingTasks: 0,
      totalPayments: 0,
      settledPayments: 0,
      failedPayments: 0,
      bondedStake: validated.initialStake,
      minStakeRequirement: 100.0,
      substantiatedDisputes: 0,
      resolvedDisputesInFavor: 0,
      unresolvedDisputes: 0,
    });

    const agent = await prisma.agent.create({
      data: {
        id: validated.agentId,
        name: validated.name,
        walletAddress: validated.walletAddress,
        operatorAddress,
        description: validated.description,
        category: validated.category,
        metadataUri: validated.metadataUri,
        verificationStatus: "PENDING",
        reputationScore: initialReputation.score,
        creditTier: initialReputation.creditTier,
        riskCategory: initialReputation.riskCategory,
        bondedStake: validated.initialStake,
        isSimulated: false, // Live registered agent
        wallets: {
          create: {
            walletAddress: validated.walletAddress,
            chainId: 84532,
            isPrimary: true,
          },
        },
        reputationProfile: {
          create: {
            currentScore: initialReputation.score,
            previousScore: initialReputation.score,
            trend: "STABLE",
            confidenceLevel: initialReputation.confidenceLevel,
            riskCategory: initialReputation.riskCategory,
            transactionReliability: 0.5,
            taskCompletionReliability: 0.5,
            paymentReliability: 0.5,
            stakeReliability: initialReputation.breakdown.bondedStake.normalizedRatio,
            disputeReliability: 1.0,
            rawScore: initialReputation.rawScore,
            confidenceMultiplier: initialReputation.confidenceMultiplier,
            totalEvaluatedTransactions: 0,
            totalEvaluatedTasks: 0,
          },
        },
        reputationHistory: {
          create: {
            score: initialReputation.score,
            changeDelta: 0,
            reason: "Initial agent identity registration",
          },
        },
        ...(validated.initialStake > 0
          ? {
              stakes: {
                create: {
                  tokenAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                  bondedAmount: validated.initialStake,
                  minStakeRequirement: 100.0,
                  status: "ACTIVE",
                },
              },
              stakeHistory: {
                create: {
                  actionType: "DEPOSIT",
                  amount: validated.initialStake,
                  reason: "Initial registration collateral",
                },
              },
            }
          : {}),
      },
      include: {
        reputationProfile: true,
        stakes: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        entityType: "AGENT",
        entityId: agent.id,
        action: "REGISTERED",
        actorAddress: operatorAddress,
        detailsJson: JSON.stringify({ name: agent.name, category: agent.category }),
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/agents error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to register agent" }, { status: 500 });
  }
}
