import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CerdAgent database with 12 realistic demo AI agents...");

  // Clear existing demo records
  await prisma.disputeEvidence.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.taskEvidence.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.reputationHistory.deleteMany({});
  await prisma.reputationScore.deleteMany({});
  await prisma.stakeHistory.deleteMany({});
  await prisma.stake.deleteMany({});
  await prisma.agentWallet.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.apiKey.deleteMany({});

  // Seed default Demo API Key for developer testing
  await prisma.apiKey.create({
    data: {
      keyHash: "cerd_live_demo_key_998877",
      name: "Default Demo Agent Key",
      ownerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      tier: "ENTERPRISE",
      rateLimitPerMin: 120,
      isActive: true,
    },
  });

  const demoAgents = [
    {
      id: "AGT-RESEARCH-01",
      name: "ResearchBot-01",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      operatorAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      description: "Autonomous biomedical & multi-modal scientific literature analysis agent.",
      category: "Research",
      metadataUri: "ipfs://bafybeiresearchbot01/meta.json",
      verificationStatus: "VERIFIED",
      reputationScore: 865,
      creditTier: "Platinum",
      riskCategory: "Low",
      bondedStake: 2500.0,
      txSuccess: 128,
      txFail: 2,
      tasksVerified: 94,
      tasksRejected: 1,
      disputes: 0,
      volume: 48200,
    },
    {
      id: "AGT-CODING-02",
      name: "CodePilot-02",
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      operatorAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      description: "Full-stack code generation, smart contract security auditing and refactoring agent.",
      category: "Coding",
      metadataUri: "ipfs://bafybeicodepilot02/meta.json",
      verificationStatus: "VERIFIED",
      reputationScore: 920,
      creditTier: "Diamond",
      riskCategory: "Excellent",
      bondedStake: 4000.0,
      txSuccess: 215,
      txFail: 1,
      tasksVerified: 142,
      tasksRejected: 0,
      disputes: 0,
      volume: 92400,
    },
    {
      id: "AGT-TRADING-03",
      name: "TradeMind-03",
      walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      operatorAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      description: "High-frequency arbitrage and liquidity balancer across decentralized automated market makers.",
      category: "Trading",
      metadataUri: "ipfs://bafybeitrademind03/meta.json",
      verificationStatus: "PENDING",
      reputationScore: 450,
      creditTier: "Silver",
      riskCategory: "Moderate",
      bondedStake: 300.0,
      txSuccess: 38,
      txFail: 14,
      tasksVerified: 12,
      tasksRejected: 4,
      disputes: 1,
      volume: 18900,
    },
    {
      id: "AGT-DATA-04",
      name: "DataOracle-04",
      walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      operatorAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
      description: "Decentralized consensus oracle ingesting, verifying, and indexing off-chain telemetry feeds.",
      category: "DataAnalysis",
      metadataUri: "ipfs://bafybeidataoracle04/meta.json",
      verificationStatus: "VERIFIED",
      reputationScore: 720,
      creditTier: "Gold",
      riskCategory: "Low",
      bondedStake: 1200.0,
      txSuccess: 84,
      txFail: 4,
      tasksVerified: 56,
      tasksRejected: 2,
      disputes: 0,
      volume: 34500,
    },
    {
      id: "AGT-PAYMENT-05",
      name: "PayBot-05",
      walletAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
      operatorAddress: "0x976EA74026E72CD55542602e771144cD000deedd",
      description: "Cross-service micro-payment routing engine for autonomous API invocations.",
      category: "Payment",
      metadataUri: "ipfs://bafybeipaybot05/meta.json",
      verificationStatus: "PENDING",
      reputationScore: 310,
      creditTier: "Bronze",
      riskCategory: "High",
      bondedStake: 150.0,
      txSuccess: 22,
      txFail: 12,
      tasksVerified: 9,
      tasksRejected: 5,
      disputes: 2,
      volume: 8200,
    },
    {
      id: "AGT-DEFI-06",
      name: "DeFiSentinel-06",
      walletAddress: "0x976EA74026E72CD55542602e771144cD000deedd",
      operatorAddress: "0x0fC5025C764cE34df352757e82f7B5c4Df39A836",
      description: "Yield optimization and liquidation protection sentinel monitoring vault collateral ratios.",
      category: "DeFi",
      metadataUri: "ipfs://bafybeidefisentinel06/meta.json",
      verificationStatus: "VERIFIED",
      reputationScore: 885,
      creditTier: "Platinum",
      riskCategory: "Low",
      bondedStake: 3200.0,
      txSuccess: 162,
      txFail: 2,
      tasksVerified: 88,
      tasksRejected: 0,
      disputes: 0,
      volume: 71000,
    },
    {
      id: "AGT-SERVICE-07",
      name: "AutoAudit-07",
      walletAddress: "0x0fC5025C764cE34df352757e82f7B5c4Df39A836",
      operatorAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      description: "Autonomous smart contract static analysis and fuzz testing service agent.",
      category: "AutonomousService",
      metadataUri: "ipfs://bafybeiautoaudit07/meta.json",
      verificationStatus: "VERIFIED",
      reputationScore: 790,
      creditTier: "Platinum",
      riskCategory: "Low",
      bondedStake: 1800.0,
      txSuccess: 95,
      txFail: 3,
      tasksVerified: 71,
      tasksRejected: 2,
      disputes: 0,
      volume: 42100,
    },
    {
      id: "AGT-TRADING-08",
      name: "SynthetixTrader-08",
      walletAddress: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
      operatorAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
      description: "Synthetic derivatives and hedging agent executing perpetual swap rebalancing.",
      category: "Trading",
      metadataUri: "ipfs://bafybeitrader08/meta.json",
      verificationStatus: "VERIFIED",
      reputationScore: 640,
      creditTier: "Gold",
      riskCategory: "Low",
      bondedStake: 850.0,
      txSuccess: 62,
      txFail: 7,
      tasksVerified: 34,
      tasksRejected: 3,
      disputes: 0,
      volume: 29800,
    },
    {
      id: "AGT-ROGUE-09",
      name: "RogueExec-09",
      walletAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
      operatorAddress: "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
      description: "Flagged autonomous agent with repeated SLA breaches and non-delivered task proofs.",
      category: "AutonomousService",
      metadataUri: "ipfs://bafybeirogue09/meta.json",
      verificationStatus: "FLAGGED",
      reputationScore: 180,
      creditTier: "Bronze",
      riskCategory: "Critical",
      bondedStake: 50.0,
      txSuccess: 12,
      txFail: 24,
      tasksVerified: 4,
      tasksRejected: 16,
      disputes: 3,
      volume: 5300,
    },
    {
      id: "AGT-CODING-10",
      name: "InfraProvisioner-10",
      walletAddress: "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
      operatorAddress: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
      description: "Decentralized RPC cluster coordinator and validator node health provisioning bot.",
      category: "Coding",
      metadataUri: "ipfs://bafybeiinfra10/meta.json",
      verificationStatus: "VERIFIED",
      reputationScore: 830,
      creditTier: "Platinum",
      riskCategory: "Low",
      bondedStake: 2100.0,
      txSuccess: 110,
      txFail: 2,
      tasksVerified: 78,
      tasksRejected: 1,
      disputes: 0,
      volume: 52000,
    },
    {
      id: "AGT-DEFI-11",
      name: "MarketMaker-11",
      walletAddress: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
      operatorAddress: "0xFabb0ac9d68B0B445fB7357272Ff202C5651694a",
      description: "Algorithmic market maker maintaining orderbook spreads across Base DEXs.",
      category: "DeFi",
      metadataUri: "ipfs://bafybeimm11/meta.json",
      verificationStatus: "PENDING",
      reputationScore: 520,
      creditTier: "Silver",
      riskCategory: "Moderate",
      bondedStake: 600.0,
      txSuccess: 45,
      txFail: 9,
      tasksVerified: 21,
      tasksRejected: 3,
      disputes: 0,
      volume: 21400,
    },
    {
      id: "AGT-RESEARCH-12",
      name: "KnowledgeGraph-12",
      walletAddress: "0xFabb0ac9d68B0B445fB7357272Ff202C5651694a",
      operatorAddress: "0x1CBD3E2b51080071914948Ff85b18085505C463C",
      description: "Enterprise knowledge ontology builder extracting entity relationships across verified data sources.",
      category: "Research",
      metadataUri: "ipfs://bafybeiknowledge12/meta.json",
      verificationStatus: "VERIFIED",
      reputationScore: 955,
      creditTier: "Diamond",
      riskCategory: "Excellent",
      bondedStake: 5000.0,
      txSuccess: 280,
      txFail: 0,
      tasksVerified: 195,
      tasksRejected: 0,
      disputes: 0,
      volume: 135000,
    },
  ];

  // PASS 1: Create all agents
  for (const d of demoAgents) {
    console.log(`Creating agent record: ${d.name} (${d.id})...`);
    await prisma.agent.create({
      data: {
        id: d.id,
        name: d.name,
        walletAddress: d.walletAddress,
        operatorAddress: d.operatorAddress,
        description: d.description,
        category: d.category,
        metadataUri: d.metadataUri,
        verificationStatus: d.verificationStatus,
        reputationScore: d.reputationScore,
        creditTier: d.creditTier,
        riskCategory: d.riskCategory,
        bondedStake: d.bondedStake,
        isSimulated: true, // Clearly identified as simulated demo record
        wallets: {
          create: {
            walletAddress: d.walletAddress,
            chainId: 84532, // Base Sepolia
            isPrimary: true,
          },
        },
        reputationProfile: {
          create: {
            currentScore: d.reputationScore,
            previousScore: Math.max(200, d.reputationScore - 15),
            trend: d.reputationScore >= 500 ? "UP" : "DOWN",
            confidenceLevel: d.txSuccess > 50 ? "HIGH" : "MEDIUM",
            riskCategory: d.riskCategory,
            transactionReliability: d.txSuccess / (d.txSuccess + d.txFail),
            taskCompletionReliability: d.tasksVerified / (d.tasksVerified + d.tasksRejected),
            paymentReliability: d.txSuccess / (d.txSuccess + d.txFail),
            stakeReliability: Math.min(1.0, Math.log(1 + d.bondedStake / 100) / Math.log(101)),
            disputeReliability: Math.max(0.0, 1.0 - d.disputes * 0.25),
            rawScore: d.reputationScore,
            confidenceMultiplier: d.txSuccess > 50 ? 0.95 : 0.65,
            totalEvaluatedTransactions: d.txSuccess + d.txFail,
            totalEvaluatedTasks: d.tasksVerified + d.tasksRejected,
          },
        },
        reputationHistory: {
          create: [
            {
              score: Math.max(200, d.reputationScore - 40),
              changeDelta: -10,
              reason: "Initial registration and baseline calibration",
              timestamp: new Date(Date.now() - 30 * 86400000),
            },
            {
              score: Math.max(200, d.reputationScore - 20),
              changeDelta: 20,
              reason: "Verified execution of multi-agent batch tasks",
              timestamp: new Date(Date.now() - 15 * 86400000),
            },
            {
              score: d.reputationScore,
              changeDelta: 20,
              reason: "Settlement milestone and bonded collateral increase",
              timestamp: new Date(Date.now() - 2 * 86400000),
            },
          ],
        },
        stakes: {
          create: {
            tokenAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            bondedAmount: d.bondedStake,
            minStakeRequirement: 100.0,
            status: "ACTIVE",
          },
        },
        stakeHistory: {
          create: [
            {
              actionType: "DEPOSIT",
              amount: 500.0,
              txHash: `0xsim_stake_${d.id}_01`,
              reason: "Initial collateral bonding",
              timestamp: new Date(Date.now() - 35 * 86400000),
            },
            ...(d.bondedStake > 500
              ? [
                  {
                    actionType: "INCREASE",
                    amount: d.bondedStake - 500.0,
                    txHash: `0xsim_stake_${d.id}_02`,
                    reason: "Credit limit expansion staking",
                    timestamp: new Date(Date.now() - 10 * 86400000),
                  },
                ]
              : []),
          ],
        },
      },
    });
  }

  // PASS 2: Create cross-agent transactions, tasks, and disputes
  console.log("Generating simulated transaction and task networks...");
  for (let i = 0; i < demoAgents.length; i++) {
    const current = demoAgents[i];
    const partner = demoAgents[(i + 1) % demoAgents.length];

    // Transaction from current to partner
    await prisma.transaction.create({
      data: {
        txHash: `0xsim_tx_${current.id}_${partner.id}_01`,
        senderAgentId: current.id,
        receiverAgentId: partner.id,
        amount: Math.round(150 + (i * 45)),
        tokenSymbol: "CRED",
        status: current.id === "AGT-ROGUE-09" ? "DISPUTED" : "COMPLETED",
        settlementTimeSeconds: 10 + (i % 5),
        serviceReference: `SRV-${current.category.toUpperCase()}-JOB`,
        isSimulated: true,
        blockNumber: 18452900 + i * 50,
        timestamp: new Date(Date.now() - (i + 1) * 3600000 * 8),
      },
    });

    // Task from partner to current
    const task = await prisma.task.create({
      data: {
        taskId: `TSK-${current.id.substring(4)}-${100 + i}`,
        requestingAgentId: partner.id,
        executingAgentId: current.id,
        title: `${current.category} Verified Compute Pipeline`,
        description: `Execute cryptographically verified autonomous task for ${partner.name}.`,
        taskValue: Math.round(80 + (i * 30)),
        tokenSymbol: "CRED",
        deadline: new Date(Date.now() + 5 * 86400000),
        status: current.id === "AGT-ROGUE-09" ? "REJECTED" : "VERIFIED",
        evidenceUri: `ipfs://bafybeitaskevidence_${current.id}`,
        reviewerNotes: current.id === "AGT-ROGUE-09" ? "Evidence hash mismatch. Rejected." : "Verified attestation proof.",
        isSimulated: true,
        completedAt: new Date(Date.now() - 2 * 86400000),
        verifiedAt: new Date(Date.now() - 1 * 86400000),
        evidences: {
          create: {
            submitterAgentId: current.id,
            evidenceUri: `ipfs://bafybeitaskevidence_${current.id}`,
            evidenceHash: `0xhash_${current.id}_proof`,
            description: "Detailed output artifacts and computational trace logs.",
          },
        },
      },
    });

    // Dispute for rogue agents
    if (current.disputes > 0) {
      await prisma.dispute.create({
        data: {
          disputeId: `DSP-${current.id.substring(4)}-01`,
          taskId: task.id,
          initiatorAgentId: partner.id,
          counterpartyAgentId: current.id,
          reason: "Non-responsive to specification and failure to deliver on-chain evidence",
          status: "RESOLVED_REQUESTER",
          resolutionNotes: "Arbitrator concluded breach of protocol SLA. 50 CRED collateral slashed.",
          resolvedBy: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          resolvedAt: new Date(Date.now() - 4 * 86400000),
          evidences: {
            create: {
              submitterAgentId: partner.id,
              evidenceUri: `ipfs://bafybeidispute_${current.id}`,
              evidenceHash: `0xdispute_proof_${current.id}`,
              explanation: "Timestamped ping failure traces across 12 consecutive hours.",
            },
          },
        },
      });
    }
  }

  console.log("Seeding completed successfully! 12 agents, transactions, tasks, and disputes created.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
