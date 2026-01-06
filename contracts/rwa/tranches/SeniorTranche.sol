// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../IdentityRegistry.sol";

/**
 * @title SeniorTranche
 * @notice ERC-4626 vault for senior tranche with fixed 5.2% APY, low risk
 */
contract SeniorTranche is ERC4626, Ownable {
    IdentityRegistry public immutable identityRegistry;
    
    uint256 public constant TARGET_APY = 520; // 5.2% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    uint256 public totalYieldDistributed;
    uint256 public lastDistributionTime;
    
    event YieldDistributed(uint256 amount, uint256 newTotalAssets);
    event KYCRequired(address indexed user);
    
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
     * @notice Deposit assets with KYC check
     */
    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        require(identityRegistry.isVerified(msg.sender), "SeniorTranche: user not KYC verified");
        return super.deposit(assets, receiver);
    }
    
    /**
     * @notice Mint shares with KYC check
     */
    function mint(uint256 shares, address receiver) public override returns (uint256) {
        require(identityRegistry.isVerified(msg.sender), "SeniorTranche: user not KYC verified");
        return super.mint(shares, receiver);
    }
    
    /**
     * @notice Distribute yield to senior tranche
     * @param amount Amount of yield to distribute
     */
    function distributeYield(uint256 amount) external onlyOwner {
        require(amount > 0, "SeniorTranche: amount must be > 0");
        
        // Transfer yield from owner to vault
        IERC20(asset()).transferFrom(msg.sender, address(this), amount);
        
        totalYieldDistributed += amount;
        lastDistributionTime = block.timestamp;
        
        emit YieldDistributed(amount, totalAssets());
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
     * @notice Get total assets including distributed yield
     */
    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }
    
    /**
     * @notice Emergency withdraw for owner
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        IERC20(asset()).transfer(owner(), amount);
    }
}
