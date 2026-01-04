// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IPriceOracle
 * @notice Interface for price oracle contracts
 * @dev Returns asset prices in USD with 18 decimals
 */
interface IPriceOracle {
    /**
     * @notice Returns the price of an asset in USD
     * @dev Price is returned with 18 decimals (e.g., $3000 = 3000e18)
     * @param asset The address of the asset
     * @return The price in USD with 18 decimals
     */
    function getPrice(address asset) external view returns (uint256);
}
