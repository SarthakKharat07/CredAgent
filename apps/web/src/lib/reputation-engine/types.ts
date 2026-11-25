export type AgentCategory =
  | "Research"
  | "Trading"
  | "Payment"
  | "Coding"
  | "DataAnalysis"
  | "DeFi"
  | "AutonomousService";

export type CreditTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export type RiskCategory = "Critical" | "High" | "Moderate" | "Low" | "Excellent";

export type ConfidenceLevel = "Low" | "Medium" | "High";

export type ReputationTrend = "UP" | "DOWN" | "STABLE";

export interface ScoringWeights {
  transactionReliability: number; // default 0.30
  taskCompletion: number;         // default 0.25
  paymentReliability: number;     // default 0.20
  bondedStake: number;            // default 0.15
  disputeReliability: number;     // default 0.10
}

export interface AgentMetrics {
  agentId: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  cancelledTransactions: number;
  disputedTransactions: number;
  totalVolumeCred: number;

  totalTasks: number;
  verifiedTasks: number;
  rejectedTasks: number;
  pendingTasks: number;

  totalPayments: number;
  settledPayments: number;
  failedPayments: number;

  bondedStake: number;
  minStakeRequirement: number;

  substantiatedDisputes: number;
  resolvedDisputesInFavor: number;
  unresolvedDisputes: number;

  previousScore?: number;
}

export interface ComponentBreakdown {
  score: number; // 0 - 1000
  weight: number; // 0.0 - 1.0
  contribution: number; // score * weight
  rawMetricValue: number;
  normalizedRatio: number; // 0.0 - 1.0
  description: string;
}

export interface ReputationResult {
  agentId: string;
  score: number; // 0 - 1000
  rawScore: number;
  previousScore: number;
  trend: ReputationTrend;
  confidenceLevel: ConfidenceLevel;
  confidenceMultiplier: number; // 0.0 - 1.0
  evidenceCount: number;
  creditTier: CreditTier;
  riskCategory: RiskCategory;
  lastUpdated: string;
  breakdown: {
    transactionReliability: ComponentBreakdown;
    taskCompletion: ComponentBreakdown;
    paymentReliability: ComponentBreakdown;
    bondedStake: ComponentBreakdown;
    disputeReliability: ComponentBreakdown;
  };
  explanation: string;
}

export interface ProposedTransaction {
  targetAgentId: string;
  proposedAmountCred: number;
  category: AgentCategory;
  durationHours?: number;
}

export interface RiskFactor {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  impact: string;
}

export interface CounterpartyEvaluation {
  targetAgentId: string;
  targetWalletAddress?: string;
  reputationScore: number;
  creditTier: CreditTier;
  riskCategory: RiskCategory;
  confidence: ConfidenceLevel;
  identityVerificationStatus: string;
  transactionSuccessRatio: number;
  taskCompletionRatio: number;
  disputeRate: number;
  bondedStake: number;
  proposedAmountCred: number;
  recommendedExposureCred: number;
  exposureRatio: number; // proposedAmount / recommendedExposure
  isExposureAcceptable: boolean;
  warnings: string[];
  riskFactors: RiskFactor[];
  executiveSummary: string;
  recommendation: string;
  evaluatedAt: string;
}
