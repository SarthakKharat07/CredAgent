'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Plus, Wallet, Shield, Settings, ExternalLink,
  CheckCircle, AlertCircle, Loader2, ChevronRight,
  Layers, TrendingUp, Activity, Copy, Eye, X
} from 'lucide-react';
import { useWallet } from '@/components/WalletContext';
import { ReputationGauge } from '@/components/ReputationGauge';

interface Agent {
  id: string;
  name: string;
  category: string;
  walletAddress: string;
  reputationScore: number;
  verificationStatus: string;
  isActive: boolean;
  registeredAt: string;
  _count?: { transactions: number; tasksAsExecutor: number };
}

const AGENT_CATEGORIES = [
  { value: 'RESEARCH', label: 'Research Agent' },
  { value: 'TRADING', label: 'Trading Agent' },
  { value: 'PAYMENT', label: 'Payment Agent' },
  { value: 'CODING', label: 'Coding Agent' },
  { value: 'DATA_ANALYSIS', label: 'Data Analysis Agent' },
  { value: 'DEFI', label: 'DeFi Agent' },
  { value: 'AUTONOMOUS_SERVICE', label: 'Autonomous Service Agent' },
];

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  UNVERIFIED: { label: 'Unverified', color: 'text-slate-400' },
  PENDING: { label: 'Pending', color: 'text-amber-400' },
  VERIFIED: { label: 'Verified', color: 'text-emerald-400' },
  FLAGGED: { label: 'Flagged', color: 'text-rose-400' },
  REVOKED: { label: 'Revoked', color: 'text-rose-400' },
};

interface RegisterForm {
  agentId: string;
  name: string;
  walletAddress: string;
  category: string;
  description: string;
  initialStake: string;
}

const defaultForm: RegisterForm = {
  agentId: '',
  name: '',
  walletAddress: '',
  category: 'RESEARCH',
  description: '',
  initialStake: '100',
};

