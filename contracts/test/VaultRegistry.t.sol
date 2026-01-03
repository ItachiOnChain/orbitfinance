// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VaultRegistry} from "../vaults/VaultRegistry.sol";
import {MockPriceOracle} from "../mocks/MockPriceOracle.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title VaultRegistryTest
 * @notice Comprehensive tests for VaultRegistry and MockPriceOracle
 */
contract VaultRegistryTest is Test {
    VaultRegistry public registry;
    MockPriceOracle public oracle;

    address public owner;
    address public user1;
    address public mockVault1;
    address public mockVault2;
    address public mockAsset1;
    address public mockAsset2;

    // Common assets for testing
    address public WETH;
    address public WBTC;
    address public USDC;
    address public DAI;

    event VaultRegistered(
        address indexed asset,
        address indexed vault,
        uint256 ltv
    );
    event LTVUpdated(address indexed asset, uint256 ltv);
    event PriceOracleUpdated(
        address indexed oldOracle,
        address indexed newOracle
    );
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event PriceUpdated(address indexed asset, uint256 price);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        mockVault1 = makeAddr("mockVault1");
        mockVault2 = makeAddr("mockVault2");
        mockAsset1 = makeAddr("mockAsset1");
        mockAsset2 = makeAddr("mockAsset2");

        // Create mock token addresses
        WETH = makeAddr("WETH");
        WBTC = makeAddr("WBTC");
        USDC = makeAddr("USDC");
        DAI = makeAddr("DAI");

        // Deploy oracle
        oracle = new MockPriceOracle();

        // Deploy registry
        registry = new VaultRegistry(address(oracle));

        // Set default prices
        address[] memory assets = new address[](4);
        uint256[] memory prices = new uint256[](4);

        assets[0] = WETH;
        assets[1] = WBTC;
        assets[2] = USDC;
        assets[3] = DAI;

        prices[0] = 3000e18; // $3000
        prices[1] = 45000e18; // $45000
        prices[2] = 1e18; // $1
        prices[3] = 1e18; // $1

        oracle.setPrices(assets, prices);
    }

    /*//////////////////////////////////////////////////////////////
                        DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_RegistryDeployment() public {
        assertEq(registry.priceOracle(), address(oracle));
        assertEq(registry.owner(), owner);
        assertEq(registry.MAX_LTV(), 7500);
        assertEq(registry.BASIS_POINTS(), 10000);
    }

    function test_RevertRegistryDeploymentZeroOracle() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );
        new VaultRegistry(address(0));
    }

    function test_OracleDeployment() public {
        assertEq(oracle.owner(), owner);
    }

    /*//////////////////////////////////////////////////////////////
                    VAULT REGISTRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_RegisterVault() public {
        uint256 ltv = 5000; // 50%

        vm.expectEmit(true, true, false, true);
        emit VaultRegistered(mockAsset1, mockVault1, ltv);

        registry.registerVault(mockAsset1, mockVault1, ltv);

        assertEq(registry.vaults(mockAsset1), mockVault1);
        assertEq(registry.ltvRatios(mockAsset1), ltv);
        assertTrue(registry.approvedVaults(mockVault1));
    }

    function test_RegisterMultipleVaults() public {
        registry.registerVault(mockAsset1, mockVault1, 5000);
        registry.registerVault(mockAsset2, mockVault2, 6000);

        assertEq(registry.vaults(mockAsset1), mockVault1);
        assertEq(registry.vaults(mockAsset2), mockVault2);
        assertEq(registry.ltvRatios(mockAsset1), 5000);
        assertEq(registry.ltvRatios(mockAsset2), 6000);
    }

    function test_RegisterVaultMaxLTV() public {
        uint256 maxLtv = 7500; // 75%

        registry.registerVault(mockAsset1, mockVault1, maxLtv);

        assertEq(registry.ltvRatios(mockAsset1), maxLtv);
    }

    function test_RevertRegisterVaultExceedsMaxLTV() public {
        uint256 invalidLtv = 7501; // 75.01%

        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.ExceedsMaxBorrow.selector,
                invalidLtv,
                7500
            )
        );

        registry.registerVault(mockAsset1, mockVault1, invalidLtv);
    }

    function test_RevertRegisterVaultZeroAddress() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );

        registry.registerVault(mockAsset1, address(0), 5000);
    }

    function test_RevertRegisterVaultUnauthorized() public {
        vm.expectRevert(
            abi.encodeWithSelector(OrbitErrors.Unauthorized.selector, user1)
        );

        vm.prank(user1);
        registry.registerVault(mockAsset1, mockVault1, 5000);
    }

    function testFuzz_RegisterVault(uint256 ltv) public {
        vm.assume(ltv <= 7500);

        registry.registerVault(mockAsset1, mockVault1, ltv);

        assertEq(registry.ltvRatios(mockAsset1), ltv);
    }

    /*//////////////////////////////////////////////////////////////
                        GETTER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetVault() public {
        registry.registerVault(mockAsset1, mockVault1, 5000);

        assertEq(registry.getVault(mockAsset1), mockVault1);
    }

    function test_GetVaultUnregistered() public {
        assertEq(registry.getVault(mockAsset1), address(0));
    }

    function test_GetLTV() public {
        registry.registerVault(mockAsset1, mockVault1, 5000);

        assertEq(registry.getLTV(mockAsset1), 5000);
    }

    function test_GetLTVUnregistered() public {
        assertEq(registry.getLTV(mockAsset1), 0);
    }

    /*//////////////////////////////////////////////////////////////
                        LTV UPDATE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetLTV() public {
        registry.registerVault(mockAsset1, mockVault1, 5000);

        uint256 newLtv = 6000;

        vm.expectEmit(true, false, false, true);
        emit LTVUpdated(mockAsset1, newLtv);

        registry.setLTV(mockAsset1, newLtv);

        assertEq(registry.ltvRatios(mockAsset1), newLtv);
    }

    function test_RevertSetLTVExceedsMax() public {
        registry.registerVault(mockAsset1, mockVault1, 5000);

        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.ExceedsMaxBorrow.selector,
                8000,
                7500
            )
        );

        registry.setLTV(mockAsset1, 8000);
    }

    function test_RevertSetLTVUnauthorized() public {
        registry.registerVault(mockAsset1, mockVault1, 5000);

        vm.expectRevert(
            abi.encodeWithSelector(OrbitErrors.Unauthorized.selector, user1)
        );

        vm.prank(user1);
        registry.setLTV(mockAsset1, 6000);
    }

    /*//////////////////////////////////////////////////////////////
                    PRICE ORACLE UPDATE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetPriceOracle() public {
        MockPriceOracle newOracle = new MockPriceOracle();

        vm.expectEmit(true, true, false, false);
        emit PriceOracleUpdated(address(oracle), address(newOracle));

        registry.setPriceOracle(address(newOracle));

        assertEq(registry.priceOracle(), address(newOracle));
    }

    function test_RevertSetPriceOracleZeroAddress() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );

        registry.setPriceOracle(address(0));
    }

    function test_RevertSetPriceOracleUnauthorized() public {
        MockPriceOracle newOracle = new MockPriceOracle();

        vm.expectRevert(
            abi.encodeWithSelector(OrbitErrors.Unauthorized.selector, user1)
        );

        vm.prank(user1);
        registry.setPriceOracle(address(newOracle));
    }

    /*//////////////////////////////////////////////////////////////
                        OWNERSHIP TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetOwner() public {
        address newOwner = makeAddr("newOwner");

        vm.expectEmit(true, true, false, false);
        emit OwnershipTransferred(owner, newOwner);

        registry.setOwner(newOwner);

        assertEq(registry.owner(), newOwner);
    }

    function test_RevertSetOwnerZeroAddress() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OrbitErrors.InvalidImplementation.selector,
                address(0)
            )
        );

        registry.setOwner(address(0));
    }

    function test_RevertSetOwnerUnauthorized() public {
        address newOwner = makeAddr("newOwner");

        vm.expectRevert(
            abi.encodeWithSelector(OrbitErrors.Unauthorized.selector, user1)
        );

        vm.prank(user1);
        registry.setOwner(newOwner);
    }

    /*//////////////////////////////////////////////////////////////
                    PRICE ORACLE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetPrice() public {
        address asset = makeAddr("newAsset");
        uint256 price = 100e18;

        vm.expectEmit(true, false, false, true);
        emit PriceUpdated(asset, price);

        oracle.setPrice(asset, price);

        assertEq(oracle.getPrice(asset), price);
    }

    function test_RevertSetPriceZero() public {
        address asset = makeAddr("newAsset");

        vm.expectRevert(OrbitErrors.ZeroAmount.selector);

        oracle.setPrice(asset, 0);
    }

    function test_RevertSetPriceUnauthorized() public {
        address asset = makeAddr("newAsset");

        vm.expectRevert(
            abi.encodeWithSelector(OrbitErrors.Unauthorized.selector, user1)
        );

        vm.prank(user1);
        oracle.setPrice(asset, 100e18);
    }

    function test_SetPricesBatch() public {
        address[] memory assets = new address[](2);
        uint256[] memory prices = new uint256[](2);

        assets[0] = makeAddr("asset1");
        assets[1] = makeAddr("asset2");
        prices[0] = 100e18;
        prices[1] = 200e18;

        oracle.setPrices(assets, prices);

        assertEq(oracle.getPrice(assets[0]), 100e18);
        assertEq(oracle.getPrice(assets[1]), 200e18);
    }

    function test_RevertSetPricesMismatchedArrays() public {
        address[] memory assets = new address[](2);
        uint256[] memory prices = new uint256[](1);

        assets[0] = makeAddr("asset1");
        assets[1] = makeAddr("asset2");
        prices[0] = 100e18;

        vm.expectRevert(
            abi.encodeWithSelector(OrbitErrors.InvalidState.selector, 2, 1)
        );

        oracle.setPrices(assets, prices);
    }

    function test_RevertSetPricesWithZero() public {
        address[] memory assets = new address[](2);
        uint256[] memory prices = new uint256[](2);

        assets[0] = makeAddr("asset1");
        assets[1] = makeAddr("asset2");
        prices[0] = 100e18;
        prices[1] = 0;

        vm.expectRevert(OrbitErrors.ZeroAmount.selector);

        oracle.setPrices(assets, prices);
    }

    function test_GetPrice() public {
        assertEq(oracle.getPrice(WETH), 3000e18);
        assertEq(oracle.getPrice(WBTC), 45000e18);
        assertEq(oracle.getPrice(USDC), 1e18);
        assertEq(oracle.getPrice(DAI), 1e18);
    }

    function test_RevertGetPriceNotSet() public {
        address unsetAsset = makeAddr("unsetAsset");

        vm.expectRevert(
            abi.encodeWithSelector(OrbitErrors.InvalidState.selector, 0, 1)
        );

        oracle.getPrice(unsetAsset);
    }

    function testFuzz_SetAndGetPrice(uint256 price) public {
        vm.assume(price > 0 && price < type(uint128).max);

        address asset = makeAddr("fuzzAsset");
        oracle.setPrice(asset, price);

        assertEq(oracle.getPrice(asset), price);
    }

    /*//////////////////////////////////////////////////////////////
                    INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_FullVaultSetup() public {
        // Register vault with LTV
        registry.registerVault(WETH, mockVault1, 5000);

        // Verify vault is registered
        assertEq(registry.getVault(WETH), mockVault1);
        assertEq(registry.getLTV(WETH), 5000);
        assertTrue(registry.approvedVaults(mockVault1));

        // Verify price is available
        assertEq(oracle.getPrice(WETH), 3000e18);

        // Update LTV
        registry.setLTV(WETH, 6000);
        assertEq(registry.getLTV(WETH), 6000);
    }

    function test_MultipleAssetsSetup() public {
        // Register multiple vaults
        registry.registerVault(WETH, mockVault1, 5000);
        registry.registerVault(WBTC, mockVault2, 6000);

        // Verify all registrations
        assertEq(registry.getVault(WETH), mockVault1);
        assertEq(registry.getVault(WBTC), mockVault2);
        assertEq(registry.getLTV(WETH), 5000);
        assertEq(registry.getLTV(WBTC), 6000);

        // Verify prices
        assertEq(oracle.getPrice(WETH), 3000e18);
        assertEq(oracle.getPrice(WBTC), 45000e18);
    }
}
