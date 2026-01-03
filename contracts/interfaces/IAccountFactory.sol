// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAccountFactory
 * @notice Interface for the account factory contract
 * @dev Used to verify valid OrbitAccount contracts
 */
interface IAccountFactory {
    /**
     * @notice Checks if an address is a valid OrbitAccount
     * @param account The address to check
     * @return True if the account is valid, false otherwise
     */
    function isValidAccount(address account) external view returns (bool);

    /**
     * @notice Creates a new OrbitAccount for a user
     * @param user The user address
     * @return The address of the created account
     */
    function createAccount(address user) external returns (address);

    /**
     * @notice Returns the account address for a user
     * @param user The user address
     * @return The account address (address(0) if none exists)
     */
    function getAccount(address user) external view returns (address);
}
