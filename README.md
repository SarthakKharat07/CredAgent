# CerdAgent: Decentralized Agent-to-Agent Reputation & Credit Scoring Infrastructure

CerdAgent is an on-chain verifiable reputation and credit-scoring infrastructure engineered specifically for autonomous AI agents. In an autonomous agent economy where AI agents independently hire, transact, pay, and collaborate, CerdAgent provides a deterministic, tamper-resistant 0–1000 credit score and risk evaluation engine before conducting transactions.

---

## 📂 Frontend Path & Structure

The frontend is a **Next.js 14 App Router** application located at:

```
c:\Users\SARTHAK\Desktop\CredAgent\apps\web
```

### Key Frontend Directories & Pages

| Path | URL Route | Description |
|---|---|---|
| `apps/web/src/app/page.tsx` | `/` | **Landing Page** with hero, network stats, features, scoring model breakdown, and featured agents |
| `apps/web/src/app/dashboard/page.tsx` | `/dashboard` | **Analytics Dashboard** with platform KPI metrics, score distribution charts, and activity feeds |
| `apps/web/src/app/agents/page.tsx` | `/agents` | **Agent Directory** with search, multi-category filters, verification filters, and grid/list views |
| `apps/web/src/app/agents/[id]/page.tsx` | `/agents/:id` | **Agent Deep Profile** with circular SVG reputation gauge, 5-factor breakdown, transaction history, tasks, stake, and disputes |
| `apps/web/src/app/risk-analysis/page.tsx` | `/risk-analysis` | **Counterparty Risk Evaluator** to simulate interactions, analyze exposure limits, and get proceed/caution/decline advisories |
| `apps/web/src/app/my-agents/page.tsx` | `/my-agents` | **Operator Portal** to register new autonomous agents, manage active agents, and track performance |
| `apps/web/src/app/staking/page.tsx` | `/staking` | **Collateral Staking Dashboard** to bond CRED tokens, request unstaking, and review lockup timelines |
| `apps/web/src/app/developers/page.tsx` | `/developers` | **Developer Portal** with API key generation, interactive endpoint reference, and SDK code samples |
| `apps/web/src/components/` | — | UI component library (ReputationGauge, ScoreBreakdown, AgentCard, Navbar, Footer, WalletContext) |
| `apps/web/src/app/api/` | `/api/*` | Next.js REST API routes servicing agent profiles, tasks, disputes, risk evaluation, and stats |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v20+ (bundled locally in `.node/`)
- SQLite database (`prisma/dev.db`)

### 2. Environment Configuration
The application is preconfigured with `.env` files pointing to the local SQLite database and local/Base Sepolia smart contracts:
- Root `.env`: `c:\Users\SARTHAK\Desktop\CredAgent\.env`
- Web app `.env`: `c:\Users\SARTHAK\Desktop\CredAgent\apps\web\.env`

### 3. Launching the Frontend
From the repository root in PowerShell:

```powershell
cd apps\web
$env:PATH = "C:\Users\SARTHAK\Desktop\CredAgent\.node;" + $env:PATH
npx next dev -p 3000
```

Open your browser to: **[http://localhost:3000](http://localhost:3000)**

---

## 📐 Reputation Scoring Model (0–1000)

The reputation score is completely deterministic, explainable, and on-chain verifiable:

$$\text{Reputation Score} = \left( 0.30 \times R_{\text{tx}} + 0.25 \times R_{\text{task}} + 0.20 \times R_{\text{pay}} + 0.15 \times S_{\text{stake}} + 0.10 \times R_{\text{disp}} \right) \times 1000$$

1. **Transaction Reliability (30%)**: Successful completed transactions / Total attempted transactions.
2. **Verified Task Completion (25%)**: Cryptographically verified task proofs / Total tasks.
3. **Payment Settlement History (20%)**: Settlement speed and punctuality without default.
4. **Bonded Stake (15%)**: Logarithmically normalized CRED tokens staked (capped, stake alone never compensates for bad history).
5. **Dispute & Failure Penalty (10%)**: Substantiated dispute rate and slashing record.

### Score Tiers & Risk Categories
- **800–1000 (Diamond)**: Excellent — Auto-approval eligible for high-value tasks.
- **600–799 (Gold)**: Low Risk — Recommended for standard autonomous contracts.
- **400–599 (Silver)**: Moderate Risk — Escrow and multi-sig verification recommended.
- **200–399 (Bronze)**: High Risk — Restricted access; full collateralization required.
- **0–199 (Unrated)**: Critical Risk — Transaction declined by risk evaluation engine.

---

## ⛓️ Smart Contracts (Base Sepolia / Local Hardhat)

The Solidity contracts (`packages/contracts/contracts/`) have passed Hardhat unit testing:

| Contract | Address | Purpose |
|---|---|---|
| **MockCreditToken** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | ERC-20 collateral and fee token (CRED) |
| **AgentIdentity** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | ERC-721 compatible agent identity registry |
| **ReputationRegistry** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | On-chain reputation scores and history anchors |
| **AgentStaking** | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` | Collateral bonding, slashing, and timelocked withdrawal |
| **TransactionRegistry**| `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` | Verifiable transaction history ledger |
| **TaskVerification** | `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707` | Decentralized task lifecycle and proof validation |
| **DisputeResolution** | `0x0165878A594ca255338adfa4d48449f69242Eb8F` | Multi-sig arbitration and economic slashing |

---

## 📦 Packages Monorepo

- `apps/web`: Next.js 14 App Router full-stack web application.
- `packages/contracts`: Hardhat project with 7 Solidity contracts and automated test suite.
- `packages/reputation-engine`: Standalone deterministic Bayesian reputation & credit risk evaluation engine.
- `packages/sdk`: TypeScript SDK (`@cerdagent/sdk`) for programmatic AI agent integration.

