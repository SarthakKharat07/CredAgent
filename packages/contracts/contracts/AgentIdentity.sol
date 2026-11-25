// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentIdentity
 * @notice Decentralized Identity Registry for Autonomous AI Agents in CerdAgent
 */
contract AgentIdentity is Ownable, ReentrancyGuard {
    enum Category {
        Research,
        Trading,
        Payment,
        Coding,
        DataAnalysis,
        DeFi,
        AutonomousService
    }

    enum VerificationStatus {
        Pending,
        Verified,
        Flagged,
        Revoked
    }

    struct AgentProfile {
        string agentId;
        string name;
        address walletAddress;
        address operatorAddress;
        Category category;
        string metadataUri;
        VerificationStatus verificationStatus;
        uint256 registeredAt;
        bool isActive;
    }

    // Mapping from agentId => AgentProfile
    mapping(string => AgentProfile) private _agents;
    // Mapping from agentId => registered boolean
    mapping(string => bool) private _registeredAgentIds;
    // Mapping from walletAddress => agentId
    mapping(address => string) private _walletToAgentId;
    // Authorized verifiers
    mapping(address => bool) public isVerifier;

    // List of all registered agent IDs
    string[] private _allAgentIds;

    event AgentRegistered(
        string indexed agentId,
        string name,
        address indexed walletAddress,
        address indexed operatorAddress,
        Category category,
        string metadataUri,
        uint256 registeredAt
    );
    event AgentMetadataUpdated(string indexed agentId, string newMetadataUri);
    event AgentVerificationChanged(string indexed agentId, VerificationStatus oldStatus, VerificationStatus newStatus);
    event AgentDeactivated(string indexed agentId);
    event VerifierUpdated(address indexed verifier, bool authorized);

    modifier onlyOperator(string memory agentId) {
        require(_registeredAgentIds[agentId], "Agent does not exist");
        require(
            _agents[agentId].operatorAddress == msg.sender || owner() == msg.sender,
            "Caller is not operator or admin"
        );
        _;
    }

    modifier onlyVerifierOrOwner() {
        require(isVerifier[msg.sender] || owner() == msg.sender, "Caller not authorized verifier");
        _;
    }

    constructor() Ownable(msg.sender) {
        isVerifier[msg.sender] = true;
    }

    function setVerifier(address verifier, bool authorized) external onlyOwner {
        isVerifier[verifier] = authorized;
        emit VerifierUpdated(verifier, authorized);
    }

    /**
     * @notice Register a new autonomous agent
     * @param agentId Unique identifier for the agent (e.g. "AGT-RESEARCH-01")
     * @param name Human-readable name
     * @param agentWallet The agent's dedicated wallet address
     * @param category Agent category enum
     * @param metadataUri IPFS or decentralized storage link to metadata
     */
    function registerAgent(
        string memory agentId,
        string memory name,
        address agentWallet,
        Category category,
        string memory metadataUri
    ) external nonReentrant {
        require(bytes(agentId).length > 0, "Agent ID cannot be empty");
        require(bytes(name).length > 0, "Agent name cannot be empty");
        require(agentWallet != address(0), "Invalid agent wallet");
        require(!_registeredAgentIds[agentId], "Agent ID already registered");
        require(bytes(_walletToAgentId[agentWallet]).length == 0, "Wallet already bound to an agent");

        _registeredAgentIds[agentId] = true;
        _walletToAgentId[agentWallet] = agentId;

        _agents[agentId] = AgentProfile({
            agentId: agentId,
            name: name,
            walletAddress: agentWallet,
            operatorAddress: msg.sender,
            category: category,
            metadataUri: metadataUri,
            verificationStatus: VerificationStatus.Pending,
            registeredAt: block.timestamp,
            isActive: true
        });

        _allAgentIds.push(agentId);

        emit AgentRegistered(
            agentId,
            name,
            agentWallet,
            msg.sender,
            category,
            metadataUri,
            block.timestamp
        );
    }

    /**
     * @notice Update agent metadata URI (IPFS / JSON)
     */
    function updateAgentMetadata(
        string memory agentId,
        string memory newMetadataUri
    ) external onlyOperator(agentId) {
        _agents[agentId].metadataUri = newMetadataUri;
        emit AgentMetadataUpdated(agentId, newMetadataUri);
    }

    /**
     * @notice Update verification status (Verifier/Admin only)
     */
    function verifyAgent(
        string memory agentId,
        VerificationStatus newStatus
    ) external onlyVerifierOrOwner {
        require(_registeredAgentIds[agentId], "Agent does not exist");
        VerificationStatus oldStatus = _agents[agentId].verificationStatus;
        _agents[agentId].verificationStatus = newStatus;
        emit AgentVerificationChanged(agentId, oldStatus, newStatus);
    }

    /**
     * @notice Deactivate an agent (Operator or Admin only)
     */
    function deactivateAgent(string memory agentId) external onlyOperator(agentId) {
        require(_agents[agentId].isActive, "Agent already inactive");
        _agents[agentId].isActive = false;
        emit AgentDeactivated(agentId);
    }

    /**
     * @notice Fetch agent profile by agentId
     */
    function getAgentProfile(string memory agentId) external view returns (AgentProfile memory) {
        require(_registeredAgentIds[agentId], "Agent does not exist");
        return _agents[agentId];
    }

    /**
     * @notice Check whether an agent ID is registered
     */
    function isRegisteredAgent(string memory agentId) external view returns (bool) {
        return _registeredAgentIds[agentId];
    }

    /**
     * @notice Fetch agent ID bound to a wallet address
     */
    function getAgentByWallet(address wallet) external view returns (string memory) {
        return _walletToAgentId[wallet];
    }

    /**
     * @notice Total number of registered agents
     */
    function totalAgents() external view returns (uint256) {
        return _allAgentIds.length;
    }

    /**
     * @notice Get all agent IDs
     */
    function getAllAgentIds() external view returns (string[] memory) {
        return _allAgentIds;
    }
}
