// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title SyntheticToken
 * @notice ERC20 token representing synthetic debt (orUSD, orETH)
 * @dev Only the debt manager can mint and burn tokens
 */
contract SyntheticToken is ERC20 {
    /// @notice The debt manager contract that can mint/burn tokens
    address public immutable debtManager;

    /**
     * @notice Ensures only the debt manager can call the function
     */
    modifier onlyDebtManager() {
        if (msg.sender != debtManager) {
            revert OrbitErrors.Unauthorized(msg.sender);
        }
        _;
    }

    /**
     * @notice Creates a new synthetic token
     * @param name The token name (e.g., "Orbit USD")
     * @param symbol The token symbol (e.g., "orUSD")
     * @param _debtManager The debt manager contract address
     */
    constructor(
        string memory name,
        string memory symbol,
        address _debtManager
    ) ERC20(name, symbol) {
        if (_debtManager == address(0)) {
            revert OrbitErrors.InvalidImplementation(_debtManager);
        }
        debtManager = _debtManager;
    }

    /**
     * @notice Mints tokens to an address
     * @dev Only callable by the debt manager
     * @param to The recipient address
     * @param amount The amount to mint
     */
    function mint(address to, uint256 amount) external onlyDebtManager {
        _mint(to, amount);
    }

    /**
     * @notice Burns tokens from an address
     * @dev Only callable by the debt manager
     * @param from The address to burn from
     * @param amount The amount to burn
     */
    function burn(address from, uint256 amount) external onlyDebtManager {
        _burn(from, amount);
    }
}