export default function MyAgentsPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RegisterForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const operatorAddress = address || '0xDEMO0000000000000000000000000000000000001';

  const fetchMyAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents?limit=50`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.agents || []);
      const agents = list.slice(0, isConnected ? undefined : 6);
      setMyAgents(agents);
    } catch {
      setMyAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAgents();
  }, [address]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          operatorAddress: address || operatorAddress,
          initialStake: parseFloat(form.initialStake) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setSubmitResult({ ok: true, message: `Agent "${form.name}" registered successfully! ID: ${data.agent?.id}` });
      setForm(defaultForm);
      setShowForm(false);
      fetchMyAgents();
    } catch (err) {
      setSubmitResult({ ok: false, message: err instanceof Error ? err.message : 'Registration failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateAgentId = () => {
    const prefix = form.category ? form.category.slice(0, 3).toUpperCase() : 'AGT';
    const rand = Math.floor(Math.random() * 900) + 100;
    setForm(f => ({ ...f, agentId: `AGT-${prefix}-${rand}` }));
  };

  return (
    <div className="min-h-screen py-10 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pb-2 border-b border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Bot className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Operator Portal</h1>
              </div>
              <p className="text-sm text-slate-300">Manage, stake collateral, and monitor telemetry for your registered AI agents.</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl text-white font-semibold text-xs transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              Register New Agent
            </button>
          </div>
        </motion.div>

        {/* Wallet Banner */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-blue-300 font-semibold text-sm">Demo Mode Active</p>
                <p className="text-slate-300 text-xs">Showing seeded network agents. Connect wallet to isolate your operator fleet.</p>
              </div>
            </div>
            <button
              onClick={connectWallet}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs font-semibold transition-all"
            >
              Connect Wallet
            </button>
          </motion.div>
        )}

        {/* Registration Result */}
        <AnimatePresence>
          {submitResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl border flex items-start gap-3 ${submitResult.ok ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}
            >
              {submitResult.ok
                ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              }
              <p className={`text-xs ${submitResult.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{submitResult.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-6 sm:p-7 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-400" /> Register Autonomous Agent
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Agent ID */}
                    <div>
                      <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                        Agent ID <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.agentId}
                          onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))}
                          placeholder="AGT-RES-001"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={generateAgentId}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs font-mono transition-all"
                        >
                          Auto
                        </button>
                      </div>
                    </div>

                    {/* Agent Name */}
                    <div>
                      <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                        Agent Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. ResearchBot-01"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Wallet Address */}
                    <div>
                      <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                        Agent On-Chain Wallet <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.walletAddress}
                        onChange={e => setForm(f => ({ ...f, walletAddress: e.target.value }))}
                        placeholder="0x..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                        Category <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        required
                      >
                        {AGENT_CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Initial Stake */}
                    <div>
                      <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                        Initial Collateral Stake (CRED)
                      </label>
                      <input
                        type="number"
                        value={form.initialStake}
                        onChange={e => setForm(f => ({ ...f, initialStake: e.target.value }))}
                        placeholder="100"
                        min="0"
                        step="0.01"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">Capabilities & Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe target service contracts and execution tasks..."
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 rounded-lg text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering...</> : <><CheckCircle className="w-3.5 h-3.5" /> Confirm Registration</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setForm(defaultForm); }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 font-medium text-xs transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Registered Fleet', value: myAgents.length, icon: Bot, color: 'text-blue-400' },
            { label: 'Active', value: myAgents.filter(a => a.isActive).length, icon: Activity, color: 'text-emerald-400' },
            { label: 'Verified', value: myAgents.filter(a => a.verificationStatus === 'VERIFIED').length, icon: Shield, color: 'text-violet-400' },
            { label: 'Avg Reputation', value: myAgents.length ? Math.round(myAgents.reduce((a, b) => a + b.reputationScore, 0) / myAgents.length) : 0, icon: TrendingUp, color: 'text-cyan-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#0D1424] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
              <p className="text-2xl font-black font-mono text-white mt-1.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 min-h-[30vh]">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          </div>
        ) : myAgents.length === 0 ? (
          <div className="text-center py-16 bg-[#0D1424] rounded-xl border border-slate-800">
            <Bot className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-white font-bold text-base mb-1">No agents found</p>
            <p className="text-slate-400 text-xs mb-4">Register your first autonomous agent to begin monitoring.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium text-xs transition-all"
            >
              Register First Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myAgents.map((agent, i) => (
              <div
                key={agent.id}
                className="bg-[#0D1424] border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  {/* Agent Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white text-base truncate">{agent.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-slate-400 font-mono">{agent.id}</span>
                        <button onClick={() => copyToClipboard(agent.id, agent.id)} className="text-slate-500 hover:text-slate-300">
                          {copiedId === agent.id ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border bg-slate-900 ${TIER_CONFIG[agent.verificationStatus]?.color || 'text-slate-400'}`}>
                      {agent.verificationStatus}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3.5 p-3 rounded-lg bg-slate-900 border border-slate-800/80 mb-3.5">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <ReputationGauge score={agent.reputationScore} size={48} showLabel={false} />
                    </div>
                    <div>
                      <p className="text-xl font-black font-mono text-white tracking-tight">{agent.reputationScore}<span className="text-xs text-slate-400 font-normal"> /1000</span></p>
                      <p className="text-xs text-blue-300 font-medium">{agent.category}</p>
                    </div>
                  </div>

                  {/* Wallet */}
                  <div className="mb-4 text-xs font-mono text-slate-400 truncate">
                    Wallet: {agent.walletAddress}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <a
                    href={`/agents/${agent.id}`}
                    className="flex-1 text-center py-1.5 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-semibold transition-all"
                  >
                    View Profile
                  </a>
                  <a
                    href={`/risk-analysis?agent=${agent.id}`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs font-semibold transition-all border border-slate-700"
                    title="Evaluate risk"
                  >
                    Risk
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
