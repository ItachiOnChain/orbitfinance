// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/rwa/BundlePool.sol";

contract DeployBundlePoolMantleTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("MANTLE_PRIVATE_KEY");
        address usdtAddress = vm.envAddress("MANTLE_USDT_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        console.log("=== BUNDLE POOL MANTLE TESTNET DEPLOYMENT ===");
        console.log("USDT Address:", usdtAddress);
        console.log("");

        // Deploy BundlePool contract
        BundlePool bundlePool = new BundlePool(usdtAddress);

        console.log("BundlePool deployed at:", address(bundlePool));
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("");
        console.log("Note: Create pools through the frontend or separate script");

        vm.stopBroadcast();
    }
}
