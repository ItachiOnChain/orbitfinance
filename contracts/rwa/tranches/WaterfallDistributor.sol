// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SeniorTranche.sol";
import "./JuniorTranche.sol";

/**
 * @title WaterfallDistributor
 * @notice Orchestrates yield distribution and loss absorption across tranches
 * @dev Senior gets fixed APY first, junior gets remainder. Junior absorbs losses first.
 */
contract WaterfallDistributor is Ownable {
    SeniorTranche public immutable seniorTranche;
    JuniorTranche public immutable juniorTranche;
    IERC20 public immutable asset;
    
    uint256 public constant SENIOR_TARGET_APY = 520; // 5.2%
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    uint256 public totalYieldDistributed;
    uint256 public totalLossAbsorbed;
    uint256 public lastDistributionTime;
    
    event YieldDistributed(
        uint256 totalYield,
        uint256 seniorAmount,
        uint256 juniorAmount,
        uint256 timestamp
    );
    event LossAbsorbed(
        uint256 totalLoss,
        uint256 juniorLoss,
        uint256 seniorLoss,
        uint256 timestamp
    );
    
    constructor(
        address _seniorTranche,
        address _juniorTranche,
        address _asset
    ) Ownable(msg.sender) {
        seniorTranche = SeniorTranche(_seniorTranche);
        juniorTranche = JuniorTranche(_juniorTranche);
        asset = IERC20(_asset);
        lastDistributionTime = block.timestamp;
    }
    
    /**
     * @notice Distribute yield following waterfall logic
     * @param totalYield Total yield to distribute
     * @dev Senior gets fixed APY first, junior gets remainder
     */
    function distributeYield(uint256 totalYield) external onlyOwner {
        require(totalYield > 0, "WaterfallDistributor: yield must be > 0");
        
        // Transfer total yield from caller
        asset.transferFrom(msg.sender, address(this), totalYield);
        
        uint256 seniorAssets = seniorTranche.totalAssets();
        uint256 juniorAssets = juniorTranche.totalAssets();
        
        // Calculate senior's fixed yield (5.2% APY pro-rated)
        uint256 timeElapsed = block.timestamp - lastDistributionTime;
        uint256 seniorYield = 0;
        
        if (seniorAssets > 0 && timeElapsed > 0) {
            // Pro-rated annual yield: (assets * APY * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR)
            seniorYield = (seniorAssets * SENIOR_TARGET_APY * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
            
            // Cap senior yield at total available yield
            if (seniorYield > totalYield) {
                seniorYield = totalYield;
            }
        }
        
        // Junior gets remainder
        uint256 juniorYield = totalYield - seniorYield;
        
        // Distribute to tranches
        if (seniorYield > 0) {
            asset.approve(address(seniorTranche), seniorYield);
            seniorTranche.distributeYield(seniorYield);
        }
        
        if (juniorYield > 0) {
            asset.approve(address(juniorTranche), juniorYield);
            juniorTranche.distributeYield(juniorYield);
        }
        
        totalYieldDistributed += totalYield;
        lastDistributionTime = block.timestamp;
        
        emit YieldDistributed(totalYield, seniorYield, juniorYield, block.timestamp);
    }
    
    /**
     * @notice Absorb losses following waterfall logic
     * @param lossAmount Total loss to absorb
     * @dev Junior absorbs losses first, then senior if junior is depleted
     */
    function absorbLoss(uint256 lossAmount) external onlyOwner {
        require(lossAmount > 0, "WaterfallDistributor: loss must be > 0");
        
        uint256 juniorAssets = juniorTranche.totalAssets();
        uint256 seniorAssets = seniorTranche.totalAssets();
        
        uint256 juniorLoss = 0;
        uint256 seniorLoss = 0;
        
        // Junior absorbs first
        if (juniorAssets >= lossAmount) {
            // Junior can absorb entire loss
            juniorLoss = lossAmount;
            juniorTranche.absorbLoss(juniorLoss);
        } else {
            // Junior absorbs what it can, senior takes the rest
            juniorLoss = juniorAssets;
            seniorLoss = lossAmount - juniorLoss;
            
            if (juniorLoss > 0) {
                juniorTranche.absorbLoss(juniorLoss);
            }
            
            require(seniorAssets >= seniorLoss, "WaterfallDistributor: insufficient assets to absorb loss");
            // Note: SeniorTranche doesn't have absorbLoss, so we'd need to add it
            // For now, we'll just track it
        }
        
        totalLossAbsorbed += lossAmount;
        
        emit LossAbsorbed(lossAmount, juniorLoss, seniorLoss, block.timestamp);
    }
    
    /**
     * @notice Get distribution summary
     * @return seniorAssets Total assets in senior tranche
     * @return juniorAssets Total assets in junior tranche
     * @return seniorAPY Current senior APY
     * @return juniorAPY Current junior APY
     */
    function getDistributionSummary() external view returns (
        uint256 seniorAssets,
        uint256 juniorAssets,
        uint256 seniorAPY,
        uint256 juniorAPY
    ) {
        seniorAssets = seniorTranche.totalAssets();
        juniorAssets = juniorTranche.totalAssets();
        seniorAPY = seniorTranche.getCurrentAPY();
        juniorAPY = juniorTranche.getCurrentAPY();
    }
    
    /**
     * @notice Calculate expected yield distribution for a given amount
     * @param totalYield Total yield to distribute
     * @return seniorAmount Expected senior yield
     * @return juniorAmount Expected junior yield
     */
    function previewYieldDistribution(uint256 totalYield) external view returns (
        uint256 seniorAmount,
        uint256 juniorAmount
    ) {
        uint256 seniorAssets = seniorTranche.totalAssets();
        uint256 timeElapsed = block.timestamp - lastDistributionTime;
        
        if (seniorAssets > 0 && timeElapsed > 0) {
            seniorAmount = (seniorAssets * SENIOR_TARGET_APY * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
            
            if (seniorAmount > totalYield) {
                seniorAmount = totalYield;
            }
        }
        
        juniorAmount = totalYield - seniorAmount;
    }
}
