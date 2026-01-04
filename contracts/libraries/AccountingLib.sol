// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MathLib} from "./MathLib.sol";

/**
 * @title AccountingLib
 * @notice Core financial calculations for the Orbit Finance protocol
 * @dev All calculations round against the user for safety
 */
library AccountingLib {
    using MathLib for uint256;

    /// @notice Precision constant for fixed-point arithmetic
    uint256 internal constant PRECISION = 1e18;

    /// @notice Basis points denominator (100% = 10000 basis points)
    uint256 internal constant BASIS_POINTS = 10000;

    /**
     * @notice Calculates maximum borrowable amount given collateral
     * @dev Formula: (depositAmount * assetPrice * ltvBasisPoints) / (10000 * debtTokenPrice)
     * @param depositAmount Amount of collateral deposited
     * @param assetPrice Price of the collateral asset
     * @param debtTokenPrice Price of the debt token
     * @param ltvBasisPoints Loan-to-value ratio in basis points (e.g., 5000 = 50%)
     * @return Maximum amount that can be borrowed
     */
    function calculateMaxBorrow(
        uint256 depositAmount,
        uint256 assetPrice,
        uint256 debtTokenPrice,
        uint256 ltvBasisPoints
    ) internal pure returns (uint256) {
        require(debtTokenPrice > 0, "Invalid debt price");
        require(ltvBasisPoints <= BASIS_POINTS, "Invalid LTV");

        // Calculate: (depositAmount * assetPrice * ltvBasisPoints) / (BASIS_POINTS * debtTokenPrice)
        uint256 numerator = depositAmount.mulDiv(assetPrice, PRECISION);
        numerator = numerator.mulDiv(ltvBasisPoints, BASIS_POINTS);

        return numerator.mulDiv(PRECISION, debtTokenPrice);
    }

    /**
     * @notice Calculates required collateral for a given debt amount
     * @dev Formula: ROUND UP: (debtAmount * debtTokenPrice * 10000) / (ltvBasisPoints * assetPrice)
     * @dev Rounds UP to ensure sufficient collateral
     * @param debtAmount Amount of debt
     * @param assetPrice Price of the collateral asset
     * @param debtTokenPrice Price of the debt token
     * @param ltvBasisPoints Loan-to-value ratio in basis points
     * @return Required collateral amount (rounded up)
     */
    function calculateRequiredCollateral(
        uint256 debtAmount,
        uint256 assetPrice,
        uint256 debtTokenPrice,
        uint256 ltvBasisPoints
    ) internal pure returns (uint256) {
        require(assetPrice > 0, "Invalid asset price");
        require(ltvBasisPoints > 0, "Invalid LTV");

        // Calculate: (debtAmount * debtTokenPrice * BASIS_POINTS) / (ltvBasisPoints * assetPrice)
        uint256 numerator = debtAmount.mulDiv(debtTokenPrice, PRECISION);
        numerator = numerator.mulDiv(BASIS_POINTS, ltvBasisPoints);

        // Use divCeil to round UP against user
        uint256 denominator = assetPrice;
        return numerator.divCeil(denominator / PRECISION);
    }

    /**
     * @notice Calculates withdrawable collateral amount
     * @dev If no debt, all deposits are withdrawable. Otherwise, only excess over required collateral
     * @param totalDeposits Total amount of collateral deposited
     * @param currentDebt Current debt amount
     * @param assetPrice Price of the collateral asset
     * @param debtTokenPrice Price of the debt token
     * @param ltvBasisPoints Loan-to-value ratio in basis points
     * @return Amount of collateral that can be withdrawn
     */
    function calculateWithdrawable(
        uint256 totalDeposits,
        uint256 currentDebt,
        uint256 assetPrice,
        uint256 debtTokenPrice,
        uint256 ltvBasisPoints
    ) internal pure returns (uint256) {
        // If no debt, all deposits are withdrawable
        if (currentDebt == 0) {
            return totalDeposits;
        }

        // Calculate required collateral for current debt
        uint256 requiredCollateral = calculateRequiredCollateral(
            currentDebt,
            assetPrice,
            debtTokenPrice,
            ltvBasisPoints
        );

        // Return excess collateral, or 0 if undercollateralized
        if (totalDeposits > requiredCollateral) {
            unchecked {
                return totalDeposits - requiredCollateral;
            }
        }

        return 0;
    }
}
