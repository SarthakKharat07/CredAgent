import {
  AgentMetrics,
  ComponentBreakdown,
  CreditTier,
  ReputationResult,
  ReputationTrend,
  RiskCategory,
  ScoringWeights,
  ConfidenceLevel,
} from "./types";
import {
  CREDIT_TIER_THRESHOLDS,
  DEFAULT_SCORING_WEIGHTS,
  MIN_STAKE_DEFAULT,
  PRIOR_BASELINE_SCORE,
  RISK_CATEGORY_THRESHOLDS,
} from "./config";

/**
 * Calculates deterministic and explainable 0-1000 reputation score.
 */
export function calculateReputationScore(
  metrics: AgentMetrics,
  customWeights?: Partial<ScoringWeights>
): ReputationResult {
  const weights: ScoringWeights = {
    ...DEFAULT_SCORING_WEIGHTS,
    ...customWeights,
  };

  // 1. Transaction Reliability (30%)
  // Ratio of successful eligible transactions to total eligible transactions
  const totalEligibleTx = metrics.successfulTransactions + metrics.failedTransactions;
  const txRatio = totalEligibleTx > 0 ? metrics.successfulTransactions / totalEligibleTx : 0.5; // neutral prior if no txs
  const txComponentScore = Math.round(txRatio * 1000);

  // 2. Verified Task Completion (25%)
  // Verified successful tasks / Total decided tasks (verified + rejected)
  const totalDecidedTasks = metrics.verifiedTasks + metrics.rejectedTasks;
  const taskRatio = totalDecidedTasks > 0 ? metrics.verifiedTasks / totalDecidedTasks : 0.5;
  const taskComponentScore = Math.round(taskRatio * 1000);

  // 3. Payment Reliability (20%)
  // Settled payments / Total eligible payments
  const totalEligiblePayments = metrics.settledPayments + metrics.failedPayments;
  const payRatio = totalEligiblePayments > 0 ? metrics.settledPayments / totalEligiblePayments : 0.5;
  const payComponentScore = Math.round(payRatio * 1000);

  // 4. Bonded Stake Reliability (15%)
  // Capped logarithmic normalization of bonded stake relative to minimum stake requirement
  const minStake = metrics.minStakeRequirement > 0 ? metrics.minStakeRequirement : MIN_STAKE_DEFAULT;
  const stakeRatio = metrics.bondedStake > 0
    ? Math.min(1.0, Math.log(1 + metrics.bondedStake / minStake) / Math.log(1 + 100))
    : 0.0;
  const stakeComponentScore = Math.round(stakeRatio * 1000);

  // 5. Dispute and Failure Factor (10%)
  // Penalty factor based on substantiated disputes and verified failures
  const disputePenalty = (metrics.substantiatedDisputes * 0.15) + (metrics.failedTransactions * 0.04) + (metrics.rejectedTasks * 0.06);
  const disputeRatio = Math.max(0.0, Math.min(1.0, 1.0 - disputePenalty));
  const disputeComponentScore = Math.round(disputeRatio * 1000);

  // Raw Weighted Score
  const rawScore =
    txRatio * weights.transactionReliability * 1000 +
    taskRatio * weights.taskCompletion * 1000 +
    payRatio * weights.paymentReliability * 1000 +
    stakeRatio * weights.bondedStake * 1000 +
    disputeRatio * weights.disputeReliability * 1000;

  // Confidence & Evidence Volume Adjustment
  // An agent with 1 transaction must not receive an unearned high score
  const totalEvidence = metrics.totalTransactions + metrics.totalTasks;
  // Sigmoid curve centered at 8 evidence items, saturating smoothly
  const rawConfidence = 1 / (1 + Math.exp(-0.25 * (totalEvidence - 8)));
  const confidenceMultiplier = Math.max(0.15, Math.min(0.98, rawConfidence));

  // Final Score: Bayesian-style blend of baseline prior (500) and observed raw score
  const finalScore = Math.round(
    PRIOR_BASELINE_SCORE * (1 - confidenceMultiplier) + rawScore * confidenceMultiplier
  );

  // Trend determination
  const prevScore = metrics.previousScore ?? PRIOR_BASELINE_SCORE;
  let trend: ReputationTrend = "STABLE";
  if (finalScore > prevScore + 5) trend = "UP";
  else if (finalScore < prevScore - 5) trend = "DOWN";

  // Confidence Classification
  let confidenceLevel: ConfidenceLevel = "Low";
  if (totalEvidence >= 25 && confidenceMultiplier >= 0.85) confidenceLevel = "High";
  else if (totalEvidence >= 8 && confidenceMultiplier >= 0.50) confidenceLevel = "Medium";

  // Tier Classification
  const creditTier = mapCreditTier(finalScore);
  const riskCategory = mapRiskCategory(finalScore);

  // Component breakdown for explainability
  const breakdown: ReputationResult["breakdown"] = {
    transactionReliability: {
      score: txComponentScore,
      weight: weights.transactionReliability,
      contribution: Math.round(txComponentScore * weights.transactionReliability),
      rawMetricValue: metrics.successfulTransactions,
      normalizedRatio: txRatio,
      description: `${metrics.successfulTransactions} successful / ${totalEligibleTx} decided transactions`,
    },
    taskCompletion: {
      score: taskComponentScore,
      weight: weights.taskCompletion,
      contribution: Math.round(taskComponentScore * weights.taskCompletion),
      rawMetricValue: metrics.verifiedTasks,
      normalizedRatio: taskRatio,
      description: `${metrics.verifiedTasks} verified / ${totalDecidedTasks} decided tasks`,
    },
    paymentReliability: {
      score: payComponentScore,
      weight: weights.paymentReliability,
      contribution: Math.round(payComponentScore * weights.paymentReliability),
      rawMetricValue: metrics.settledPayments,
      normalizedRatio: payRatio,
      description: `${metrics.settledPayments} settled / ${totalEligiblePayments} payment attempts`,
    },
    bondedStake: {
      score: stakeComponentScore,
      weight: weights.bondedStake,
      contribution: Math.round(stakeComponentScore * weights.bondedStake),
      rawMetricValue: metrics.bondedStake,
      normalizedRatio: stakeRatio,
      description: `${metrics.bondedStake.toLocaleString()} CRED bonded (min required: ${minStake} CRED)`,
    },
    disputeReliability: {
      score: disputeComponentScore,
      weight: weights.disputeReliability,
      contribution: Math.round(disputeComponentScore * weights.disputeReliability),
      rawMetricValue: metrics.substantiatedDisputes,
      normalizedRatio: disputeRatio,
      description: `${metrics.substantiatedDisputes} substantiated disputes recorded`,
    },
  };

  const explanation = generateExplanationNarrative(
    finalScore,
    creditTier,
    riskCategory,
    confidenceLevel,
    metrics,
    breakdown
  );

  return {
    agentId: metrics.agentId,
    score: finalScore,
    rawScore: Math.round(rawScore),
    previousScore: prevScore,
    trend,
    confidenceLevel,
    confidenceMultiplier: parseFloat(confidenceMultiplier.toFixed(3)),
    evidenceCount: totalEvidence,
    creditTier,
    riskCategory,
    lastUpdated: new Date().toISOString(),
    breakdown,
    explanation,
  };
}

