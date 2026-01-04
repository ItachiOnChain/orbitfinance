// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {OrbitAccount} from "../core/OrbitAccount.sol";
import {DebtManager} from "../core/DebtManager.sol";
import {VaultRegistry} from "../vaults/VaultRegistry.sol";
import {MockPriceOracle} from "../mocks/MockPriceOracle.sol";
import {orUSD} from "../tokens/orUSD.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockAccountFactory} from "./mocks/MockAccountFactory.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title OrbitAccountTest
 * @notice Comprehensive tests for OrbitAccount contract
 */
contract OrbitAccountTest is Test {
    OrbitAccount public account;
    DebtManager public debtManager;
    VaultRegistry public registry;
    MockPriceOracle public oracle;
    orUSD public debtToken;
    MockAccountFactory public factory;

    MockERC20 public weth;
    MockERC20 public usdc;

    address public user;
    address public mockVault;

    uint256 constant WETH_PRICE = 3000e18; // $3000
    uint256 constant USDC_PRICE = 1e18; // $1
    uint256 constant LTV_50 = 5000; // 50%
    uint256 constant LTV_75 = 7500; // 75%

    function setUp() public {
        user = makeAddr("user");
        mockVault = makeAddr("mockVault");

        // Deploy tokens
        weth = new MockERC20("Wrapped ETH", "WETH", 18);
        usdc = new MockERC20("USD Coin", "USDC", 6);

        // Deploy oracle and set prices
        oracle = new MockPriceOracle();
        oracle.setPrice(address(weth), WETH_PRICE);
        oracle.setPrice(address(usdc), USDC_PRICE);

        // Deploy registry
        registry = new VaultRegistry(address(oracle));
        registry.registerVault(address(weth), mockVault, LTV_50);
        registry.registerVault(address(usdc), mockVault, LTV_75);

        // Deploy factory
        factory = new MockAccountFactory();

        // Deploy debt token and manager
        address predictedDebtManager = vm.computeCreateAddress(
            address(this),
            vm.getNonce(address(this)) + 1
        );
        debtToken = new orUSD(predictedDebtManager);
        debtManager = new DebtManager(address(debtToken), address(factory));

        // Set debt token price
        oracle.setPrice(address(debtToken), 1e18); // $1

        // Deploy account
        account = new OrbitAccount(address(registry), address(debtManager));
        account.initialize(
            user,
            address(registry),
            address(debtManager),
            address(0)
        );

        // Register and authorize account
        factory.registerAccount(address(account));
        debtManager.authorizeAccount(address(account));

        // Mint tokens to user
        weth.mint(user, 100 ether);
        usdc.mint(user, 100000e6);

        // Mint debt tokens to user for repayment tests
        // Authorize test contract temporarily to mint
        factory.registerAccount(address(this));
        debtManager.authorizeAccount(address(this));
        debtManager.mint(user, 10000e18);

        // Approve account to spend user's tokens
        vm.startPrank(user);
        weth.approve(address(account), type(uint256).max);
        usdc.approve(address(account), type(uint256).max);
        debtToken.approve(address(account), type(uint256).max);
        debtToken.approve(address(debtManager), type(uint256).max);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        INITIALIZATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Initialization() public {
        assertEq(account.owner(), user);
        assertEq(account.vaultRegistry(), address(registry));
        assertEq(account.debtManager(), address(debtManager));
        assertEq(
            uint8(account.currentState()),
            uint8(OrbitAccount.State.CREATED)
        );
        assertEq(account.lastUpdateBlock(), block.number);
    }

    function test_RevertDoubleInitialization() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.AccountAlreadyExists.selector,
                user,
                address(account)
            )
        );
        account.initialize(
            user,
            address(registry),
            address(debtManager),
            address(0)
        );
    }

    /*//////////////////////////////////////////////////////////////
                        DEPOSIT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Deposit() public {
        uint256 depositAmount = 1 ether;

        vm.prank(user);
        account.deposit(depositAmount, address(weth));

        assertEq(account.deposits(address(weth)), depositAmount);
        assertEq(account.totalDepositsAllTime(), depositAmount);
        assertEq(
            uint8(account.currentState()),
            uint8(OrbitAccount.State.DEPOSITED)
        );
        assertEq(weth.balanceOf(address(account)), depositAmount);
    }

    function test_DepositMultipleAssets() public {
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));
        account.deposit(1000e6, address(usdc));
        vm.stopPrank();

        assertEq(account.deposits(address(weth)), 1 ether);
        assertEq(account.deposits(address(usdc)), 1000e6);
    }

    function test_RevertDepositZeroAmount() public {
        vm.expectRevert(OrbitErrors.ZeroAmount.selector);

        vm.prank(user);
        account.deposit(0, address(weth));
    }

    function test_RevertDepositUnregisteredAsset() public {
        MockERC20 unregistered = new MockERC20("Unregistered", "UNREG", 18);

        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );

        vm.prank(user);
        account.deposit(1 ether, address(unregistered));
    }

    function test_RevertDepositUnauthorized() public {
        address attacker = makeAddr("attacker");

        vm.expectRevert(
            abi.encodeWithSelector(OrbitErrors.Unauthorized.selector, attacker)
        );

        vm.prank(attacker);
        account.deposit(1 ether, address(weth));
    }

    /*//////////////////////////////////////////////////////////////
                        BORROW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Borrow() public {
        // Deposit 1 WETH ($3000)
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));

        // Max borrow at 50% LTV = $1500
        uint256 borrowAmount = 1500e18;
        account.borrow(borrowAmount, address(debtToken));
        vm.stopPrank();

        assertEq(account.totalDebt(), borrowAmount);
        assertEq(account.debtToken(), address(debtToken));
        assertEq(account.totalBorrowsAllTime(), borrowAmount);
        assertEq(
            uint8(account.currentState()),
            uint8(OrbitAccount.State.BORROWED)
        );
        assertEq(debtToken.balanceOf(user), 10000e18 + borrowAmount);
    }

    function test_BorrowMaxAmount() public {
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));

        // Max borrow = $3000 * 50% = $1500
        // Need to check with debt token address since debtToken is not set yet
        uint256 maxBorrow = account.maxBorrowableAmount();
        // When debtToken is not set, maxBorrowableAmount returns 0
        // So we need to borrow first to set it, or calculate manually
        assertEq(maxBorrow, 0); // debtToken not set yet

        // After setting debt token via borrow
        account.borrow(100e18, address(debtToken));
        maxBorrow = account.maxBorrowableAmount();
        assertEq(maxBorrow, 1500e18 - 100e18); // Max minus already borrowed

        account.borrow(maxBorrow, address(debtToken));
        vm.stopPrank();

        assertEq(account.totalDebt(), maxBorrow + 100e18); // Total borrowed
    }

    function test_RevertBorrowExceedsMax() public {
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));

        // Try to borrow more than max
        uint256 tooMuch = 1501e18;

        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.ExceedsMaxBorrow.selector,
                tooMuch,
                1500e18
            )
        );

        account.borrow(tooMuch, address(debtToken));
        vm.stopPrank();
    }

    function test_RevertBorrowZeroAmount() public {
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));

        vm.expectRevert(OrbitErrors.ZeroAmount.selector);
        account.borrow(0, address(debtToken));
        vm.stopPrank();
    }

    function test_RevertBorrowDifferentDebtToken() public {
        // Deploy second debt token
        address predictedDebtManager2 = vm.computeCreateAddress(
            address(this),
            vm.getNonce(address(this))
        );
        orUSD debtToken2 = new orUSD(predictedDebtManager2);

        vm.startPrank(user);
        account.deposit(1 ether, address(weth));
        account.borrow(100e18, address(debtToken));

        // Try to borrow different debt token
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidState.selector,
                uint8(1),
                uint8(0)
            )
        );
        account.borrow(100e18, address(debtToken2));
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        REPAY TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Repay() public {
        // Setup: deposit and borrow
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));
        account.borrow(1000e18, address(debtToken));

        // Repay half
        uint256 repayAmount = 500e18;
        account.repay(repayAmount);
        vm.stopPrank();

        assertEq(account.totalDebt(), 500e18);
        assertEq(account.totalRepaymentsAllTime(), repayAmount);
    }

    function test_RepayFull() public {
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));
        account.borrow(1000e18, address(debtToken));

        // Repay full amount
        account.repay(1000e18);
        vm.stopPrank();

        assertEq(account.totalDebt(), 0);
        assertEq(
            uint8(account.currentState()),
            uint8(OrbitAccount.State.DEBT_CLEARED)
        );
    }

    function test_RevertRepayZeroAmount() public {
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));
        account.borrow(1000e18, address(debtToken));

        vm.expectRevert(OrbitErrors.ZeroAmount.selector);
        account.repay(0);
        vm.stopPrank();
    }

    function test_RevertRepayExceedsDebt() public {
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));
        account.borrow(1000e18, address(debtToken));

        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InsufficientCollateral.selector,
                1001e18,
                1000e18
            )
        );
        account.repay(1001e18);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        WITHDRAW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_WithdrawNoDebt() public {
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));

        // Can withdraw all when no debt
        account.withdraw(1 ether, address(weth));
        vm.stopPrank();

        assertEq(account.deposits(address(weth)), 0);
        assertEq(weth.balanceOf(user), 100 ether);
    }

    function test_WithdrawWithDebt() public {
        vm.startPrank(user);
        account.deposit(2 ether, address(weth));
        account.borrow(1500e18, address(debtToken));

        // Can withdraw excess collateral
        uint256 withdrawable = account.withdrawableCollateral(address(weth));
        assertTrue(withdrawable > 0);

        account.withdraw(withdrawable, address(weth));
        vm.stopPrank();
    }

    function test_RevertWithdrawExceedsMax() public {
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));
        account.borrow(1500e18, address(debtToken));

        // Try to withdraw too much
        vm.expectRevert();
        account.withdraw(0.1 ether, address(weth));
        vm.stopPrank();
    }

    function test_RevertWithdrawZeroAmount() public {
        vm.startPrank(user);
        account.deposit(1 ether, address(weth));

        vm.expectRevert(OrbitErrors.ZeroAmount.selector);
        account.withdraw(0, address(weth));
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        STATE TRANSITION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_StateTransitions() public {
        // CREATED
        assertEq(
            uint8(account.currentState()),
            uint8(OrbitAccount.State.CREATED)
        );

        vm.startPrank(user);

        // CREATED -> DEPOSITED
        account.deposit(1 ether, address(weth));
        assertEq(
            uint8(account.currentState()),
            uint8(OrbitAccount.State.DEPOSITED)
        );

        // DEPOSITED -> BORROWED
        account.borrow(1000e18, address(debtToken));
        assertEq(
            uint8(account.currentState()),
            uint8(OrbitAccount.State.BORROWED)
        );

        // BORROWED -> DEBT_CLEARED
        account.repay(1000e18);
        assertEq(
            uint8(account.currentState()),
            uint8(OrbitAccount.State.DEBT_CLEARED)
        );

        // DEBT_CLEARED -> EXITED
        account.withdraw(1 ether, address(weth));
        assertEq(
            uint8(account.currentState()),
            uint8(OrbitAccount.State.EXITED)
        );

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_FullLifecycle() public {
        vm.startPrank(user);

        // 1. Deposit collateral
        account.deposit(2 ether, address(weth));
        assertEq(account.totalDepositsAllTime(), 2 ether);

        // 2. Borrow against collateral
        uint256 borrowAmount = 2000e18;
        account.borrow(borrowAmount, address(debtToken));
        assertEq(account.totalBorrowsAllTime(), borrowAmount);

        // 3. Partial repayment
        account.repay(1000e18);
        assertEq(account.totalRepaymentsAllTime(), 1000e18);
        assertEq(account.totalDebt(), 1000e18);

        // 4. Full repayment
        account.repay(1000e18);
        assertEq(account.totalDebt(), 0);

        // 5. Withdraw all collateral
        account.withdraw(2 ether, address(weth));
        assertEq(account.deposits(address(weth)), 0);

        vm.stopPrank();
    }

    function test_MultipleAssetsBorrowing() public {
        vm.startPrank(user);

        // Deposit both assets
        account.deposit(1 ether, address(weth)); // $3000 * 50% = $1500
        account.deposit(1000e6, address(usdc)); // $1000 * 75% = $750

        // Total borrow capacity = $2250
        // maxBorrowableAmount returns 0 when debtToken not set
        // Borrow first to set debt token
        account.borrow(100e18, address(debtToken));
        uint256 maxBorrow = account.maxBorrowableAmount();
        assertEq(maxBorrow, 2250e18 - 100e18); // Max minus already borrowed

        // Borrow up to max (2250 - 100 already borrowed)
        account.borrow(maxBorrow, address(debtToken));
        assertEq(account.totalDebt(), 2250e18); // Total borrowed

        vm.stopPrank();
    }

    function test_MaxBorrowableCalculation() public {
        vm.prank(user);
        account.deposit(1 ether, address(weth));

        // WETH: $3000 * 50% LTV = $1500 borrowable
        // maxBorrowableAmount returns 0 when debtToken not set
        uint256 maxBorrow = account.maxBorrowableAmount();
        assertEq(maxBorrow, 0); // debtToken not set yet
    }

    function test_WithdrawableCalculation() public {
        vm.startPrank(user);
        account.deposit(2 ether, address(weth));
        account.borrow(1500e18, address(debtToken));

        // Required collateral for $1500 debt at 50% LTV = $3000 = 1 WETH
        // Deposited 2 WETH, so 1 WETH is withdrawable
        uint256 withdrawable = account.withdrawableCollateral(address(weth));
        assertEq(withdrawable, 1 ether);

        vm.stopPrank();
    }
}
