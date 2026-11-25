import {
  AgentCategory,
  CounterpartyEvaluation,
  ProposedTransaction,
  ReputationResult,
  RiskFactor,
} from "./types";

export interface AgentProfileData {
  agentId: string;
  name: string;
  walletAddress: string;
  category: AgentCategory;
  verificationStatus: string; // PENDING, VERIFIED, FLAGGED, REVOKED
  bondedStake: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  disputedTransactions: number;
  totalTasks: number;
  verifiedTasks: number;
  substantiatedDisputes: number;
}

/**
 * Evaluates counterparty risk for an AI agent prior to entering an economic agreement or transaction.
 */
export function evaluateCounterpartyRisk(
  agent: AgentProfileData,
  proposed: ProposedTransaction,
  reputation: ReputationResult
): CounterpartyEvaluation {
  const warnings: string[] = [];
  const riskFactors: RiskFactor[] = [];

  // Calculate success ratios
  const totalTx = agent.successfulTransactions + agent.failedTransactions;
  const txSuccessRatio = totalTx > 0 ? agent.successfulTransactions / totalTx : 0.0;
  const taskCompletionRatio = agent.totalTasks > 0 ? agent.verifiedTasks / agent.totalTasks : 0.0;
  const disputeRate = totalTx > 0 ? agent.disputedTransactions / totalTx : 0.0;

  // 1. Exposure Limits Calculation based on Credit Tier & Bonded Stake
  let exposureMultiplier = 0.0;
  switch (reputation.creditTier) {
    case "Bronze":
      exposureMultiplier = reputation.score < 200 ? 0.0 : 0.15;
      break;
    case "Silver":
      exposureMultiplier = 0.50;
      break;
    case "Gold":
      exposureMultiplier = 1.25;
      break;
    case "Platinum":
      exposureMultiplier = 2.50;
      break;
    case "Diamond":
      exposureMultiplier = 5.00;
      break;
  }

  // Base exposure from stake
  const baselineExposure = Math.max(50, agent.bondedStake * exposureMultiplier);
  // Cap by credit score confidence
  const recommendedExposureCred = Math.round(baselineExposure * reputation.confidenceMultiplier);
  const exposureRatio = recommendedExposureCred > 0 ? proposed.proposedAmountCred / recommendedExposureCred : 999.0;
  const isExposureAcceptable = proposed.proposedAmountCred <= recommendedExposureCred;

  // 2. Risk Factors Analysis
  // Verification check
  if (agent.verificationStatus !== "VERIFIED") {
    warnings.push(`Identity verification status is '${agent.verificationStatus}', not officially verified.`);
    riskFactors.push({
      severity: "HIGH",
      title: "Unverified Identity Status",
      description: "Agent has not passed validator identity verification.",
      impact: "Higher probability of sybil identity or unmonitored agent operator.",
    });
  }

  // Exposure check
  if (!isExposureAcceptable) {
    warnings.push(
      `Proposed amount (${proposed.proposedAmountCred} CRED) exceeds recommended safe exposure limit (${recommendedExposureCred} CRED).`
    );
    riskFactors.push({
      severity: proposed.proposedAmountCred > recommendedExposureCred * 2 ? "CRITICAL" : "HIGH",
      title: "Over-Exposure Risk",
      description: `Requested deal size is ${Math.round(exposureRatio * 100)}% of agent's collateralized risk tolerance.`,
      impact: "Potential default without sufficient slashed collateral recovery in event of failure.",
    });
  }

  // Dispute check
  if (agent.substantiatedDisputes > 0 || disputeRate > 0.05) {
    warnings.push(`Agent has ${agent.substantiatedDisputes} substantiated disputes on record.`);
    riskFactors.push({
      severity: agent.substantiatedDisputes >= 3 ? "CRITICAL" : "HIGH",
      title: "Historical Dispute Penalties",
      description: `${agent.substantiatedDisputes} dispute verdicts concluded against this agent.`,
      impact: "Demonstrated prior non-compliance with task contracts or payment terms.",
    });
  }

  // Confidence / Sample size check
  if (reputation.confidenceLevel === "Low") {
    warnings.push("Evidence sample size is low. Score incorporates baseline regression prior.");
    riskFactors.push({
      severity: "MEDIUM",
      title: "Limited Track Record",
      description: "Fewer than 8 verifiable on-chain records exist.",
      impact: "Performance reliability is not yet statistically assured.",
    });
  }

  // Stake backing check
  if (agent.bondedStake < 100) {
    warnings.push("Low bonded collateral stake (less than 100 CRED standard).");
    riskFactors.push({
      severity: "MEDIUM",
      title: "Minimal Skin-in-the-Game",
      description: "Bonded collateral does not provide substantial deterrent against rogue execution.",
      impact: "Lack of economic commitment.",
    });
  }

  // 3. Executive Summary & Recommendation
  let recommendation = "";
  if (reputation.riskCategory === "Critical" || !isExposureAcceptable && exposureRatio > 3) {
    recommendation =
      "Reject or require full upfront escrow / 100% pre-collateralization. Counterparty carries unacceptable default or dispute risk.";
  } else if (reputation.riskCategory === "High" || !isExposureAcceptable) {
    recommendation =
      "Proceed only with phased milestone disbursements. Reduce deal size below recommended exposure limit.";
  } else if (reputation.riskCategory === "Moderate") {
    recommendation =
      "Standard contract terms recommended with standard dispute window. Ensure deliverables are anchored on-chain.";
  } else {
    recommendation =
      "Counterparty shows strong reliability and sufficient economic backing. Favorable credit profile for autonomous interaction.";
  }

  const executiveSummary =
    `Agent ${agent.name} (${agent.agentId}) holds reputation score ${reputation.score}/1000 (${reputation.creditTier} Tier, ${reputation.riskCategory} Risk) with ${reputation.confidenceLevel} confidence. Proposed transaction of ${proposed.proposedAmountCred} CRED in ${proposed.category} evaluates to ${isExposureAcceptable ? "ACCEPTABLE" : "ELEVATED"} risk relative to the recommended exposure limit of ${recommendedExposureCred} CRED.`;

  return {
    targetAgentId: agent.agentId,
    targetWalletAddress: agent.walletAddress,
    reputationScore: reputation.score,
    creditTier: reputation.creditTier,
    riskCategory: reputation.riskCategory,
    confidence: reputation.confidenceLevel,
    identityVerificationStatus: agent.verificationStatus,
    transactionSuccessRatio: parseFloat(txSuccessRatio.toFixed(3)),
    taskCompletionRatio: parseFloat(taskCompletionRatio.toFixed(3)),
    disputeRate: parseFloat(disputeRate.toFixed(3)),
    bondedStake: agent.bondedStake,
    proposedAmountCred: proposed.proposedAmountCred,
    recommendedExposureCred,
    exposureRatio: parseFloat(exposureRatio.toFixed(2)),
    isExposureAcceptable,
    warnings,
    riskFactors,
    executiveSummary,
    recommendation,
    evaluatedAt: new Date().toISOString(),
  };
}
