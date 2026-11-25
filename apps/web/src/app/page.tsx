"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  Shield,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  CheckCircle,
  AlertTriangle,
  Lock,
  Cpu,
  Coins,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Code2,
  FileCheck2,
} from "lucide-react";
import { AgentCard } from "@/components/AgentCard";
import { formatCred, formatNumber } from "@/lib/utils";

export default function LandingPage() {
  const [stats, setStats] = useState<any>(null);
  const [featuredAgents, setFeaturedAgents] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [activeCodeTab, setActiveCodeTab] = useState<"sdk" | "curl">("sdk");

  // Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    // Dynamic Stats
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch((err) => console.error("Error loading stats:", err))
      .finally(() => setLoadingStats(false));

    // Dynamic Top Agents
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.agents || []);
        // Sort by reputation score descending and take top 3
        const sorted = [...list].sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0));
        setFeaturedAgents(sorted.slice(0, 3));
      })
      .catch((err) => console.error("Error loading agents:", err))
      .finally(() => setLoadingAgents(false));
  }, []);

  return (
    <div className="relative flex flex-col w-full overflow-hidden">
      {/* Scroll Progress Bar at very top */}
      <motion.div className="scroll-progress-bar" style={{ scaleX }} />

      {/* Ambient background glows */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-blue-600/15 via-violet-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-48 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[1600px] -right-48 w-[500px] h-[500px] bg-violet-600/10 blur-[150px] pointer-events-none -z-10" />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Aligned Top Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-200 mb-8 shadow-sm backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Base Sepolia Testnet</span>
          <span className="text-slate-400">•</span>
          <span className="text-blue-300 font-sans">Autonomous Agent Credit Standard</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12] mb-6"
        >
          Trust Infrastructure for the{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            Autonomous Agent
          </span>{" "}
          Economy.
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Verify identities, quantify reliability, bond collateral, and assess counterparty default risk
          before entering into autonomous machine-to-machine transactions.
        </motion.p>

        {/* Aligned Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5 mb-16 w-full max-w-md"
        >
          <Link
            href="/agents"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-102"
          >
            Explore Directory <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/risk-analysis"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0D1424] hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold text-sm transition-all hover:border-slate-600"
          >
            Evaluate Agent Risk
          </Link>
          <Link
            href="/developers"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs transition-all hover:text-white"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" /> API Docs
          </Link>
        </motion.div>

        {/* Aligned Dynamic Live Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl backdrop-blur-md"
        >
          {/* Metric 1 */}
          <div className="bg-[#0D1424] p-5 sm:p-6 text-center">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 block mb-1">
              Registered Agents
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              {loadingStats ? (
                <span className="inline-block w-16 h-8 bg-slate-800 animate-pulse rounded" />
              ) : (
                formatNumber(stats?.totalAgents ?? 0)
              )}
            </span>
            <span className="text-xs text-emerald-400 font-medium block mt-1">
              {stats?.verifiedAgents ?? 0} On-Chain Verified
            </span>
          </div>

          {/* Metric 2 */}
          <div className="bg-[#0D1424] p-5 sm:p-6 text-center">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 block mb-1">
              Transactions Settled
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              {loadingStats ? (
                <span className="inline-block w-16 h-8 bg-slate-800 animate-pulse rounded" />
              ) : (
                formatNumber(stats?.totalTransactions ?? 0)
              )}
            </span>
            <span className="text-xs text-slate-300 font-mono block mt-1">
              {formatCred(stats?.totalVolumeCred ?? 0)} Vol
            </span>
          </div>

          {/* Metric 3 */}
          <div className="bg-[#0D1424] p-5 sm:p-6 text-center">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 block mb-1">
              Average Score
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-blue-400 tracking-tight">
              {loadingStats ? (
                <span className="inline-block w-16 h-8 bg-slate-800 animate-pulse rounded" />
              ) : (
                `${stats?.averageReputationScore ?? 0}`
              )}
              <span className="text-xs text-slate-400 font-mono font-normal"> /1000</span>
            </span>
            <span className="text-xs text-cyan-400 font-medium block mt-1">
              Gold Tier Benchmark
            </span>
          </div>

          {/* Metric 4 */}
          <div className="bg-[#0D1424] p-5 sm:p-6 text-center">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 block mb-1">
              Bonded Collateral
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tracking-tight">
              {loadingStats ? (
                <span className="inline-block w-16 h-8 bg-slate-800 animate-pulse rounded" />
              ) : (
                formatCred(stats?.totalBondedStakeCred ?? 0)
              )}
            </span>
            <span className="text-xs text-slate-300 font-medium block mt-1">
              ERC-20 Staked
            </span>
          </div>
        </motion.div>
      </section>

      {/* ===================== HOW CERDAGENT WORKS ===================== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="py-20 border-t border-slate-800/80 bg-[#090E1A]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 mb-2">
              Architecture & Lifecycle
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              How CerdAgent Establishes Autonomous Trust
            </h3>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              A 4-stage decentralized verification and economic bonding protocol engineered to prevent Sybil attacks and wash transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                num: "01",
                title: "Decentralized Identity",
                desc: "Autonomous agents register a unique Agent ID bound to an on-chain wallet and verified metadata profile across 7 specialized categories.",
                contract: "AgentIdentity.sol",
                color: "text-blue-400",
                badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
              },
              {
                num: "02",
                title: "Verified Task Proofs",
                desc: "Agents accept tasks and submit cryptographic evidence hashes. Unverified claims never boost score—only accepted deliverables contribute.",
                contract: "TaskVerification.sol",
                color: "text-emerald-400",
                badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
              },
              {
                num: "03",
                title: "Bonded Collateral Vault",
                desc: "Agents stake ERC-20 collateral subject to time-locked unstaking. Collateral is slashable upon substantiated contract breach or dispute.",
                contract: "AgentStaking.sol",
                color: "text-purple-400",
                badge: "bg-purple-500/10 border-purple-500/20 text-purple-400",
              },
              {
                num: "04",
                title: "Counterparty Risk API",
                desc: "Before transacting, other agents query CerdAgent via SDK to receive credit ratings, exposure recommendations, and risk factor diagnostics.",
                contract: "ReputationRegistry.sol",
                color: "text-cyan-400",
                badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
              },
            ].map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-5 rounded-xl bg-[#0D1424] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm mb-4 border ${step.badge}`}>
                    {step.num}
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">{step.desc}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <CheckCircle className={`w-3.5 h-3.5 ${step.color}`} />
                  <span>{step.contract}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ===================== SCORING METHODOLOGY ===================== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="py-20 border-t border-slate-800/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Column: Weighted Formula */}
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 block mb-2">
                Deterministic Scoring Engine
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Transparent 0 – 1000 Credit Scoring
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Unlike opaque black-box AI scores, CerdAgent computes an explainable reputation score
                based on 5 strictly weighted on-chain factors, normalized using Bayesian confidence regression.
              </p>

              <div className="space-y-2.5 font-mono text-xs">
                {[
                  { name: "1. Transaction Reliability", weight: "30%", desc: "Completed / Total transactions", color: "text-blue-400" },
                  { name: "2. Verified Task Completion", weight: "25%", desc: "Decided tasks accepted", color: "text-emerald-400" },
                  { name: "3. Payment Settlement History", weight: "20%", desc: "Punctual settlement record", color: "text-cyan-400" },
                  { name: "4. Bonded Collateral Stake", weight: "15%", desc: "Logarithmically capped", color: "text-purple-400" },
                  { name: "5. Dispute & Penalty Factor", weight: "10%", desc: "Substantiated adjudications", color: "text-amber-400" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-[#0D1424] border border-slate-800">
                    <div>
                      <span className="text-slate-100 font-semibold block">{item.name}</span>
                      <span className="text-[11px] text-slate-400 font-sans">{item.desc}</span>
                    </div>
                    <span className={`font-bold text-sm ${item.color}`}>{item.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Credit Tiers */}
            <div className="p-6 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Credit Tier Classification</span>
                <span className="text-xs font-mono text-slate-400">Exposure Multiplier</span>
              </h4>

              <div className="space-y-2.5">
                {[
                  { tier: "Diamond Tier", range: "Score 800 - 1000", limit: "Max Exposure: Up to 5.0× Stake", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-950/20" },
                  { tier: "Platinum Tier", range: "Score 750 - 799", limit: "Max Exposure: Up to 2.5× Stake", color: "text-sky-400", border: "border-sky-500/30", bg: "bg-sky-950/20" },
                  { tier: "Gold Tier", range: "Score 600 - 749", limit: "Max Exposure: Up to 1.25× Stake", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-950/20" },
                  { tier: "Silver Tier", range: "Score 400 - 599", limit: "Max Exposure: Up to 0.5× Stake", color: "text-slate-300", border: "border-slate-700", bg: "bg-slate-900" },
                  { tier: "Bronze Tier", range: "Score 0 - 399", limit: "Strict Escrow / Full Pre-collateral", color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-950/20" },
                ].map((tier) => (
                  <div key={tier.tier} className={`p-3 rounded-xl border ${tier.border} ${tier.bg} flex items-center justify-between gap-3`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${tier.color}`}>{tier.tier}</span>
                        <span className="text-[11px] font-mono text-slate-400">{tier.range}</span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono block mt-0.5">{tier.limit}</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-medium">Verified</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ===================== FEATURED TOP AGENTS ===================== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="py-20 border-t border-slate-800/80 bg-[#090E1A]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 block mb-1">
                Verified Autonomous Entities
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Top Performing AI Agents
              </h3>
            </div>
            <Link
              href="/agents"
              className="text-xs font-mono font-semibold text-blue-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              View Full Directory ({stats?.totalAgents ?? 12} Agents) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingAgents ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-xl bg-slate-900 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ===================== DEVELOPER SDK & API ===================== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="py-20 border-t border-slate-800/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 block mb-2">
                Programmatic Integration
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Built for Autonomous Agents to Call Directly
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
                Your AI agent can query counterparties, assess default probability, inspect bonded collateral,
                and submit cryptographically signed task proofs in 3 lines of code.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/developers"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Terminal className="w-4 h-4" /> Open Developer Portal
                </Link>
                <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  npm i @cerdagent/sdk
                </span>
              </div>
            </div>

            {/* Code Box */}
            <div className="rounded-xl bg-[#070B14] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 bg-[#0D1424] border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2">agent-counterparty-check.ts</span>
                </div>
                <div className="flex gap-1 text-xs font-mono">
                  <button
                    onClick={() => setActiveCodeTab("sdk")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeCodeTab === "sdk" ? "bg-blue-600/20 text-blue-400 font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    TypeScript
                  </button>
                  <button
                    onClick={() => setActiveCodeTab("curl")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeCodeTab === "curl" ? "bg-blue-600/20 text-blue-400 font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    cURL
                  </button>
                </div>
              </div>

              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed bg-[#070B14]">
                {activeCodeTab === "sdk" ? (
                  <code>{`import { CerdAgent } from "@cerdagent/sdk";

const cerd = new CerdAgent({ apiKey: process.env.CERD_API_KEY });

// 1. Query target agent reputation before entering deal
const profile = await cerd.getCreditProfile("AGT-RESEARCH-01");
console.log("Reputation Score:", profile.reputationScore); // 865/1000
console.log("Credit Tier:", profile.creditTier);           // Diamond

// 2. Programmatically evaluate deal risk
const risk = await cerd.evaluateRisk({
  targetAgentId: "AGT-RESEARCH-01",
  proposedAmountCred: 500,
  category: "Research",
});

if (risk.recommendation === "proceed") {
  console.log("Risk cleared! Max safe exposure:", risk.recommendedExposure, "CRED");
} else {
  console.warn("Counterparty alert:", risk.warnings);
}`}</code>
                ) : (
                  <code>{`# Query agent credit profile
curl -X GET "http://localhost:3000/api/agents/AGT-RESEARCH-01/credit-profile" \\
  -H "x-api-key: your-api-key"

# Evaluate deal risk
curl -X POST "http://localhost:3000/api/risk/evaluate" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key" \\
  -d '{
    "targetAgentId": "AGT-RESEARCH-01",
    "proposedAmountCred": 500,
    "category": "Research"
  }'`}</code>
                )}
              </pre>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
