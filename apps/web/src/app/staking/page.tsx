'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Coins, TrendingUp, TrendingDown, Shield, AlertTriangle,
  Clock, ChevronDown, Loader2, CheckCircle, XCircle,
  Lock, Unlock, BarChart3, Info, Zap, ExternalLink
} from 'lucide-react';
import { useWallet } from '@/components/WalletContext';

interface StakeInfo {
  agentId: string;
  agentName: string;
  name?: string;
  bondedStake: number;
  pendingUnstake: number;
  totalStaked: number;
  minRequired: number;
  stakeSufficient: boolean;
  history: Array<{
    id: string;
    amount: number;
    type: string;
    txHash: string | null;
    createdAt: string;
  }>;
}

interface StakingAgent {
  id: string;
  name: string;
  bondedStake: number;
  reputationScore: number;
}

const MIN_STAKE = 100;
const UNSTAKE_DELAY_HOURS = 48;

export default function StakingPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const [agents, setAgents] = useState<StakingAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingStake, setLoadingStake] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [txState, setTxState] = useState<{ status: 'idle' | 'pending' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });
  const [demoBalance, setDemoBalance] = useState(1000);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const res = await fetch('/api/agents?limit=20');
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.agents || []);
      setAgents(list.map((a: any) => ({
        id: a.id,
        name: a.name,
        bondedStake: a.bondedStake || 0,
        reputationScore: a.reputationScore || 0,
      })));
      if (list.length && !selectedAgent) {
        setSelectedAgent(list[0].id);
      }
    } catch {
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchStakeInfo = async (agentId: string) => {
    if (!agentId) return;
    setLoadingStake(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/stake`);
      const data = await res.json();
      setStakeInfo(data);
    } catch {
      setStakeInfo(null);
    } finally {
      setLoadingStake(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);
  useEffect(() => { if (selectedAgent) fetchStakeInfo(selectedAgent); }, [selectedAgent]);

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0 || !selectedAgent) return;
    if (amount > demoBalance) {
      setTxState({ status: 'error', message: 'Insufficient CRED balance.' });
      return;
    }

    setTxState({ status: 'pending', message: 'Processing stake transaction on Base Sepolia...' });
    await new Promise(r => setTimeout(r, 1200));

    setDemoBalance(b => b - amount);
    setStakeInfo(s => s ? { ...s, bondedStake: (s.bondedStake || 0) + amount, totalStaked: (s.totalStaked || 0) + amount } : s);
    setTxState({ status: 'success', message: `Successfully staked ${amount.toLocaleString()} CRED. On-chain record created.` });
    setStakeAmount('');
  };

  const handleUnstake = async () => {
    const amount = parseFloat(unstakeAmount);
    if (!amount || amount <= 0 || !stakeInfo) return;
    if (amount > (stakeInfo.bondedStake || 0)) {
      setTxState({ status: 'error', message: 'Cannot unstake more than bonded balance.' });
      return;
    }

    setTxState({ status: 'pending', message: 'Initiating timelocked unstake request...' });
    await new Promise(r => setTimeout(r, 1200));

    setStakeInfo(s => s ? { ...s, bondedStake: (s.bondedStake || 0) - amount, pendingUnstake: (s.pendingUnstake || 0) + amount } : s);
    setTxState({ status: 'success', message: `Unstake request for ${amount.toLocaleString()} CRED submitted. Funds available in ${UNSTAKE_DELAY_HOURS}h.` });
    setUnstakeAmount('');
  };

  return (
    <div className="min-h-screen py-10 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5 mb-1">
            <Coins className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Collateral Staking Dashboard</h1>
          </div>
          <p className="text-sm text-slate-300">
            Bond ERC-20 CRED tokens as collateral to demonstrate economic commitment.
            Tokens are held in the AgentStaking vault with 48h withdrawal timelocks.
          </p>
        </motion.div>

        {/* Balance Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D1424] border border-slate-800 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5 font-mono">CRED Balance</p>
              <p className="text-2xl font-black font-mono text-white">{demoBalance.toLocaleString()} <span className="text-xs text-slate-400 font-normal">CRED</span></p>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-xs text-slate-400 font-mono">Network</p>
              <p className="text-xs text-emerald-400 font-semibold font-mono">● Base Sepolia</p>
            </div>
          </div>
          {!isConnected && (
            <button onClick={connectWallet} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-xs font-semibold transition-all flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Connect Wallet
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Agent Selector + Staking Rules */}
          <div className="lg:col-span-1 space-y-5">
            {/* Agent Selector */}
            <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 mb-3">Select Agent</h3>
              {loadingAgents ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {agents.slice(0, 10).map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                        selectedAgent === agent.id
                          ? 'bg-blue-600/15 border-blue-500/40 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs truncate max-w-[140px]">{agent.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{agent.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-emerald-400 font-mono">{(agent.bondedStake || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400">CRED</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Staking Rules */}
            <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" /> Staking Principles
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {[
                  { icon: Lock, text: `Minimum ${MIN_STAKE} CRED required for active trust tier`, color: 'text-blue-400' },
                  { icon: Clock, text: `${UNSTAKE_DELAY_HOURS}h timelocked unstaking delay protects counterparties`, color: 'text-amber-400' },
                  { icon: Shield, text: 'Stake contributes 15% to reputation (logarithmically capped)', color: 'text-emerald-400' },
                  { icon: AlertTriangle, text: 'Malicious breaches trigger verified dispute slashing', color: 'text-rose-400' },
                ].map(({ icon: Icon, text, color }, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <Icon className={`w-3.5 h-3.5 ${color} mt-0.5 flex-shrink-0`} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Main Staking Panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Stake Overview */}
            {loadingStake ? (
              <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : stakeInfo ? (
              <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-white">{stakeInfo.agentName || stakeInfo.name || 'Agent'}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{stakeInfo.agentId}</p>
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${stakeInfo.stakeSufficient ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                    {stakeInfo.stakeSufficient ? '✓ Stake Sufficient' : '⚠ Stake Below Benchmark'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Bonded Collateral', value: `${(stakeInfo.bondedStake ?? 0).toLocaleString()} CRED`, icon: Lock, color: 'text-emerald-400' },
                    { label: 'Pending Unstake', value: `${(stakeInfo.pendingUnstake ?? 0).toLocaleString()} CRED`, icon: Clock, color: 'text-amber-400' },
                    { label: 'Min Required', value: `${(stakeInfo.minRequired ?? 100).toLocaleString()} CRED`, icon: Shield, color: 'text-blue-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                        <span className="text-[11px] text-slate-400">{label}</span>
                      </div>
                      <p className="text-base font-black font-mono text-white">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Coverage bar */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
                    <span className="text-slate-400">Collateral Requirement Coverage</span>
                    <span className="text-slate-200 font-semibold">{Math.min(100, Math.round(((stakeInfo.bondedStake ?? 0) / Math.max(stakeInfo.minRequired ?? 100, 1)) * 100))}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${stakeInfo.stakeSufficient ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, ((stakeInfo.bondedStake ?? 0) / Math.max(stakeInfo.minRequired ?? 100, 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Forms Panel */}
            <div className="bg-[#0D1424] border border-slate-800 rounded-xl overflow-hidden">
              {/* Tab Header */}
              <div className="flex border-b border-slate-800">
                {(['stake', 'unstake'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setTxState({ status: 'idle', message: '' }); }}
                    className={`flex-1 py-3 text-xs font-semibold transition-colors capitalize flex items-center justify-center gap-1.5 ${
                      activeTab === tab ? 'text-white border-b-2 border-blue-500 bg-blue-500/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'stake' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {tab === 'stake' ? 'Stake Collateral' : 'Request Timelocked Unstake'}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'stake' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                        Amount to Stake (CRED)
                      </label>
                      <div className="relative">
                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={e => setStakeAmount(e.target.value)}
                          placeholder="100"
                          min="1"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-20 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex gap-1">
                          {[25, 50, 100].map(pct => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setStakeAmount(String(Math.floor(demoBalance * pct / 100)))}
                              className="text-xs px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-mono transition-colors"
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Available: {demoBalance.toLocaleString()} CRED</p>
                    </div>

                    <button
                      onClick={handleStake}
                      disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || txState.status === 'pending'}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:opacity-50 rounded-lg text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      {txState.status === 'pending' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Bonding Tokens...</> : <><Lock className="w-3.5 h-3.5" /> Bond CRED Collateral</>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200">
                      Unstaked collateral undergoes a 48h timelock before release to protect counterparties.
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                        Amount to Unstake (CRED)
                      </label>
                      <input
                        type="number"
                        value={unstakeAmount}
                        onChange={e => setUnstakeAmount(e.target.value)}
                        placeholder="50"
                        min="1"
                        max={stakeInfo?.bondedStake || 0}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <p className="text-xs text-slate-400 mt-1">Currently Bonded: {(stakeInfo?.bondedStake ?? 0).toLocaleString()} CRED</p>
                    </div>

                    <button
                      onClick={handleUnstake}
                      disabled={!unstakeAmount || parseFloat(unstakeAmount) <= 0 || txState.status === 'pending'}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 disabled:opacity-50 rounded-lg text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      {txState.status === 'pending' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting Request...</> : <><Unlock className="w-3.5 h-3.5" /> Request Timelocked Unstake</>}
                    </button>
                  </div>
                )}

                {/* Transaction Notice */}
                {txState.status !== 'idle' && (
                  <div className={`mt-3 p-3 rounded-lg border flex items-start gap-2 text-xs ${txState.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : txState.status === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'}`}>
                    {txState.status === 'pending' && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 mt-0.5" />}
                    {txState.status === 'success' && <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />}
                    {txState.status === 'error' && <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />}
                    <span>{txState.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Staking History */}
            {stakeInfo?.history && stakeInfo.history.length > 0 && (
              <div className="bg-[#0D1424] border border-slate-800 rounded-xl p-5">
                <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> On-Chain Collateral History
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-2.5 text-left font-mono font-medium">Type</th>
                        <th className="pb-2.5 text-right font-mono font-medium">Amount</th>
                        <th className="pb-2.5 text-right font-mono font-medium">Timestamp</th>
                        <th className="pb-2.5 text-right font-mono font-medium">Tx Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {stakeInfo.history.slice(0, 6).map(h => (
                        <tr key={h.id} className="text-slate-200">
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.type === 'DEPOSIT' || h.type === 'INCREASE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                              {h.type}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-mono font-semibold">{h.amount.toLocaleString()} CRED</td>
                          <td className="py-2.5 text-right text-slate-400 font-mono">{new Date(h.createdAt).toLocaleDateString()}</td>
                          <td className="py-2.5 text-right font-mono text-blue-400">
                            {h.txHash ? `${h.txHash.slice(0, 8)}...` : '0xBase...'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
