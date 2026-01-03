// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISyntheticToken} from "../interfaces/ISyntheticToken.sol";
import {IAccountFactory} from "../interfaces/IAccountFactory.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title DebtManager
 * @notice Manages minting and burning of synthetic debt tokens
 * @dev Only authorized OrbitAccount contracts can mint/burn debt
 */
contract DebtManager {
    /// @notice The synthetic debt token (orUSD or orETH)
    ISyntheticToken public immutable debtToken;

    /// @notice Total supply of debt tokens
    uint256 public totalDebtSupply;

    /// @notice Mapping of authorized accounts that can mint/burn
    mapping(address => bool) public authorizedAccounts;

    /// @notice The account factory contract
    address public immutable accountFactory;

    /// @notice The owner of this contract
    address public owner;

    /**
     * @notice Emitted when debt tokens are minted
     * @param account The account that initiated the mint
     * @param to The recipient of the minted tokens
     * @param amount The amount minted
     */
    event DebtMinted(
        address indexed account,
        address indexed to,
        uint256 amount
    );

    /**
     * @notice Emitted when debt tokens are burned
     * @param account The account that initiated the burn
     * @param from The address whose tokens are burned
     * @param amount The amount burned
     */
    event DebtBurned(
        address indexed account,
        address indexed from,
        uint256 amount
    );

    /**
     * @notice Emitted when an account is authorized
     * @param account The authorized account address
     */
    event AccountAuthorized(address indexed account);

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
     * @notice Ensures only authorized accounts can call the function
     */
    modifier onlyAuthorized() {
        if (!authorizedAccounts[msg.sender]) {
            revert OrbitErrors.Unauthorized(msg.sender);
        }
        _;
    }

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
     * @notice Creates a new DebtManager
     * @param _debtToken The synthetic debt token address
     * @param _accountFactory The account factory address
     */
    constructor(address _debtToken, address _accountFactory) {
        if (_debtToken == address(0) || _accountFactory == address(0)) {
            revert OrbitErrors.InvalidImplementation(address(0));
        }

        debtToken = ISyntheticToken(_debtToken);
        accountFactory = _accountFactory;
        owner = msg.sender;
    }

    /**
     * @notice Mints debt tokens to an address
     * @dev Only callable by authorized accounts
     * @param to The recipient address
     * @param amount The amount to mint
     */
    function mint(address to, uint256 amount) external onlyAuthorized {
        if (amount == 0) {
            revert OrbitErrors.ZeroAmount();
        }

        debtToken.mint(to, amount);

        unchecked {
            totalDebtSupply += amount;
        }

        emit DebtMinted(msg.sender, to, amount);
    }

    /**
     * @notice Burns debt tokens from an address
     * @dev Only callable by authorized accounts
     * @param from The address to burn from
     * @param amount The amount to burn
     */
    function burn(address from, uint256 amount) external onlyAuthorized {
        if (amount == 0) {
            revert OrbitErrors.ZeroAmount();
        }

        if (amount > totalDebtSupply) {
            revert OrbitErrors.InsufficientCollateral(amount, totalDebtSupply);
        }

        debtToken.burn(from, amount);

        unchecked {
            totalDebtSupply -= amount;
        }

        emit DebtBurned(msg.sender, from, amount);
    }

    /**
     * @notice Authorizes an OrbitAccount to mint/burn debt
     * @dev Verifies the account is valid via the factory
     * @param account The account address to authorize
     */
    function authorizeAccount(address account) external {
        if (!IAccountFactory(accountFactory).isValidAccount(account)) {
            revert OrbitErrors.Unauthorized(account);
        }

        authorizedAccounts[account] = true;
        emit AccountAuthorized(account);
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
