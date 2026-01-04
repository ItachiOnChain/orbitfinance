// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SyntheticToken} from "./SyntheticToken.sol";

/**
 * @title orETH
 * @notice Orbit ETH - Synthetic ETH debt token
 * @dev Concrete implementation of SyntheticToken for ETH-pegged debt
 */
contract orETH is SyntheticToken {
    /**
     * @notice Creates the Orbit ETH token
     * @param _debtManager The debt manager contract address
     */
    constructor(
        address _debtManager
    ) SyntheticToken("Orbit ETH", "orETH", _debtManager) {}

    /**
     * @notice Returns the number of decimals for the token
     * @return The number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
