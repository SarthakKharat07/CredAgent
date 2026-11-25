"use client";

import React from "react";

interface ComponentItem {
  score: number;
  weight: number;
  contribution: number;
  description: string;
}

interface ScoreBreakdownProps {
  breakdown: {
    transactionReliability: ComponentItem;
    taskCompletion: ComponentItem;
    paymentReliability: ComponentItem;
    bondedStake: ComponentItem;
    disputeReliability: ComponentItem;
  };
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const items = [
    {
      name: "Transaction Reliability",
      weight: "30%",
      data: breakdown.transactionReliability,
      color: "bg-blue-500",
      textColor: "text-blue-400",
    },
    {
      name: "Verified Task Completion",
      weight: "25%",
      data: breakdown.taskCompletion,
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
    },
    {
      name: "Payment Settlement History",
      weight: "20%",
      data: breakdown.paymentReliability,
      color: "bg-cyan-500",
      textColor: "text-cyan-400",
    },
    {
      name: "Bonded Collateral Stake",
      weight: "15%",
      data: breakdown.bondedStake,
      color: "bg-purple-500",
      textColor: "text-purple-400",
    },
    {
      name: "Dispute & Penalty Factor",
      weight: "10%",
      data: breakdown.disputeReliability,
      color: "bg-amber-500",
      textColor: "text-amber-400",
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="p-3.5 rounded-xl bg-[#0D1424] border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">{item.name}</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {item.weight}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-mono font-extrabold ${item.textColor}`}>
                {item.data?.score ?? 0}/1000
              </span>
              <span className="text-xs font-mono text-slate-400 ml-1.5">
                (+{item.data?.contribution ?? 0} pts)
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full ${item.color} transition-all duration-700`}
              style={{ width: `${Math.min(100, Math.max(0, ((item.data?.score ?? 0) / 1000) * 100))}%` }}
            />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {item.data?.description}
          </p>
        </div>
      ))}
    </div>
  );
}
