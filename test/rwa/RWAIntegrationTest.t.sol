// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/rwa/IdentityRegistry.sol";
import "../../contracts/rwa/RWAIncomeNFT.sol";
import "../../contracts/rwa/OrbitRWAPool.sol";
import "../../contracts/rwa/SPVManager.sol";
import "../../contracts/rwa/MockUSDC.sol";

contract RWAIntegrationTest is Test {
    IdentityRegistry public identityRegistry;
    RWAIncomeNFT public rwaIncomeNFT;
    OrbitRWAPool public rwaPool;
    SPVManager public spvManager;
    MockUSDC public usdc;
    
    address public admin = address(this);
    address public spvWallet = address(0x1);
    address public borrower = address(0x2);
    address public unverifiedUser = address(0x3);
    
    function setUp() public {
        // Deploy contracts
        usdc = new MockUSDC();
        identityRegistry = new IdentityRegistry();
        rwaIncomeNFT = new RWAIncomeNFT();
        rwaPool = new OrbitRWAPool(
            address(usdc),
            address(rwaIncomeNFT),
            address(identityRegistry)
        );
        spvManager = new SPVManager(
            address(rwaPool),
            address(rwaIncomeNFT),
            address(usdc)
        );
        
        // Setup: Mint USDC to pool for liquidity
        usdc.mint(address(rwaPool), 1_000_000 * 10**6);
        
        // Setup: Mint USDC to SPV wallet
        usdc.mint(spvWallet, 500_000 * 10**6);
        
        // Setup: Verify borrower for KYC
        identityRegistry.mockVerifyUser(borrower);
        
        // Setup: Mint USDC to borrower for repayments
        usdc.mint(borrower, 10_000 * 10**6);
    }
    
    // ============ KYC Tests ============
    
    function test_KYCVerification() public {
        assertFalse(identityRegistry.isVerified(unverifiedUser));
        
        identityRegistry.mockVerifyUser(unverifiedUser);
        
        assertTrue(identityRegistry.isVerified(unverifiedUser));
    }
    
    function test_AdminVerification() public {
        address newUser = address(0x4);
        
        identityRegistry.verifyUser(newUser);
        
        assertTrue(identityRegistry.isVerified(newUser));
    }
    
    function test_BatchVerification() public {
        address[] memory users = new address[](3);
        users[0] = address(0x5);
        users[1] = address(0x6);
        users[2] = address(0x7);
        
        identityRegistry.batchVerifyUsers(users);
        
        assertTrue(identityRegistry.isVerified(users[0]));
        assertTrue(identityRegistry.isVerified(users[1]));
        assertTrue(identityRegistry.isVerified(users[2]));
    }
    
    // ============ NFT Minting Tests ============
    
    function test_MintRWANFT() public {
        uint256 tokenId = rwaIncomeNFT.mint(
            borrower,
            "Rental Property #1",
            RWAIncomeNFT.AssetType.RENTAL,
            2000 * 10**6,  // $2000/month
            12,            // 12 months
            100_000 * 10**6 // $100k total value
        );
        
        assertEq(rwaIncomeNFT.ownerOf(tokenId), borrower);
        assertEq(rwaIncomeNFT.getValue(tokenId), 100_000 * 10**6);
        
        RWAIncomeNFT.AssetMetadata memory metadata = rwaIncomeNFT.getMetadata(tokenId);
        assertEq(metadata.assetName, "Rental Property #1");
        assertEq(uint(metadata.assetType), uint(RWAIncomeNFT.AssetType.RENTAL));
        assertEq(metadata.monthlyIncome, 2000 * 10**6);
        assertTrue(metadata.spvApproved);
    }
    
    function test_TokensOfOwner() public {
        rwaIncomeNFT.mint(borrower, "Asset 1", RWAIncomeNFT.AssetType.RENTAL, 1000 * 10**6, 12, 50_000 * 10**6);
        rwaIncomeNFT.mint(borrower, "Asset 2", RWAIncomeNFT.AssetType.INVOICE, 1500 * 10**6, 6, 30_000 * 10**6);
        
        uint256[] memory tokens = rwaIncomeNFT.tokensOfOwner(borrower);
        
        assertEq(tokens.length, 2);
    }
    
    // ============ Collateral Deposit Tests ============
    
    function test_DepositCollateral() public {
        uint256 nftId = rwaIncomeNFT.mint(
            borrower,
            "Test Asset",
            RWAIncomeNFT.AssetType.RENTAL,
            2000 * 10**6,
            12,
            100_000 * 10**6
        );
        
        vm.startPrank(borrower);
        rwaIncomeNFT.approve(address(rwaPool), nftId);
        rwaPool.depositCollateral(nftId);
        vm.stopPrank();
        
        assertEq(rwaIncomeNFT.ownerOf(nftId), address(rwaPool));
        assertEq(rwaPool.getUserCollateralValue(borrower), 100_000 * 10**6);
    }
    
    function test_RevertWhen_DepositWithoutKYC() public {
        uint256 nftId = rwaIncomeNFT.mint(
            unverifiedUser,
            "Test Asset",
            RWAIncomeNFT.AssetType.RENTAL,
            2000 * 10**6,
            12,
            100_000 * 10**6
        );
        
        vm.startPrank(unverifiedUser);
        rwaIncomeNFT.approve(address(rwaPool), nftId);
        
        vm.expectRevert("OrbitRWAPool: user not KYC verified");
        rwaPool.depositCollateral(nftId);
        vm.stopPrank();
    }
    
    // ============ Borrowing Tests ============
    
    function test_Borrow() public {
        // Setup: Deposit collateral
        uint256 nftId = rwaIncomeNFT.mint(
            borrower,
            "Test Asset",
            RWAIncomeNFT.AssetType.RENTAL,
            2000 * 10**6,
            12,
            100_000 * 10**6
        );
        
        vm.startPrank(borrower);
        rwaIncomeNFT.approve(address(rwaPool), nftId);
        rwaPool.depositCollateral(nftId);
        
        // Borrow at 50% LTV
        uint256 borrowAmount = 50_000 * 10**6; // $50k (50% of $100k)
        uint256 balanceBefore = usdc.balanceOf(borrower);
        
        rwaPool.borrow(borrowAmount);
        
        uint256 balanceAfter = usdc.balanceOf(borrower);
        vm.stopPrank();
        
        assertEq(balanceAfter - balanceBefore, borrowAmount);
        assertEq(rwaPool.getUserDebt(borrower), borrowAmount);
    }
    
    function test_RevertWhen_BorrowExceedsLTV() public {
        // Setup: Deposit collateral
        uint256 nftId = rwaIncomeNFT.mint(
            borrower,
            "Test Asset",
            RWAIncomeNFT.AssetType.RENTAL,
            2000 * 10**6,
            12,
            100_000 * 10**6
        );
        
        vm.startPrank(borrower);
        rwaIncomeNFT.approve(address(rwaPool), nftId);
        rwaPool.depositCollateral(nftId);
        
        // Try to borrow more than 50% LTV
        uint256 borrowAmount = 51_000 * 10**6; // $51k (>50% of $100k)
        
        vm.expectRevert("OrbitRWAPool: exceeds LTV limit");
        rwaPool.borrow(borrowAmount);
        vm.stopPrank();
    }
    
    // ============ Repayment Tests ============
    
    function test_Repay() public {
        // Setup: Deposit and borrow
        uint256 nftId = rwaIncomeNFT.mint(
            borrower,
            "Test Asset",
            RWAIncomeNFT.AssetType.RENTAL,
            2000 * 10**6,
            12,
            100_000 * 10**6
        );
        
        vm.startPrank(borrower);
        rwaIncomeNFT.approve(address(rwaPool), nftId);
        rwaPool.depositCollateral(nftId);
        rwaPool.borrow(50_000 * 10**6);
        
        // Repay
        uint256 repayAmount = 10_000 * 10**6;
        usdc.approve(address(rwaPool), repayAmount);
        rwaPool.repay(repayAmount);
        vm.stopPrank();
        
        assertEq(rwaPool.getUserDebt(borrower), 40_000 * 10**6);
    }
    
    // ============ Auto-Repayment Tests ============
    
    function test_EnableAutoRepay() public {
        // Setup: Deposit and borrow
        uint256 nftId = rwaIncomeNFT.mint(
            borrower,
            "Test Asset",
            RWAIncomeNFT.AssetType.RENTAL,
            2000 * 10**6,
            12,
            100_000 * 10**6
        );
        
        vm.startPrank(borrower);
        rwaIncomeNFT.approve(address(rwaPool), nftId);
        rwaPool.depositCollateral(nftId);
        rwaPool.borrow(50_000 * 10**6);
        rwaPool.enableAutoRepay();
        vm.stopPrank();
        
        assertTrue(rwaPool.isAutoRepayEnabled(borrower));
        
        // Enable in SPV manager
        spvManager.enableAutoRepay(borrower, nftId);
        assertTrue(spvManager.isAutoRepayEnabled(borrower, nftId));
    }
    
    function test_ApplyAutoRepayment() public {
        // Setup: Deposit, borrow, and enable auto-repay
        uint256 nftId = rwaIncomeNFT.mint(
            borrower,
            "Test Asset",
            RWAIncomeNFT.AssetType.RENTAL,
            2000 * 10**6,
            12,
            100_000 * 10**6
        );
        
        vm.startPrank(borrower);
        rwaIncomeNFT.approve(address(rwaPool), nftId);
        rwaPool.depositCollateral(nftId);
        rwaPool.borrow(50_000 * 10**6);
        rwaPool.enableAutoRepay();
        vm.stopPrank();
        
        spvManager.enableAutoRepay(borrower, nftId);
        
        // Apply auto-repayment from SPV (admin is owner of SPVManager)
        uint256 yieldAmount = 2000 * 10**6; // $2000 monthly yield
        usdc.approve(address(spvManager), yieldAmount);
        spvManager.applyAutoRepayment(borrower, nftId, yieldAmount);
        
        assertEq(rwaPool.getUserDebt(borrower), 48_000 * 10**6);
        
        SPVManager.YieldRecord[] memory history = spvManager.getYieldHistory(borrower);
        assertEq(history.length, 1);
        assertEq(history[0].amount, yieldAmount);
    }
    
    // ============ LTV Enforcement Tests ============
    
    function test_LTVEnforcement() public {
        uint256 nftId = rwaIncomeNFT.mint(
            borrower,
            "Test Asset",
            RWAIncomeNFT.AssetType.RENTAL,
            2000 * 10**6,
            12,
            100_000 * 10**6
        );
        
        vm.startPrank(borrower);
        rwaIncomeNFT.approve(address(rwaPool), nftId);
        rwaPool.depositCollateral(nftId);
        
        // Borrow exactly 50%
        rwaPool.borrow(50_000 * 10**6);
        
        // Try to borrow more - should fail
        vm.expectRevert("OrbitRWAPool: exceeds LTV limit");
        rwaPool.borrow(1 * 10**6);
        vm.stopPrank();
    }
}
