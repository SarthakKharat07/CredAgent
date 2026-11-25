// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationRegistry
 * @notice Stores and attests explainable 0-1000 credit/reputation scores for AI agents on-chain.
 */
contract ReputationRegistry is Ownable {
    struct ScoreRecord {
        uint16 score;               // 0 to 1000
        uint8 confidenceLevel;      // 0: Low, 1: Medium, 2: High
        uint256 lastUpdated;
        uint256 updateCount;
        string explanationHash;     // IPFS hash of score factor breakdown
    }

    struct HistoryEntry {
        uint16 score;
        int16 delta;
        uint256 timestamp;
        string reason;
    }

    // AgentId => Current Score Record
    mapping(string => ScoreRecord) private _scores;
    // AgentId => Historical Entries
    mapping(string => HistoryEntry[]) private _history;
    // Authorized oracles / score engines allowed to submit verified scores
    mapping(address => bool) public isAuthorizedScorer;

    event ScoreUpdated(
        string indexed agentId,
        uint16 oldScore,
        uint16 newScore,
        int16 delta,
        uint8 confidenceLevel,
        string reason,
        string explanationHash,
        uint256 timestamp
    );
    event ScorerAuthorized(address indexed scorer, bool authorized);

    modifier onlyScorerOrOwner() {
        require(isAuthorizedScorer[msg.sender] || owner() == msg.sender, "Caller not authorized scorer");
        _;
    }

    constructor() Ownable(msg.sender) {
        isAuthorizedScorer[msg.sender] = true;
    }

    function setAuthorizedScorer(address scorer, bool authorized) external onlyOwner {
        isAuthorizedScorer[scorer] = authorized;
        emit ScorerAuthorized(scorer, authorized);
    }

    /**
     * @notice Update the verified reputation score for an agent
     * @param agentId Agent identifier
     * @param newScore Reputation score (0-1000)
     * @param confidenceLevel Confidence level enum (0, 1, 2)
     * @param reason Human/agent readable rationale
     * @param explanationHash IPFS URI with full mathematical breakdown
     */
    function updateAgentScore(
        string memory agentId,
        uint16 newScore,
        uint8 confidenceLevel,
        string memory reason,
        string memory explanationHash
    ) external onlyScorerOrOwner {
        require(bytes(agentId).length > 0, "Empty agentId");
        require(newScore <= 1000, "Score exceeds maximum 1000");
        require(confidenceLevel <= 2, "Invalid confidence level");

        ScoreRecord storage record = _scores[agentId];
        uint16 oldScore = record.score;
        int16 delta = int16(int32(uint32(newScore)) - int32(uint32(oldScore)));

        record.score = newScore;
        record.confidenceLevel = confidenceLevel;
        record.lastUpdated = block.timestamp;
        record.updateCount += 1;
        record.explanationHash = explanationHash;

        _history[agentId].push(HistoryEntry({
            score: newScore,
            delta: delta,
            timestamp: block.timestamp,
            reason: reason
        }));

        emit ScoreUpdated(
            agentId,
            oldScore,
            newScore,
            delta,
            confidenceLevel,
            reason,
            explanationHash,
            block.timestamp
        );
    }

    /**
     * @notice Get current reputation score record
     */
    function getAgentScore(string memory agentId) external view returns (
        uint16 score,
        uint8 confidenceLevel,
        uint256 lastUpdated,
        uint256 updateCount,
        string memory explanationHash
    ) {
        ScoreRecord memory record = _scores[agentId];
        return (
            record.score,
            record.confidenceLevel,
            record.lastUpdated,
            record.updateCount,
            record.explanationHash
        );
    }

    /**
     * @notice Get historical score count
     */
    function getHistoryCount(string memory agentId) external view returns (uint256) {
        return _history[agentId].length;
    }

    /**
     * @notice Get historical score entries
     */
    function getScoreHistory(string memory agentId) external view returns (HistoryEntry[] memory) {
        return _history[agentId];
    }
}
