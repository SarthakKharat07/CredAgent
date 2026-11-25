"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  ChevronDown,
  CheckCircle,
  Menu,
  X,
  Wallet,
  Sparkles,
  ExternalLink,
  Code,
  UserCheck,
  Zap,
} from "lucide-react";
import { useWallet, DEMO_OPERATOR_ACCOUNTS } from "./WalletContext";
import { formatAddress, formatCred } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, balanceCred, connectWallet, disconnectWallet, switchAccount, claimFaucet, isClaiming } = useWallet();

  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const walletRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Detect scroll for subtle navbar elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) {
        setWalletDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
    setWalletDropdownOpen(false);
    setMoreDropdownOpen(false);
  }, [pathname]);

  // Clean, high-priority primary links
  const primaryLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Agents", href: "/agents" },
    { label: "Risk Evaluator", href: "/risk-analysis" },
    { label: "Staking", href: "/staking" },
  ];

  // Secondary links in "More"
  const secondaryLinks = [
    { label: "Operator Portal", href: "/my-agents", desc: "Register & manage agents", icon: UserCheck },
    { label: "Developer API & SDK", href: "/developers", desc: "REST endpoints & keys", icon: Code },
  ];

  const isMoreActive = pathname === "/my-agents" || pathname === "/developers";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-800/90 bg-[#080D18]/95 backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-b border-slate-800/50 bg-[#080D18]/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 p-0.5 shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#080D18] rounded-[6px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-300 transition-colors">
              CerdAgent
            </span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              v1.0
            </span>
          </div>
        </Link>

        {/* Clean, uncrowded Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {primaryLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isMoreActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              More
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {moreDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0D1424] border border-slate-700/70 shadow-2xl p-2 z-50">
                {secondaryLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-colors ${
                        isActive ? "bg-blue-600/15 text-blue-300" : "hover:bg-slate-800/70 text-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Network Indicator + Wallet */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Subtle Network Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Base Sepolia</span>
          </div>

          {/* Wallet Button */}
          {isConnected && address ? (
            <div className="relative" ref={walletRef}>
              <button
                onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-slate-700 hover:border-blue-500/50 text-xs font-mono text-slate-100 transition-all shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-semibold">{formatAddress(address)}</span>
                <span className="text-slate-400 hidden lg:inline">| {formatCred(balanceCred)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {walletDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0D1424] border border-slate-700/80 shadow-2xl p-3.5 z-50">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                    <span className="text-xs text-slate-400">Connected Wallet</span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  </div>

                  <div className="my-2.5 p-2 rounded-lg bg-slate-900/90 font-mono text-xs text-slate-200 break-all select-all border border-slate-800">
                    {address}
                  </div>

                  <div className="flex justify-between items-center text-xs py-1.5 px-1 bg-slate-900/50 rounded-lg mb-2">
                    <span className="text-slate-400">CRED Balance</span>
                    <span className="font-bold text-white font-mono">{formatCred(balanceCred)}</span>
                  </div>

                  <button
                    onClick={claimFaucet}
                    disabled={isClaiming}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-semibold hover:bg-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    {isClaiming ? "Claiming..." : "+ Claim 1,000 Test CRED"}
                  </button>

                  <div className="mt-3 pt-2.5 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1 font-medium uppercase tracking-wider">
                      Switch Demo Operator:
                    </span>
                    <div className="space-y-1">
                      {DEMO_OPERATOR_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.address}
                          onClick={() => {
                            switchAccount(acc.address);
                            setWalletDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors ${
                            acc.address.toLowerCase() === address.toLowerCase()
                              ? "bg-blue-600/20 text-blue-300 font-semibold"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          {acc.label} ({formatAddress(acc.address)})
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      disconnectWallet();
                      setWalletDropdownOpen(false);
                    }}
                    className="w-full mt-3 py-1.5 text-center text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#080D18] px-4 pt-3 pb-5 space-y-2">
          {primaryLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? "bg-blue-600/20 text-blue-400" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            {secondaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-mono px-3">
            <span>Network:</span>
            <span className="text-emerald-400">● Base Sepolia</span>
          </div>
        </div>
      )}
    </header>
  );
}
