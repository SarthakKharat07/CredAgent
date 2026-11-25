import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080D18",
        foreground: "#F8FAFC",
        surface: {
          DEFAULT: "#0D1424",
          hover: "#152038",
          card: "rgba(13, 20, 36, 0.85)",
          border: "rgba(51, 65, 85, 0.45)",
          muted: "#1E293B",
        },
        brand: {
          DEFAULT: "#3B82F6",
          dark: "#1D4ED8",
          light: "#60A5FA",
        },
        violet: {
          accent: "#8B5CF6",
        },
        risk: {
          critical: "#EF4444",
          high: "#F97316",
          moderate: "#EAB308",
          low: "#10B981",
          excellent: "#06B6D4",
        },
        tier: {
          bronze: "#CD7F32",
          silver: "#94A3B8",
          gold: "#F59E0B",
          platinum: "#38BDF8",
          diamond: "#A855F7",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
