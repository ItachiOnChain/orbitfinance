// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../IdentityRegistry.sol";

/**
 * @title JuniorTranche
 * @notice ERC-4626 vault for junior tranche with variable APY (~14.8%), high risk, 30-day lockup
 */
contract JuniorTranche is ERC4626, Ownable {
    IdentityRegistry public immutable identityRegistry;
    
    uint256 public constant TARGET_APY = 1480; // 14.8% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant LOCKUP_PERIOD = 3 days; // Reduced to 3 days for demo
    
    mapping(address => uint256) public depositTime;
    
    uint256 public totalYieldDistributed;
    uint256 public totalLossAbsorbed;
    uint256 public lastDistributionTime;
    
    event YieldDistributed(uint256 amount, uint256 newTotalAssets);
    event LossAbsorbed(uint256 amount, uint256 newTotalAssets);
    event KYCRequired(address indexed user);
    event LockupEnforced(address indexed user, uint256 unlockTime);
    
    constructor(
        IERC20 asset_,
        address _identityRegistry,
        string memory name_,
        string memory symbol_
    ) ERC4626(asset_) ERC20(name_, symbol_) Ownable(msg.sender) {
        identityRegistry = IdentityRegistry(_identityRegistry);
        lastDistributionTime = block.timestamp;
    }
    
    /**
     * @notice Deposit assets with KYC check and record deposit time
     */
    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        require(identityRegistry.isVerified(msg.sender), "JuniorTranche: user not KYC verified");
        
        // Record deposit time for lockup
        if (depositTime[receiver] == 0) {
            depositTime[receiver] = block.timestamp;
        }
        
        return super.deposit(assets, receiver);
    }
    
    /**
     * @notice Mint shares with KYC check and record deposit time
     */
    function mint(uint256 shares, address receiver) public override returns (uint256) {
        require(identityRegistry.isVerified(msg.sender), "JuniorTranche: user not KYC verified");
        
        // Record deposit time for lockup
        if (depositTime[receiver] == 0) {
            depositTime[receiver] = block.timestamp;
        }
        
        return super.mint(shares, receiver);
    }
    
    /**
     * @notice Withdraw with lockup period enforcement
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public override returns (uint256) {
        require(
            block.timestamp >= depositTime[owner] + LOCKUP_PERIOD,
            "JuniorTranche: lockup period not expired"
        );
        return super.withdraw(assets, receiver, owner);
    }
    
    /**
     * @notice Redeem with lockup period enforcement
     */
    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) public override returns (uint256) {
        require(
            block.timestamp >= depositTime[owner] + LOCKUP_PERIOD,
            "JuniorTranche: lockup period not expired"
        );
        return super.redeem(shares, receiver, owner);
    }
    
    /**
     * @notice Distribute yield to junior tranche
     * @param amount Amount of yield to distribute
     */
    function distributeYield(uint256 amount) external onlyOwner {
        require(amount > 0, "JuniorTranche: amount must be > 0");
        
        // Transfer yield from owner to vault
        IERC20(asset()).transferFrom(msg.sender, address(this), amount);
        
        totalYieldDistributed += amount;
        lastDistributionTime = block.timestamp;
        
        emit YieldDistributed(amount, totalAssets());
    }
    
    /**
     * @notice Absorb losses (junior tranche takes losses first)
     * @param amount Amount of loss to absorb
     */
    function absorbLoss(uint256 amount) external onlyOwner {
        require(amount > 0, "JuniorTranche: amount must be > 0");
        require(totalAssets() >= amount, "JuniorTranche: insufficient assets to absorb loss");
        
        // Transfer loss from vault to owner (burn)
        IERC20(asset()).transfer(owner(), amount);
        
        totalLossAbsorbed += amount;
        
        emit LossAbsorbed(amount, totalAssets());
    }
    
    /**
     * @notice Get current APY based on yield distributed
     * @return Current APY in basis points
     */
    function getCurrentAPY() external view returns (uint256) {
        if (totalAssets() == 0 || totalYieldDistributed == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - lastDistributionTime;
        if (timeElapsed == 0) {
            return 0;
        }
        
        // Annualized yield = (totalYield / totalAssets) * (365 days / timeElapsed) * 10000
        uint256 yieldRate = (totalYieldDistributed * BASIS_POINTS) / totalAssets();
        uint256 annualizedRate = (yieldRate * 365 days) / timeElapsed;
        
        return annualizedRate;
    }
    
    /**
     * @notice Get total assets including distributed yield minus absorbed losses
     */
    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }
    
    /**
     * @notice Check if user's lockup period has expired
     * @param user Address to check
     * @return True if lockup expired or no deposit
     */
    function isLockupExpired(address user) external view returns (bool) {
        if (depositTime[user] == 0) {
            return true;
        }
        return block.timestamp >= depositTime[user] + LOCKUP_PERIOD;
    }
    
    /**
     * @notice Get time remaining in lockup period
     * @param user Address to check
     * @return Seconds remaining, 0 if expired
     */
    function getLockupTimeRemaining(address user) external view returns (uint256) {
        if (depositTime[user] == 0) {
            return 0;
        }
        
        uint256 unlockTime = depositTime[user] + LOCKUP_PERIOD;
        if (block.timestamp >= unlockTime) {
            return 0;
        }
        
        return unlockTime - block.timestamp;
    }
}
