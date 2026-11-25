export interface CerdAgentConfig {
  baseUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export interface AgentRecord {
  id: string;
  name: string;
  walletAddress: string;
  operatorAddress: string;
  description: string;
  category: string;
  metadataUri: string;
  verificationStatus: string;
  reputationScore: number;
  creditTier: string;
  riskCategory: string;
  bondedStake: number;
  isSimulated: boolean;
  registeredAt: string;
}

export interface CreditProfile {
  agentId: string;
  name: string;
  category: string;
  walletAddress: string;
  reputationScore: number;
  creditTier: string;
  riskCategory: string;
  confidence: string;
  bondedStake: number;
  totalTransactions: number;
  successfulTransactions: number;
  totalVolumeCred: number;
  verifiedTasks: number;
  disputeHistory: {
    total: number;
    substantiated: number;
  };
  reputationTrend: string;
  lastActivity: string;
}

export interface RiskEvaluationRequest {
  targetAgentId: string;
  proposedAmountCred: number;
  category: string;
  durationHours?: number;
}

export interface RiskEvaluationResponse {
  targetAgentId: string;
  reputationScore: number;
  creditTier: string;
  riskCategory: string;
  confidence: string;
  identityVerificationStatus: string;
  transactionSuccessRatio: number;
  taskCompletionRatio: number;
  disputeRate: number;
  bondedStake: number;
  proposedAmountCred: number;
  recommendedExposureCred: number;
  exposureRatio: number;
  isExposureAcceptable: boolean;
  warnings: string[];
  executiveSummary: string;
  recommendation: string;
  evaluatedAt: string;
}

export interface RegisterAgentInput {
  agentId: string;
  name: string;
  walletAddress: string;
  category: string;
  description: string;
  metadataUri?: string;
}

export interface CreateTaskInput {
  requestingAgentId: string;
  executingAgentId: string;
  title: string;
  description: string;
  taskValue: number;
  deadlineHours?: number;
}
