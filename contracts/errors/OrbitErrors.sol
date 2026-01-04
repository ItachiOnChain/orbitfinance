// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title OrbitErrors
 * @notice Custom error definitions for the Orbit Finance protocol
 * @dev All protocol contracts should use these errors for consistent error handling
 */
library OrbitErrors {
    /**
     * @notice Thrown when collateral is insufficient for the requested operation
     * @param required The minimum collateral required
     * @param available The actual collateral available
     */
    error InsufficientCollateral(uint256 required, uint256 available);

    /**
     * @notice Thrown when borrow amount exceeds maximum allowed
     * @param requested The amount requested to borrow
     * @param max The maximum amount allowed to borrow
     */
    error ExceedsMaxBorrow(uint256 requested, uint256 max);

    /**
     * @notice Thrown when attempting to withdraw with outstanding debt
     * @param amount The outstanding debt amount
     */
    error DebtOutstanding(uint256 amount);

    /**
     * @notice Thrown when contract is in an invalid state for the operation
     * @param current The current state
     * @param required The required state
     */
    error InvalidState(uint8 current, uint8 required);

    /**
     * @notice Thrown when a zero amount is provided where non-zero is required
     */
    error ZeroAmount();

    /**
     * @notice Thrown when caller is not authorized for the operation
     * @param caller The address of the unauthorized caller
     */
    error Unauthorized(address caller);

    /**
     * @notice Thrown when attempting to create an account that already exists
     * @param user The user address
     * @param account The existing account address
     */
    error AccountAlreadyExists(address user, address account);

    /**
     * @notice Thrown when an invalid implementation address is provided
     * @param impl The invalid implementation address
     */
    error InvalidImplementation(address impl);
}
