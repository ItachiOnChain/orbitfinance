#!/bin/bash

# ============================================================================
# Orbit Finance - Unified Deployment Script
# ============================================================================
# Deploys both Crypto and RWA contracts, updates all ABIs and addresses
# Usage: ./deploy.sh
# ============================================================================

set -e

echo "🚀 Orbit Finance - Unified Deployment"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Export private key for the script to use
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# ============================================================================
# STEP 1: Deploy Crypto Contracts
# ============================================================================
echo -e "${BLUE}📝 Step 1/6: Deploying Crypto Contracts...${NC}"
forge script scripts/Deploy.s.sol --tc DeployOrbitFinance \
  --rpc-url http://localhost:8545 \
  --broadcast

echo -e "${GREEN}✅ Crypto contracts deployed!${NC}"
echo ""

# ============================================================================
# STEP 2: Deploy RWA Contracts
# ============================================================================
echo -e "${BLUE}📝 Step 2/7: Deploying RWA Contracts...${NC}"
forge script script/DeployRWA.s.sol:DeployRWA \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

echo -e "${GREEN}✅ RWA contracts deployed!${NC}"
echo ""

# ============================================================================
# STEP 2.5: Deploy Bundle Pool Contract
# ============================================================================
echo -e "${BLUE}📝 Step 2.5/7: Deploying Bundle Pool Contract...${NC}"
export USDT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
forge script script/DeployBundlePool.s.sol:DeployBundlePool \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --legacy

echo -e "${GREEN}✅ Bundle Pool contract deployed!${NC}"
echo ""


# ============================================================================
# STEP 3: Copy Crypto ABIs to Frontend
# ============================================================================
echo -e "${BLUE}📋 Step 3/7: Copying Crypto ABIs to frontend...${NC}"
mkdir -p frontend/src/contracts/abis
cp out/AccountFactory.sol/AccountFactory.json frontend/src/contracts/abis/
cp out/OrbitAccount.sol/OrbitAccount.json frontend/src/contracts/abis/
cp out/ERC4626Vault.sol/ERC4626Vault.json frontend/src/contracts/abis/
cp out/orUSD.sol/orUSD.json frontend/src/contracts/abis/

echo -e "${GREEN}✅ Crypto ABIs copied!${NC}"
echo ""

# ============================================================================
# STEP 4: Copy RWA ABIs to Frontend
# ============================================================================
echo -e "${BLUE}📋 Step 4/7: Copying RWA ABIs to frontend...${NC}"
mkdir -p frontend/src/contracts/rwa-abis
cp out/IdentityRegistry.sol/IdentityRegistry.json frontend/src/contracts/rwa-abis/
cp out/RWAIncomeNFT.sol/RWAIncomeNFT.json frontend/src/contracts/rwa-abis/
cp out/OrbitRWAPool.sol/OrbitRWAPool.json frontend/src/contracts/rwa-abis/
cp out/SPVManager.sol/SPVManager.json frontend/src/contracts/rwa-abis/
cp out/SeniorTranche.sol/SeniorTranche.json frontend/src/contracts/rwa-abis/
cp out/JuniorTranche.sol/JuniorTranche.json frontend/src/contracts/rwa-abis/
cp out/WaterfallDistributor.sol/WaterfallDistributor.json frontend/src/contracts/rwa-abis/
cp out/MockUSDC.sol/MockUSDC.json frontend/src/contracts/rwa-abis/
cp out/BundlePool.sol/BundlePool.json frontend/src/contracts/rwa-abis/

echo -e "${GREEN}✅ RWA ABIs copied!${NC}"
echo ""

# ============================================================================
# STEP 5: Update Contract Addresses
# ============================================================================
echo -e "${BLUE}🔗 Step 5/7: Updating contract addresses...${NC}"

# Update Crypto addresses
python3 <<'CRYPTO_ADDRESSES'
import json

# Read Crypto deployment output
with open('broadcast/Deploy.s.sol/31337/run-latest.json', 'r') as f:
    data = json.load(f)

# Extract addresses
addresses = {}
for tx in data['transactions']:
    if tx.get('contractName'):
        name = tx['contractName']
        addr = tx['contractAddress']
        if name not in addresses:
            addresses[name] = addr

# Get addresses from deployment order
weth = None
usdc = None
weth_vault = None
usdc_vault = None
weth_strategy = None
usdc_strategy = None

for tx in data['transactions']:
    name = tx.get('contractName')
    addr = tx['contractAddress']
    
    if name == 'MockERC20':
        if weth is None:
            weth = addr
        elif usdc is None:
            usdc = addr
    elif name == 'ERC4626Vault':
        if weth_vault is None:
            weth_vault = addr
        elif usdc_vault is None:
            usdc_vault = addr
    elif name == 'MockStrategy':
        if weth_strategy is None:
            weth_strategy = addr
        elif usdc_strategy is None:
            usdc_strategy = addr

