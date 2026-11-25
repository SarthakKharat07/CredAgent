// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockCreditToken (CRED)
 * @dev Mock ERC-20 token used for agent collateral staking and payment settlements on Base Sepolia.
 */
contract MockCreditToken is ERC20, Ownable {
    uint8 private constant DECIMALS = 18;
    uint256 public constant FAUCET_AMOUNT = 1000 * 10 ** DECIMALS;
    mapping(address => uint256) public lastFaucetClaim;
    uint256 public constant FAUCET_COOLDOWN = 1 hours;

    event FaucetClaimed(address indexed recipient, uint256 amount);

    constructor() ERC20("CerdAgent Credit Token", "CRED") Ownable(msg.sender) {
        // Mint initial supply of 10,000,000 CRED to deployer
        _mint(msg.sender, 10_000_000 * 10 ** DECIMALS);
    }

    /**
     * @notice Mint new tokens (owner only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Public testnet faucet allowing users and agents to claim test CRED tokens
     */
    function claimFaucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown active"
        );
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
}
