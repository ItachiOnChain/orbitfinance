// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IStrategy
 * @notice Interface for yield generation strategies
 * @dev Strategies deploy funds to external protocols (Aave, Compound, Yearn)
 */
interface IStrategy {
    /**
     * @notice Deposits assets into the strategy
     * @param amount The amount to deposit
     */
    function deposit(uint256 amount) external;

    /**
     * @notice Withdraws assets from the strategy
     * @param amount The amount to withdraw
     * @param receiver The address to receive the withdrawn assets
     * @return The actual amount withdrawn
     */
    function withdraw(
        uint256 amount,
        address receiver
    ) external returns (uint256);

    /**
     * @notice Harvests yield from the strategy
     * @dev Realizes gains and compounds if applicable
     * @return The amount of yield harvested
     */
    function harvest() external returns (uint256);

    /**
     * @notice Returns the total assets controlled by the strategy
     * @return The total asset amount
     */
    function totalAssets() external view returns (uint256);

    /**
     * @notice Returns the underlying asset address
     * @return The asset token address
     */
    function asset() external view returns (address);

    /**
     * @notice Sets the vault address
     * @param _vault The vault address
     */
    function setVault(address _vault) external;
}
