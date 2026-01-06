// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./OrbitRWAPool.sol";
import "./RWAIncomeNFT.sol";

/**
 * @title SPVManager
 * @notice Handles auto-repayment logic for RWA income streams
 */
contract SPVManager is Ownable {
    OrbitRWAPool public immutable rwaPool;
    RWAIncomeNFT public immutable rwaIncomeNFT;
    IERC20 public immutable usdc;
    
    struct AutoRepayConfig {
        bool enabled;
        uint256 nftId;
        uint256 totalRepaid;
        uint256 lastRepaymentTime;
    }
    
    struct YieldRecord {
        uint256 amount;
        uint256 timestamp;
        uint256 nftId;
    }
    
    mapping(address => mapping(uint256 => AutoRepayConfig)) public autoRepayConfigs;
    mapping(address => YieldRecord[]) public yieldHistory;
    
    event AutoRepayEnabled(address indexed borrower, uint256 indexed nftId);
    event AutoRepaymentApplied(
        address indexed borrower,
        uint256 indexed nftId,
        uint256 amount,
        uint256 remainingDebt
    );
    event YieldReceived(address indexed borrower, uint256 indexed nftId, uint256 amount);
    
    constructor(
        address _rwaPool,
        address _rwaIncomeNFT,
        address _usdc
    ) Ownable(msg.sender) {
        rwaPool = OrbitRWAPool(_rwaPool);
        rwaIncomeNFT = RWAIncomeNFT(_rwaIncomeNFT);
        usdc = IERC20(_usdc);
    }
    
    /**
     * @notice Enable auto-repayment for a specific NFT
     * @param borrower Address of the borrower
     * @param nftId NFT ID to enable auto-repay for
     */
    function enableAutoRepay(address borrower, uint256 nftId) external onlyOwner {
        require(rwaIncomeNFT.ownerOf(nftId) == address(rwaPool), "SPVManager: NFT not in pool");
        require(rwaPool.isAutoRepayEnabled(borrower), "SPVManager: auto-repay not enabled in pool");
        
        autoRepayConfigs[borrower][nftId] = AutoRepayConfig({
            enabled: true,
            nftId: nftId,
            totalRepaid: 0,
            lastRepaymentTime: block.timestamp
        });
        
        emit AutoRepayEnabled(borrower, nftId);
    }
    
    /**
     * @notice Apply auto-repayment from income yield
     * @param borrower Address of the borrower
     * @param nftId NFT ID generating the yield
     * @param amount Amount of yield to apply
     */
    function applyAutoRepayment(
        address borrower,
        uint256 nftId,
        uint256 amount
    ) external onlyOwner {
        AutoRepayConfig storage config = autoRepayConfigs[borrower][nftId];
        require(config.enabled, "SPVManager: auto-repay not enabled for this NFT");
        
        uint256 currentDebt = rwaPool.getUserDebt(borrower);
        require(currentDebt > 0, "SPVManager: no debt to repay");
        
        // Transfer USDC from SPV to this contract
        usdc.transferFrom(msg.sender, address(this), amount);
        
        // Approve pool to spend USDC
        usdc.approve(address(rwaPool), amount);
        
        // Repay on behalf of borrower
        rwaPool.repayOnBehalfOf(borrower, amount);
        
        // Update config
        config.totalRepaid += amount;
        config.lastRepaymentTime = block.timestamp;
        
        // Record yield
        yieldHistory[borrower].push(YieldRecord({
            amount: amount,
            timestamp: block.timestamp,
            nftId: nftId
        }));
        
        uint256 remainingDebt = rwaPool.getUserDebt(borrower);
        
        emit YieldReceived(borrower, nftId, amount);
        emit AutoRepaymentApplied(borrower, nftId, amount, remainingDebt);
    }
    
    /**
     * @notice Get yield history for a borrower
     * @param borrower Address to query
     * @return Array of yield records
     */
    function getYieldHistory(address borrower) external view returns (YieldRecord[] memory) {
        return yieldHistory[borrower];
    }
    
    /**
     * @notice Get auto-repay configuration for a borrower and NFT
     * @param borrower Address to query
     * @param nftId NFT ID to query
     * @return Auto-repay configuration
     */
    function getAutoRepayConfig(address borrower, uint256 nftId) external view returns (AutoRepayConfig memory) {
        return autoRepayConfigs[borrower][nftId];
    }
    
    /**
     * @notice Check if auto-repay is enabled for a borrower and NFT
     * @param borrower Address to query
     * @param nftId NFT ID to query
     * @return True if enabled
     */
    function isAutoRepayEnabled(address borrower, uint256 nftId) external view returns (bool) {
        return autoRepayConfigs[borrower][nftId].enabled;
    }
    
    /**
     * @notice Disable auto-repayment for a specific NFT
     * @param borrower Address of the borrower
     * @param nftId NFT ID to disable auto-repay for
     */
    function disableAutoRepay(address borrower, uint256 nftId) external onlyOwner {
        autoRepayConfigs[borrower][nftId].enabled = false;
    }
}
