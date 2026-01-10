// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {IdentityRegistry} from "../contracts/rwa/IdentityRegistry.sol";
import {RWAIncomeNFT} from "../contracts/rwa/RWAIncomeNFT.sol";
import {OrbitRWAPool} from "../contracts/rwa/OrbitRWAPool.sol";
import {SPVManager} from "../contracts/rwa/SPVManager.sol";
import {MockUSDC} from "../contracts/rwa/MockUSDC.sol";
import {SeniorTranche} from "../contracts/rwa/tranches/SeniorTranche.sol";
import {JuniorTranche} from "../contracts/rwa/tranches/JuniorTranche.sol";
import {WaterfallDistributor} from "../contracts/rwa/tranches/WaterfallDistributor.sol";

contract DeployRWAMantleTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("MANTLE_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== ORBIT FINANCE RWA MANTLE TESTNET DEPLOYMENT ===");
        console.log("Deployer:", deployer);
        console.log("Chain ID: 5003 (Mantle Testnet)");
        console.log("");
        
        // 1. Deploy MockUSDC
        console.log("1. Deploying MockUSDC...");
        MockUSDC usdc = new MockUSDC();
        console.log("  MockUSDC:", address(usdc));
        console.log("");
        
        // 2. Deploy IdentityRegistry
        console.log("2. Deploying IdentityRegistry...");
        IdentityRegistry identityRegistry = new IdentityRegistry();
        console.log("  IdentityRegistry:", address(identityRegistry));
        console.log("");
        
        // 3. Deploy RWAIncomeNFT
        console.log("3. Deploying RWAIncomeNFT...");
        RWAIncomeNFT rwaIncomeNFT = new RWAIncomeNFT();
        console.log("  RWAIncomeNFT:", address(rwaIncomeNFT));
        console.log("");
        
        // 4. Deploy OrbitRWAPool
        console.log("4. Deploying OrbitRWAPool...");
        OrbitRWAPool rwaPool = new OrbitRWAPool(
            address(usdc),
            address(rwaIncomeNFT),
            address(identityRegistry)
        );
        console.log("  OrbitRWAPool:", address(rwaPool));
        console.log("");
        
        // 5. Deploy SPVManager
        console.log("5. Deploying SPVManager...");
        SPVManager spvManager = new SPVManager(
            address(rwaPool),
            address(rwaIncomeNFT),
            address(usdc)
        );
        console.log("  SPVManager:", address(spvManager));
        console.log("");
        
        // 6. Deploy Senior Tranche
        console.log("6. Deploying Senior Tranche...");
        SeniorTranche seniorTranche = new SeniorTranche(
            usdc,
            address(identityRegistry),
            "Orbit Senior Tranche",
            "orSENIOR"
        );
        console.log("  SeniorTranche:", address(seniorTranche));
        console.log("");
        
        // 7. Deploy Junior Tranche
        console.log("7. Deploying Junior Tranche...");
        JuniorTranche juniorTranche = new JuniorTranche(
            usdc,
            address(identityRegistry),
            "Orbit Junior Tranche",
            "orJUNIOR"
        );
        console.log("  JuniorTranche:", address(juniorTranche));
        console.log("");
        
        // 8. Deploy WaterfallDistributor
        console.log("8. Deploying WaterfallDistributor...");
        WaterfallDistributor waterfallDistributor = new WaterfallDistributor(
            address(seniorTranche),
            address(juniorTranche),
            address(usdc)
        );
        console.log("  WaterfallDistributor:", address(waterfallDistributor));
        console.log("");
        
        // 9. Setup: Transfer ownership of tranches to distributor
        console.log("9. Setting up tranche permissions...");
        seniorTranche.transferOwnership(address(waterfallDistributor));
        juniorTranche.transferOwnership(address(waterfallDistributor));
        console.log("  Transferred tranche ownership to WaterfallDistributor");
        console.log("");
        
        // 10. Setup: Mint USDC to pool for liquidity
        console.log("10. Setting up initial liquidity...");
        uint256 initialLiquidity = 1_000_000 * 10**6; // 1M USDC
        usdc.mint(address(rwaPool), initialLiquidity);
        console.log("  Minted 1,000,000 USDC to pool");
        
        // Mint USDC to SPV wallet (deployer) for auto-repayments
        uint256 spvBalance = 500_000 * 10**6; // 500K USDC
        usdc.mint(deployer, spvBalance);
        console.log("  Minted 500,000 USDC to SPV wallet");
        
        // Mint USDC to distributor for yield distribution
        uint256 distributorBalance = 100_000 * 10**6; // 100K USDC
        usdc.mint(address(waterfallDistributor), distributorBalance);
        console.log("  Minted 100,000 USDC to WaterfallDistributor");
        console.log("");
        
        // 11. Add deployer as SPV approver for NFT minting
        console.log("11. Setting up SPV approver...");
        rwaIncomeNFT.addSPVApprover(deployer);
        console.log("  Added deployer as SPV approver");
        console.log("");
        
        vm.stopBroadcast();
        
        // 12. Export addresses
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("");
        console.log("RWA Contract Addresses for Mantle Testnet:");
        console.log("");
        console.log("MockUSDC:", address(usdc));
        console.log("IdentityRegistry:", address(identityRegistry));
        console.log("RWAIncomeNFT:", address(rwaIncomeNFT));
        console.log("OrbitRWAPool:", address(rwaPool));
        console.log("SPVManager:", address(spvManager));
        console.log("SeniorTranche:", address(seniorTranche));
        console.log("JuniorTranche:", address(juniorTranche));
        console.log("WaterfallDistributor:", address(waterfallDistributor));
        console.log("");
        console.log("SPV Wallet:", deployer);
    }
}
