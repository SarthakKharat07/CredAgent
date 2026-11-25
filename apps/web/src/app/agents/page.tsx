"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, RefreshCw, Users, ShieldAlert, Sparkles } from "lucide-react";
import { AgentCard } from "@/components/AgentCard";

export default function AgentDirectoryPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [riskCategory, setRiskCategory] = useState("ALL");
  const [creditTier, setCreditTier] = useState("ALL");
  const [verificationStatus, setVerificationStatus] = useState("ALL");

  const categories = [
    "ALL",
    "Research",
    "Trading",
    "Payment",
    "Coding",
    "DataAnalysis",
    "DeFi",
    "AutonomousService",
  ];

  const riskCategories = ["ALL", "Critical", "High", "Moderate", "Low", "Excellent"];
  const creditTiers = ["ALL", "Bronze", "Silver", "Gold", "Platinum", "Diamond"];
  const verificationStatuses = ["ALL", "VERIFIED", "PENDING", "FLAGGED"];

  const fetchAgents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "ALL") params.append("category", category);
    if (riskCategory !== "ALL") params.append("riskCategory", riskCategory);
    if (creditTier !== "ALL") params.append("creditTier", creditTier);
    if (search.trim()) params.append("search", search.trim());

    fetch(`/api/agents?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        let filtered = Array.isArray(data) ? data : (data?.agents || []);
        if (verificationStatus !== "ALL") {
          filtered = filtered.filter((a: any) => a.verificationStatus === verificationStatus);
        }
        setAgents(filtered);
      })
      .catch((err) => console.error("Error fetching directory agents:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAgents();
  }, [category, riskCategory, creditTier, verificationStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAgents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-2 border-b border-slate-800"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Autonomous Agent Directory
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Explore registered autonomous AI agents, inspect cryptographic identities, view credit tiers, and evaluate counterparty risk.
        </p>
      </motion.div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-xl bg-[#0D1424] border border-slate-800 space-y-4 shadow-lg"
      >
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Agent Name, ID (e.g. AGT-RESEARCH-01), or 0x Wallet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Category */}
          <div>
            <label className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 block mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Credit Tier */}
          <div>
            <label className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 block mb-1.5">
              Credit Tier
            </label>
            <select
              value={creditTier}
              onChange={(e) => setCreditTier(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {creditTiers.map((t) => (
                <option key={t} value={t}>
                  {t === "ALL" ? "All Tiers" : `${t} Tier`}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Category */}
          <div>
            <label className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 block mb-1.5">
              Risk Level
            </label>
            <select
              value={riskCategory}
              onChange={(e) => setRiskCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {riskCategories.map((r) => (
                <option key={r} value={r}>
                  {r === "ALL" ? "All Risk Levels" : `${r} Risk`}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 block mb-1.5">
              Verification
            </label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {verificationStatuses.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All Statuses" : v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count & Clear */}
        <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-3 border-t border-slate-800">
          <span className="text-slate-300 font-medium">Showing {agents.length} autonomous agents</span>
          <button
            onClick={() => {
              setSearch("");
              setCategory("ALL");
              setRiskCategory("ALL");
              setCreditTier("ALL");
              setVerificationStatus("ALL");
            }}
            className="hover:text-white text-slate-400 transition-colors flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </motion.div>

      {/* AGENT CARDS GRID */}
      {loading ? (
        <div className="flex justify-center p-20 min-h-[40vh] items-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-[#0D1424] border border-slate-800">
          <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No agents match your criteria</h3>
          <p className="text-xs text-slate-300 mt-1">Try resetting your filter parameters or search terms.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
