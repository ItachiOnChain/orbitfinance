// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {AccountFactory} from "../contracts/core/AccountFactory.sol";
import {OrbitAccount} from "../contracts/core/OrbitAccount.sol";
import {DebtManager} from "../contracts/core/DebtManager.sol";
import {VaultRegistry} from "../contracts/vaults/VaultRegistry.sol";
import {ERC4626Vault} from "../contracts/vaults/ERC4626Vault.sol";
import {MockStrategy} from "../contracts/strategies/MockStrategy.sol";
import {MockPriceOracle} from "../contracts/mocks/MockPriceOracle.sol";
import {orUSD} from "../contracts/tokens/orUSD.sol";

contract MockERC20 {
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
    
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        return true;
    }
    
    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        return true;
    }
}

contract DeployMantleTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("MANTLE_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== ORBIT FINANCE MANTLE TESTNET DEPLOYMENT ===");
        console.log("Deployer:", deployer);
        console.log("Chain ID: 5003 (Mantle Testnet)");
        console.log("");
        
        // 1. Deploy Mock Tokens
        console.log("1. Deploying Mock Tokens...");
        MockERC20 weth = new MockERC20("Wrapped Ether", "WETH", 18);
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 6);
        console.log("  WETH:", address(weth));
        console.log("  USDC:", address(usdc));
        console.log("");
        
        // 2. Deploy Price Oracle
        console.log("2. Deploying Price Oracle...");
        MockPriceOracle oracle = new MockPriceOracle();
        oracle.setPrice(address(weth), 3000e18); // $3000 per WETH
        oracle.setPrice(address(usdc), 1e18);    // $1 per USDC
        console.log("  Oracle:", address(oracle));
        console.log("");
        
        // 3. Deploy Vault Registry
        console.log("3. Deploying Vault Registry...");
        VaultRegistry registry = new VaultRegistry(address(oracle));
        console.log("  Registry:", address(registry));
        console.log("");
        
        // 4. Deploy Debt System (DebtManager first, then orUSD)
        console.log("4. Deploying Debt System...");
        
        // Predict addresses for circular dependency
        uint256 currentNonce = vm.getNonce(deployer);
        address predictedDebtToken = vm.computeCreateAddress(deployer, currentNonce + 1);
        address predictedFactory = vm.computeCreateAddress(deployer, currentNonce + 4);
        
        // Deploy DebtManager with predicted orUSD address
        DebtManager debtManager = new DebtManager(predictedDebtToken, predictedFactory);
        
        // Deploy orUSD with actual DebtManager address
        orUSD debtToken = new orUSD(address(debtManager));
        
        // Verify prediction was correct
        require(address(debtToken) == predictedDebtToken, "orUSD prediction failed");
        
        oracle.setPrice(address(debtToken), 1e18); // $1 per orUSD
        console.log("  orUSD:", address(debtToken));
        console.log("  DebtManager:", address(debtManager));
        console.log("");
        
        // 5. Deploy Account System
        console.log("5. Deploying Account System...");
        OrbitAccount implementation = new OrbitAccount(address(registry), address(debtManager));
        AccountFactory factory = new AccountFactory(
            address(implementation),
            address(registry),
            address(debtManager)
        );
        
        // Verify factory prediction
        require(address(factory) == predictedFactory, "Factory prediction failed");
        
        console.log("  Implementation:", address(implementation));
        console.log("  Factory:", address(factory));
        console.log("");
        
        // 6. Deploy Strategies
        console.log("6. Deploying Strategies...");
        MockStrategy wethStrategy = new MockStrategy(address(weth));
        MockStrategy usdcStrategy = new MockStrategy(address(usdc));
        wethStrategy.setYieldRate(500);  // 5% APY
        usdcStrategy.setYieldRate(400);  // 4% APY
        console.log("  WETH Strategy:", address(wethStrategy));
        console.log("  USDC Strategy:", address(usdcStrategy));
        console.log("");
        
        // 7. Deploy Vaults
        console.log("7. Deploying Vaults...");
        ERC4626Vault wethVault = new ERC4626Vault(
            address(weth),
            address(wethStrategy),
            5000,  // 50% LTV
            100 ether,
            "WETH Vault",
            "vWETH"
        );
        ERC4626Vault usdcVault = new ERC4626Vault(
            address(usdc),
            address(usdcStrategy),
            7500,  // 75% LTV
            500000e6,
            "USDC Vault",
            "vUSDC"
        );
        console.log("  WETH Vault:", address(wethVault));
        console.log("  USDC Vault:", address(usdcVault));
        console.log("");
        
        // 8. Register Vaults
        console.log("8. Registering Vaults...");
        registry.registerVault(address(weth), address(wethVault), 5000);
        registry.registerVault(address(usdc), address(usdcVault), 7500);
        console.log("  Registered WETH vault with 50% LTV");
        console.log("  Registered USDC vault with 75% LTV");
        console.log("");
        
        // 9. Mint initial tokens to deployer for testing
        console.log("9. Minting test tokens to deployer...");
        weth.mint(deployer, 100 ether);
        usdc.mint(deployer, 100000e6);
        console.log("  Deployer WETH: 100");
        console.log("  Deployer USDC: 100,000");
        console.log("");
        
        vm.stopBroadcast();
        
        // 10. Export Addresses
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("");
        console.log("Contract Addresses for Mantle Testnet:");
        console.log("");
        console.log("AccountFactory:", address(factory));
        console.log("DebtManager:", address(debtManager));
        console.log("VaultRegistry:", address(registry));
        console.log("PriceOracle:", address(oracle));
        console.log("orUSD:", address(debtToken));
        console.log("WETH:", address(weth));
        console.log("USDC:", address(usdc));
        console.log("WETH_Vault:", address(wethVault));
        console.log("USDC_Vault:", address(usdcVault));
        console.log("WETH_Strategy:", address(wethStrategy));
        console.log("USDC_Strategy:", address(usdcStrategy));
        console.log("");
        console.log("Deployer:", deployer);
    }
}
