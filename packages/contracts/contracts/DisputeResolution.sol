// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgentStaking.sol";

/**
 * @title DisputeResolution
 * @notice Arbitrates disputes between AI agents, verifies evidence, and coordinates collateral slashing.
 */
contract DisputeResolution is Ownable {
    enum DisputeStatus {
        Open,
        EvidencePending,
        UnderReview,
        Resolved
    }

    enum DisputeOutcome {
        Pending,
        InFavorOfRequester,
        InFavorOfCounterparty,
        MutualSettlement,
        Inconclusive
    }

    struct Dispute {
        string disputeId;
        string txId;
        string taskId;
        string initiatorAgentId;
        string counterpartyAgentId;
        string reason;
        string initialEvidenceUri;
        string counterEvidenceUri;
        DisputeStatus status;
        DisputeOutcome outcome;
        uint256 slashAmount;
        string resolutionNotes;
        uint256 createdAt;
        uint256 resolvedAt;
        address arbitrator;
        bool exists;
    }

    AgentStaking public stakingVault;
    mapping(string => Dispute) private _disputes;
    mapping(address => bool) public isArbitrator;
    string[] private _allDisputeIds;

    event DisputeRaised(
        string indexed disputeId,
        string indexed initiatorAgentId,
        string indexed counterpartyAgentId,
        string txId,
        string taskId,
        string reason,
        string initialEvidenceUri,
        uint256 createdAt
    );
    event CounterEvidenceSubmitted(string indexed disputeId, string counterEvidenceUri);
    event DisputeResolved(
        string indexed disputeId,
        DisputeOutcome outcome,
        uint256 slashAmount,
        string notes,
        address indexed arbitrator,
        uint256 resolvedAt
    );
    event ArbitratorUpdated(address indexed arbitrator, bool authorized);

    modifier onlyArbitratorOrOwner() {
        require(isArbitrator[msg.sender] || owner() == msg.sender, "Not authorized arbitrator");
        _;
    }

    constructor(address _stakingVault) Ownable(msg.sender) {
        if (_stakingVault != address(0)) {
            stakingVault = AgentStaking(_stakingVault);
        }
        isArbitrator[msg.sender] = true;
    }

    function setStakingVault(address _stakingVault) external onlyOwner {
        require(_stakingVault != address(0), "Invalid staking vault");
        stakingVault = AgentStaking(_stakingVault);
    }

    function setArbitrator(address arbitrator, bool authorized) external onlyOwner {
        isArbitrator[arbitrator] = authorized;
        emit ArbitratorUpdated(arbitrator, authorized);
    }

    /**
     * @notice Raise a formal dispute against another agent
     */
    function raiseDispute(
        string memory disputeId,
        string memory txId,
        string memory taskId,
        string memory initiatorAgentId,
        string memory counterpartyAgentId,
        string memory reason,
        string memory initialEvidenceUri
    ) external {
        require(bytes(disputeId).length > 0, "Empty disputeId");
        require(!_disputes[disputeId].exists, "Dispute ID exists");
        require(bytes(initiatorAgentId).length > 0 && bytes(counterpartyAgentId).length > 0, "Invalid agents");

        _disputes[disputeId] = Dispute({
            disputeId: disputeId,
            txId: txId,
            taskId: taskId,
            initiatorAgentId: initiatorAgentId,
            counterpartyAgentId: counterpartyAgentId,
            reason: reason,
            initialEvidenceUri: initialEvidenceUri,
            counterEvidenceUri: "",
            status: DisputeStatus.Open,
            outcome: DisputeOutcome.Pending,
            slashAmount: 0,
            resolutionNotes: "",
            createdAt: block.timestamp,
            resolvedAt: 0,
            arbitrator: address(0),
            exists: true
        });

        _allDisputeIds.push(disputeId);

        emit DisputeRaised(
            disputeId,
            initiatorAgentId,
            counterpartyAgentId,
            txId,
            taskId,
            reason,
            initialEvidenceUri,
            block.timestamp
        );
    }

    /**
     * @notice Submit counter-evidence from the challenged agent
     */
    function submitCounterEvidence(string memory disputeId, string memory counterEvidenceUri) external {
        Dispute storage d = _disputes[disputeId];
        require(d.exists, "Dispute does not exist");
        require(d.status == DisputeStatus.Open || d.status == DisputeStatus.EvidencePending, "Not accepting evidence");

        d.counterEvidenceUri = counterEvidenceUri;
        d.status = DisputeStatus.UnderReview;

        emit CounterEvidenceSubmitted(disputeId, counterEvidenceUri);
    }

    /**
     * @notice Arbitrate and record finalized dispute resolution
     * @param disputeId Identifier
     * @param outcome Adjudication outcome enum
     * @param slashAmount Optional collateral slashing amount if damages awarded
     * @param victimRecipient Address to receive slashed collateral compensation
     * @param notes Rationale for verdict
     */
    function resolveDispute(
        string memory disputeId,
        DisputeOutcome outcome,
        uint256 slashAmount,
        address victimRecipient,
        string memory notes
    ) external onlyArbitratorOrOwner {
        Dispute storage d = _disputes[disputeId];
        require(d.exists, "Dispute does not exist");
        require(d.status != DisputeStatus.Resolved, "Already resolved");
        require(outcome != DisputeOutcome.Pending, "Must provide final outcome");

        d.status = DisputeStatus.Resolved;
        d.outcome = outcome;
        d.slashAmount = slashAmount;
        d.resolutionNotes = notes;
        d.arbitrator = msg.sender;
        d.resolvedAt = block.timestamp;

        // If outcome is in favor of requester and a penalty is awarded, execute slashing from counterparty stake
        if (outcome == DisputeOutcome.InFavorOfRequester && slashAmount > 0 && address(stakingVault) != address(0)) {
            if (victimRecipient != address(0)) {
                stakingVault.slashStake(d.counterpartyAgentId, slashAmount, victimRecipient, notes);
            }
        }

        emit DisputeResolved(disputeId, outcome, slashAmount, notes, msg.sender, block.timestamp);
    }

    /**
     * @notice Get dispute details
     */
    function getDispute(string memory disputeId) external view returns (Dispute memory) {
        require(_disputes[disputeId].exists, "Dispute does not exist");
        return _disputes[disputeId];
    }

    /**
     * @notice Total disputes count
     */
    function totalDisputes() external view returns (uint256) {
        return _allDisputeIds.length;
    }
}