export function mapCreditTier(score: number): CreditTier {
  if (score <= CREDIT_TIER_THRESHOLDS.BRONZE) return "Bronze";
  if (score <= CREDIT_TIER_THRESHOLDS.SILVER) return "Silver";
  if (score <= CREDIT_TIER_THRESHOLDS.GOLD) return "Gold";
  if (score <= CREDIT_TIER_THRESHOLDS.PLATINUM) return "Platinum";
  return "Diamond";
}

export function mapRiskCategory(score: number): RiskCategory {
  if (score <= RISK_CATEGORY_THRESHOLDS.CRITICAL) return "Critical";
  if (score <= RISK_CATEGORY_THRESHOLDS.HIGH) return "High";
  if (score <= RISK_CATEGORY_THRESHOLDS.MODERATE) return "Moderate";
  if (score <= RISK_CATEGORY_THRESHOLDS.LOW) return "Low";
  return "Excellent";
}

function generateExplanationNarrative(
  score: number,
  tier: CreditTier,
  risk: RiskCategory,
  confidence: ConfidenceLevel,
  metrics: AgentMetrics,
  breakdown: ReputationResult["breakdown"]
): string {
  const parts: string[] = [];

  parts.push(
    `Agent ${metrics.agentId} holds a score of ${score}/1000 (${tier} Tier, ${risk} Risk) with ${confidence} evidence confidence.`
  );

  if (confidence === "Low") {
    parts.push(
      "Notice: Historical sample size is currently limited; score is regressed toward the baseline prior (500) to mitigate Sybil risks."
    );
  } else {
    parts.push(
      `Supported by ${metrics.totalTransactions} transactions and ${metrics.totalTasks} recorded tasks.`
    );
  }

  if (metrics.substantiatedDisputes > 0) {
    parts.push(
      `Warning: ${metrics.substantiatedDisputes} substantiated disputes resulted in a penalty on the dispute component (${breakdown.disputeReliability.score}/1000).`
    );
  } else {
    parts.push("Zero substantiated disputes recorded to date.");
  }

  if (metrics.bondedStake >= metrics.minStakeRequirement) {
    parts.push(
      `Economic backing is reinforced with ${metrics.bondedStake.toLocaleString()} CRED bonded collateral.`
    );
  } else {
    parts.push("Collateral stake is below or at minimum requirement.");
  }

  return parts.join(" ");
}
