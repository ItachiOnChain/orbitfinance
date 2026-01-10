// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/rwa/BundlePool.sol";

contract CreateBundlePoolOnMantle is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("MANTLE_PRIVATE_KEY");
        
        address bundlePoolAddress = 0xf4c5C29b14f0237131F7510A51684c8191f98E06;
        
        vm.startBroadcast(deployerPrivateKey);

        BundlePool bundlePool = BundlePool(bundlePoolAddress);

        console.log("Creating pool on BundlePool:", bundlePoolAddress);

        // Create pool with same parameters as Anvil deployment
        uint256 poolId = bundlePool.createPool(
            "Mantel x Orbit Finance - Revenue-Based Lending Pool - B1",
            1000000 * 10**6, // $1,000,000 USDT (6 decimals)
            16, // 16% expected APY
            block.timestamp + 210 days, // 7 months from now
            25, // 25% junior distribution
            75  // 75% senior distribution
        );

        console.log("Pool created with ID:", poolId);

        // Set pool status to Staking
        bundlePool.updatePoolStatus(poolId, BundlePool.PoolStatus.Staking);

        console.log("Pool status set to Staking");
        console.log("");
        console.log("=== POOL CREATION COMPLETE ===");

        vm.stopBroadcast();
    }
}
