"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Coins,
  Activity,
  FileCheck,
  Clock,
  ExternalLink,
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ReputationGauge } from "@/components/ReputationGauge";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { formatAddress, formatCred, formatNumber, getRiskColor, getTierColor } from "@/lib/utils";

export default function AgentProfilePage() {
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "tasks" | "staking" | "history" | "disputes">("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!agentId) return;

    setLoading(true);
    Promise.all([
      fetch(`/api/agents/${encodeURIComponent(agentId)}`).then((r) => r.json()),
      fetch(`/api/agents/${encodeURIComponent(agentId)}/reputation`).then((r) => r.json()),
    ])
      .then(([agentData, repData]) => {
        setAgent(agentData);
        setReputation(repData);
      })
      .catch((err) => console.error("Error loading agent profile:", err))
      .finally(() => setLoading(false));
  }, [agentId]);

  const copyWallet = () => {
    if (agent?.walletAddress) {
      navigator.clipboard.writeText(agent.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading Agent Credit Profile...</span>
        </div>
      </div>
    );
  }

  if (!agent || agent.error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Agent Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">Could not locate an agent record for "{agentId}".</p>
        <Link href="/agents" className="px-4 py-2 bg-brand text-white text-xs rounded-lg font-medium">
          Back to Directory
        </Link>
      </div>
    );
  }

  const tier = getTierColor(agent.creditTier);
  const risk = getRiskColor(agent.riskCategory);
  const allTx = [...(agent.sentTransactions || []), ...(agent.receivedTransactions || [])];
  const historyData = (agent.reputationHistory || []).map((h: any, i: number) => ({
    name: new Date(h.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: h.score,
    delta: h.changeDelta,
    reason: h.reason,
  })).reverse();

  // If historyData has only 1 point, add a baseline start point
  if (historyData.length === 1) {
    historyData.unshift({
      name: "Prior",
      score: 500,
      delta: 0,
      reason: "Initial neutral prior calibration",
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/agents"
          className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Agent Directory
        </Link>
        <div className="flex items-center gap-2">
          {agent.isSimulated && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400">
              SIMULATED TEST DATA
            </span>
          )}
          <Link
            href={`/risk-analysis?agent=${agent.id}`}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand to-violet-accent hover:from-brand-dark hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-brand/20 transition-all"
          >
            Evaluate This Agent
          </Link>
        </div>
      </div>

      {/* AGENT HERO PROFILE CARD */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface/90 border border-surface-border shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Col 1: Identity & Metadata */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700/60 text-slate-300">
                {agent.id}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand/10 border border-brand/30 text-brand-light">
                {agent.category}
              </span>
              {agent.verificationStatus === "VERIFIED" ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> Identity Verified
                </span>
              ) : agent.verificationStatus === "FLAGGED" ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" /> Flagged Entity
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  Pending Verification
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {agent.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-2xl">
                {agent.description}
              </p>
            </div>

            {/* Wallet Address & Operator Info */}
            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs text-slate-400 border-t border-surface-border/60">
              <div className="flex items-center gap-1.5">
                <span>Agent Wallet:</span>
                <span className="text-slate-200">{formatAddress(agent.walletAddress, 6)}</span>
                <button
                  onClick={copyWallet}
                  className="p-1 hover:text-white transition-colors"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Operator:</span>
                <span className="text-slate-200">{formatAddress(agent.operatorAddress, 4)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Registered:</span>
                <span className="text-slate-200">
                  {new Date(agent.registeredAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Circular Reputation Score Gauge & Tier */}
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-900/80 border border-surface-border">
            <ReputationGauge score={agent.reputationScore} size={150} />

            <div className="mt-4 text-center">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-md border ${tier.bg} ${tier.text} ${tier.border} inline-block mb-1 shadow-sm`}
              >
                {agent.creditTier} Tier
              </span>
              <span className={`text-[11px] font-semibold block ${risk.text}`}>
                {agent.riskCategory} Risk Rating
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                Confidence: {reputation?.confidence || "Medium"} (Score {agent.reputationScore}/1000)
              </span>
            </div>
          </div>
        </div>

        {/* 4 Bottom Highlight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-border/80 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-900/60">
            <span className="text-slate-400 block text-[10px] uppercase">Bonded Collateral</span>
            <span className="text-white font-bold text-base mt-0.5 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              {formatCred(agent.bondedStake)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60">
            <span className="text-slate-400 block text-[10px] uppercase">Transactions</span>
            <span className="text-white font-bold text-base mt-0.5">
              {allTx.length} Total
              <span className="text-xs font-normal text-emerald-400 ml-1">
                ({allTx.filter((t) => t.status === "COMPLETED").length} ok)
              </span>
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60">
            <span className="text-slate-400 block text-[10px] uppercase">Verified Tasks</span>
            <span className="text-white font-bold text-base mt-0.5">
              {(agent.executedTasks || []).filter((t: any) => t.status === "VERIFIED").length}
              <span className="text-xs font-normal text-slate-400 ml-1">
                / {(agent.executedTasks || []).length} tasks
              </span>
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60">
            <span className="text-slate-400 block text-[10px] uppercase">Dispute History</span>
            <span className="text-white font-bold text-base mt-0.5">
              {reputation?.disputedTransactions || 0} Disputes
              <span className="text-xs font-normal text-slate-400 ml-1">recorded</span>
            </span>
          </div>
        </div>
      </div>

      {/* 6 TABS NAVIGATION */}
      <div className="border-b border-surface-border flex gap-2 overflow-x-auto pb-px">
        {[
          { key: "overview", label: "Overview & Breakdown" },
          { key: "transactions", label: `Transactions (${allTx.length})` },
          { key: "tasks", label: `Tasks (${(agent.executedTasks || []).length})` },
          { key: "staking", label: "Bonded Staking" },
          { key: "history", label: "Reputation History" },
          { key: "disputes", label: "Disputes & Verdicts" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "border-brand text-brand-light font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT PANELS */}
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Score Factor Breakdown */}
            <div className="p-6 rounded-xl bg-surface/80 border border-surface-border">
              <h3 className="text-sm font-bold text-white mb-2">
                Reputation Component Breakdown (0 - 1000)
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Mathematical factor contributions across the 5 weighted dimensions.
              </p>

              {reputation?.breakdown ? (
                <ScoreBreakdown breakdown={reputation.breakdown} />
              ) : (
                <div className="text-xs text-slate-400 font-mono">Loading factor breakdown...</div>
              )}
            </div>

            {/* Explainability Narrative */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-surface-border">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-brand" /> Explainable Risk Assessment
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {reputation?.explanation || "Deterministic calculation based on on-chain records and bonded collateral."}
              </p>
            </div>
          </div>

          {/* Right Sidebar: Quick Actions & Counterparty Recommendation */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-surface/80 border border-surface-border space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Counterparty Quick Actions
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assess whether this agent meets the risk thresholds for your proposed economic transaction.
              </p>

              <Link
                href={`/risk-analysis?agent=${agent.id}`}
                className="w-full py-2.5 px-4 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold text-center block shadow-md shadow-brand/20 transition-all"
              >
                Run Counterparty Evaluation
              </Link>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-surface-border text-xs space-y-3 font-mono">
              <h4 className="text-slate-300 font-bold uppercase text-[11px]">Identity Verification</h4>
              <div className="flex justify-between py-1 border-b border-surface-border">
                <span className="text-slate-400">Metadata URI:</span>
                <span className="text-slate-200 truncate max-w-[150px]">{agent.metadataUri}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border">
                <span className="text-slate-400">Network:</span>
                <span className="text-slate-200">Base Sepolia (84532)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-semibold">{agent.verificationStatus}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TRANSACTIONS TAB */}
      {activeTab === "transactions" && (
        <div className="p-6 rounded-xl bg-surface/80 border border-surface-border">
          <h3 className="text-sm font-bold text-white mb-4">Transaction Settlement Log</h3>
          {allTx.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-8 text-center">No transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-mono uppercase text-slate-400 border-b border-surface-border">
                  <tr>
                    <th className="py-2.5 px-3">Transaction Hash</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Counterparty</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50 font-mono">
                  {allTx.map((tx: any) => {
                    const isSender = tx.senderAgentId === agent.id;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3 text-slate-300 truncate max-w-[140px]">
                          {tx.txHash}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${isSender ? "bg-amber-950/40 text-amber-400" : "bg-blue-950/40 text-blue-400"}`}>
                            {isSender ? "OUTBOUND" : "INBOUND"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-200">
                          {isSender ? tx.receiver?.name || tx.receiverAgentId : tx.sender?.name || tx.senderAgentId}
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          {formatCred(tx.amount)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === "COMPLETED"
                                ? "bg-emerald-950/40 text-emerald-400"
                                : tx.status === "DISPUTED"
                                ? "bg-rose-950/40 text-rose-400"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. TASKS TAB */}
      {activeTab === "tasks" && (
        <div className="p-6 rounded-xl bg-surface/80 border border-surface-border">
          <h3 className="text-sm font-bold text-white mb-4">Task Execution & Verification History</h3>
          {(agent.executedTasks || []).length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-8 text-center">No tasks executed yet.</p>
          ) : (
            <div className="space-y-3">
              {(agent.executedTasks || []).map((task: any) => (
                <div key={task.id} className="p-4 rounded-lg bg-slate-900/60 border border-surface-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">{task.taskId}</span>
                      <span className="text-[11px] text-slate-300 font-semibold">{task.title}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          task.status === "VERIFIED"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                            : task.status === "REJECTED"
                            ? "bg-rose-950/40 text-rose-400 border border-rose-500/30"
                            : "bg-amber-950/40 text-amber-400"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{task.description}</p>
                    {task.reviewerNotes && (
                      <p className="text-[11px] font-mono text-slate-400">Review: "{task.reviewerNotes}"</p>
                    )}
                  </div>

                  <div className="text-right shrink-0 font-mono text-xs">
                    <span className="text-white font-bold block">{formatCred(task.taskValue)}</span>
                    <span className="text-[10px] text-slate-400">
                      Req by: {task.requestingAgent?.name || task.requestingAgentId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. STAKING TAB */}
      {activeTab === "staking" && (
        <div className="p-6 rounded-xl bg-surface/80 border border-surface-border space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Collateral Vault & Staking</h3>
              <p className="text-xs text-slate-400">Bonded ERC-20 collateral ensuring economic commitment.</p>
            </div>
            <span className="text-base font-mono font-bold text-amber-400">
              {formatCred(agent.bondedStake)} Bonded
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-surface-border text-xs font-mono space-y-2">
            <div className="flex justify-between py-1 border-b border-surface-border">
              <span className="text-slate-400">Minimum Stake Requirement:</span>
              <span className="text-slate-200">100.0 CRED</span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-border">
              <span className="text-slate-400">Vault Contract:</span>
              <span className="text-slate-200">AgentStaking.sol</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Unstake Lockup Period:</span>
              <span className="text-slate-200">2 Days (Standard) / 60s (Testnet)</span>
            </div>
          </div>

          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Stake Action History</h4>
          {(agent.stakeHistory || []).length === 0 ? (
            <p className="text-xs text-slate-400 font-mono">No staking actions recorded.</p>
          ) : (
            <div className="space-y-2">
              {(agent.stakeHistory || []).map((sh: any) => (
                <div key={sh.id} className="p-3 rounded-lg bg-slate-900/60 border border-surface-border flex justify-between items-center text-xs font-mono">
                  <div>
                    <span className="font-bold text-white mr-2">{sh.actionType}</span>
                    <span className="text-slate-400">{sh.reason}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-400">+{formatCred(sh.amount)}</span>
                    <span className="text-[10px] text-slate-400 block">{new Date(sh.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. REPUTATION HISTORY TAB */}
      {activeTab === "history" && (
        <div className="p-6 rounded-xl bg-surface/80 border border-surface-border space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Reputation Score Historical Trajectory</h3>
            <p className="text-xs text-slate-400">Audit trail of verified changes, performance milestones, and adjustments.</p>
          </div>

          {/* Trajectory Chart */}
          <div className="h-64 w-full p-4 rounded-xl bg-slate-900/60 border border-surface-border">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 1000]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ fill: "#60A5FA", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Audit Events List */}
          <div className="space-y-2">
            {(agent.reputationHistory || []).map((h: any) => (
              <div key={h.id} className="p-3 rounded-lg bg-slate-900/60 border border-surface-border flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-slate-200 font-semibold">{h.reason}</span>
                  <span className="text-[10px] text-slate-400 block">{new Date(h.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{h.score}</span>
                  <span className={`text-[11px] ml-1.5 font-bold ${h.changeDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {h.changeDelta >= 0 ? `+${h.changeDelta}` : h.changeDelta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. DISPUTES TAB */}
      {activeTab === "disputes" && (
        <div className="p-6 rounded-xl bg-surface/80 border border-surface-border space-y-4">
          <h3 className="text-sm font-bold text-white">Dispute History & Adjudication Rulings</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Record of contested contracts, arbitration findings, and collateral slashing events.
          </p>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-surface-border text-xs font-mono">
            {reputation?.disputedTransactions === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400 py-3">
                <CheckCircle className="w-4 h-4" /> Zero substantiated disputes recorded against this agent. Clean compliance record.
              </div>
            ) : (
              <div className="space-y-2 text-rose-300">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  {reputation?.disputedTransactions} formal dispute verdicts on file.
                </div>
                <p className="text-slate-400 text-xs">
                  Substantiated disputes incur a direct deduction on the Dispute Component Score (10% weight) and may trigger slashing of bonded collateral.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

