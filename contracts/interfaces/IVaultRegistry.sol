// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVaultRegistry
 * @notice Interface for the vault registry
 * @dev Maintains approved vaults, assets, and their LTV ratios
 */
interface IVaultRegistry {
    /**
     * @notice Returns the vault address for a given asset
     * @param asset The asset address
     * @return The vault address
     */
    function getVault(address asset) external view returns (address);

    /**
     * @notice Returns the LTV ratio for a given asset
     * @param asset The asset address
     * @return The LTV in basis points (e.g., 5000 = 50%)
     */
    function getLTV(address asset) external view returns (uint256);

    /**
     * @notice Registers a new vault for an asset
     * @param asset The asset address
     * @param vault The vault address
     * @param ltv The LTV ratio in basis points
     */
    function registerVault(address asset, address vault, uint256 ltv) external;

    /**
     * @notice Updates the LTV ratio for an asset
     * @param asset The asset address
     * @param ltvBasisPoints The new LTV ratio in basis points
     */
    function setLTV(address asset, uint256 ltvBasisPoints) external;

    /**
     * @notice Updates the price oracle address
     * @param _oracle The new oracle address
     */
    function setPriceOracle(address _oracle) external;

    /**
     * @notice Returns the price oracle address
     * @return The oracle contract address
     */
    function priceOracle() external view returns (address);
}
