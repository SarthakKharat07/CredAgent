'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Search,
  TrendingUp, TrendingDown, Minus, Info, Zap, ChevronDown,
  Clock, DollarSign, Activity, BarChart3, Eye, ArrowRight
} from 'lucide-react';
import { ReputationGauge } from '@/components/ReputationGauge';

interface RiskFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

interface EvaluationResult {
  targetAgentId: string;
  agentName: string;
  walletAddress: string;
  reputationScore: number;
  creditTier: string;
  riskCategory: string;
  identityVerified: boolean;
  transactionSuccessRatio: number;
  taskCompletionRatio: number;
  disputeRate: number;
  bondedStake: number;
  confidenceLevel: string;
  recommendedExposure: number;
  warnings: string[];
  riskFactors: RiskFactor[];
  recommendation: 'proceed' | 'caution' | 'decline';
  executiveSummary: string;
  scoreBreakdown: {
    transactionReliability: number;
    taskCompletion: number;
    paymentReliability: number;
    stakeScore: number;
    disputeReliability: number;
  };
}

const AGENT_CATEGORIES = [
  'Research', 'Trading', 'Payment', 'Coding',
  'DataAnalysis', 'DeFi', 'AutonomousService'
];

const RISK_COLORS: Record<string, string> = {
  'Critical Risk': 'text-red-400 bg-red-500/10 border-red-500/30',
  'High Risk': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'Moderate Risk': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  'Low Risk': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Excellent': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
};

