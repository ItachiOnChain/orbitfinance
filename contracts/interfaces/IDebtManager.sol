// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDebtManager
 * @notice Interface for managing synthetic debt tokens
 * @dev Handles minting and burning of debt tokens (orUSD, orETH)
 */
interface IDebtManager {
    /**
     * @notice Emitted when debt tokens are minted
     * @param to The recipient of the minted tokens
     * @param amount The amount minted
     */
    event DebtMinted(address indexed to, uint256 amount);

    /**
     * @notice Emitted when debt tokens are burned
     * @param from The address whose tokens are burned
     * @param amount The amount burned
     */
    event DebtBurned(address indexed from, uint256 amount);

    /**
     * @notice Mints debt tokens to an address
     * @param to The recipient address
     * @param amount The amount to mint
     */
    function mint(address to, uint256 amount) external;

    /**
     * @notice Burns debt tokens from an address
     * @param from The address to burn from
     * @param amount The amount to burn
     */
    function burn(address from, uint256 amount) external;

    /**
     * @notice Returns the total supply of debt tokens
     * @return The total debt supply
     */
    function totalDebtSupply() external view returns (uint256);

    /**
     * @notice Authorizes an account to mint/burn debt tokens
     * @param account The account to authorize
     */
    function authorizeAccount(address account) external;
}
