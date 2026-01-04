// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title MockStrategy
 * @notice Mock strategy for testing yield generation
 */
contract MockStrategy is IStrategy {
    using SafeERC20 for IERC20;

    IERC20 private immutable _asset;
    address public vault;
    uint256 public totalDeposited;
    uint256 public simulatedYieldBasisPoints = 50000; // 500% APY for demo visibility
    uint256 public lastHarvestBlock;
    uint256 private constant BLOCKS_PER_YEAR = 2628000;
    uint256 private constant BASIS_POINTS = 10000;

    error NotVault();
    error VaultAlreadySet();

    constructor(address assetAddress) {
        require(assetAddress != address(0), "Invalid asset");
        _asset = IERC20(assetAddress);
        lastHarvestBlock = block.number;
        vault = address(0); // Will be set by setVault()
    }

    function asset() external view override returns (address) {
        return address(_asset);
    }

    function setVault(address _vault) external override {
        if (vault != address(0)) {
            revert VaultAlreadySet();
        }
        require(_vault != address(0), "Invalid vault");
        vault = _vault;
    }

    function deposit(uint256 amount) external override onlyVault {
        require(amount > 0, "Zero amount");
        _asset.safeTransferFrom(msg.sender, address(this), amount);
        totalDeposited += amount;
    }

    /**
     * @notice Withdraw assets from strategy - FIXED VERSION
     * @dev Now checks actual balance before transfer to prevent underflow
     * @param amount Amount to withdraw
     * @param receiver Address to receive the assets
     * @return Amount actually withdrawn
     */
    function withdraw(
        uint256 amount,
        address receiver
    ) external override onlyVault returns (uint256) {
        require(amount > 0, "Zero amount");
        
        // CRITICAL FIX: Check actual token balance, not just accounting
        // The strategy might have less tokens than totalDeposited due to yield harvesting timing
        uint256 actualBalance = _asset.balanceOf(address(this));
        uint256 toWithdraw = amount > actualBalance ? actualBalance : amount;
        
        require(toWithdraw > 0, "No tokens available");
        
        // Update accounting - only decrease by what we actually withdraw
        if (toWithdraw <= totalDeposited) {
            totalDeposited -= toWithdraw;
        } else {
            totalDeposited = 0;
        }
        
        // Transfer the actual available amount
        _asset.safeTransfer(receiver, toWithdraw);
        
        return toWithdraw;
    }

    function harvest() external override onlyVault returns (uint256 yieldEarned) {
        uint256 blocksSinceHarvest = block.number - lastHarvestBlock;
        
        if (blocksSinceHarvest > 0 && totalDeposited > 0) {
            yieldEarned = (totalDeposited * simulatedYieldBasisPoints * blocksSinceHarvest) / (BLOCKS_PER_YEAR * BASIS_POINTS);
            totalDeposited += yieldEarned;
        }
        
        lastHarvestBlock = block.number;
    }

    function totalAssets() external view override returns (uint256) {
        return totalDeposited + _calculatePendingYield();
    }

    function setYieldRate(uint256 basisPoints) external {
        // Allow vault or anyone (for testing flexibility)
        require(basisPoints <= 10000, "Invalid rate");
        simulatedYieldBasisPoints = basisPoints;
    }

    function _calculatePendingYield() internal view returns (uint256) {
        uint256 blocksSinceHarvest = block.number - lastHarvestBlock;
        
        if (blocksSinceHarvest == 0 || totalDeposited == 0) {
            return 0;
        }
        
        return (totalDeposited * simulatedYieldBasisPoints * blocksSinceHarvest) / (BLOCKS_PER_YEAR * BASIS_POINTS);
    }

    modifier onlyVault() {
        if (msg.sender != vault) {
            revert NotVault();
        }
        _;
    }
}