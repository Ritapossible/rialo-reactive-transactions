// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Staking
 * @dev Staking contract for ERC20 tokens with reward distribution
 */
contract Staking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Staking info for each user per token
    struct StakeInfo {
        uint256 stakedAmount;
        uint256 stakingTime;
        uint256 lastClaimTime;
    }

    // Mapping: user => token => stake info
    mapping(address => mapping(address => StakeInfo)) public stakes;

    // Reward rate: 10% APY (simplified as per-second rate)
    uint256 public constant REWARD_RATE = 317; // ~10% APY in basis points per year / seconds
    uint256 public constant REWARD_DENOMINATOR = 1e10;

    // Events
    event Staked(address indexed user, address indexed token, uint256 amount);
    event Unstaked(address indexed user, address indexed token, uint256 amount);
    event RewardsClaimed(address indexed user, address indexed token, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Stake tokens
     * @param tokenAddress The address of the token to stake
     * @param amount The amount to stake
     */
    function stake(address tokenAddress, uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0 tokens");
        require(tokenAddress != address(0), "Invalid token address");

        IERC20 token = IERC20(tokenAddress);
        
        // Transfer tokens from user to this contract
        token.safeTransferFrom(msg.sender, address(this), amount);

        StakeInfo storage stakeInfo = stakes[msg.sender][tokenAddress];
        
        // If already staking, claim pending rewards first
        if (stakeInfo.stakedAmount > 0) {
            _claimRewards(msg.sender, tokenAddress);
        }

        stakeInfo.stakedAmount += amount;
        stakeInfo.stakingTime = block.timestamp;
        stakeInfo.lastClaimTime = block.timestamp;

        emit Staked(msg.sender, tokenAddress, amount);
    }

    /**
     * @dev Unstake all tokens
     * @param tokenAddress The address of the token to unstake
     */
    function unstake(address tokenAddress) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender][tokenAddress];
        require(stakeInfo.stakedAmount > 0, "No tokens staked");

        uint256 amount = stakeInfo.stakedAmount;
        
        // Claim pending rewards before unstaking
        _claimRewards(msg.sender, tokenAddress);

        // Reset stake info
        stakeInfo.stakedAmount = 0;
        stakeInfo.stakingTime = 0;
        stakeInfo.lastClaimTime = 0;

        // Transfer tokens back to user
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, tokenAddress, amount);
    }

    /**
     * @dev Claim staking rewards
     * @param tokenAddress The address of the staked token
     */
    function claimRewards(address tokenAddress) external nonReentrant {
        _claimRewards(msg.sender, tokenAddress);
    }

    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards(address user, address tokenAddress) internal {
        StakeInfo storage stakeInfo = stakes[user][tokenAddress];
        
        if (stakeInfo.stakedAmount == 0) return;

        uint256 pendingRewards = calculateRewards(user, tokenAddress);
        
        if (pendingRewards > 0) {
            stakeInfo.lastClaimTime = block.timestamp;
            
            // Note: In a real implementation, rewards would come from a reward pool
            // For testnet demo, we'll emit the event but actual reward distribution
            // would require the contract to hold reward tokens
            
            emit RewardsClaimed(user, tokenAddress, pendingRewards);
        }
    }

    /**
     * @dev Calculate pending rewards for a user
     * @param user The user address
     * @param tokenAddress The staked token address
     * @return The amount of pending rewards
     */
    function calculateRewards(address user, address tokenAddress) public view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[user][tokenAddress];
        
        if (stakeInfo.stakedAmount == 0) return 0;

        uint256 stakingDuration = block.timestamp - stakeInfo.lastClaimTime;
        uint256 rewards = (stakeInfo.stakedAmount * REWARD_RATE * stakingDuration) / REWARD_DENOMINATOR;
        
        return rewards;
    }

    /**
     * @dev Get stake info for a user
     * @param user The user address
     * @param tokenAddress The token address
     * @return stakedAmount The amount staked
     * @return pendingRewards The pending rewards
     * @return stakingTime The time when staking started
     */
    function getStakeInfo(address user, address tokenAddress) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 stakingTime
    ) {
        StakeInfo storage stakeInfo = stakes[user][tokenAddress];
        
        return (
            stakeInfo.stakedAmount,
            calculateRewards(user, tokenAddress),
            stakeInfo.stakingTime
        );
    }
}
