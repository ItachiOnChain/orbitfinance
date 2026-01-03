// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AccountFactory} from "../core/AccountFactory.sol";
import {OrbitAccount} from "../core/OrbitAccount.sol";
import {DebtManager} from "../core/DebtManager.sol";
import {VaultRegistry} from "../vaults/VaultRegistry.sol";
import {MockPriceOracle} from "../mocks/MockPriceOracle.sol";
import {orUSD} from "../tokens/orUSD.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title AccountFactoryTest
 * @notice Comprehensive tests for AccountFactory contract
 */
contract AccountFactoryTest is Test {
    AccountFactory public factory;
    OrbitAccount public implementation;
    DebtManager public debtManager;
    VaultRegistry public registry;
    MockPriceOracle public oracle;
    orUSD public debtToken;

    address public user1;
    address public user2;
    address public mockVault;

    event AccountCreated(
        address indexed user,
        address indexed account,
        uint256 totalAccounts
    );

    function setUp() public {
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        mockVault = makeAddr("mockVault");

        // Deploy oracle
        oracle = new MockPriceOracle();

        // Deploy registry
        registry = new VaultRegistry(address(oracle));

        // Deploy debt token and manager
        address predictedDebtManager = vm.computeCreateAddress(
            address(this),
            vm.getNonce(address(this)) + 1
        );
        debtToken = new orUSD(predictedDebtManager);
        address predictedFactory = vm.computeCreateAddress(address(this), vm.getNonce(address(this)) + 2);
        debtManager = new DebtManager(address(debtToken), predictedFactory); // Will set factory later

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
        
        require(address(factory) == predictedFactory, "Factory prediction failed");
    }

    /*//////////////////////////////////////////////////////////////
                        DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Deployment() public {
        assertEq(factory.accountImplementation(), address(implementation));
        assertEq(factory.vaultRegistry(), address(registry));
        assertEq(factory.debtManager(), address(debtManager));
        assertEq(factory.owner(), address(this));
        assertEq(factory.totalAccounts(), 0);
    }

    function test_RevertDeploymentZeroImplementation() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );
        new AccountFactory(address(0), address(registry), address(debtManager));
    }

    function test_RevertDeploymentZeroRegistry() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );
        new AccountFactory(
            address(implementation),
            address(0),
            address(debtManager)
        );
    }

    function test_RevertDeploymentZeroDebtManager() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );
        new AccountFactory(
            address(implementation),
            address(registry),
            address(0)
        );
    }

    /*//////////////////////////////////////////////////////////////
                    ACCOUNT CREATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreateAccount() public {
        vm.expectEmit(true, false, false, true);
        emit AccountCreated(user1, address(0), 1); // address(0) because we don't know the clone address yet

        vm.prank(user1);
        address account = factory.createAccount();

        assertTrue(account != address(0));
        assertEq(factory.accounts(user1), account);
        assertTrue(factory.isOrbitAccount(account));
        assertEq(factory.totalAccounts(), 1);

        // Verify account is initialized correctly
        OrbitAccount orbitAccount = OrbitAccount(account);
        assertEq(orbitAccount.owner(), user1);
        assertEq(orbitAccount.vaultRegistry(), address(registry));
        assertEq(orbitAccount.debtManager(), address(debtManager));
    }

    function test_CreateMultipleAccounts() public {
        vm.prank(user1);
        address account1 = factory.createAccount();

        vm.prank(user2);
        address account2 = factory.createAccount();

        assertTrue(account1 != account2);
        assertEq(factory.accounts(user1), account1);
        assertEq(factory.accounts(user2), account2);
        assertEq(factory.totalAccounts(), 2);
    }

    function test_RevertCreateAccountDuplicate() public {
        vm.startPrank(user1);
        factory.createAccount();

        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.AccountAlreadyExists.selector,
                user1,
                factory.accounts(user1)
            )
        );
        factory.createAccount();
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                    GET OR CREATE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetOrCreateAccountNew() public {
        address account = factory.getOrCreateAccount(user1);

        assertTrue(account != address(0));
        assertEq(factory.accounts(user1), account);
        assertTrue(factory.isOrbitAccount(account));
        assertEq(factory.totalAccounts(), 1);
    }

    function test_GetOrCreateAccountExisting() public {
        vm.prank(user1);
        address account1 = factory.createAccount();

        address account2 = factory.getOrCreateAccount(user1);

        assertEq(account1, account2);
        assertEq(factory.totalAccounts(), 1); // Should not increment
    }

    /*//////////////////////////////////////////////////////////////
                        GETTER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetAccount() public {
        vm.prank(user1);
        address account = factory.createAccount();

        assertEq(factory.getAccount(user1), account);
    }

    function test_GetAccountNonExistent() public {
        assertEq(factory.getAccount(user1), address(0));
    }

    function test_IsValidAccount() public {
        vm.prank(user1);
        address account = factory.createAccount();

        assertTrue(factory.isValidAccount(account));
        assertFalse(factory.isValidAccount(user1));
        assertFalse(factory.isValidAccount(address(0)));
    }

    /*//////////////////////////////////////////////////////////////
                        OWNERSHIP TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetOwner() public {
        address newOwner = makeAddr("newOwner");

        factory.setOwner(newOwner);

        assertEq(factory.owner(), newOwner);
    }

    function test_RevertSetOwnerUnauthorized() public {
        address newOwner = makeAddr("newOwner");

        vm.expectRevert(
            abi.encodeWithSelector(OrbitErrors.Unauthorized.selector, user1)
        );

        vm.prank(user1);
        factory.setOwner(newOwner);
    }

    function test_RevertSetOwnerZeroAddress() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );

        factory.setOwner(address(0));
    }

    /*//////////////////////////////////////////////////////////////
                    CLONE VERIFICATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ClonedAccountsAreIndependent() public {
        vm.prank(user1);
        address account1 = factory.createAccount();

        vm.prank(user2);
        address account2 = factory.createAccount();

        // Verify they have different owners
        assertEq(OrbitAccount(account1).owner(), user1);
        assertEq(OrbitAccount(account2).owner(), user2);

        // Verify they have the same implementation
        assertEq(
            OrbitAccount(account1).vaultRegistry(),
            OrbitAccount(account2).vaultRegistry()
        );
    }

    function test_ClonedAccountsShareImplementation() public {
        vm.prank(user1);
        address account1 = factory.createAccount();

        vm.prank(user2);
        address account2 = factory.createAccount();

        // Both should reference the same registry and debtManager
        assertEq(
            OrbitAccount(account1).vaultRegistry(),
            OrbitAccount(account2).vaultRegistry()
        );
        assertEq(
            OrbitAccount(account1).debtManager(),
            OrbitAccount(account2).debtManager()
        );
    }

    /*//////////////////////////////////////////////////////////////
                    INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_FactoryIntegrationWithDebtManager() public {
        // Create account via factory
        vm.prank(user1);
        address account = factory.createAccount();

        // Verify DebtManager can validate the account
        assertTrue(factory.isValidAccount(account));

        // This would be used by DebtManager.authorizeAccount()
        assertEq(factory.getAccount(user1), account);
    }

    function test_MultipleAccountCreationFlow() public {
        // Create 5 accounts
        address[] memory users = new address[](5);
        address[] memory accounts = new address[](5);

        for (uint256 i = 0; i < 5; i++) {
            users[i] = makeAddr(string(abi.encodePacked("user", i)));
            vm.prank(users[i]);
            accounts[i] = factory.createAccount();
        }

        // Verify all accounts
        assertEq(factory.totalAccounts(), 5);

        for (uint256 i = 0; i < 5; i++) {
            assertEq(factory.accounts(users[i]), accounts[i]);
            assertTrue(factory.isOrbitAccount(accounts[i]));
            assertEq(OrbitAccount(accounts[i]).owner(), users[i]);
        }
    }
}
