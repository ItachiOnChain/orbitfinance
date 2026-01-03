// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title ERC4626Vault
 * @notice ERC4626-compatible vault wrapping yield strategies
 * @dev Manages deposits, withdrawals, and yield harvesting
 */
contract ERC4626Vault is ERC4626 {
    using SafeERC20 for IERC20;

    /// @notice The underlying strategy
    IStrategy public strategy;

    /// @notice LTV ratio for this vault's asset
    uint256 public ltvRatio;

    /// @notice Maximum total deposits allowed
    uint256 public depositCap;

    /// @notice Total assets deposited (excluding yield)
    uint256 public totalDeposits;

    /// @notice Total assets at last harvest
    uint256 public totalAssetsAtLastHarvest;

    /// @notice Block number of last harvest
    uint256 public lastHarvestBlock;

    /// @notice Owner of the vault
    address public owner;

    /// @notice Whether deposits are paused
    bool public paused;

    /**
     * @notice Emitted when yield is harvested
     * @param yieldEarned The amount of yield earned
     * @param totalAssets The new total assets
     */
    event Harvested(uint256 yieldEarned, uint256 totalAssets);

    /**
     * @notice Emitted when the vault is paused
     */
    event Paused();

    /**
     * @notice Emitted when the vault is unpaused
     */
    event Unpaused();

    /**
     * @notice Ensures only the owner can call the function
     */
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert OrbitErrors.Unauthorized(msg.sender);
        }
        _;
    }

    /**
     * @notice Ensures the vault is not paused
     */
    modifier whenNotPaused() {
        if (paused) {
            revert OrbitErrors.InvalidState(1, 0);
        }
        _;
    }

    /**
     * @notice Creates a new ERC4626Vault
     * @param _asset The underlying asset
     * @param _strategy The yield strategy
     * @param _ltvRatio The LTV ratio for this asset
     * @param _depositCap The maximum total deposits
     * @param _name The vault token name
     * @param _symbol The vault token symbol
     */
    constructor(
        address _asset,
        address _strategy,
        uint256 _ltvRatio,
        uint256 _depositCap,
        string memory _name,
        string memory _symbol
    ) ERC4626(IERC20(_asset)) ERC20(_name, _symbol) {
        if (_strategy == address(0)) {
            revert OrbitErrors.InvalidImplementation(_strategy);
        }

        strategy = IStrategy(_strategy);
        
        // CRITICAL FIX: Set vault reference in strategy
        IStrategy(_strategy).setVault(address(this));
        
        ltvRatio = _ltvRatio;
        depositCap = _depositCap;
        owner = msg.sender;
        lastHarvestBlock = block.number;
    }

    /**
     * @notice Deposits assets and mints shares
     * @param assets The amount of assets to deposit
     * @param receiver The address to receive shares
     * @return shares The amount of shares minted
     */
    function deposit(
        uint256 assets,
        address receiver
    ) public override whenNotPaused returns (uint256 shares) {
        if (assets == 0) {
            revert OrbitErrors.ZeroAmount();
        }

        if (totalDeposits + assets > depositCap) {
            revert OrbitErrors.ExceedsMaxBorrow(
                totalDeposits + assets,
                depositCap
            );
        }

        // Calculate shares before deposit
        shares = previewDeposit(assets);

        // Transfer assets from depositor
        IERC20(asset()).safeTransferFrom(msg.sender, address(this), assets);

        // Approve and deposit to strategy
        IERC20(asset()).forceApprove(address(strategy), assets);
        strategy.deposit(assets);

        // Mint shares to receiver
        _mint(receiver, shares);

        // Update total deposits
        totalDeposits += assets;

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /**
     * @notice Redeems shares for assets
     * @param shares The amount of shares to redeem
     * @param receiver The address to receive assets
     * @param owner_ The owner of the shares
     * @return assets The amount of assets withdrawn
     */
    function redeem(
        uint256 shares,
        address receiver,
        address owner_
    ) public override returns (uint256 assets) {
        if (shares == 0) {
            revert OrbitErrors.ZeroAmount();
        }

        // Calculate assets before burning
        assets = previewRedeem(shares);

        // Check allowance if not owner
        if (msg.sender != owner_) {
            _spendAllowance(owner_, msg.sender, shares);
        }

        // Burn shares
        _burn(owner_, shares);

        // Withdraw from strategy
        strategy.withdraw(assets, receiver);

        // CRITICAL FIX: Prevent underflow when assets include yield that exceeds totalDeposits
        // This can happen when withdrawing after harvest has accumulated yield
        if (assets <= totalDeposits) {
            totalDeposits -= assets;
        } else {
            // If withdrawing more than totalDeposits (due to yield), set to 0
            totalDeposits = 0;
        }

        emit Withdraw(msg.sender, receiver, owner_, assets, shares);
    }

    /**
     * @notice Harvests yield from the strategy
     * @return yieldEarned The amount of yield earned
     */
    function harvest() external returns (uint256 yieldEarned) {
        uint256 totalAssetsBefore = strategy.totalAssets();

        // Call strategy harvest
        uint256 strategyYield = strategy.harvest();

        uint256 totalAssetsAfter = strategy.totalAssets();

        if (totalAssetsAfter > totalAssetsBefore) {
            yieldEarned = totalAssetsAfter - totalAssetsBefore;
            totalAssetsAtLastHarvest = totalAssetsAfter;
        }

        lastHarvestBlock = block.number;

        emit Harvested(yieldEarned, totalAssetsAfter);
    }

    /**
     * @notice Returns the total assets managed by the vault
     * @return The total assets including yield
     */
    function totalAssets() public view override returns (uint256) {
        return strategy.totalAssets();
    }

    /**
     * @notice Previews the amount of shares for a deposit
     * @param assets The amount of assets to deposit
     * @return The amount of shares that would be minted
     */
    function previewDeposit(
        uint256 assets
    ) public view override returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? assets : (assets * supply) / totalAssets();
    }

    /**
     * @notice Previews the amount of assets for a redemption
     * @param shares The amount of shares to redeem
     * @return The amount of assets that would be withdrawn
     */
    function previewRedeem(
        uint256 shares
    ) public view override returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? 0 : (shares * totalAssets()) / supply;
    }

    /**
     * @notice Pauses deposits
     */
    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    /**
     * @notice Unpauses deposits
     */
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    /**
     * @notice Transfers ownership
     * @param newOwner The new owner address
     */
    function setOwner(address newOwner) external onlyOwner {
        if (newOwner == address(0)) {
            revert OrbitErrors.InvalidImplementation(newOwner);
        }
        owner = newOwner;
    }
}