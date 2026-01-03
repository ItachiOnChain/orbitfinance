// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ISyntheticToken
 * @notice Interface for synthetic debt tokens (orUSD, orETH)
 * @dev Extends ERC20 with mint/burn functionality
 */
interface ISyntheticToken is IERC20 {
    /**
     * @notice Mints tokens to an address
     * @dev Only callable by the debt manager
     * @param to The recipient address
     * @param amount The amount to mint
     */
    function mint(address to, uint256 amount) external;

    /**
     * @notice Burns tokens from an address
     * @dev Only callable by the debt manager
     * @param from The address to burn from
     * @param amount The amount to burn
     */
    function burn(address from, uint256 amount) external;

    /**
     * @notice Returns the debt manager address
     * @return The debt manager contract address
     */
    function debtManager() external view returns (address);
}
