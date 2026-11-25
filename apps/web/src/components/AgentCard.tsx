"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, AlertTriangle, ArrowRight, TrendingUp, TrendingDown, Minus, Coins, ShieldCheck } from "lucide-react";
import { formatAddress, formatCred, getRiskColor, getTierColor } from "@/lib/utils";

export interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    walletAddress: string;
    category: string;
    description: string;
    verificationStatus: string;
    reputationScore: number;
    creditTier: string;
    riskCategory: string;
    bondedStake: number;
    isSimulated?: boolean;
    reputationProfile?: {
      trend?: string;
      confidenceLevel?: string;
    };
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  const tierColor = getTierColor(agent.creditTier);
  const riskColor = getRiskColor(agent.riskCategory);
  const trend = agent.reputationProfile?.trend || "STABLE";

  return (
    <div className="group relative rounded-xl bg-[#0D1424]/85 border border-slate-800/80 p-5 hover:border-blue-500/40 hover:bg-[#0F182E] transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {agent.id}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
              {agent.category}
            </span>
            {agent.isSimulated && (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                Demo
              </span>
            )}
          </div>

          {/* Verification Badge */}
          {agent.verificationStatus === "VERIFIED" ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full flex-shrink-0">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> Verified
            </span>
          ) : agent.verificationStatus === "FLAGGED" ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded-full flex-shrink-0">
              <AlertTriangle className="w-3 h-3 text-rose-400" /> Flagged
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full flex-shrink-0">
              Pending
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          href={`/agents/${agent.id}`}
          className="text-base font-bold text-white hover:text-blue-300 transition-colors block mb-1.5"
        >
          {agent.name}
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed font-normal">
          {agent.description}
        </p>

        {/* Sleek Score & Tier Bar */}
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 mb-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 mb-0.5">
              Reputation Score
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
                {agent.reputationScore}
              </span>
              <span className="text-xs text-slate-400 font-mono">/1000</span>
              {trend === "UP" && <TrendingUp className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
              {trend === "DOWN" && <TrendingDown className="w-3.5 h-3.5 text-rose-400 ml-1" />}
              {trend === "STABLE" && <Minus className="w-3.5 h-3.5 text-slate-500 ml-1" />}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-medium text-slate-400 mb-1">
              Credit Tier
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-md border ${tierColor.bg} ${tierColor.text} ${tierColor.border} inline-block shadow-sm`}
            >
              {agent.creditTier}
            </span>
          </div>
        </div>

        {/* Clean 2-metric specs */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4 py-2 border-y border-slate-800/80">
          <div>
            <span className="text-slate-400 block text-[11px]">Bonded Stake</span>
            <span className="text-slate-100 font-semibold flex items-center gap-1 mt-0.5">
              <Coins className="w-3 h-3 text-amber-400" />
              {formatCred(agent.bondedStake)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Risk Rating</span>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-0.5 ${riskColor.bg} ${riskColor.text} border ${riskColor.border}`}>
              {agent.riskCategory} Risk
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-1 flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-slate-400 truncate max-w-[120px]" title={agent.walletAddress}>
          {formatAddress(agent.walletAddress)}
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/risk-analysis?agent=${agent.id}`}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/20 hover:text-blue-300 text-slate-200 font-medium transition-colors border border-slate-700/60 hover:border-blue-500/30"
          >
            Evaluate
          </Link>
          <Link
            href={`/agents/${agent.id}`}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all flex items-center gap-1 shadow-sm"
          >
            Profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
