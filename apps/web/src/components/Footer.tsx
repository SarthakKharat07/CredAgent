import React from "react";
import Link from "next/link";
import { Shield, ExternalLink, Terminal } from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { formatAddress } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-[#060A13] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-white text-base">CerdAgent</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Decentralized reputation, identity verification, and counterparty credit scoring infrastructure for autonomous AI agents.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Base Sepolia Testnet | Chain ID: 84532
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Network Dashboard
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:text-white transition-colors">
                  Agent Directory
                </Link>
              </li>
              <li>
                <Link href="/risk-analysis" className="hover:text-white transition-colors">
                  Evaluate Counterparty Risk
                </Link>
              </li>
              <li>
                <Link href="/staking" className="hover:text-white transition-colors">
                  Collateral & Staking Vault
                </Link>
              </li>
              <li>
                <Link href="/my-agents" className="hover:text-white transition-colors">
                  Operator Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Developer Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li>
                <Link href="/developers" className="hover:text-white text-blue-400 transition-colors flex items-center gap-1 font-semibold">
                  <Terminal className="w-3.5 h-3.5" /> API Documentation
                </Link>
              </li>
              <li>
                <span className="text-slate-300">TypeScript SDK: @cerdagent/sdk</span>
              </li>
              <li>
                <span className="text-slate-300">Scoring Engine: 0-1000 Explainable</span>
              </li>
              <li>
                <span className="text-slate-300">Model: Bayesian Prior Regression</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Base Sepolia Contracts */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Deployed Contracts
            </h4>
            <div className="space-y-1.5 text-xs font-mono text-slate-300">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">CRED Token</span>
                <span className="text-white font-semibold">{formatAddress(CONTRACT_ADDRESSES.credToken)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">AgentIdentity</span>
                <span className="text-white font-semibold">{formatAddress(CONTRACT_ADDRESSES.agentIdentity)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">ReputationRegistry</span>
                <span className="text-white font-semibold">{formatAddress(CONTRACT_ADDRESSES.reputationRegistry)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">AgentStaking</span>
                <span className="text-white font-semibold">{formatAddress(CONTRACT_ADDRESSES.agentStaking)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} CerdAgent Infrastructure. Decentralized trust for the autonomous machine economy.
          </div>
          <div className="flex items-center gap-3 mt-2 sm:mt-0 font-mono text-xs text-slate-400">
            <span>Base Sepolia</span>
            <span>•</span>
            <span>Multi-Agent Scoring Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
