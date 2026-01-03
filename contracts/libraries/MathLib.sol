// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MathLib
 * @notice Fixed-point math operations using 1e18 precision
 * @dev Provides safe math operations with gas optimizations where possible
 */
library MathLib {
    /// @notice Precision constant for fixed-point arithmetic
    uint256 internal constant PRECISION = 1e18;

    /**
     * @notice Division with ceiling rounding
     * @dev Rounds up to ensure user doesn't get favorable rounding
     * @param a Numerator
     * @param b Denominator
     * @return Result of a / b rounded up
     */
    function divCeil(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "Division by zero");

        // Equivalent to: (a + b - 1) / b
        // This avoids overflow in (a + b - 1) by using: a / b + (a % b > 0 ? 1 : 0)
        uint256 quotient = a / b;
        uint256 remainder = a % b;

        unchecked {
            return remainder > 0 ? quotient + 1 : quotient;
        }
    }

    /**
     * @notice Returns the minimum of two numbers
     * @param a First number
     * @param b Second number
     * @return The smaller of a and b
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @notice Returns the maximum of two numbers
     * @param a First number
     * @param b Second number
     * @return The larger of a and b
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @notice Calculates (a * b) / c with overflow protection
     * @dev Uses full precision multiplication before division
     * @param a First multiplicand
     * @param b Second multiplicand
     * @param c Divisor
     * @return Result of (a * b) / c
     */
    function mulDiv(
        uint256 a,
        uint256 b,
        uint256 c
    ) internal pure returns (uint256) {
        require(c > 0, "Division by zero");

        // Check for overflow in multiplication
        uint256 result = a * b;
        require(a == 0 || result / a == b, "Multiplication overflow");

        return result / c;
    }
}
