import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WalletProvider } from "@/components/WalletContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "CerdAgent | Decentralized Agent Reputation & Credit Infrastructure",
  description:
    "Verifiable decentralized identity, dynamic reputation scoring (0-1000), collateral staking, and autonomous counterparty risk assessment on Base Sepolia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-foreground antialiased flex flex-col min-h-screen selection:bg-brand/30 selection:text-white">
        <WalletProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
