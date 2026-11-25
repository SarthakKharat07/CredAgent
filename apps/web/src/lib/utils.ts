import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function formatCred(amount: number): string {
  return `${new Intl.NumberFormat().format(amount)} CRED`;
}

export function getTierColor(tier: string): { bg: string; text: string; border: string; glow: string } {
  switch (tier?.toLowerCase()) {
    case "diamond":
      return { bg: "bg-purple-950/40", text: "text-purple-400", border: "border-purple-600/40", glow: "shadow-purple-500/20" };
    case "platinum":
      return { bg: "bg-sky-950/40", text: "text-sky-400", border: "border-sky-500/40", glow: "shadow-sky-500/20" };
    case "gold":
      return { bg: "bg-amber-950/40", text: "text-amber-400", border: "border-amber-500/40", glow: "shadow-amber-500/20" };
    case "silver":
      return { bg: "bg-slate-900/60", text: "text-slate-300", border: "border-slate-500/40", glow: "shadow-slate-500/10" };
    case "bronze":
    default:
      return { bg: "bg-orange-950/30", text: "text-orange-400", border: "border-orange-600/30", glow: "shadow-orange-500/10" };
  }
}

export function getRiskColor(risk: string): { bg: string; text: string; border: string } {
  switch (risk?.toLowerCase()) {
    case "excellent":
      return { bg: "bg-cyan-950/40", text: "text-cyan-400", border: "border-cyan-500/40" };
    case "low":
      return { bg: "bg-emerald-950/40", text: "text-emerald-400", border: "border-emerald-500/40" };
    case "moderate":
      return { bg: "bg-yellow-950/40", text: "text-yellow-400", border: "border-yellow-500/40" };
    case "high":
      return { bg: "bg-orange-950/40", text: "text-orange-400", border: "border-orange-500/40" };
    case "critical":
    default:
      return { bg: "bg-rose-950/40", text: "text-rose-400", border: "border-rose-500/40" };
  }
}
