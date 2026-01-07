// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/rwa/BundlePool.sol";

contract DeployBundlePool is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdtAddress = vm.envAddress("USDT_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy BundlePool contract
        BundlePool bundlePool = new BundlePool(usdtAddress);

        console.log("BundlePool deployed at:", address(bundlePool));

        // Create initial test pool
        uint256 poolId = bundlePool.createPool(
            "Mantel x Orbit Finance - Revenue-Based Lending Pool - B1",
            1000000 * 10**6, // $1,000,000 USDT
            16, // 16% expected APY
            block.timestamp + 210 days, // 7 months from now
            25, // 25% junior distribution
            75  // 75% senior distribution
        );

        console.log("Initial pool created with ID:", poolId);

        // Set pool status to Staking
        bundlePool.updatePoolStatus(poolId, BundlePool.PoolStatus.Staking);

        console.log("Pool status set to Staking");

        vm.stopBroadcast();
    }
}
