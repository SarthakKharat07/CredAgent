import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("Deploying CerdAgent Contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 1. Deploy MockCreditToken
  const MockCreditToken = await ethers.getContractFactory("MockCreditToken");
  const credToken = await MockCreditToken.deploy();
  await credToken.waitForDeployment();
  const tokenAddress = await credToken.getAddress();
  console.log("MockCreditToken deployed to:", tokenAddress);

  // 2. Deploy AgentIdentity
  const AgentIdentity = await ethers.getContractFactory("AgentIdentity");
  const agentIdentity = await AgentIdentity.deploy();
  await agentIdentity.waitForDeployment();
  const identityAddress = await agentIdentity.getAddress();
  console.log("AgentIdentity deployed to:", identityAddress);

  // 3. Deploy ReputationRegistry
  const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy();
  await reputationRegistry.waitForDeployment();
  const reputationAddress = await reputationRegistry.getAddress();
  console.log("ReputationRegistry deployed to:", reputationAddress);

  // 4. Deploy AgentStaking (minStake = 100 CRED, delay = 60s for testing/local)
  const minStake = ethers.parseEther("100");
  const withdrawalDelay = 60; // 60 seconds for testing
  const AgentStaking = await ethers.getContractFactory("AgentStaking");
  const agentStaking = await AgentStaking.deploy(tokenAddress, minStake, withdrawalDelay);
  await agentStaking.waitForDeployment();
  const stakingAddress = await agentStaking.getAddress();
  console.log("AgentStaking deployed to:", stakingAddress);

  // 5. Deploy TransactionRegistry
  const TransactionRegistry = await ethers.getContractFactory("TransactionRegistry");
  const transactionRegistry = await TransactionRegistry.deploy();
  await transactionRegistry.waitForDeployment();
  const txAddress = await transactionRegistry.getAddress();
  console.log("TransactionRegistry deployed to:", txAddress);

  // 6. Deploy TaskVerification
  const TaskVerification = await ethers.getContractFactory("TaskVerification");
  const taskVerification = await TaskVerification.deploy();
  await taskVerification.waitForDeployment();
  const taskAddress = await taskVerification.getAddress();
  console.log("TaskVerification deployed to:", taskAddress);

  // 7. Deploy DisputeResolution
  const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
  const disputeResolution = await DisputeResolution.deploy(stakingAddress);
  await disputeResolution.waitForDeployment();
  const disputeAddress = await disputeResolution.getAddress();
  console.log("DisputeResolution deployed to:", disputeAddress);

  // Wire permissions: DisputeResolution authorized to slash on AgentStaking
  await agentStaking.setDisputeResolver(disputeAddress, true);
  console.log("Authorized DisputeResolution on AgentStaking.");

  // Save deployed addresses JSON
  const deployedAddresses = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    MockCreditToken: tokenAddress,
    AgentIdentity: identityAddress,
    ReputationRegistry: reputationAddress,
    AgentStaking: stakingAddress,
    TransactionRegistry: txAddress,
    TaskVerification: taskAddress,
    DisputeResolution: disputeAddress,
    timestamp: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployedAddresses, null, 2));
  console.log("Saved deployed contract addresses to:", outputPath);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
