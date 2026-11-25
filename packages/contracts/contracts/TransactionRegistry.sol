// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TransactionRegistry
 * @notice Authoritative on-chain registry for agent-to-agent transactions and payment settlements.
 */
contract TransactionRegistry is Ownable {
    enum TxStatus {
        Pending,
        Completed,
        Failed,
        Disputed,
        Cancelled
    }

    struct Record {
        string txId;
        string senderAgentId;
        string receiverAgentId;
        uint256 amount;
        address token;
        TxStatus status;
        uint256 timestamp;
        uint256 settledAt;
        string serviceRef;
        bool exists;
    }

    // Mapping from txId => Record
    mapping(string => Record) private _transactions;
    // Authorized settlement operators (oracles, payment handlers)
    mapping(address => bool) public isAuthorizedHandler;

    string[] private _allTxIds;

    event TransactionRecorded(
        string indexed txId,
        string indexed senderAgentId,
        string indexed receiverAgentId,
        uint256 amount,
        address token,
        string serviceRef,
        uint256 timestamp
    );
    event TransactionSettled(string indexed txId, TxStatus status, uint256 settledAt);
    event TransactionDisputed(string indexed txId, string reason);
    event TransactionCancelled(string indexed txId);

    modifier onlyHandlerOrOwner() {
        require(isAuthorizedHandler[msg.sender] || owner() == msg.sender, "Not authorized handler");
        _;
    }

    constructor() Ownable(msg.sender) {
        isAuthorizedHandler[msg.sender] = true;
    }

    function setAuthorizedHandler(address handler, bool authorized) external onlyOwner {
        isAuthorizedHandler[handler] = authorized;
    }

    /**
     * @notice Record a new agent transaction on-chain
     */
    function recordTransaction(
        string memory txId,
        string memory senderAgentId,
        string memory receiverAgentId,
        uint256 amount,
        address token,
        string memory serviceRef
    ) external onlyHandlerOrOwner {
        require(bytes(txId).length > 0, "Empty txId");
        require(!_transactions[txId].exists, "Tx ID already exists");
        require(bytes(senderAgentId).length > 0 && bytes(receiverAgentId).length > 0, "Invalid agents");

        _transactions[txId] = Record({
            txId: txId,
            senderAgentId: senderAgentId,
            receiverAgentId: receiverAgentId,
            amount: amount,
            token: token,
            status: TxStatus.Pending,
            timestamp: block.timestamp,
            settledAt: 0,
            serviceRef: serviceRef,
            exists: true
        });

        _allTxIds.push(txId);

        emit TransactionRecorded(
            txId,
            senderAgentId,
            receiverAgentId,
            amount,
            token,
            serviceRef,
            block.timestamp
        );
    }

    /**
     * @notice Settle transaction (Completed or Failed)
     */
    function settleTransaction(string memory txId, bool success) external onlyHandlerOrOwner {
        Record storage r = _transactions[txId];
        require(r.exists, "Tx does not exist");
        require(r.status == TxStatus.Pending, "Tx not pending");

        r.status = success ? TxStatus.Completed : TxStatus.Failed;
        r.settledAt = block.timestamp;

        emit TransactionSettled(txId, r.status, block.timestamp);
    }

    /**
     * @notice Mark transaction as Disputed
     */
    function disputeTransaction(string memory txId, string memory reason) external onlyHandlerOrOwner {
        Record storage r = _transactions[txId];
        require(r.exists, "Tx does not exist");
        require(r.status == TxStatus.Pending || r.status == TxStatus.Completed, "Cannot dispute in current status");

        r.status = TxStatus.Disputed;
        emit TransactionDisputed(txId, reason);
    }

    /**
     * @notice Cancel pending transaction
     */
    function cancelTransaction(string memory txId) external onlyHandlerOrOwner {
        Record storage r = _transactions[txId];
        require(r.exists, "Tx does not exist");
        require(r.status == TxStatus.Pending, "Tx not pending");

        r.status = TxStatus.Cancelled;
        emit TransactionCancelled(txId);
    }

    /**
     * @notice Fetch transaction record
     */
    function getTransaction(string memory txId) external view returns (Record memory) {
        require(_transactions[txId].exists, "Tx does not exist");
        return _transactions[txId];
    }

    /**
     * @notice Total transactions count
     */
    function totalTransactions() external view returns (uint256) {
        return _allTxIds.length;
    }
}
