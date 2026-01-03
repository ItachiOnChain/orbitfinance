// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {DebtManager} from "../core/DebtManager.sol";
import {orUSD} from "../tokens/orUSD.sol";
import {orETH} from "../tokens/orETH.sol";
import {ISyntheticToken} from "../interfaces/ISyntheticToken.sol";
import {IAccountFactory} from "../interfaces/IAccountFactory.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title DebtManagerTest
 * @notice Comprehensive tests for the DebtManager contract
 */
contract DebtManagerTest is Test {
    DebtManager public debtManager;
    orUSD public debtToken;
    MockAccountFactory public accountFactory;

    address public owner;
    address public user1;
    address public user2;
    address public mockAccount1;
    address public mockAccount2;
    address public unauthorizedAccount;

    event DebtMinted(
        address indexed account,
        address indexed to,
        uint256 amount
    );
    event DebtBurned(
        address indexed account,
        address indexed from,
        uint256 amount
    );
    event AccountAuthorized(address indexed account);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        mockAccount1 = makeAddr("mockAccount1");
        mockAccount2 = makeAddr("mockAccount2");
        unauthorizedAccount = makeAddr("unauthorized");

        // Deploy mock account factory
        accountFactory = new MockAccountFactory();

        // First deploy DebtManager with a temporary token address
        // We'll use a predictable address calculation
        address predictedDebtManager = vm.computeCreateAddress(
            address(this),
            vm.getNonce(address(this)) + 1
        );

        // Deploy debt token with the predicted DebtManager address
        debtToken = new orUSD(predictedDebtManager);

        // Now deploy the actual DebtManager
        debtManager = new DebtManager(
            address(debtToken),
            address(accountFactory)
        );

        // Verify the prediction was correct
        require(
            address(debtManager) == predictedDebtManager,
            "Address prediction failed"
        );

        // Register mock accounts in factory
        accountFactory.registerAccount(mockAccount1);
        accountFactory.registerAccount(mockAccount2);
    }

    /*//////////////////////////////////////////////////////////////
                        DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Deployment() public {
        assertEq(address(debtManager.debtToken()), address(debtToken));
        assertEq(debtManager.accountFactory(), address(accountFactory));
        assertEq(debtManager.owner(), owner);
        assertEq(debtManager.totalDebtSupply(), 0);
    }

    function test_RevertDeploymentWithZeroAddresses() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );
        new DebtManager(address(0), address(accountFactory));

        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );
        new DebtManager(address(debtToken), address(0));
    }

    /*//////////////////////////////////////////////////////////////
                        AUTHORIZATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_AuthorizeAccount() public {
        vm.expectEmit(true, false, false, false);
        emit AccountAuthorized(mockAccount1);

        debtManager.authorizeAccount(mockAccount1);

        assertTrue(debtManager.authorizedAccounts(mockAccount1));
    }

    function test_RevertAuthorizeInvalidAccount() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.Unauthorized.selector,
                unauthorizedAccount
            )
        );
        debtManager.authorizeAccount(unauthorizedAccount);
    }

    function test_AuthorizeMultipleAccounts() public {
        debtManager.authorizeAccount(mockAccount1);
        debtManager.authorizeAccount(mockAccount2);

        assertTrue(debtManager.authorizedAccounts(mockAccount1));
        assertTrue(debtManager.authorizedAccounts(mockAccount2));
    }

    /*//////////////////////////////////////////////////////////////
                        MINTING TESTS
    //////////////////////////////////////////////////////////////*/

    function test_MintDebt() public {
        // Authorize account
        debtManager.authorizeAccount(mockAccount1);

        uint256 mintAmount = 1000e18;

        vm.expectEmit(true, true, false, true);
        emit DebtMinted(mockAccount1, user1, mintAmount);

        vm.prank(mockAccount1);
        debtManager.mint(user1, mintAmount);

        assertEq(debtToken.balanceOf(user1), mintAmount);
        assertEq(debtManager.totalDebtSupply(), mintAmount);
    }

    function test_RevertMintUnauthorized() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.Unauthorized.selector,
                unauthorizedAccount
            )
        );

        vm.prank(unauthorizedAccount);
        debtManager.mint(user1, 1000e18);
    }

    function test_RevertMintZeroAmount() public {
        debtManager.authorizeAccount(mockAccount1);

        vm.expectRevert(OrbitErrors.ZeroAmount.selector);

        vm.prank(mockAccount1);
        debtManager.mint(user1, 0);
    }

    function test_MintMultipleTimes() public {
        debtManager.authorizeAccount(mockAccount1);

        vm.startPrank(mockAccount1);
        debtManager.mint(user1, 500e18);
        debtManager.mint(user1, 300e18);
        debtManager.mint(user2, 200e18);
        vm.stopPrank();

        assertEq(debtToken.balanceOf(user1), 800e18);
        assertEq(debtToken.balanceOf(user2), 200e18);
        assertEq(debtManager.totalDebtSupply(), 1000e18);
    }

    function testFuzz_Mint(uint256 amount) public {
        vm.assume(amount > 0 && amount < type(uint128).max);

        debtManager.authorizeAccount(mockAccount1);

        vm.prank(mockAccount1);
        debtManager.mint(user1, amount);

        assertEq(debtToken.balanceOf(user1), amount);
        assertEq(debtManager.totalDebtSupply(), amount);
    }

    /*//////////////////////////////////////////////////////////////
                        BURNING TESTS
    //////////////////////////////////////////////////////////////*/

    function test_BurnDebt() public {
        // Setup: Mint some debt first
        debtManager.authorizeAccount(mockAccount1);
        vm.prank(mockAccount1);
        debtManager.mint(user1, 1000e18);

        uint256 burnAmount = 400e18;

        vm.expectEmit(true, true, false, true);
        emit DebtBurned(mockAccount1, user1, burnAmount);

        vm.prank(mockAccount1);
        debtManager.burn(user1, burnAmount);

        assertEq(debtToken.balanceOf(user1), 600e18);
        assertEq(debtManager.totalDebtSupply(), 600e18);
    }

    function test_RevertBurnUnauthorized() public {
        // Setup: Mint some debt first
        debtManager.authorizeAccount(mockAccount1);
        vm.prank(mockAccount1);
        debtManager.mint(user1, 1000e18);

        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.Unauthorized.selector,
                unauthorizedAccount
            )
        );

        vm.prank(unauthorizedAccount);
        debtManager.burn(user1, 100e18);
    }

    function test_RevertBurnZeroAmount() public {
        debtManager.authorizeAccount(mockAccount1);

        vm.expectRevert(OrbitErrors.ZeroAmount.selector);

        vm.prank(mockAccount1);
        debtManager.burn(user1, 0);
    }

    function test_RevertBurnExceedsTotalSupply() public {
        debtManager.authorizeAccount(mockAccount1);
        vm.prank(mockAccount1);
        debtManager.mint(user1, 1000e18);

        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InsufficientCollateral.selector,
                2000e18,
                1000e18
            )
        );

        vm.prank(mockAccount1);
        debtManager.burn(user1, 2000e18);
    }

    function test_BurnMultipleTimes() public {
        debtManager.authorizeAccount(mockAccount1);

        vm.prank(mockAccount1);
        debtManager.mint(user1, 1000e18);

        vm.startPrank(mockAccount1);
        debtManager.burn(user1, 300e18);
        debtManager.burn(user1, 200e18);
        vm.stopPrank();

        assertEq(debtToken.balanceOf(user1), 500e18);
        assertEq(debtManager.totalDebtSupply(), 500e18);
    }

    function testFuzz_Burn(uint256 mintAmount, uint256 burnAmount) public {
        vm.assume(mintAmount > 0 && mintAmount < type(uint128).max);
        vm.assume(burnAmount > 0 && burnAmount <= mintAmount);

        debtManager.authorizeAccount(mockAccount1);

        vm.startPrank(mockAccount1);
        debtManager.mint(user1, mintAmount);
        debtManager.burn(user1, burnAmount);
        vm.stopPrank();

        assertEq(debtToken.balanceOf(user1), mintAmount - burnAmount);
        assertEq(debtManager.totalDebtSupply(), mintAmount - burnAmount);
    }

    /*//////////////////////////////////////////////////////////////
                        OWNERSHIP TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetOwner() public {
        address newOwner = makeAddr("newOwner");

        vm.expectEmit(true, true, false, false);
        emit OwnershipTransferred(owner, newOwner);

        debtManager.setOwner(newOwner);

        assertEq(debtManager.owner(), newOwner);
    }

    function test_RevertSetOwnerUnauthorized() public {
        address newOwner = makeAddr("newOwner");

        vm.expectRevert(
            abi.encodeWithSelector(OrbitErrors.Unauthorized.selector, user1)
        );

        vm.prank(user1);
        debtManager.setOwner(newOwner);
    }

    function test_RevertSetOwnerZeroAddress() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );
        debtManager.setOwner(address(0));
    }

    /*//////////////////////////////////////////////////////////////
                    TOTAL DEBT SUPPLY TRACKING
    //////////////////////////////////////////////////////////////*/

    function test_TotalDebtSupplyTracking() public {
        debtManager.authorizeAccount(mockAccount1);
        debtManager.authorizeAccount(mockAccount2);

        // Mint from account1
        vm.prank(mockAccount1);
        debtManager.mint(user1, 1000e18);
        assertEq(debtManager.totalDebtSupply(), 1000e18);

        // Mint from account2
        vm.prank(mockAccount2);
        debtManager.mint(user2, 500e18);
        assertEq(debtManager.totalDebtSupply(), 1500e18);

        // Burn from account1
        vm.prank(mockAccount1);
        debtManager.burn(user1, 300e18);
        assertEq(debtManager.totalDebtSupply(), 1200e18);

        // Burn from account2
        vm.prank(mockAccount2);
        debtManager.burn(user2, 200e18);
        assertEq(debtManager.totalDebtSupply(), 1000e18);
    }
}

/**
 * @title MockAccountFactory
 * @notice Mock implementation of IAccountFactory for testing
 */
contract MockAccountFactory is IAccountFactory {
    mapping(address => bool) private validAccounts;
    mapping(address => address) private userAccounts;

    function registerAccount(address account) external {
        validAccounts[account] = true;
    }

    function isValidAccount(address account) external view returns (bool) {
        return validAccounts[account];
    }

    function createAccount(address user) external returns (address) {
        address account = address(
            uint160(uint256(keccak256(abi.encodePacked(user, block.timestamp))))
        );
        validAccounts[account] = true;
        userAccounts[user] = account;
        return account;
    }

    function getAccount(address user) external view returns (address) {
        return userAccounts[user];
    }
}
