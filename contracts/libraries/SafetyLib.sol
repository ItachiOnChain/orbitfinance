// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OrbitErrors} from "../errors/OrbitErrors.sol";
import {MathLib} from "./MathLib.sol";

/**
 * @title SafetyLib
 * @notice Safety invariant checks for the Orbit Finance protocol
 * @dev Ensures positions remain properly collateralized
 */
library SafetyLib {
    using MathLib for uint256;

    /// @notice Precision constant for fixed-point arithmetic
    uint256 internal constant PRECISION = 1e18;

    /// @notice Basis points denominator (100% = 10000 basis points)
    uint256 internal constant BASIS_POINTS = 10000;

    /// @notice Minimum amount threshold to avoid dust
    uint256 internal constant DUST_THRESHOLD = 1000;

    /**
     * @notice Checks if a position is properly collateralized
     * @dev Returns true if: (deposits * assetPrice) >= (debt * debtPrice * 10000) / minLTV
     * @param deposits Amount of collateral deposited
     * @param debt Amount of debt outstanding
     * @param assetPrice Price of the collateral asset
     * @param debtPrice Price of the debt token
     * @param minLTV Minimum loan-to-value ratio in basis points
     * @return True if position is properly collateralized, false otherwise
     */
    function checkCollateralization(
        uint256 deposits,
        uint256 debt,
        uint256 assetPrice,
        uint256 debtPrice,
        uint256 minLTV
    ) internal pure returns (bool) {
        // No debt means always collateralized
        if (debt == 0) {
            return true;
        }

        // Require valid prices and LTV
        require(assetPrice > 0, "Invalid asset price");
        require(debtPrice > 0, "Invalid debt price");
        require(minLTV > 0 && minLTV <= BASIS_POINTS, "Invalid LTV");

        // Calculate collateral value: deposits * assetPrice
        uint256 collateralValue = deposits.mulDiv(assetPrice, PRECISION);

        // Calculate required collateral value: (debt * debtPrice * BASIS_POINTS) / minLTV
        uint256 debtValue = debt.mulDiv(debtPrice, PRECISION);
        uint256 requiredValue = debtValue.mulDiv(BASIS_POINTS, minLTV);

        return collateralValue >= requiredValue;
    }

    /**
     * @notice Checks collateralization and reverts if undercollateralized
     * @dev Reverts with InsufficientCollateral if position is not properly collateralized
     * @param deposits Amount of collateral deposited
     * @param debt Amount of debt outstanding
     * @param assetPrice Price of the collateral asset
     * @param debtPrice Price of the debt token
     * @param minLTV Minimum loan-to-value ratio in basis points
     */
    function checkNotUndercollateralized(
        uint256 deposits,
        uint256 debt,
        uint256 assetPrice,
        uint256 debtPrice,
        uint256 minLTV
    ) internal pure {
        if (
            !checkCollateralization(
                deposits,
                debt,
                assetPrice,
                debtPrice,
                minLTV
            )
        ) {
            // Calculate what's required vs available for error message
            uint256 debtValue = debt.mulDiv(debtPrice, PRECISION);
            uint256 requiredCollateral = debtValue.mulDiv(BASIS_POINTS, minLTV);
            requiredCollateral = requiredCollateral.mulDiv(
                PRECISION,
                assetPrice
            );

            revert OrbitErrors.InsufficientCollateral(
                requiredCollateral,
                deposits
            );
        }
    }
}
