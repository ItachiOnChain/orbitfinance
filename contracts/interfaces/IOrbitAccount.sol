// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOrbitAccount
 * @notice Interface for user account contracts in Orbit Finance
 * @dev Each user has their own deployed OrbitAccount contract
 */
interface IOrbitAccount {
    /**
     * @notice Emitted when collateral is deposited
     * @param asset The address of the deposited asset
     * @param amount The amount deposited
     */
    event Deposit(address indexed asset, uint256 amount);

    /**
     * @notice Emitted when debt tokens are borrowed
     * @param debtToken The address of the borrowed debt token
     * @param amount The amount borrowed
     */
    event Borrowed(address indexed debtToken, uint256 amount);

    /**
     * @notice Emitted when debt is repaid
     * @param amount The amount repaid
     */
    event Repaid(uint256 amount);

    /**
     * @notice Emitted when collateral is withdrawn
     * @param asset The address of the withdrawn asset
     * @param amount The amount withdrawn
     */
    event Withdrawal(address indexed asset, uint256 amount);

    /**
     * @notice Emitted when a self-liquidation occurs
     * @param debtAmount The amount of debt liquidated
     * @param asset The collateral asset used
     * @param collateralAmount The amount of collateral used
     */
    event SelfLiquidated(
        uint256 debtAmount,
        address indexed asset,
        uint256 collateralAmount
    );

    /**
     * @notice Initializes the account for a user
     * @param owner The owner of this account
     * @param vaultRegistry The vault registry contract address
     * @param debtManager The debt manager contract address
     * @param yieldRouter The yield router contract address
     */
    function initialize(
        address owner,
        address vaultRegistry,
        address debtManager,
        address yieldRouter
    ) external;

    /**
     * @notice Deposits collateral into the account
     * @param amount The amount to deposit
     * @param asset The asset to deposit
     */
    function deposit(uint256 amount, address asset) external;

    /**
     * @notice Borrows debt tokens against collateral
     * @param amount The amount to borrow
     * @param debtToken The debt token to borrow
     */
    function borrow(uint256 amount, address debtToken) external;

    /**
     * @notice Repays outstanding debt
     * @param amount The amount to repay
     */
    function repay(uint256 amount) external;

    /**
     * @notice Withdraws collateral from the account
     * @param amount The amount to withdraw
     * @param asset The asset to withdraw
     */
    function withdraw(uint256 amount, address asset) external;

    /**
     * @notice Self-liquidates position by burning collateral to repay debt
     * @param debtAmount The amount of debt to repay
     * @param asset The collateral asset to use
     * @param maxCollateralIn Maximum collateral willing to spend
     */
    function liquidate(
        uint256 debtAmount,
        address asset,
        uint256 maxCollateralIn
    ) external;

    /**
     * @notice Returns the total debt for this account
     * @return The total debt amount
     */
    function totalDebt() external view returns (uint256);

    /**
     * @notice Returns the deposit amount for a specific asset
     * @param asset The asset to query
     * @return The deposited amount
     */
    function deposits(address asset) external view returns (uint256);

    /**
     * @notice Returns the maximum borrowable amount
     * @return The maximum amount that can be borrowed
     */
    function maxBorrowableAmount() external view returns (uint256);

    /**
     * @notice Returns the withdrawable collateral for a specific asset
     * @param asset The asset to query
     * @return The amount that can be withdrawn
     */
    function withdrawableCollateral(
        address asset
    ) external view returns (uint256);
}