# Generate addresses.ts
output = f'''export const CONTRACTS = {{
    anvil: {{
        AccountFactory: '{addresses.get("AccountFactory", "")}',
        DebtManager: '{addresses.get("DebtManager", "")}',
        VaultRegistry: '{addresses.get("VaultRegistry", "")}',
        PriceOracle: '{addresses.get("MockPriceOracle", "")}',
        orUSD: '{addresses.get("orUSD", "")}',
        WETH: '{weth}',
        USDC: '{usdc}',
        WETH_Vault: '{weth_vault}',
        USDC_Vault: '{usdc_vault}',
        WETH_Strategy: '{weth_strategy}',
        USDC_Strategy: '{usdc_strategy}',
    }}
}};

export const TEST_ACCOUNT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
'''

with open('frontend/src/contracts/addresses.ts', 'w') as f:
    f.write(output)

print('✅ Crypto addresses updated!')
CRYPTO_ADDRESSES

# Update RWA addresses
python3 <<'RWA_ADDRESSES'
import json

# Read RWA deployment output
with open('broadcast/DeployRWA.s.sol/31337/run-latest.json', 'r') as f:
    data = json.load(f)

# Extract RWA contract addresses
rwa_addresses = {}
for tx in data['transactions']:
    if tx.get('contractName') and tx.get('contractAddress'):
        name = tx['contractName']
        addr = tx['contractAddress']
        # Only store first occurrence of each contract name
        if name not in rwa_addresses:
            rwa_addresses[name] = addr

# Create RWA addresses JSON
rwa_json = {
    "MockUSDC": rwa_addresses.get("MockUSDC", ""),
    "IdentityRegistry": rwa_addresses.get("IdentityRegistry", ""),
    "RWAIncomeNFT": rwa_addresses.get("RWAIncomeNFT", ""),
    "OrbitRWAPool": rwa_addresses.get("OrbitRWAPool", ""),
    "SPVManager": rwa_addresses.get("SPVManager", ""),
    "SeniorTranche": rwa_addresses.get("SeniorTranche", ""),
    "JuniorTranche": rwa_addresses.get("JuniorTranche", ""),
    "WaterfallDistributor": rwa_addresses.get("WaterfallDistributor", ""),
    "TestUser": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "SPVWallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}

with open('deployments/anvil-rwa.json', 'w') as f:
    json.dump(rwa_json, f, indent=2)

print('✅ RWA addresses updated!')
print('')
print('📍 RWA Contract Addresses:')
print(f'  IdentityRegistry: {rwa_json["IdentityRegistry"]}')
print(f'  RWAIncomeNFT: {rwa_json["RWAIncomeNFT"]}')
print(f'  OrbitRWAPool: {rwa_json["OrbitRWAPool"]}')
print(f'  SPVManager: {rwa_json["SPVManager"]}')
print(f'  SeniorTranche: {rwa_json["SeniorTranche"]}')
print(f'  JuniorTranche: {rwa_json["JuniorTranche"]}')
print(f'  WaterfallDistributor: {rwa_json["WaterfallDistributor"]}')
print(f'  MockUSDC: {rwa_json["MockUSDC"]}')

# Read BundlePool deployment
try:
    with open('broadcast/DeployBundlePool.s.sol/31337/run-latest.json', 'r') as f:
        bundle_data = json.load(f)
        for tx in bundle_data['transactions']:
            if tx.get('contractName') == 'BundlePool':
                rwa_json['BundlePool'] = tx['contractAddress']
                # Update bundlePoolConfig.ts
                import re
                with open('frontend/src/contracts/bundlePoolConfig.ts', 'r') as cf:
                    config = cf.read()
                config = re.sub(
                    r"export const BUNDLE_POOL_ADDRESS = '[^']*';",
                    f"export const BUNDLE_POOL_ADDRESS = '{tx['contractAddress']}';",
                    config
                )
                with open('frontend/src/contracts/bundlePoolConfig.ts', 'w') as cf:
                    cf.write(config)
                break
    # Re-save with BundlePool
    with open('deployments/anvil-rwa.json', 'w') as f:
        json.dump(rwa_json, f, indent=2)
except:
    pass

if 'BundlePool' in rwa_json:
    print(f'  BundlePool: {rwa_json["BundlePool"]}')
RWA_ADDRESSES

echo ""

# ============================================================================
# STEP 6: Mint Test Funds
# ============================================================================
echo -e "${BLUE}💰 Step 6/7: Minting test funds...${NC}"
echo ""
echo -e "${YELLOW}Test funds already minted during deployment:${NC}"
echo "  - 50,000 USDC (RWA testing)"
echo "  - Test tokens for Crypto vaults"
echo "  - Account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo ""

# ============================================================================
# DEPLOYMENT COMPLETE
# ============================================================================
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "======================================"
echo ""
echo -e "${GREEN}✅ All contracts deployed${NC}"
echo -e "${GREEN}✅ All ABIs copied to frontend${NC}"
echo -e "${GREEN}✅ All addresses updated${NC}"
echo -e "${GREEN}✅ Test funds minted${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "  1. Frontend will auto-reload with new addresses"
echo "  2. Test account ready: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "  3. Clear localStorage for fresh KYC testing:"
echo "     localStorage.removeItem('kyc_submissions');"
echo ""
echo -e "${YELLOW}⚠️  Note: KYC is NOT auto-verified. Users must complete KYC flow.${NC}"
echo ""