const RECOMMENDATION_CONFIG = {
  proceed: { label: 'Proceed with Deal', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  caution: { label: 'Proceed with Caution', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  decline: { label: 'Decline Transaction', icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
};

export default function RiskAnalysisPage() {
  const [targetAgentId, setTargetAgentId] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [category, setCategory] = useState('Research');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAgentId.trim() || !proposedAmount) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/risk/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAgentId: targetAgentId.trim(),
          proposedAmountCred: parseFloat(proposedAmount),
          category,
          durationHours: duration ? parseInt(duration) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fillExample = (agentId: string) => {
    setTargetAgentId(agentId);
    setProposedAmount('500');
    setCategory('Research');
  };

  return (
    <div className="min-h-screen py-10 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-2 border-b border-slate-800"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <Shield className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Counterparty Risk Evaluator
            </h1>
          </div>
          <p className="text-sm text-slate-300">
            Assess the creditworthiness of any autonomous AI agent before entering into a transaction.
            Generates real-time exposure caps, risk factors, and actionable recommendations.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0D1424] border border-slate-800 rounded-xl p-6 sm:p-7 shadow-xl"
        >
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" />
            Evaluate Counterparty Agent
          </h2>

          <form onSubmit={handleEvaluate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Agent ID */}
              <div>
                <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Agent ID or Wallet <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={targetAgentId}
                  onChange={e => setTargetAgentId(e.target.value)}
                  placeholder="e.g. AGT-RESEARCH-01 or 0x..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                  required
                />
              </div>

              {/* Proposed Amount */}
              <div>
                <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Proposed Deal Volume (CRED) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={proposedAmount}
                    onChange={e => setProposedAmount(e.target.value)}
                    placeholder="500"
                    min="1"
                    step="0.01"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Transaction Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {AGENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.replace(/([A-Z])/g, ' $1').trim()}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Duration (hours) <span className="text-slate-400 font-normal">optional</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="24"
                    min="1"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Quick Examples */}
            <div className="pt-1">
              <span className="text-xs font-mono text-slate-400 mr-2">Quick test:</span>
              <div className="inline-flex flex-wrap gap-1.5 mt-1">
                {['AGT-RESEARCH-01', 'AGT-TRADING-01', 'AGT-PAYMENT-01', 'AGT-DEFI-01'].map(id => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => fillExample(id)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300 hover:text-white transition-all"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !targetAgentId.trim() || !proposedAmount}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Risk Factors...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Run Counterparty Risk Assessment</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
            >
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-semibold text-sm">Evaluation Failed</p>
                <p className="text-red-300/80 text-xs mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Top Row: Gauge + Recommendation + Key Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Score Gauge */}
                <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center">
                  <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 mb-3">Reputation Score</h3>
                  <ReputationGauge score={result.reputationScore} size={150} />
                  <div className="mt-3 text-center">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-bold ${RISK_COLORS[result.riskCategory] || 'text-slate-300 bg-slate-800'}`}>
                      {result.riskCategory}
                    </div>
                    <p className="text-slate-400 text-xs font-mono mt-1.5">Confidence: {result.confidenceLevel}</p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-5 flex flex-col">
                  <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 mb-3">Recommendation</h3>
                  {(() => {
                    const cfg = RECOMMENDATION_CONFIG[result.recommendation];
                    const Icon = cfg.icon;
                    return (
                      <div className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border ${cfg.bg}`}>
                        <Icon className={`w-10 h-10 ${cfg.color} mb-2`} />
                        <p className={`text-base font-extrabold ${cfg.color}`}>{cfg.label}</p>
                        <div className="mt-3 w-full space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Agent</span>
                            <span className="text-white font-bold">{result.targetAgentId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tier</span>
                            <span className="text-white font-bold">{result.creditTier}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Max Exposure</span>
                            <span className="text-emerald-400 font-bold">{(result.recommendedExposure ?? 0).toLocaleString()} CRED</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Identity</span>
                            <span className={result.identityVerified ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                              {result.identityVerified ? '✓ Verified' : '⚠ Unverified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Key Metrics */}
                <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 mb-3">Operational Metrics</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Tx Success Rate', value: `${(result.transactionSuccessRatio * 100).toFixed(1)}%`, icon: Activity, color: result.transactionSuccessRatio > 0.8 ? 'text-emerald-400' : 'text-amber-400' },
                      { label: 'Task Completion', value: `${(result.taskCompletionRatio * 100).toFixed(1)}%`, icon: CheckCircle, color: result.taskCompletionRatio > 0.8 ? 'text-emerald-400' : 'text-amber-400' },
                      { label: 'Dispute Rate', value: `${(result.disputeRate * 100).toFixed(1)}%`, icon: AlertTriangle, color: result.disputeRate < 0.05 ? 'text-emerald-400' : 'text-rose-400' },
                      { label: 'Bonded Stake', value: `${(result.bondedStake ?? 0).toLocaleString()} CRED`, icon: Shield, color: 'text-blue-400' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="flex items-center justify-between p-2.5 bg-slate-900/70 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${color}`} />
                          <span className="text-xs text-slate-300">{label}</span>
                        </div>
                        <span className={`font-mono font-bold text-xs ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-5">
                <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" /> Executive Summary
                </h3>
                <p className="text-slate-100 text-sm leading-relaxed">{result.executiveSummary}</p>
              </div>

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-5">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Risk Warnings
                  </h3>
                  <ul className="space-y-1.5">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-200">
                        <span className="text-amber-400 mt-0.5">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {result.riskFactors && result.riskFactors.length > 0 && (
                <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Risk Factor Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {result.riskFactors.map((f, i) => {
                      const icon = f.impact === 'positive' ? TrendingUp : f.impact === 'negative' ? TrendingDown : Minus;
                      const color = f.impact === 'positive' ? 'text-emerald-400' : f.impact === 'negative' ? 'text-rose-400' : 'text-slate-400';
                      const Icon = icon;
                      return (
                        <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                          <Icon className={`w-4 h-4 ${color} mt-0.5 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-white">{f.factor}</span>
                              <span className={`text-xs font-mono ${color}`}>×{f.weight.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5 leading-tight">{f.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Profile Link */}
              <div className="text-center pt-2">
                <a
                  href={`/agents/${result.targetAgentId}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-xs transition-all shadow-md"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Agent On-Chain Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
