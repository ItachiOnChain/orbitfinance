// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../../contracts/rwa/MockUSDC.sol";
import "../../../contracts/rwa/IdentityRegistry.sol";
import "../../../contracts/rwa/tranches/SeniorTranche.sol";
import "../../../contracts/rwa/tranches/JuniorTranche.sol";
import "../../../contracts/rwa/tranches/WaterfallDistributor.sol";

contract TrancheTest is Test {
    MockUSDC public usdc;
    IdentityRegistry public identityRegistry;
    SeniorTranche public seniorTranche;
    JuniorTranche public juniorTranche;
    WaterfallDistributor public waterfallDistributor;
    
    address public admin = address(this);
    address public seniorInvestor = address(0x1);
    address public juniorInvestor = address(0x2);
    address public unverifiedUser = address(0x3);
    
    function setUp() public {
        // Deploy contracts
        usdc = new MockUSDC();
        identityRegistry = new IdentityRegistry();
        
        seniorTranche = new SeniorTranche(
            usdc,
            address(identityRegistry),
            "Orbit Senior Tranche",
            "orSENIOR"
        );
        
        juniorTranche = new JuniorTranche(
            usdc,
            address(identityRegistry),
            "Orbit Junior Tranche",
            "orJUNIOR"
        );
        
        waterfallDistributor = new WaterfallDistributor(
            address(seniorTranche),
            address(juniorTranche),
            address(usdc)
        );
        
        // Transfer ownership to distributor
        seniorTranche.transferOwnership(address(waterfallDistributor));
        juniorTranche.transferOwnership(address(waterfallDistributor));
        
        // Setup: Verify investors
        identityRegistry.mockVerifyUser(seniorInvestor);
        identityRegistry.mockVerifyUser(juniorInvestor);
        
        // Setup: Mint USDC to investors
        usdc.mint(seniorInvestor, 100_000 * 10**6); // 100K USDC
        usdc.mint(juniorInvestor, 100_000 * 10**6); // 100K USDC
        
        // Setup: Mint USDC to distributor for yield
        usdc.mint(address(waterfallDistributor), 50_000 * 10**6); // 50K USDC
    }
    
    // ============ Senior Tranche Tests ============
    
    function test_SeniorDeposit() public {
        uint256 depositAmount = 10_000 * 10**6;
        
        vm.startPrank(seniorInvestor);
        usdc.approve(address(seniorTranche), depositAmount);
        uint256 shares = seniorTranche.deposit(depositAmount, seniorInvestor);
        vm.stopPrank();
        
        assertEq(seniorTranche.balanceOf(seniorInvestor), shares);
        assertEq(seniorTranche.totalAssets(), depositAmount);
    }
    
    function test_RevertWhen_SeniorDepositWithoutKYC() public {
        uint256 depositAmount = 10_000 * 10**6;
        usdc.mint(unverifiedUser, depositAmount);
        
        vm.startPrank(unverifiedUser);
        usdc.approve(address(seniorTranche), depositAmount);
        
        vm.expectRevert("SeniorTranche: user not KYC verified");
        seniorTranche.deposit(depositAmount, unverifiedUser);
        vm.stopPrank();
    }
    
    function test_SeniorWithdraw() public {
        uint256 depositAmount = 10_000 * 10**6;
        
        vm.startPrank(seniorInvestor);
        usdc.approve(address(seniorTranche), depositAmount);
        seniorTranche.deposit(depositAmount, seniorInvestor);
        
        // Withdraw half
        uint256 withdrawAmount = 5_000 * 10**6;
        seniorTranche.withdraw(withdrawAmount, seniorInvestor, seniorInvestor);
        vm.stopPrank();
        
        assertEq(seniorTranche.totalAssets(), depositAmount - withdrawAmount);
    }
    
    // ============ Junior Tranche Tests ============
    
    function test_JuniorDeposit() public {
        uint256 depositAmount = 10_000 * 10**6;
        
        vm.startPrank(juniorInvestor);
        usdc.approve(address(juniorTranche), depositAmount);
        uint256 shares = juniorTranche.deposit(depositAmount, juniorInvestor);
        vm.stopPrank();
        
        assertEq(juniorTranche.balanceOf(juniorInvestor), shares);
        assertEq(juniorTranche.totalAssets(), depositAmount);
        assertGt(juniorTranche.depositTime(juniorInvestor), 0);
    }
    
    function test_RevertWhen_JuniorDepositWithoutKYC() public {
        uint256 depositAmount = 10_000 * 10**6;
        usdc.mint(unverifiedUser, depositAmount);
        
        vm.startPrank(unverifiedUser);
        usdc.approve(address(juniorTranche), depositAmount);
        
        vm.expectRevert("JuniorTranche: user not KYC verified");
        juniorTranche.deposit(depositAmount, unverifiedUser);
        vm.stopPrank();
    }
    
    function test_RevertWhen_JuniorWithdrawBeforeLockup() public {
        uint256 depositAmount = 10_000 * 10**6;
        
        vm.startPrank(juniorInvestor);
        usdc.approve(address(juniorTranche), depositAmount);
        juniorTranche.deposit(depositAmount, juniorInvestor);
        
        // Try to withdraw immediately
        vm.expectRevert("JuniorTranche: lockup period not expired");
        juniorTranche.withdraw(5_000 * 10**6, juniorInvestor, juniorInvestor);
        vm.stopPrank();
    }
    
    function test_JuniorWithdrawAfterLockup() public {
        uint256 depositAmount = 10_000 * 10**6;
        
        vm.startPrank(juniorInvestor);
        usdc.approve(address(juniorTranche), depositAmount);
        juniorTranche.deposit(depositAmount, juniorInvestor);
        vm.stopPrank();
        
        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days + 1);
        
        vm.startPrank(juniorInvestor);
        uint256 withdrawAmount = 5_000 * 10**6;
        juniorTranche.withdraw(withdrawAmount, juniorInvestor, juniorInvestor);
        vm.stopPrank();
        
        assertEq(juniorTranche.totalAssets(), depositAmount - withdrawAmount);
    }
    
    function test_JuniorLockupStatus() public {
        uint256 depositAmount = 10_000 * 10**6;
        
        vm.startPrank(juniorInvestor);
        usdc.approve(address(juniorTranche), depositAmount);
        juniorTranche.deposit(depositAmount, juniorInvestor);
        vm.stopPrank();
        
        // Check lockup not expired
        assertFalse(juniorTranche.isLockupExpired(juniorInvestor));
        assertGt(juniorTranche.getLockupTimeRemaining(juniorInvestor), 0);
        
        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days + 1);
        
        // Check lockup expired
        assertTrue(juniorTranche.isLockupExpired(juniorInvestor));
        assertEq(juniorTranche.getLockupTimeRemaining(juniorInvestor), 0);
    }
    
    // ============ Waterfall Distribution Tests ============
    
    function test_YieldDistribution() public {
        // Setup: Deposit to both tranches
        uint256 seniorDeposit = 50_000 * 10**6; // $50K
        uint256 juniorDeposit = 20_000 * 10**6; // $20K
        
        vm.startPrank(seniorInvestor);
        usdc.approve(address(seniorTranche), seniorDeposit);
        seniorTranche.deposit(seniorDeposit, seniorInvestor);
        vm.stopPrank();
        
        vm.startPrank(juniorInvestor);
        usdc.approve(address(juniorTranche), juniorDeposit);
        juniorTranche.deposit(juniorDeposit, juniorInvestor);
        vm.stopPrank();
        
        // Fast forward 1 year for APY calculation
        vm.warp(block.timestamp + 365 days);
        
        // Distribute yield
        uint256 totalYield = 5_000 * 10**6; // $5K yield
        usdc.mint(admin, totalYield);
        usdc.approve(address(waterfallDistributor), totalYield);
        waterfallDistributor.distributeYield(totalYield);
        
        // Check distribution
        uint256 seniorAssets = seniorTranche.totalAssets();
        uint256 juniorAssets = juniorTranche.totalAssets();
        
        // Senior should get ~5.2% APY = $2,600
        // Junior gets remainder
        assertGt(seniorAssets, seniorDeposit);
        assertGt(juniorAssets, juniorDeposit);
        assertEq(seniorAssets + juniorAssets, seniorDeposit + juniorDeposit + totalYield);
    }
    
    function test_YieldDistributionPreview() public {
        // Setup deposits
        uint256 seniorDeposit = 50_000 * 10**6;
        uint256 juniorDeposit = 20_000 * 10**6;
        
        vm.startPrank(seniorInvestor);
        usdc.approve(address(seniorTranche), seniorDeposit);
        seniorTranche.deposit(seniorDeposit, seniorInvestor);
        vm.stopPrank();
        
        vm.startPrank(juniorInvestor);
        usdc.approve(address(juniorTranche), juniorDeposit);
        juniorTranche.deposit(juniorDeposit, juniorInvestor);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 365 days);
        
        // Preview distribution
        uint256 totalYield = 5_000 * 10**6;
        (uint256 seniorAmount, uint256 juniorAmount) = waterfallDistributor.previewYieldDistribution(totalYield);
        
        assertGt(seniorAmount, 0);
        assertGt(juniorAmount, 0);
        assertEq(seniorAmount + juniorAmount, totalYield);
    }
    
    function test_LossAbsorption() public {
        // Setup: Deposit to both tranches
        uint256 seniorDeposit = 50_000 * 10**6;
        uint256 juniorDeposit = 20_000 * 10**6;
        
        vm.startPrank(seniorInvestor);
        usdc.approve(address(seniorTranche), seniorDeposit);
        seniorTranche.deposit(seniorDeposit, seniorInvestor);
        vm.stopPrank();
        
        vm.startPrank(juniorInvestor);
        usdc.approve(address(juniorTranche), juniorDeposit);
        juniorTranche.deposit(juniorDeposit, juniorInvestor);
        vm.stopPrank();
        
        // Absorb loss (junior should take it)
        uint256 lossAmount = 5_000 * 10**6; // $5K loss
        waterfallDistributor.absorbLoss(lossAmount);
        
        // Junior should have absorbed the loss
        uint256 juniorAssets = juniorTranche.totalAssets();
        assertEq(juniorAssets, juniorDeposit - lossAmount);
        
        // Senior should be unaffected
        assertEq(seniorTranche.totalAssets(), seniorDeposit);
    }
    
    function test_LossAbsorptionExceedsJunior() public {
        // Setup: Small junior deposit
        uint256 seniorDeposit = 50_000 * 10**6;
        uint256 juniorDeposit = 5_000 * 10**6;
        
        vm.startPrank(seniorInvestor);
        usdc.approve(address(seniorTranche), seniorDeposit);
        seniorTranche.deposit(seniorDeposit, seniorInvestor);
        vm.stopPrank();
        
        vm.startPrank(juniorInvestor);
        usdc.approve(address(juniorTranche), juniorDeposit);
        juniorTranche.deposit(juniorDeposit, juniorInvestor);
        vm.stopPrank();
        
        // Try to absorb loss larger than junior
        uint256 lossAmount = 10_000 * 10**6; // $10K loss (exceeds junior)
        
        // This should absorb all junior assets
        waterfallDistributor.absorbLoss(lossAmount);
        
        // Junior should be depleted
        assertEq(juniorTranche.totalAssets(), 0);
    }
    
    function test_GetDistributionSummary() public {
        // Setup deposits
        uint256 seniorDeposit = 50_000 * 10**6;
        uint256 juniorDeposit = 20_000 * 10**6;
        
        vm.startPrank(seniorInvestor);
        usdc.approve(address(seniorTranche), seniorDeposit);
        seniorTranche.deposit(seniorDeposit, seniorInvestor);
        vm.stopPrank();
        
        vm.startPrank(juniorInvestor);
        usdc.approve(address(juniorTranche), juniorDeposit);
        juniorTranche.deposit(juniorDeposit, juniorInvestor);
        vm.stopPrank();
        
        (
            uint256 seniorAssets,
            uint256 juniorAssets,
            uint256 seniorAPY,
            uint256 juniorAPY
        ) = waterfallDistributor.getDistributionSummary();
        
        assertEq(seniorAssets, seniorDeposit);
        assertEq(juniorAssets, juniorDeposit);
        // APY should be 0 initially (no yield distributed yet)
        assertEq(seniorAPY, 0);
        assertEq(juniorAPY, 0);
    }
}
