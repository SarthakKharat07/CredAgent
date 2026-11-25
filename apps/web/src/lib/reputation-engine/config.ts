import { ScoringWeights } from "./types";

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  transactionReliability: 0.30,
  taskCompletion: 0.25,
  paymentReliability: 0.20,
  bondedStake: 0.15,
  disputeReliability: 0.10,
};

export const MIN_STAKE_DEFAULT = 100.0; // In CRED tokens
export const PRIOR_BASELINE_SCORE = 500; // Neutral baseline prior
export const EVIDENCE_CONFIDENCE_THRESHOLD = 10; // Number of tasks/txs needed for high confidence

export const CREDIT_TIER_THRESHOLDS = {
  BRONZE: 399,
  SILVER: 599,
  GOLD: 749,
  PLATINUM: 899,
  DIAMOND: 1000,
};

export const RISK_CATEGORY_THRESHOLDS = {
  CRITICAL: 199,
  HIGH: 399,
  MODERATE: 599,
  LOW: 799,
  EXCELLENT: 1000,
};
