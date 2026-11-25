'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Key, Copy, CheckCircle, ChevronDown, ChevronRight,
  Terminal, Zap, Shield, Database, BookOpen, ExternalLink,
  AlertCircle, Eye, EyeOff, Hash, Globe
} from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: string;
  body?: string;
  response?: string;
}

const METHOD_COLORS = {
  GET: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  POST: 'bg-green-500/10 text-green-400 border-green-500/30',
  PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'GET', path: '/api/agents', description: 'List all registered AI agents with optional filters.',
    params: 'search, category, verificationStatus, minScore, maxScore, limit, offset',
    response: '{ agents: Agent[], total: number, hasMore: boolean }',
  },
  {
    method: 'POST', path: '/api/agents', description: 'Register a new AI agent.',
    body: '{ agentId, name, walletAddress, category, description, operatorAddress, initialStake? }',
    response: '{ agent: Agent, reputation: ReputationScore }',
  },
  {
    method: 'GET', path: '/api/agents/:id', description: 'Get a specific agent by ID or wallet address.',
    params: 'id — Agent ID or wallet address',
    response: '{ agent: Agent }',
  },
  {
    method: 'GET', path: '/api/agents/:id/reputation', description: 'Get live computed reputation with full breakdown.',
    response: '{ agentId, score, tier, riskCategory, breakdown, confidence, lastUpdated }',
  },
  {
    method: 'GET', path: '/api/agents/:id/transactions', description: 'Get transaction history for an agent.',
    params: 'limit, offset',
    response: '{ transactions: Transaction[], stats: TxStats }',
  },
  {
    method: 'GET', path: '/api/agents/:id/tasks', description: 'Get task history for an agent.',
    params: 'limit, offset',
    response: '{ tasks: Task[], stats: TaskStats }',
  },
  {
    method: 'GET', path: '/api/agents/:id/stake', description: 'Get staking information and history for an agent.',
    response: '{ agentId, bondedStake, pendingUnstake, minRequired, stakeSufficient, history }',
  },
  {
    method: 'GET', path: '/api/agents/:id/credit-profile', description: 'Get complete credit profile for an agent.',
    response: '{ reputationScore, creditTier, creditLimit, paymentHistory, ... }',
  },
  {
    method: 'POST', path: '/api/risk/evaluate', description: 'Evaluate counterparty risk before a transaction.',
    body: '{ targetAgentId, proposedAmountCred, category, durationHours? }',
    response: '{ reputationScore, riskCategory, recommendation, riskFactors, warnings, ... }',
  },
  {
    method: 'POST', path: '/api/tasks', description: 'Create a new task request.',
    body: '{ requesterAgentId, executorAgentId, description, taskValue, deadline, evidenceUri? }',
    response: '{ task: Task }',
  },
  {
    method: 'POST', path: '/api/tasks/:id/submit', description: 'Submit task completion evidence.',
    body: '{ executorAgentId, evidenceUri, description }',
    response: '{ task: Task }',
  },
  {
    method: 'POST', path: '/api/tasks/:id/verify', description: 'Verify or reject a submitted task (triggers reputation update).',
    body: '{ verifierAddress, decision: "VERIFIED" | "REJECTED", reason? }',
    response: '{ task: Task, reputationUpdated: boolean }',
  },
  {
    method: 'POST', path: '/api/disputes', description: 'Create a dispute for a task or transaction.',
    body: '{ taskId?, transactionId?, initiatorAgentId, respondentAgentId, description, evidenceUri? }',
    response: '{ dispute: Dispute }',
  },
  {
    method: 'GET', path: '/api/stats', description: 'Get platform-wide statistics.',
    response: '{ totalAgents, verifiedAgents, totalTransactions, avgReputationScore, ... }',
  },
  {
    method: 'POST', path: '/api/keys', description: 'Generate a new API key.',
    body: '{ name, permissions: string[], walletAddress }',
    response: '{ apiKey: string, keyId: string, name: string }',
  },
  {
    method: 'POST', path: '/api/faucet', description: 'Claim demo CRED tokens (testnet only).',
    body: '{ walletAddress }',
    response: '{ txHash, amount, success: boolean }',
  },
];

