import { calculateReputationScore } from "./engine";
import { evaluateCounterpartyRisk, AgentProfileData } from "./risk";
import { AgentMetrics, ProposedTransaction } from "./types";

console.log("-----------------------------------------------------------------");
console.log("RUNNING REPUTATION & RISK ENGINE TESTS");
console.log("-----------------------------------------------------------------");

// TEST 1: New Agent with Zero History (Edge Case)
const newAgentMetrics: AgentMetrics = {
  agentId: "AGT-NEW-00",
  totalTransactions: 0,
  successfulTransactions: 0,
  failedTransactions: 0,
  cancelledTransactions: 0,
  disputedTransactions: 0,
  totalVolumeCred: 0,
  totalTasks: 0,
  verifiedTasks: 0,
  rejectedTasks: 0,
  pendingTasks: 0,
  totalPayments: 0,
  settledPayments: 0,
  failedPayments: 0,
  bondedStake: 0,
  minStakeRequirement: 100,
  substantiatedDisputes: 0,
  resolvedDisputesInFavor: 0,
  unresolvedDisputes: 0,
};

const newAgentResult = calculateReputationScore(newAgentMetrics);
console.log("\n[TEST 1] New Agent (Zero History):");
console.log("  Score:", newAgentResult.score, "/ 1000");
console.log("  Confidence:", newAgentResult.confidenceLevel, `(${newAgentResult.confidenceMultiplier})`);
console.log("  Credit Tier:", newAgentResult.creditTier);
console.log("  Risk Category:", newAgentResult.riskCategory);
if (newAgentResult.score > 600 || newAgentResult.confidenceLevel !== "Low") {
  throw new Error("FAIL: New agent should not have high score or high confidence!");
}
console.log("  ✓ PASS: New agent properly regressed towards neutral prior with Low confidence.");

// TEST 2: Established Elite Agent (High Volume, High Success)
const eliteMetrics: AgentMetrics = {
  agentId: "AGT-RESEARCH-01",
  totalTransactions: 150,
  successfulTransactions: 147,
  failedTransactions: 3,
  cancelledTransactions: 0,
  disputedTransactions: 0,
  totalVolumeCred: 85000,
  totalTasks: 65,
  verifiedTasks: 64,
  rejectedTasks: 1,
  pendingTasks: 2,
  totalPayments: 150,
  settledPayments: 148,
  failedPayments: 2,
  bondedStake: 2500,
  minStakeRequirement: 100,
  substantiatedDisputes: 0,
  resolvedDisputesInFavor: 0,
  unresolvedDisputes: 0,
};

const eliteResult = calculateReputationScore(eliteMetrics);
console.log("\n[TEST 2] Elite Agent (High Volume, High Stake):");
console.log("  Score:", eliteResult.score, "/ 1000");
console.log("  Confidence:", eliteResult.confidenceLevel, `(${eliteResult.confidenceMultiplier})`);
console.log("  Credit Tier:", eliteResult.creditTier);
console.log("  Risk Category:", eliteResult.riskCategory);
if (eliteResult.score < 800 || eliteResult.confidenceLevel !== "High") {
  throw new Error("FAIL: Established high performing agent should receive excellent score & high confidence!");
}
console.log("  ✓ PASS: Elite agent achieves Excellent status & High confidence.");

// TEST 3: Malicious / High Dispute Agent
const maliciousMetrics: AgentMetrics = {
  agentId: "AGT-ROGUE-99",
  totalTransactions: 40,
  successfulTransactions: 22,
  failedTransactions: 18,
  cancelledTransactions: 5,
  disputedTransactions: 8,
  totalVolumeCred: 12000,
  totalTasks: 20,
  verifiedTasks: 8,
  rejectedTasks: 12,
  pendingTasks: 0,
  totalPayments: 35,
  settledPayments: 19,
  failedPayments: 16,
  bondedStake: 100,
  minStakeRequirement: 100,
  substantiatedDisputes: 6,
  resolvedDisputesInFavor: 0,
  unresolvedDisputes: 2,
};

const maliciousResult = calculateReputationScore(maliciousMetrics);
console.log("\n[TEST 3] Rogue / High-Dispute Agent:");
console.log("  Score:", maliciousResult.score, "/ 1000");
console.log("  Confidence:", maliciousResult.confidenceLevel);
console.log("  Credit Tier:", maliciousResult.creditTier);
console.log("  Risk Category:", maliciousResult.riskCategory);
if (maliciousResult.score > 399) {
  throw new Error("FAIL: High-dispute agent should be in Critical or High Risk!");
}
console.log("  ✓ PASS: High-dispute agent properly classified into Critical/High Risk.");

// TEST 4: Counterparty Risk Assessment
const agentProfile: AgentProfileData = {
  agentId: eliteMetrics.agentId,
  name: "ResearchBot-01",
  walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  category: "Research",
  verificationStatus: "VERIFIED",
  bondedStake: eliteMetrics.bondedStake,
  totalTransactions: eliteMetrics.totalTransactions,
  successfulTransactions: eliteMetrics.successfulTransactions,
  failedTransactions: eliteMetrics.failedTransactions,
  disputedTransactions: eliteMetrics.disputedTransactions,
  totalTasks: eliteMetrics.totalTasks,
  verifiedTasks: eliteMetrics.verifiedTasks,
  substantiatedDisputes: eliteMetrics.substantiatedDisputes,
};

const proposedTx: ProposedTransaction = {
  targetAgentId: eliteMetrics.agentId,
  proposedAmountCred: 500,
  category: "Research",
  durationHours: 24,
};

const riskEval = evaluateCounterpartyRisk(agentProfile, proposedTx, eliteResult);
console.log("\n[TEST 4] Counterparty Risk Evaluation:");
console.log("  Proposed:", proposedTx.proposedAmountCred, "CRED");
console.log("  Recommended Max Exposure:", riskEval.recommendedExposureCred, "CRED");
console.log("  Acceptable:", riskEval.isExposureAcceptable);
console.log("  Warnings count:", riskEval.warnings.length);
console.log("  Recommendation:", riskEval.recommendation);
if (!riskEval.isExposureAcceptable) {
  throw new Error("FAIL: 500 CRED should be acceptable for Diamond agent with 2500 bonded stake!");
}
console.log("  ✓ PASS: Risk evaluation correctly identified acceptable exposure.");

console.log("\n-----------------------------------------------------------------");
console.log("ALL REPUTATION & RISK ENGINE TESTS PASSED!");
console.log("-----------------------------------------------------------------");
