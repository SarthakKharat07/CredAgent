import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalAgents,
      verifiedAgents,
      totalTransactions,
      allTransactions,
      allAgents,
      allStakes,
      totalTasks,
      totalDisputes,
      recentTransactions,
    ] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.transaction.count(),
      prisma.transaction.findMany({
        select: { amount: true, status: true, settlementTimeSeconds: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.agent.findMany({
        select: { id: true, name: true, reputationScore: true, creditTier: true, riskCategory: true, category: true, verificationStatus: true },
      }),
      prisma.stake.findMany({ where: { status: "ACTIVE" }, select: { bondedAmount: true } }),
      prisma.task.count(),
      prisma.dispute.count(),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
      }),
    ]);

    const totalVolume = allTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);
    const completedTransactions = allTransactions.filter((t) => t.status === "COMPLETED");
    const avgSettlementTime = completedTransactions.length > 0
      ? Math.round(completedTransactions.reduce((acc, t) => acc + (t.settlementTimeSeconds || 12), 0) / completedTransactions.length)
      : 12;

    const avgScore = allAgents.length > 0
      ? Math.round(allAgents.reduce((acc, a) => acc + a.reputationScore, 0) / allAgents.length)
      : 500;
    const totalBondedStake = allStakes.reduce((acc, s) => acc + s.bondedAmount, 0);

    // Dynamic distribution by credit tier
    const tierDistribution = {
      Bronze: allAgents.filter((a) => a.creditTier?.toUpperCase() === "BRONZE").length,
      Silver: allAgents.filter((a) => a.creditTier?.toUpperCase() === "SILVER").length,
      Gold: allAgents.filter((a) => a.creditTier?.toUpperCase() === "GOLD").length,
      Platinum: allAgents.filter((a) => a.creditTier?.toUpperCase() === "PLATINUM").length,
      Diamond: allAgents.filter((a) => a.creditTier?.toUpperCase() === "DIAMOND").length,
    };

    // Dynamic distribution by category
    const categoryDistribution = allAgents.reduce((acc: Record<string, number>, a) => {
      const cat = a.category || "General";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Dynamic activity trend grouped by day
    const activityMap: Record<string, { count: number; volume: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      activityMap[key] = { count: 0, volume: 0 };
    }

    allTransactions.forEach((tx) => {
      const d = new Date(tx.createdAt);
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      if (activityMap[key]) {
        activityMap[key].count += 1;
        activityMap[key].volume += tx.amount || 0;
      }
    });

    const activityData = Object.entries(activityMap).map(([day, val]) => ({
      day,
      transactions: val.count,
      volume: Math.round(val.volume),
    }));

    return NextResponse.json({
      totalAgents,
      verifiedAgents,
      totalTransactions,
      totalVolumeCred: totalVolume,
      averageReputationScore: avgScore,
      totalBondedStakeCred: totalBondedStake,
      avgSettlementTimeSeconds: avgSettlementTime,
      totalTasks,
      totalDisputes,
      tierDistribution,
      categoryDistribution,
      activityData,
      recentTransactions,
    });
  } catch (error: any) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch platform stats" }, { status: 500 });
  }
}
