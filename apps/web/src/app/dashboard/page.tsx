"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Users,
  Shield,
  Coins,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle,
  Clock,
  Layers,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { formatAddress, formatCred, formatNumber, getRiskColor, getTierColor } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/agents").then((r) => r.json()),
    ])
      .then(([statsData, agentsData]) => {
        setStats(statsData);
        setAgents(Array.isArray(agentsData) ? agentsData : (agentsData?.agents || []));
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-300">Loading Network Telemetry...</span>
        </div>
      </div>
    );
  }

  // Dynamic distribution chart data from real database
  const tierChartData = [
    { tier: "Bronze", count: stats?.tierDistribution?.Bronze ?? 0, fill: "#CD7F32" },
    { tier: "Silver", count: stats?.tierDistribution?.Silver ?? 0, fill: "#94A3B8" },
    { tier: "Gold", count: stats?.tierDistribution?.Gold ?? 0, fill: "#F59E0B" },
    { tier: "Platinum", count: stats?.tierDistribution?.Platinum ?? 0, fill: "#38BDF8" },
    { tier: "Diamond", count: stats?.tierDistribution?.Diamond ?? 0, fill: "#A855F7" },
  ];

  // Dynamic activity data from real database transactions
  const activityData = stats?.activityData?.length > 0
    ? stats.activityData
    : [
        { day: "Mon", transactions: 1, volume: 150 },
        { day: "Tue", transactions: 2, volume: 450 },
        { day: "Wed", transactions: 3, volume: 800 },
        { day: "Thu", transactions: 2, volume: 600 },
        { day: "Fri", transactions: 4, volume: 1400 },
        { day: "Sat", transactions: 3, volume: 950 },
        { day: "Sun", transactions: 5, volume: 1650 },
      ];

  const highRiskAgents = agents.filter(
    (a) => a.riskCategory?.toLowerCase() === "critical" || a.riskCategory?.toLowerCase() === "high"
  );
  
  // Sort agents by reputation score
  const sortedByScore = [...agents].sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0));
  const topAgents = sortedByScore.slice(0, 5);
  const recentAgents = [...agents].reverse().slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Network Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Real-time telemetry, reputation scores, collateral bonding, and counterparty risk telemetry on Base Sepolia.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/my-agents"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            + Register Agent
          </Link>
          <Link
            href="/risk-analysis"
            className="px-4 py-2 rounded-xl bg-[#0D1424] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:border-slate-600"
          >
            Evaluate Agent
          </Link>
        </div>
      </motion.div>

      {/* 5 Sleek Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-xl bg-[#0D1424] border border-slate-800"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Total Agents</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {formatNumber(stats?.totalAgents ?? agents.length)}
          </div>
          <span className="text-xs text-slate-400 font-mono mt-1 block">
            Across 7 categories
          </span>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-[#0D1424] border border-slate-800"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Verified Agents</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            {formatNumber(stats?.verifiedAgents ?? 0)}
          </div>
          <span className="text-xs text-slate-300 font-mono mt-1 block">
            {stats?.totalAgents ? Math.round(((stats.verifiedAgents || 0) / stats.totalAgents) * 100) : 0}% of network
          </span>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-xl bg-[#0D1424] border border-slate-800"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Transactions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {formatNumber(stats?.totalTransactions ?? 0)}
          </div>
          <span className="text-xs text-cyan-400 font-mono mt-1 block">
            Vol: {formatCred(stats?.totalVolumeCred ?? 0)}
          </span>
        </motion.div>

        {/* Metric 4 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-[#0D1424] border border-slate-800"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Avg Reputation</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-400 tracking-tight">
            {stats?.averageReputationScore ?? 500}
            <span className="text-xs text-slate-400 font-mono font-normal"> /1000</span>
          </div>
          <span className="text-xs text-amber-400 font-mono mt-1 block">
            Gold Benchmark
          </span>
        </motion.div>

        {/* Metric 5 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-xl bg-[#0D1424] border border-slate-800"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Bonded Stake</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
            {formatCred(stats?.totalBondedStakeCred ?? 0)}
          </div>
          <span className="text-xs text-slate-400 font-mono mt-1 block">
            Active ERC-20 Locked
          </span>
        </motion.div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Credit Tier Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-xl bg-[#0D1424] border border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Agent Credit Tier Distribution</h3>
              <p className="text-xs text-slate-300">Live categorization across 5 credit reliability tiers</p>
            </div>
            <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              0 - 1000 Standard
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="tier" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0D1424", borderColor: "#334155", borderRadius: "8px", fontSize: "12px", color: "#F8FAFC" }}
                />
                <Bar dataKey="count" name="Agents" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2: Transaction Activity & Settlement Volume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-5 rounded-xl bg-[#0D1424] border border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">On-Chain Settlement Volume</h3>
              <p className="text-xs text-slate-300">Dynamic daily transaction throughput & volume (CRED)</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-500/30">
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0D1424", borderColor: "#334155", borderRadius: "8px", fontSize: "12px", color: "#F8FAFC" }}
                />
                <Area type="monotone" dataKey="volume" name="Volume (CRED)" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#volGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* High Risk Alert Banner */}
      {highRiskAgents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                Risk Advisory: {highRiskAgents.length} Agents Flagged in High / Critical Risk
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Agents with elevated failure rates or active dispute flags require strict escrow before transacting.
              </p>
            </div>
          </div>
          <Link
            href="/agents?verificationStatus=FLAGGED"
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/40 shrink-0 transition-colors"
          >
            Review Flagged Entities
          </Link>
        </motion.div>
      )}

      {/* Two Column Tables: Top Agents & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Credit-Ranked Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-xl bg-[#0D1424] border border-slate-800"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Top Credit-Ranked Agents
            </h3>
            <Link href="/agents" className="text-xs font-mono text-blue-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {topAgents.map((agent) => {
              const tier = getTierColor(agent.creditTier);
              return (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="p-3 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-200">
                      {agent.id.slice(-2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                          {agent.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {agent.category}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        Bonded: {formatCred(agent.bondedStake)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold font-mono text-white">
                      {agent.reputationScore}
                      <span className="text-xs text-slate-400 font-normal">/1000</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tier.bg} ${tier.text} ${tier.border}`}>
                      {agent.creditTier}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Recently Registered Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-5 rounded-xl bg-[#0D1424] border border-slate-800"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" /> Recent Registrations
            </h3>
            <Link href="/agents" className="text-xs font-mono text-blue-400 hover:underline">
              Directory
            </Link>
          </div>

          <div className="space-y-2">
            {recentAgents.map((agent) => {
              const risk = getRiskColor(agent.riskCategory);
              return (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="p-3 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                        {agent.name}
                      </span>
                      <span className="text-xs font-mono text-slate-400">({agent.id})</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Wallet: {formatAddress(agent.walletAddress)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${risk.bg} ${risk.text} ${risk.border}`}>
                      {agent.riskCategory} Risk
                    </span>
                    <span className="text-xs font-mono text-slate-300 block mt-1">
                      Score: {agent.reputationScore}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
