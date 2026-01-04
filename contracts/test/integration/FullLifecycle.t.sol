// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {AccountFactory} from "../../core/AccountFactory.sol";
import {OrbitAccount} from "../../core/OrbitAccount.sol";
import {DebtManager} from "../../core/DebtManager.sol";
import {VaultRegistry} from "../../vaults/VaultRegistry.sol";
import {ERC4626Vault} from "../../vaults/ERC4626Vault.sol";
import {MockStrategy} from "../../strategies/MockStrategy.sol";
import {MockPriceOracle} from "../../mocks/MockPriceOracle.sol";
import {orUSD} from "../../tokens/orUSD.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OrbitErrors} from "../../errors/OrbitErrors.sol";

// Mock ERC20 for testing
contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function mint(address to, uint256 amount) external {
        _balances[to] += amount;
        _totalSupply += amount;
    }

    function burn(address from, uint256 amount) external {
        _balances[from] -= amount;
        _totalSupply -= amount;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        return true;
    }

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        return true;
    }
}

/**
 * @title FullLifecycleTest
 * @notice Comprehensive integration tests for Orbit Finance
 */
contract FullLifecycleTest is Test {
    // Core contracts
    AccountFactory public factory;
    OrbitAccount public implementation;
    DebtManager public debtManager;
    VaultRegistry public registry;
    MockPriceOracle public oracle;

    // Tokens
    orUSD public debtToken;
    MockERC20 public weth;
    MockERC20 public usdc;

    // Vaults and strategies
    ERC4626Vault public wethVault;
    ERC4626Vault public usdcVault;
    ERC4626Vault public orUSDVault;
    MockStrategy public wethStrategy;
    MockStrategy public usdcStrategy;
    MockStrategy public orUSDStrategy;

    // Test users
    address public user1;
    address public user2;
    address public user3;

    // Constants
    uint256 constant WETH_PRICE = 3000e18; // $3000
    uint256 constant USDC_PRICE = 1e18; // $1
    uint256 constant ORUSD_PRICE = 1e18; // $1
    uint256 constant LTV_RATIO = 5000; // 50%

    function setUp() public {
        // Create test users
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        // Deploy oracle
        oracle = new MockPriceOracle();

        // Deploy registry
        registry = new VaultRegistry(address(oracle));

        // Deploy tokens
        weth = new MockERC20("Wrapped Ether", "WETH", 18);
        usdc = new MockERC20("USD Coin", "USDC", 6);

        // Deploy debt token and manager
        address predictedDebtManager = vm.computeCreateAddress(
            address(this),
            vm.getNonce(address(this)) + 1
        );
        debtToken = new orUSD(predictedDebtManager);

        // Predict factory address
        address predictedFactory = vm.computeCreateAddress(
            address(this),
            vm.getNonce(address(this)) + 2
        );
        debtManager = new DebtManager(address(debtToken), predictedFactory);

        // Deploy implementation
        implementation = new OrbitAccount(
            address(registry),
            address(debtManager)
        );

        // Deploy factory
        factory = new AccountFactory(
            address(implementation),
            address(registry),
            address(debtManager)
        );

        require(
            address(factory) == predictedFactory,
            "Factory prediction failed"
        );

        // Deploy strategies
        wethStrategy = new MockStrategy(address(weth));
        usdcStrategy = new MockStrategy(address(usdc));
        orUSDStrategy = new MockStrategy(address(debtToken));

        // Deploy vaults
        wethVault = new ERC4626Vault(
            address(weth),
            address(wethStrategy),
            LTV_RATIO,
            1000000 ether,
            "WETH Vault",
            "vWETH"
        );

        usdcVault = new ERC4626Vault(
            address(usdc),
            address(usdcStrategy),
            LTV_RATIO,
            1000000e6,
            "USDC Vault",
            "vUSDC"
        );

        orUSDVault = new ERC4626Vault(
            address(debtToken),
            address(orUSDStrategy),
            LTV_RATIO,
            1000000e18,
            "orUSD Vault",
            "vORUSD"
        );

        // Set prices
        oracle.setPrice(address(weth), WETH_PRICE);
        oracle.setPrice(address(usdc), USDC_PRICE);
        oracle.setPrice(address(debtToken), ORUSD_PRICE);

        // Register vaults
        registry.registerVault(address(weth), address(wethVault), LTV_RATIO);
        registry.registerVault(address(usdc), address(usdcVault), LTV_RATIO);
        registry.registerVault(
            address(debtToken),
            address(orUSDVault),
            LTV_RATIO
        );
    }

    /*//////////////////////////////////////////////////////////////
                            HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _createAndFundUser(
        address user,
        uint256 wethAmount,
        uint256 usdcAmount
    ) internal returns (address account) {
        // Mint tokens to user
        if (wethAmount > 0) {
            weth.mint(user, wethAmount);
        }
        if (usdcAmount > 0) {
            usdc.mint(user, usdcAmount);
        }

        // Create account
        vm.prank(user);
        account = factory.createAccount();

        // Authorize account
        debtManager.authorizeAccount(account);

        return account;
    }

    function _advanceBlocks(uint256 blocks) internal {
        vm.roll(block.number + blocks);
    }

    /*//////////////////////////////////////////////////////////////
                        INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_FullLifecycleHappyPath() public {
        console.log("=== Test: Full Lifecycle Happy Path ===");

        // 1. Create account and fund user
        address account = _createAndFundUser(user1, 2 ether, 0);

        // 2. Deposit 2 WETH
        vm.startPrank(user1);
        weth.approve(account, 2 ether);
        OrbitAccount(account).deposit(2 ether, address(weth));
        vm.stopPrank();

        console.log("Deposited 2 WETH");

        // 3. Borrow 1000 orUSD (below 50% LTV)
        vm.prank(user1);
        OrbitAccount(account).borrow(1000e18, address(debtToken));

        console.log("Borrowed 1000 orUSD");
        assertEq(OrbitAccount(account).totalDebt(), 1000e18);

        // 4. Simulate 1000 blocks passing
        _advanceBlocks(1000);

        // 5. Harvest vault yield
        wethVault.harvest();

        // 6. Sync account (debt should reduce)
        OrbitAccount(account).sync();

        uint256 debtAfterSync = OrbitAccount(account).totalDebt();
        console.log("Debt after sync:", debtAfterSync);
        assertLt(debtAfterSync, 1000e18, "Debt should reduce");

        // 7. Repay remaining debt
        vm.startPrank(user1);
        debtToken.approve(account, debtAfterSync);
        OrbitAccount(account).repay(debtAfterSync);
        vm.stopPrank();

        assertEq(OrbitAccount(account).totalDebt(), 0);
        console.log("Debt fully repaid");

        // 8. Withdraw all collateral
        uint256 depositAmount = OrbitAccount(account).deposits(address(weth));
        vm.prank(user1);
        OrbitAccount(account).withdraw(depositAmount, address(weth));

        console.log("Withdrew all collateral");

        // 9. Verify final state
        assertEq(OrbitAccount(account).totalDebt(), 0);
        assertEq(uint8(OrbitAccount(account).currentState()), uint8(4)); // EXITED

        console.log("=== Test Passed ===\n");
    }

    function test_MultiAssetCollateral() public {
        console.log("=== Test: Multi-Asset Collateral ===");

        // Create account and fund
        address account = _createAndFundUser(user1, 1 ether, 3000e6);

        // Deposit 1 WETH and 3000 USDC
        vm.startPrank(user1);
        weth.approve(account, 1 ether);
        OrbitAccount(account).deposit(1 ether, address(weth));

        usdc.approve(account, 3000e6);
        OrbitAccount(account).deposit(3000e6, address(usdc));
        vm.stopPrank();

        console.log("Deposited 1 WETH + 3000 USDC");

        // Borrow 2000 orUSD
        vm.prank(user1);
        OrbitAccount(account).borrow(2000e18, address(debtToken));

        console.log("Borrowed 2000 orUSD");

        // Try to withdraw partial WETH (should succeed)
        vm.prank(user1);
        OrbitAccount(account).withdraw(0.2 ether, address(weth));

        console.log("Withdrew 0.2 WETH successfully");

        // Try to withdraw all remaining WETH (should fail)
        vm.prank(user1);
        vm.expectRevert();
        OrbitAccount(account).withdraw(0.8 ether, address(weth));

        console.log("Cannot withdraw all WETH (would break collateralization)");
        console.log("=== Test Passed ===\n");
    }

    function test_AutoRepayReducesDebt() public {
        console.log("=== Test: Auto-Repay Reduces Debt ===");

        // Create account and fund
        address account = _createAndFundUser(user1, 2 ether, 0);

        // Deposit and borrow
        vm.startPrank(user1);
        weth.approve(account, 2 ether);
        OrbitAccount(account).deposit(2 ether, address(weth));
        OrbitAccount(account).borrow(1000e18, address(debtToken));
        vm.stopPrank();

        // Initial debt: 1000e18

        // Set yield rate to 500 bps (5% APY)
        wethStrategy.setYieldRate(500);

        // Simulate 100,000 blocks
        _advanceBlocks(100000);

        // Harvest and sync
        wethVault.harvest();
        OrbitAccount(account).sync();

        uint256 finalDebt = OrbitAccount(account).totalDebt();
        uint256 credit = OrbitAccount(account).accumulatedCredit();

        console.log("Final debt:", finalDebt);
        console.log("Accumulated credit:", credit);

        assertLt(finalDebt, 1000e18, "Debt should be reduced");
        assertEq(credit, 0, "Credit should be 0 (yield went to debt)");

        console.log("=== Test Passed ===\n");
    }

    function test_CreditAccumulationWhenNoDebt() public {
        console.log("=== Test: Credit Accumulation When No Debt ===");

        // Create account and fund
        address account = _createAndFundUser(user1, 2 ether, 0);

        // Deposit only (no borrowing)
        vm.startPrank(user1);
        weth.approve(account, 2 ether);
        OrbitAccount(account).deposit(2 ether, address(weth));
        vm.stopPrank();

        // Set yield rate
        wethStrategy.setYieldRate(500);

        // Simulate blocks and harvest
        _advanceBlocks(100000);
        wethVault.harvest();

        // Sync
        OrbitAccount(account).sync();

        uint256 credit = OrbitAccount(account).accumulatedCredit();
        console.log("Accumulated credit:", credit);

        assertGt(credit, 0, "Credit should accumulate");

        // Claim credit
        uint256 userBalanceBefore = debtToken.balanceOf(user1);
        vm.prank(user1);
        OrbitAccount(account).claimCredit(credit);

        uint256 userBalanceAfter = debtToken.balanceOf(user1);
        assertEq(userBalanceAfter - userBalanceBefore, credit);

        console.log("User claimed credit successfully");
        console.log("=== Test Passed ===\n");
    }

    function test_BorrowLimitEnforcement() public {
        console.log("=== Test: Borrow Limit Enforcement ===");

        // Create account and fund
        address account = _createAndFundUser(user1, 2 ether, 0);

        // Deposit 2 WETH ($6000 value)
        vm.startPrank(user1);
        weth.approve(account, 2 ether);
        OrbitAccount(account).deposit(2 ether, address(weth));
        vm.stopPrank();

        // Calculate max borrowable (should be $3000 at 50% LTV)
        uint256 maxBorrow = OrbitAccount(account).maxBorrowableAmount(address(debtToken));
        console.log("Max borrowable:", maxBorrow);
        assertEq(maxBorrow, 3000e18);

        // Attempt to borrow $3001 → should REVERT
        vm.prank(user1);
        vm.expectRevert();
        OrbitAccount(account).borrow(3001e18, address(debtToken));

        console.log("Cannot borrow above limit");

        // Borrow $3000 → should SUCCEED
        vm.prank(user1);
        OrbitAccount(account).borrow(3000e18, address(debtToken));

        console.log("Borrowed max amount successfully");

        // Attempt to borrow $1 more → should REVERT
        vm.prank(user1);
        vm.expectRevert();
        OrbitAccount(account).borrow(1e18, address(debtToken));

        console.log("Cannot borrow more after reaching limit");
        console.log("=== Test Passed ===\n");
    }

    function test_WithdrawalConstraint() public {
        console.log("=== Test: Withdrawal Constraint ===");

        // Create account and fund
        address account = _createAndFundUser(user1, 2 ether, 0);

        // Deposit 2 WETH, borrow 3000 orUSD (max)
        vm.startPrank(user1);
        weth.approve(account, 2 ether);
        OrbitAccount(account).deposit(2 ether, address(weth));
        OrbitAccount(account).borrow(3000e18, address(debtToken));
        vm.stopPrank();

        console.log("Borrowed at max LTV");

        // Attempt to withdraw any WETH → should REVERT
        vm.prank(user1);
        vm.expectRevert();
        OrbitAccount(account).withdraw(0.1 ether, address(weth));

        console.log("Cannot withdraw when at max LTV");

        // Repay 1500 orUSD (50%)
        vm.startPrank(user1);
        debtToken.approve(account, 1500e18);
        OrbitAccount(account).repay(1500e18);
        vm.stopPrank();

        console.log("Repaid 50% of debt");

        // Should be able to withdraw ~1 WETH now
        vm.prank(user1);
        OrbitAccount(account).withdraw(1 ether, address(weth));

        console.log("Withdrew 1 WETH successfully");

        // Attempt to withdraw 0.5 more WETH → should REVERT
        vm.prank(user1);
        vm.expectRevert();
        OrbitAccount(account).withdraw(0.5 ether, address(weth));

        console.log("Cannot over-withdraw");
        console.log("=== Test Passed ===\n");
    }

    function test_SelfLiquidation() public {
        console.log("=== Test: Self-Liquidation ===");

        // Create account and fund
        address account = _createAndFundUser(user1, 0, 0);

        // Give user1 some orUSD to deposit as collateral
        deal(address(debtToken), user1, 3000e18);

        // FIXED: Deposit 3000 orUSD, borrow 1500 orUSD (50% LTV, not 2000!)
        // Math: 3000 orUSD collateral × 50% LTV = 1500 max borrow
        vm.startPrank(user1);
        debtToken.approve(account, 3000e18);
        OrbitAccount(account).deposit(3000e18, address(debtToken));
        OrbitAccount(account).borrow(1500e18, address(debtToken));
        vm.stopPrank();

        console.log("Deposited 3000 orUSD, borrowed 1500 orUSD");

        // FIXED: Self-liquidate 1500 orUSD (not 2000)
        vm.prank(user1);
        OrbitAccount(account).liquidate(1500e18, address(debtToken), 1600e18);

        uint256 finalDebt = OrbitAccount(account).totalDebt();
        uint256 remainingDeposit = OrbitAccount(account).deposits(
            address(debtToken)
        );

        console.log("Final debt:", finalDebt);
        console.log("Remaining deposit:", remainingDeposit);

        assertEq(finalDebt, 0, "Debt should be 0");
        // Remaining should be ~1500 orUSD (3000 - 1515 with 1% buffer)
        assertGt(remainingDeposit, 1400e18, "Should have ~1500 orUSD remaining");
        assertEq(uint8(OrbitAccount(account).currentState()), uint8(3)); // DEBT_CLEARED

        console.log("=== Test Passed ===\n");
    }

    function test_MultiUserScenario() public {
        console.log("=== Test: Multi-User Scenario ===");

        // Create 3 accounts
        address account1 = _createAndFundUser(user1, 1 ether, 0);
        address account2 = _createAndFundUser(user2, 2 ether, 0);
        address account3 = _createAndFundUser(user3, 3 ether, 0);

        // User 1: Deposit 1 WETH, borrow 500 orUSD
        vm.startPrank(user1);
        weth.approve(account1, 1 ether);
        OrbitAccount(account1).deposit(1 ether, address(weth));
        OrbitAccount(account1).borrow(500e18, address(debtToken));
        vm.stopPrank();

        // User 2: Deposit 2 WETH, borrow 1500 orUSD
        vm.startPrank(user2);
        weth.approve(account2, 2 ether);
        OrbitAccount(account2).deposit(2 ether, address(weth));
        OrbitAccount(account2).borrow(1500e18, address(debtToken));
        vm.stopPrank();

        // User 3: Deposit 3 WETH, borrow 3000 orUSD
        vm.startPrank(user3);
        weth.approve(account3, 3 ether);
        OrbitAccount(account3).deposit(3 ether, address(weth));
        OrbitAccount(account3).borrow(3000e18, address(debtToken));
        vm.stopPrank();

        // Verify isolation
        assertEq(OrbitAccount(account1).totalDebt(), 500e18);
        assertEq(OrbitAccount(account2).totalDebt(), 1500e18);
        assertEq(OrbitAccount(account3).totalDebt(), 3000e18);

        assertEq(OrbitAccount(account1).deposits(address(weth)), 1 ether);
        assertEq(OrbitAccount(account2).deposits(address(weth)), 2 ether);
        assertEq(OrbitAccount(account3).deposits(address(weth)), 3 ether);

        console.log("All accounts isolated correctly");
        console.log("=== Test Passed ===\n");
    }
}