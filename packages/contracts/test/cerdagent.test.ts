import { expect } from "chai";
import { ethers } from "hardhat";

describe("CerdAgent Smart Contract Suite", function () {
  let deployer: any;
  let operator: any;
  let agentWallet1: any;
  let agentWallet2: any;
  let arbitrator: any;
  let unauthorized: any;

  let credToken: any;
  let agentIdentity: any;
  let reputationRegistry: any;
  let agentStaking: any;
  let transactionRegistry: any;
  let taskVerification: any;
  let disputeResolution: any;

  const minStake = ethers.parseEther("100");
  const withdrawalDelay = 10; // 10 seconds for test

  beforeEach(async function () {
    [deployer, operator, agentWallet1, agentWallet2, arbitrator, unauthorized] = await ethers.getSigners();

    // 1. Deploy MockCreditToken
    const MockCreditToken = await ethers.getContractFactory("MockCreditToken");
    credToken = await MockCreditToken.deploy();
    await credToken.waitForDeployment();

    // 2. Deploy AgentIdentity
    const AgentIdentity = await ethers.getContractFactory("AgentIdentity");
    agentIdentity = await AgentIdentity.deploy();
    await agentIdentity.waitForDeployment();

    // 3. Deploy ReputationRegistry
    const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
    reputationRegistry = await ReputationRegistry.deploy();
    await reputationRegistry.waitForDeployment();

    // 4. Deploy AgentStaking
    const AgentStaking = await ethers.getContractFactory("AgentStaking");
    agentStaking = await AgentStaking.deploy(await credToken.getAddress(), minStake, withdrawalDelay);
    await agentStaking.waitForDeployment();

    // 5. Deploy TransactionRegistry
    const TransactionRegistry = await ethers.getContractFactory("TransactionRegistry");
    transactionRegistry = await TransactionRegistry.deploy();
    await transactionRegistry.waitForDeployment();

    // 6. Deploy TaskVerification
    const TaskVerification = await ethers.getContractFactory("TaskVerification");
    taskVerification = await TaskVerification.deploy();
    await taskVerification.waitForDeployment();

    // 7. Deploy DisputeResolution
    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    disputeResolution = await DisputeResolution.deploy(await agentStaking.getAddress());
    await disputeResolution.waitForDeployment();

    // Wire permissions
    await agentStaking.setDisputeResolver(await disputeResolution.getAddress(), true);
    await disputeResolution.setArbitrator(arbitrator.address, true);

    // Fund operator and agent with test CRED
    await credToken.transfer(operator.address, ethers.parseEther("5000"));
    await credToken.connect(operator).approve(await agentStaking.getAddress(), ethers.MaxUint256);
  });

  describe("AgentIdentity", function () {
    it("should successfully register an agent", async function () {
      await agentIdentity.connect(operator).registerAgent(
        "AGT-RESEARCH-01",
        "ResearchBot One",
        agentWallet1.address,
        0, // Category.Research
        "ipfs://bafybeicerdagent01"
      );

      expect(await agentIdentity.isRegisteredAgent("AGT-RESEARCH-01")).to.be.true;
      const profile = await agentIdentity.getAgentProfile("AGT-RESEARCH-01");
      expect(profile.name).to.equal("ResearchBot One");
      expect(profile.walletAddress).to.equal(agentWallet1.address);
      expect(profile.operatorAddress).to.equal(operator.address);
      expect(profile.isActive).to.be.true;
    });

    it("should prevent duplicate agent registrations with same ID or wallet", async function () {
      await agentIdentity.connect(operator).registerAgent(
        "AGT-RESEARCH-01",
        "ResearchBot One",
        agentWallet1.address,
        0,
        "ipfs://bafybeicerdagent01"
      );

      // Attempt same agentId
      await expect(
        agentIdentity.connect(operator).registerAgent(
          "AGT-RESEARCH-01",
          "Duplicate Name",
          agentWallet2.address,
          0,
          "ipfs://bafybeidup"
        )
      ).to.be.revertedWith("Agent ID already registered");

      // Attempt same wallet
      await expect(
        agentIdentity.connect(operator).registerAgent(
          "AGT-RESEARCH-02",
          "Another Agent",
          agentWallet1.address,
          0,
          "ipfs://bafybeidup2"
        )
      ).to.be.revertedWith("Wallet already bound to an agent");
    });
  });

  describe("ReputationRegistry", function () {
    it("should reject score updates from unauthorized accounts", async function () {
      await expect(
        reputationRegistry.connect(unauthorized).updateAgentScore(
          "AGT-RESEARCH-01",
          850,
          2, // High confidence
          "Routine score update",
          "ipfs://bafybeiexplanation01"
        )
      ).to.be.revertedWith("Caller not authorized scorer");
    });

    it("should allow authorized scorer to update and record score history", async function () {
      await reputationRegistry.updateAgentScore(
        "AGT-RESEARCH-01",
        850,
        2,
        "Verified task milestone reached",
        "ipfs://bafybeiexplanation01"
      );

      const scoreData = await reputationRegistry.getAgentScore("AGT-RESEARCH-01");
      expect(scoreData.score).to.equal(850);
      expect(scoreData.confidenceLevel).to.equal(2);
      expect(scoreData.updateCount).to.equal(1);

      const history = await reputationRegistry.getScoreHistory("AGT-RESEARCH-01");
      expect(history.length).to.equal(1);
      expect(history[0].score).to.equal(850);
      expect(history[0].delta).to.equal(850);
    });

    it("should prevent scores exceeding 1000", async function () {
      await expect(
        reputationRegistry.updateAgentScore(
          "AGT-RESEARCH-01",
          1001,
          2,
          "Invalid high score",
          ""
        )
      ).to.be.revertedWith("Score exceeds maximum 1000");
    });
  });

  describe("AgentStaking", function () {
    it("should require minimum stake when depositing collateral", async function () {
      await expect(
        agentStaking.connect(operator).stake("AGT-RESEARCH-01", ethers.parseEther("50"))
      ).to.be.revertedWith("Amount below minimum stake requirement");
    });

    it("should allow staking and increasing stake", async function () {
      const stakeAmount = ethers.parseEther("200");
      await agentStaking.connect(operator).stake("AGT-RESEARCH-01", stakeAmount);

      expect(await agentStaking.getBondedStake("AGT-RESEARCH-01")).to.equal(stakeAmount);

      const addAmount = ethers.parseEther("100");
      await agentStaking.connect(operator).increaseStake("AGT-RESEARCH-01", addAmount);

      expect(await agentStaking.getBondedStake("AGT-RESEARCH-01")).to.equal(stakeAmount + addAmount);
    });

    it("should enforce withdrawal delay before stake can be withdrawn", async function () {
      await agentStaking.connect(operator).stake("AGT-RESEARCH-01", ethers.parseEther("200"));
      await agentStaking.connect(operator).requestUnstake("AGT-RESEARCH-01", ethers.parseEther("50"));

      // Immediate withdrawal should revert
      await expect(
        agentStaking.connect(operator).withdrawEligibleStake("AGT-RESEARCH-01")
      ).to.be.revertedWith("Withdrawal lock period active");

      // Fast forward time past delay
      await ethers.provider.send("evm_increaseTime", [withdrawalDelay + 2]);
      await ethers.provider.send("evm_mine", []);

      // Now withdrawal should succeed
      await expect(
        agentStaking.connect(operator).withdrawEligibleStake("AGT-RESEARCH-01")
      ).to.emit(agentStaking, "StakeWithdrawn");

      expect(await agentStaking.getBondedStake("AGT-RESEARCH-01")).to.equal(ethers.parseEther("150"));
    });
  });

  describe("TaskVerification", function () {
    it("should cycle through task creation, acceptance, submission, and verification", async function () {
      const deadline = (await ethers.provider.getBlock("latest"))!.timestamp + 3600;

      // 1. Create task
      await taskVerification.createTask(
        "TSK-1001",
        "AGT-RESEARCH-01",
        "AGT-CODING-02",
        "0x1234567890abcdef",
        ethers.parseEther("50"),
        deadline
      );

      let task = await taskVerification.getTask("TSK-1001");
      expect(task.status).to.equal(0); // TaskStatus.Created

      // 2. Accept task
      await taskVerification.acceptTask("TSK-1001");
      task = await taskVerification.getTask("TSK-1001");
      expect(task.status).to.equal(1); // TaskStatus.Accepted

      // 3. Submit evidence
      await taskVerification.submitTaskEvidence("TSK-1001", "ipfs://bafybeitaskevidence01");
      task = await taskVerification.getTask("TSK-1001");
      expect(task.status).to.equal(3); // TaskStatus.Submitted

      // 4. Verify task
      await taskVerification.verifyTask("TSK-1001", true, "High quality code delivered");
      task = await taskVerification.getTask("TSK-1001");
      expect(task.status).to.equal(4); // TaskStatus.Verified
    });
  });

  describe("DisputeResolution & Collateral Slashing", function () {
    it("should resolve dispute in favor of requester and slash counterparty collateral", async function () {
      // Stake collateral for bad agent
      await agentStaking.connect(operator).stake("AGT-BAD-09", ethers.parseEther("500"));

      // Raise dispute
      await disputeResolution.raiseDispute(
        "DSP-0001",
        "TX-9988",
        "TSK-5544",
        "AGT-VICTIM-01",
        "AGT-BAD-09",
        "Failed deliverable and breach of service contract",
        "ipfs://bafybeievidence1"
      );

      // Arbitrator resolves in favor of victim requester with 200 CRED slashing compensation
      const victimAddress = agentWallet1.address;
      const initialVictimBalance = await credToken.balanceOf(victimAddress);
      const slashAmount = ethers.parseEther("200");

      await disputeResolution.connect(arbitrator).resolveDispute(
        "DSP-0001",
        1, // DisputeOutcome.InFavorOfRequester
        slashAmount,
        victimAddress,
        "Confirmed contract failure after reviewing evidence"
      );

      const dispute = await disputeResolution.getDispute("DSP-0001");
      expect(dispute.status).to.equal(3); // Resolved
      expect(dispute.outcome).to.equal(1); // InFavorOfRequester

      // Verify collateral was slashed from AGT-BAD-09 and transferred to victim
      expect(await agentStaking.getBondedStake("AGT-BAD-09")).to.equal(ethers.parseEther("300"));
      const finalVictimBalance = await credToken.balanceOf(victimAddress);
      expect(finalVictimBalance - initialVictimBalance).to.equal(slashAmount);
    });
  });
});
