// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IOrbitAccount} from "../interfaces/IOrbitAccount.sol";
import {IDebtManager} from "../interfaces/IDebtManager.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title AccountFactory
 * @notice Factory for deploying OrbitAccount contracts using minimal proxies
 * @dev Uses OpenZeppelin Clones for gas-efficient deployment
 */
contract AccountFactory {
    /// @notice Mapping of user to their account address
    mapping(address user => address account) public accounts;

    /// @notice Mapping to verify if an address is a valid OrbitAccount
    mapping(address account => bool isValid) public isOrbitAccount;

    /// @notice The OrbitAccount implementation contract
    address public immutable accountImplementation;

    /// @notice The vault registry address
    address public immutable vaultRegistry;

    /// @notice The debt manager address
    address public immutable debtManager;

    /// @notice The owner of this factory
    address public owner;

    /// @notice Total number of accounts created
    uint256 public totalAccounts;

    /**
     * @notice Emitted when a new account is created
     * @param user The user who owns the account
     * @param account The deployed account address
     * @param totalAccounts The new total number of accounts
     */
    event AccountCreated(
        address indexed user,
        address indexed account,
        uint256 totalAccounts
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
     * @notice Creates a new AccountFactory
     * @param _accountImplementation The OrbitAccount implementation address
     * @param _vaultRegistry The vault registry address
     * @param _debtManager The debt manager address
     */
    constructor(
        address _accountImplementation,
        address _vaultRegistry,
        address _debtManager
    ) {
        if (
            _accountImplementation == address(0) ||
            _vaultRegistry == address(0) ||
            _debtManager == address(0)
        ) {
            revert OrbitErrors.InvalidImplementation(address(0));
        }

        accountImplementation = _accountImplementation;
        vaultRegistry = _vaultRegistry;
        debtManager = _debtManager;
        owner = msg.sender;
    }

    /**
     * @notice Creates a new OrbitAccount for the caller
     * @dev Uses minimal proxy pattern for gas efficiency
     * @return account The address of the newly created account
     */
    function createAccount() external returns (address account) {
        if (accounts[msg.sender] != address(0)) {
            revert OrbitErrors.AccountAlreadyExists(
                msg.sender,
                accounts[msg.sender]
            );
        }

        account = _createAccountFor(msg.sender);
    }

    /**
     * @notice Gets existing account or creates new one for user
     * @param user The user address
     * @return account The user's account address
     */
    function getOrCreateAccount(
        address user
    ) external returns (address account) {
        account = accounts[user];

        if (account == address(0)) {
            account = _createAccountFor(user);
        }
    }

    /**
     * @notice Returns the account address for a user
     * @param user The user address
     * @return The account address (or address(0) if none exists)
     */
    function getAccount(address user) external view returns (address) {
        return accounts[user];
    }

    /**
     * @notice Checks if an address is a valid OrbitAccount
     * @param account The address to check
     * @return True if the address is a valid OrbitAccount
     */
    function isValidAccount(address account) external view returns (bool) {
        return isOrbitAccount[account];
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

    /**
     * @notice Internal function to create an account for a specific user
     * @param user The user address
     * @return account The newly created account address
     */
    function _createAccountFor(
        address user
    ) internal returns (address account) {
        // Clone the implementation
        account = Clones.clone(accountImplementation);

        // Initialize the cloned account
        IOrbitAccount(account).initialize(
            user,
            vaultRegistry,
            debtManager,
            address(0)
        );

        // Register the account
        accounts[user] = account;
        isOrbitAccount[account] = true;
        totalAccounts++;

        // CRITICAL FIX: Authorize account with DebtManager
        IDebtManager(debtManager).authorizeAccount(account);

        emit AccountCreated(user, account, totalAccounts);
    }
}
