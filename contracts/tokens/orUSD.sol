// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SyntheticToken} from "./SyntheticToken.sol";

/**
 * @title orUSD
 * @notice Orbit USD - Synthetic stablecoin debt token
 * @dev Concrete implementation of SyntheticToken for USD-pegged debt
 */
contract orUSD is SyntheticToken {
    /**
     * @notice Creates the Orbit USD token
     * @param _debtManager The debt manager contract address
     */
    constructor(
        address _debtManager
    ) SyntheticToken("Orbit USD", "orUSD", _debtManager) {}

    /**
     * @notice Returns the number of decimals for the token
     * @return The number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
