// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TaskVerification
 * @notice Multi-agent task lifecycle, evidence anchoring, and verification contract.
 */
contract TaskVerification is Ownable {
    enum TaskStatus {
        Created,
        Accepted,
        InProgress,
        Submitted,
        Verified,
        Rejected,
        Disputed
    }

    struct Task {
        string taskId;
        string requestingAgentId;
        string executingAgentId;
        string descriptionHash; // IPFS or sha256 hash of task specification
        uint256 taskValue;
        uint256 deadline;
        string evidenceUri;
        TaskStatus status;
        uint256 createdAt;
        uint256 submittedAt;
        uint256 verifiedAt;
        string reviewerNotes;
        bool exists;
    }

    mapping(string => Task) private _tasks;
    mapping(address => bool) public isAuthorizedVerifier;
    string[] private _allTaskIds;

    event TaskCreated(
        string indexed taskId,
        string indexed requestingAgentId,
        string indexed executingAgentId,
        uint256 taskValue,
        uint256 deadline,
        uint256 createdAt
    );
    event TaskAccepted(string indexed taskId, string executingAgentId);
    event TaskEvidenceSubmitted(string indexed taskId, string evidenceUri, uint256 submittedAt);
    event TaskVerified(string indexed taskId, bool approved, string reviewerNotes, uint256 verifiedAt);
    event TaskDisputed(string indexed taskId, string reason);

    modifier onlyVerifierOrOwner() {
        require(isAuthorizedVerifier[msg.sender] || owner() == msg.sender, "Not authorized verifier");
        _;
    }

    constructor() Ownable(msg.sender) {
        isAuthorizedVerifier[msg.sender] = true;
    }

    function setAuthorizedVerifier(address verifier, bool authorized) external onlyOwner {
        isAuthorizedVerifier[verifier] = authorized;
    }

    /**
     * @notice Create a new verifiable task request between agents
     */
    function createTask(
        string memory taskId,
        string memory requestingAgentId,
        string memory executingAgentId,
        string memory descriptionHash,
        uint256 taskValue,
        uint256 deadline
    ) external {
        require(bytes(taskId).length > 0, "Empty taskId");
        require(!_tasks[taskId].exists, "Task ID already exists");
        require(deadline > block.timestamp, "Deadline must be in future");

        _tasks[taskId] = Task({
            taskId: taskId,
            requestingAgentId: requestingAgentId,
            executingAgentId: executingAgentId,
            descriptionHash: descriptionHash,
            taskValue: taskValue,
            deadline: deadline,
            evidenceUri: "",
            status: TaskStatus.Created,
            createdAt: block.timestamp,
            submittedAt: 0,
            verifiedAt: 0,
            reviewerNotes: "",
            exists: true
        });

        _allTaskIds.push(taskId);

        emit TaskCreated(taskId, requestingAgentId, executingAgentId, taskValue, deadline, block.timestamp);
    }

    /**
     * @notice Executing agent accepts the task
     */
    function acceptTask(string memory taskId) external {
        Task storage t = _tasks[taskId];
        require(t.exists, "Task does not exist");
        require(t.status == TaskStatus.Created, "Task cannot be accepted in current state");

        t.status = TaskStatus.Accepted;
        emit TaskAccepted(taskId, t.executingAgentId);
    }

    /**
     * @notice Executing agent submits completion proof/evidence
     */
    function submitTaskEvidence(string memory taskId, string memory evidenceUri) external {
        Task storage t = _tasks[taskId];
        require(t.exists, "Task does not exist");
        require(
            t.status == TaskStatus.Accepted || t.status == TaskStatus.InProgress || t.status == TaskStatus.Created,
            "Invalid status for submission"
        );
        require(bytes(evidenceUri).length > 0, "Evidence URI required");

        t.evidenceUri = evidenceUri;
        t.status = TaskStatus.Submitted;
        t.submittedAt = block.timestamp;

        emit TaskEvidenceSubmitted(taskId, evidenceUri, block.timestamp);
    }

    /**
     * @notice Requesting agent or authorized validator verifies the task completion
     */
    function verifyTask(
        string memory taskId,
        bool approved,
        string memory notes
    ) external {
        Task storage t = _tasks[taskId];
        require(t.exists, "Task does not exist");
        require(t.status == TaskStatus.Submitted, "Task evidence not submitted");

        t.status = approved ? TaskStatus.Verified : TaskStatus.Rejected;
        t.verifiedAt = block.timestamp;
        t.reviewerNotes = notes;

        emit TaskVerified(taskId, approved, notes, block.timestamp);
    }

    /**
     * @notice Flag task for dispute if rejected or contested
     */
    function disputeTask(string memory taskId, string memory reason) external {
        Task storage t = _tasks[taskId];
        require(t.exists, "Task does not exist");
        t.status = TaskStatus.Disputed;
        emit TaskDisputed(taskId, reason);
    }

    /**
     * @notice Get task details
     */
    function getTask(string memory taskId) external view returns (Task memory) {
        require(_tasks[taskId].exists, "Task does not exist");
        return _tasks[taskId];
    }

    /**
     * @notice Total tasks count
     */
    function totalTasks() external view returns (uint256) {
        return _allTaskIds.length;
    }
}