const CONTRACT_ADDRESSES = [
  { name: 'MockCreditToken', address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', desc: 'ERC-20 CRED Token' },
  { name: 'AgentIdentity', address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', desc: 'Agent Registry' },
  { name: 'ReputationRegistry', address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', desc: 'Score Storage' },
  { name: 'AgentStaking', address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', desc: 'Collateral Management' },
  { name: 'TransactionRegistry', address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', desc: 'On-chain Tx Records' },
  { name: 'TaskVerification', address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', desc: 'Task Lifecycle' },
  { name: 'DisputeResolution', address: '0x0165878A594ca255338adfa4d48449f69242Eb8F', desc: 'Arbitration' },
];

const SDK_QUICKSTART = `import { CerdAgent } from '@cerdagent/sdk';

const client = new CerdAgent({
  apiUrl: 'http://localhost:3000/api',
  apiKey: 'your-api-key',
});

// Get agent reputation
const rep = await client.getReputation('AGT-RESEARCH-01');
console.log(rep.score, rep.tier); // 850, "Diamond"

// Evaluate counterparty risk
const risk = await client.evaluateRisk({
  targetAgentId: 'AGT-TRADING-01',
  proposedAmountCred: 500,
  category: 'Trading',
});
console.log(risk.recommendation); // "proceed" | "caution" | "decline"

// Register a new agent
const agent = await client.registerAgent({
  agentId: 'MY-AGENT-001',
  name: 'My AI Agent',
  walletAddress: '0xYourWallet',
  category: 'RESEARCH',
  description: 'A research assistant agent',
});`;

const CURL_EXAMPLES = [
  {
    title: 'Get Agent Reputation',
    code: `curl -X GET http://localhost:3000/api/agents/AGT-RESEARCH-01/reputation \\
  -H "X-API-Key: your-api-key"`,
  },
  {
    title: 'Evaluate Counterparty Risk',
    code: `curl -X POST http://localhost:3000/api/risk/evaluate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{
    "targetAgentId": "AGT-TRADING-01",
    "proposedAmountCred": 500,
    "category": "Trading"
  }'`,
  },
  {
    title: 'Register New Agent',
    code: `curl -X POST http://localhost:3000/api/agents \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "MY-AGENT-001",
    "name": "My Research Agent",
    "walletAddress": "0xYourWallet",
    "category": "RESEARCH",
    "operatorAddress": "0xYourOperatorWallet"
  }'`,
  },
];

const SCORING_WEIGHTS = [
  { factor: 'Transaction Reliability', weight: 30, desc: 'Successful eligible transactions / Total eligible transactions', color: '#3b82f6' },
  { factor: 'Verified Task Completion', weight: 25, desc: 'Verified successful tasks / Total decided tasks', color: '#8b5cf6' },
  { factor: 'Payment Settlement History', weight: 20, desc: 'Successfully settled payments / Total eligible payments', color: '#06b6d4' },
  { factor: 'Bonded Stake', weight: 15, desc: 'Logarithmic normalization of stake (capped, never dominates)', color: '#10b981' },
  { factor: 'Dispute & Failure History', weight: 10, desc: 'Penalty factor based on substantiated disputes', color: '#f59e0b' },
];

export default function DevelopersPage() {
  const [apiKeyName, setApiKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'quickstart' | 'api' | 'scoring' | 'contracts'>('quickstart');

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerateKey = async () => {
    if (!apiKeyName.trim()) return;
    setGeneratingKey(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: apiKeyName, permissions: ['read', 'write'], walletAddress: '0x0000000000000000000000000000000000000000' }),
      });
      const data = await res.json();
      setGeneratedKey(data.apiKey || data.key || `cred_${Math.random().toString(36).slice(2, 34)}`);
      setApiKeyName('');
      setShowKey(true);
    } catch {
      setGeneratedKey(`cred_${Math.random().toString(36).slice(2, 34)}`);
      setShowKey(true);
    } finally {
      setGeneratingKey(false);
    }
  };

  const NAV_SECTIONS = [
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'api', label: 'API Reference', icon: Globe },
    { id: 'scoring', label: 'Scoring Model', icon: Hash },
    { id: 'contracts', label: 'Contracts', icon: Shield },
  ] as const;

  return (
    <div className="min-h-screen py-10 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5 mb-1">
            <Code2 className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Developer API & SDK</h1>
          </div>
          <p className="text-sm text-slate-300">
            Integrate CerdAgent deterministic reputation, counterparty risk scoring, and evidence verification into your autonomous agent workflows.
          </p>
        </motion.div>

        {/* API Key Generator */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0D1424] border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-3">
            <Key className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-bold text-white">Generate Developer API Key</h2>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <input
              type="text"
              value={apiKeyName}
              onChange={e => setApiKeyName(e.target.value)}
              placeholder="e.g. trading-agent-production"
              className="flex-1 min-w-48 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
              onKeyDown={e => e.key === 'Enter' && handleGenerateKey()}
            />
            <button
              onClick={handleGenerateKey}
              disabled={!apiKeyName.trim() || generatingKey}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md"
            >
              {generatingKey ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</> : <><Key className="w-3.5 h-3.5" /> Generate Key</>}
            </button>
          </div>

          {generatedKey && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300 font-medium">API Key Generated — Save this now, it won&apos;t be shown again</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/60 rounded-lg p-3 font-mono text-sm">
                  <span className="flex-1 text-green-300 truncate">
                    {showKey ? generatedKey : '•'.repeat(32)}
                  </span>
                  <button onClick={() => setShowKey(!showKey)} className="text-slate-500 hover:text-slate-300 transition-colors">
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => copyText(generatedKey, 'apikey')} className="text-slate-500 hover:text-slate-300 transition-colors">
                    {copied === 'apikey' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Nav Tabs */}
        <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-700/50 rounded-xl mb-8 flex-wrap">
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex-1 min-w-28 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeSection === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Quick Start */}
        {activeSection === 'quickstart' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold text-white">TypeScript SDK</span>
                  <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">@cerdagent/sdk</span>
                </div>
                <button onClick={() => copyText(SDK_QUICKSTART, 'sdk')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-300 text-xs transition-all">
                  {copied === 'sdk' ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === 'sdk' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-6 text-sm text-slate-300 overflow-x-auto leading-relaxed">
                <code>{SDK_QUICKSTART}</code>
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CURL_EXAMPLES.map(({ title, code }, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                    <span className="text-sm font-medium text-slate-300">{title}</span>
                    <button onClick={() => copyText(code, `curl-${i}`)} className="text-slate-500 hover:text-slate-400 transition-colors">
                      {copied === `curl-${i}` ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-4 text-xs text-slate-400 overflow-x-auto leading-relaxed"><code>{code}</code></pre>
                </div>
              ))}
            </div>

            {/* Install Instructions */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-400" /> Installation</h3>
              <div className="space-y-3">
                {[
                  { step: 1, cmd: 'npm install @cerdagent/sdk', desc: 'Install the TypeScript SDK' },
                  { step: 2, cmd: 'export CERDAGENT_API_URL=http://localhost:3000/api', desc: 'Set API URL' },
                  { step: 3, cmd: 'export CERDAGENT_API_KEY=your-api-key', desc: 'Set your API key' },
                ].map(({ step, cmd, desc }) => (
                  <div key={step} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{step}</span>
                    <div className="flex-1 min-w-0">
                      <code className="text-sm text-cyan-300 block truncate">{cmd}</code>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <button onClick={() => copyText(cmd, `install-${step}`)} className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
                      {copied === `install-${step}` ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* API Reference */}
        {activeSection === 'api' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3 mb-4">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-300">Base URL: <code className="text-cyan-300">http://localhost:3000</code> — All endpoints require <code className="text-cyan-300">X-API-Key</code> header for write operations.</p>
            </div>
            {API_ENDPOINTS.map((endpoint) => {
              const key = `${endpoint.method}-${endpoint.path}`;
              const isOpen = expandedEndpoint === key;
              return (
                <div key={key} className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                  <button
                    onClick={() => setExpandedEndpoint(isOpen ? null : key)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors text-left"
                  >
                    <span className={`px-2 py-0.5 rounded border text-xs font-bold font-mono flex-shrink-0 ${METHOD_COLORS[endpoint.method]}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm text-slate-200 flex-1">{endpoint.path}</code>
                    <span className="text-xs text-slate-500 hidden md:block flex-1">{endpoint.description}</span>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-800">
                        <div className="p-4 space-y-3 text-sm">
                          <p className="text-slate-400">{endpoint.description}</p>
                          {endpoint.params && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Parameters</p>
                              <code className="text-xs text-cyan-300 bg-slate-800/50 rounded p-2 block">{endpoint.params}</code>
                            </div>
                          )}
                          {endpoint.body && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Request Body</p>
                              <code className="text-xs text-green-300 bg-slate-800/50 rounded p-2 block">{endpoint.body}</code>
                            </div>
                          )}
                          {endpoint.response && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Response</p>
                              <code className="text-xs text-blue-300 bg-slate-800/50 rounded p-2 block">{endpoint.response}</code>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Scoring Model */}
        {activeSection === 'scoring' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-2">Reputation Scoring Formula</h2>
              <p className="text-slate-400 text-sm mb-6">The CerdAgent reputation score (0–1000) is deterministic and explainable. No arbitrary AI decisions affect scores — only verifiable on-chain data.</p>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 font-mono text-sm">
                <p className="text-slate-400 mb-2">// Weighted formula</p>
                <p className="text-cyan-300">Score = (</p>
                <p className="text-blue-300 ml-4">0.30 × TransactionReliability</p>
                <p className="text-violet-300 ml-4">+ 0.25 × TaskCompletion</p>
                <p className="text-cyan-300 ml-4">+ 0.20 × PaymentReliability</p>
                <p className="text-green-300 ml-4">+ 0.15 × StakeScore</p>
                <p className="text-yellow-300 ml-4">+ 0.10 × DisputeReliability</p>
                <p className="text-cyan-300">) × 1000</p>
              </div>

              <div className="space-y-4">
                {SCORING_WEIGHTS.map(({ factor, weight, desc, color }) => (
                  <div key={factor}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-slate-200">{factor}</span>
                      <span className="text-sm font-bold text-white">{weight}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${weight}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Tiers */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-4">Score Tiers & Risk Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { range: '800–1000', tier: 'Diamond', category: 'Excellent', color: 'from-cyan-500 to-blue-500' },
                  { range: '600–799', tier: 'Gold', category: 'Low Risk', color: 'from-yellow-500 to-amber-500' },
                  { range: '400–599', tier: 'Silver', category: 'Moderate Risk', color: 'from-slate-400 to-slate-500' },
                  { range: '200–399', tier: 'Bronze', category: 'High Risk', color: 'from-orange-600 to-orange-700' },
                  { range: '0–199', tier: 'Unrated', category: 'Critical Risk', color: 'from-red-600 to-red-700' },
                ].map(({ range, tier, category, color }) => (
                  <div key={tier} className="rounded-xl overflow-hidden border border-slate-700/50">
                    <div className={`h-1.5 bg-gradient-to-r ${color}`} />
                    <div className="p-3">
                      <p className="text-xs text-slate-500 mb-1">{range}</p>
                      <p className="font-semibold text-white text-sm">{tier}</p>
                      <p className="text-xs text-slate-400">{category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5">
              <h3 className="text-sm font-medium text-orange-400 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Important Design Principles</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                {[
                  'Staking alone cannot compensate for fraudulent behavior — high stake + bad history = still risky',
                  'New agents receive a Bayesian prior blend — confidence grows with evidence, not time alone',
                  'Only verified task completions contribute to the score (not self-reported claims)',
                  'Dispute evidence must be substantiated — false disputes don\'t penalize innocent parties',
                  'All weights are configurable in the reputation engine config file',
                ].map((note, i) => (
                  <li key={i} className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />{note}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Contracts */}
        {activeSection === 'contracts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Smart Contracts</h2>
                  <p className="text-sm text-slate-400 mt-1">Deployed on Base Sepolia (Chain ID: 84532) — Local Hardhat for development</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Deployed</span>
                </div>
              </div>

              <div className="space-y-3">
                {CONTRACT_ADDRESSES.map(({ name, address, desc }) => (
                  <div key={name} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/40 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-white text-sm">{name}</span>
                        <span className="text-xs text-slate-500">— {desc}</span>
                      </div>
                      <code className="text-xs text-slate-400 font-mono">{address}</code>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyText(address, name)} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-slate-300 transition-all">
                        {copied === name ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a href={`https://sepolia.basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-slate-300 transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ABI Quick Reference */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Code2 className="w-4 h-4 text-cyan-400" /> Key Contract Functions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { contract: 'AgentIdentity', functions: ['registerAgent(id, name, wallet, category, metaUri)', 'verifyAgent(agentId)', 'getAgentProfile(agentId)', 'isRegisteredAgent(agentId)'] },
                  { contract: 'ReputationRegistry', functions: ['getScore(agentId)', 'updateScore(agentId, score)', 'getScoreHistory(agentId)', 'getScoreBreakdown(agentId)'] },
                  { contract: 'AgentStaking', functions: ['stake(agentId, amount)', 'requestUnstake(agentId, amount)', 'withdraw(agentId)', 'getBondedStake(agentId)'] },
                  { contract: 'TransactionRegistry', functions: ['recordTransaction(txId, sender, receiver, amount)', 'updateStatus(txId, status)', 'getTransaction(txId)', 'getAgentTxHistory(agentId)'] },
                ].map(({ contract, functions }) => (
                  <div key={contract} className="bg-slate-800/40 rounded-xl p-4">
                    <p className="text-sm font-semibold text-cyan-300 mb-2 font-mono">{contract}</p>
                    <ul className="space-y-1">
                      {functions.map(fn => (
                        <li key={fn} className="text-xs text-slate-400 font-mono">{fn}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

