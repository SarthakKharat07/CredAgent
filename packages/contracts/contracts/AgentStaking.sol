// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AgentStaking
 * @notice Collateral vault for AI agents to bond stake and back their economic reliability.
 */
contract AgentStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    uint256 public minStakeRequirement;
    uint256 public withdrawalDelay; // in seconds (e.g., 2 days in production, configurable for tests)

    struct StakeRecord {
        uint256 bondedAmount;
        uint256 unstakingAmount;
        uint256 unstakeAvailableAt;
        address depositor;
        bool exists;
    }

    // Mapping from agentId => StakeRecord
    mapping(string => StakeRecord) private _stakes;
    // Authorized dispute resolution contract allowed to execute verified slashings
    mapping(address => bool) public isDisputeResolver;

    event Staked(string indexed agentId, address indexed depositor, uint256 amount, uint256 totalBonded);
    event StakeIncreased(string indexed agentId, uint256 addedAmount, uint256 totalBonded);
    event UnstakeRequested(string indexed agentId, uint256 amount, uint256 availableAt);
    event StakeWithdrawn(string indexed agentId, address indexed recipient, uint256 amount);
    event StakeSlashed(string indexed agentId, uint256 amount, address indexed recipient, string reason);
    event MinStakeUpdated(uint256 oldMin, uint256 newMin);
    event WithdrawalDelayUpdated(uint256 oldDelay, uint256 newDelay);
    event DisputeResolverUpdated(address indexed resolver, bool authorized);

    modifier onlyResolverOrOwner() {
        require(isDisputeResolver[msg.sender] || owner() == msg.sender, "Caller not authorized dispute resolver");
        _;
    }

    constructor(
        address _stakingToken,
        uint256 _minStake,
        uint256 _withdrawalDelay
    ) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid token address");
        stakingToken = IERC20(_stakingToken);
        minStakeRequirement = _minStake;
        withdrawalDelay = _withdrawalDelay;
    }

    function setDisputeResolver(address resolver, bool authorized) external onlyOwner {
        isDisputeResolver[resolver] = authorized;
        emit DisputeResolverUpdated(resolver, authorized);
    }

    function setMinStakeRequirement(uint256 newMin) external onlyOwner {
        emit MinStakeUpdated(minStakeRequirement, newMin);
        minStakeRequirement = newMin;
    }

    function setWithdrawalDelay(uint256 newDelay) external onlyOwner {
        emit WithdrawalDelayUpdated(withdrawalDelay, newDelay);
        withdrawalDelay = newDelay;
    }

    /**
     * @notice Deposit initial collateral stake for an agent
     */
    function stake(string memory agentId, uint256 amount) external nonReentrant {
        require(bytes(agentId).length > 0, "Empty agentId");
        require(amount >= minStakeRequirement, "Amount below minimum stake requirement");
        require(!_stakes[agentId].exists, "Stake already exists; use increaseStake");

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        _stakes[agentId] = StakeRecord({
            bondedAmount: amount,
            unstakingAmount: 0,
            unstakeAvailableAt: 0,
            depositor: msg.sender,
            exists: true
        });

        emit Staked(agentId, msg.sender, amount, amount);
    }

    /**
     * @notice Increase existing bonded stake
     */
    function increaseStake(string memory agentId, uint256 amount) external nonReentrant {
        require(_stakes[agentId].exists, "Agent has no active stake");
        require(amount > 0, "Amount must be > 0");

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        _stakes[agentId].bondedAmount += amount;

        emit StakeIncreased(agentId, amount, _stakes[agentId].bondedAmount);
    }

    /**
     * @notice Request unstaking with mandatory lockup delay
     */
    function requestUnstake(string memory agentId, uint256 amount) external nonReentrant {
        StakeRecord storage record = _stakes[agentId];
        require(record.exists, "Agent has no active stake");
        require(msg.sender == record.depositor || msg.sender == owner(), "Not depositor");
        require(amount > 0 && amount <= record.bondedAmount, "Invalid unstake amount");

        record.bondedAmount -= amount;
        record.unstakingAmount += amount;
        record.unstakeAvailableAt = block.timestamp + withdrawalDelay;

        emit UnstakeRequested(agentId, amount, record.unstakeAvailableAt);
    }

    /**
     * @notice Withdraw eligible funds after lockup period expires
     */
    function withdrawEligibleStake(string memory agentId) external nonReentrant {
        StakeRecord storage record = _stakes[agentId];
        require(record.exists, "Agent has no active stake");
        require(msg.sender == record.depositor || msg.sender == owner(), "Not depositor");
        require(record.unstakingAmount > 0, "No pending unstake amount");
        require(block.timestamp >= record.unstakeAvailableAt, "Withdrawal lock period active");

        uint256 amount = record.unstakingAmount;
        record.unstakingAmount = 0;
        record.unstakeAvailableAt = 0;

        stakingToken.safeTransfer(record.depositor, amount);
        emit StakeWithdrawn(agentId, record.depositor, amount);
    }

    /**
     * @notice Slashes an agent's bonded stake following a substantiated dispute
     * @dev Only executable by authorized DisputeResolution contract or platform governor
     */
    function slashStake(
        string memory agentId,
        uint256 amount,
        address recipient,
        string memory reason
    ) external onlyResolverOrOwner nonReentrant {
        StakeRecord storage record = _stakes[agentId];
        require(record.exists, "Agent has no active stake");
        require(amount > 0, "Slash amount must be > 0");
        require(recipient != address(0), "Invalid recipient");

        uint256 slashable = record.bondedAmount >= amount ? amount : record.bondedAmount;
        record.bondedAmount -= slashable;

        stakingToken.safeTransfer(recipient, slashable);
        emit StakeSlashed(agentId, slashable, recipient, reason);
    }

    /**
     * @notice Get current bonded balance for an agent
     */
    function getBondedStake(string memory agentId) external view returns (uint256) {
        return _stakes[agentId].bondedAmount;
    }

    /**
     * @notice Get full staking record
     */
    function getStakeInfo(string memory agentId) external view returns (
        uint256 bondedAmount,
        uint256 unstakingAmount,
        uint256 unstakeAvailableAt,
        address depositor,
        bool exists
    ) {
        StakeRecord memory r = _stakes[agentId];
        return (r.bondedAmount, r.unstakingAmount, r.unstakeAvailableAt, r.depositor, r.exists);
    }
}
