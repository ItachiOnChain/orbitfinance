// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPriceOracle} from "../interfaces/IPriceOracle.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title VaultRegistry
 * @notice Registry of approved vaults and their parameters
 * @dev Manages vault-asset mappings, LTV ratios, and price oracle reference
 */
contract VaultRegistry {
    /// @notice Maximum allowed LTV ratio (75% = 7500 basis points)
    uint256 public constant MAX_LTV = 7500;

    /// @notice Basis points denominator (100% = 10000)
    uint256 public constant BASIS_POINTS = 10000;

    /// @notice Mapping of asset to vault address
    mapping(address asset => address vault) public vaults;

    /// @notice Mapping of asset to LTV ratio in basis points
    mapping(address asset => uint256 ltvBasisPoints) public ltvRatios;

    /// @notice Mapping of approved vault addresses
    mapping(address => bool) public approvedVaults;

    /// @notice The price oracle contract
    address public priceOracle;

    /// @notice The owner of this contract
    address public owner;

    /**
     * @notice Emitted when a vault is registered
     * @param asset The asset address
     * @param vault The vault address
     * @param ltv The LTV ratio in basis points
     */
    event VaultRegistered(
        address indexed asset,
        address indexed vault,
        uint256 ltv
    );

    /**
     * @notice Emitted when an LTV ratio is updated
     * @param asset The asset address
     * @param ltv The new LTV ratio in basis points
     */
    event LTVUpdated(address indexed asset, uint256 ltv);

    /**
     * @notice Emitted when the price oracle is updated
     * @param oldOracle The previous oracle address
     * @param newOracle The new oracle address
     */
    event PriceOracleUpdated(
        address indexed oldOracle,
        address indexed newOracle
    );

    /**
     * @notice Emitted when ownership is transferred
     * @param previousOwner The previous owner address
     * @param newOwner The new owner address
     */
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

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
     * @notice Creates a new VaultRegistry
     * @param _priceOracle The price oracle address
     */
    constructor(address _priceOracle) {
        if (_priceOracle == address(0)) {
            revert OrbitErrors.InvalidImplementation(_priceOracle);
        }
        priceOracle = _priceOracle;
        owner = msg.sender;
    }

    /**
     * @notice Registers a new vault for an asset
     * @dev Only callable by owner
     * @param asset The asset address
     * @param vault The vault address
     * @param ltvBasisPoints The LTV ratio in basis points (max 7500 = 75%)
     */
    function registerVault(
        address asset,
        address vault,
        uint256 ltvBasisPoints
    ) external onlyOwner {
        if (vault == address(0)) {
            revert OrbitErrors.InvalidImplementation(vault);
        }

        if (ltvBasisPoints > MAX_LTV) {
            revert OrbitErrors.ExceedsMaxBorrow(ltvBasisPoints, MAX_LTV);
        }

        vaults[asset] = vault;
        ltvRatios[asset] = ltvBasisPoints;
        approvedVaults[vault] = true;

        emit VaultRegistered(asset, vault, ltvBasisPoints);
    }

    /**
     * @notice Returns the vault address for an asset
     * @param asset The asset address
     * @return The vault address
     */
    function getVault(address asset) external view returns (address) {
        return vaults[asset];
    }

    /**
     * @notice Returns the LTV ratio for an asset
     * @param asset The asset address
     * @return The LTV ratio in basis points
     */
    function getLTV(address asset) external view returns (uint256) {
        return ltvRatios[asset];
    }

    /**
     * @notice Updates the LTV ratio for an asset
     * @dev Only callable by owner
     * @param asset The asset address
     * @param ltvBasisPoints The new LTV ratio in basis points (max 7500 = 75%)
     */
    function setLTV(address asset, uint256 ltvBasisPoints) external onlyOwner {
        if (ltvBasisPoints > MAX_LTV) {
            revert OrbitErrors.ExceedsMaxBorrow(ltvBasisPoints, MAX_LTV);
        }

        ltvRatios[asset] = ltvBasisPoints;
        emit LTVUpdated(asset, ltvBasisPoints);
    }

    /**
     * @notice Updates the price oracle address
     * @dev Only callable by owner
     * @param _oracle The new oracle address
     */
    function setPriceOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) {
            revert OrbitErrors.InvalidImplementation(_oracle);
        }

        address oldOracle = priceOracle;
        priceOracle = _oracle;

        emit PriceOracleUpdated(oldOracle, _oracle);
    }

    /**
     * @notice Transfers ownership to a new address
     * @dev Only callable by the current owner
     * @param newOwner The new owner address
     */
    function setOwner(address newOwner) external onlyOwner {
        if (newOwner == address(0)) {
            revert OrbitErrors.InvalidImplementation(newOwner);
        }

        address previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }
}
