#!/bin/bash

# ============================================================================
# Orbit Finance - Mantle Sepolia Deployment Script
# ============================================================================
# This script is the SINGLE SOURCE OF TRUTH for Mantle Sepolia deployment
# It deploys all contracts and syncs addresses to frontend/src/contracts.ts
# ============================================================================

set -e

echo "🚀 Orbit Finance - Mantle Sepolia Clean Deployment"
echo "===================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Mantle Sepolia Configuration
RPC_URL="https://rpc.sepolia.mantle.xyz"
CHAIN_ID=5003

# ============================================================================
# STEP 0: Validate Environment
# ============================================================================
echo -e "${BLUE}🔍 Step 0/8: Validating environment...${NC}"

if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

set -a
source .env
set +a

if [ -z "$MANTLE_PRIVATE_KEY" ]; then
    echo -e "${RED}❌ Error: MANTLE_PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment validated${NC}"
echo "  RPC: $RPC_URL"
echo "  Chain ID: $CHAIN_ID"
echo ""

# ============================================================================
# STEP 1: Deploy Crypto Contracts
# ============================================================================
echo -e "${BLUE}📝 Step 1/8: Deploying Crypto contracts...${NC}"
forge script script/DeployMantleTestnet.s.sol:DeployMantleTestnet \
  --rpc-url $RPC_URL \
  --broadcast \
  --legacy

echo -e "${GREEN}✅ Crypto contracts deployed${NC}"
echo ""

# ============================================================================
# STEP 2: Deploy RWA Contracts
# ============================================================================
echo -e "${BLUE}📝 Step 2/8: Deploying RWA contracts...${NC}"
forge script script/DeployRWAMantleTestnet.s.sol:DeployRWAMantleTestnet \
  --rpc-url $RPC_URL \
  --broadcast \
  --legacy

echo -e "${GREEN}✅ RWA contracts deployed${NC}"
echo ""

# ============================================================================
# STEP 3: Deploy Bundle Pool
# ============================================================================
echo -e "${BLUE}📝 Step 3/8: Deploying Bundle Pool...${NC}"

# Get MockUSDC address from RWA deployment
USDC_ADDR=$(python3 <<'GET_USDC'
import json
with open('broadcast/DeployRWAMantleTestnet.s.sol/5003/run-latest.json', 'r') as f:
    data = json.load(f)
    for tx in data['transactions']:
        if tx.get('contractName') == 'MockUSDC':
            print(tx['contractAddress'])
            break
GET_USDC
)

export MANTLE_USDT_ADDRESS=$USDC_ADDR

forge script script/DeployBundlePoolMantleTestnet.s.sol:DeployBundlePoolMantleTestnet \
  --rpc-url $RPC_URL \
  --broadcast \
  --legacy

echo -e "${GREEN}✅ Bundle Pool deployed${NC}"
echo ""

# ============================================================================
# STEP 4: Copy ABIs to Frontend
# ============================================================================
echo -e "${BLUE}📋 Step 4/8: Copying ABIs...${NC}"
mkdir -p frontend/src/contracts/abis
mkdir -p frontend/src/contracts/rwa-abis

# Crypto ABIs
cp out/AccountFactory.sol/AccountFactory.json frontend/src/contracts/abis/
cp out/OrbitAccount.sol/OrbitAccount.json frontend/src/contracts/abis/
cp out/ERC4626Vault.sol/ERC4626Vault.json frontend/src/contracts/abis/
cp out/orUSD.sol/orUSD.json frontend/src/contracts/abis/

# RWA ABIs
cp out/IdentityRegistry.sol/IdentityRegistry.json frontend/src/contracts/rwa-abis/
cp out/RWAIncomeNFT.sol/RWAIncomeNFT.json frontend/src/contracts/rwa-abis/
cp out/OrbitRWAPool.sol/OrbitRWAPool.json frontend/src/contracts/rwa-abis/
cp out/SPVManager.sol/SPVManager.json frontend/src/contracts/rwa-abis/
cp out/SeniorTranche.sol/SeniorTranche.json frontend/src/contracts/rwa-abis/
cp out/JuniorTranche.sol/JuniorTranche.json frontend/src/contracts/rwa-abis/
cp out/WaterfallDistributor.sol/WaterfallDistributor.json frontend/src/contracts/rwa-abis/
cp out/MockUSDC.sol/MockUSDC.json frontend/src/contracts/rwa-abis/
cp out/BundlePool.sol/BundlePool.json frontend/src/contracts/rwa-abis/

echo -e "${GREEN}✅ ABIs copied${NC}"
echo ""

# ============================================================================
# STEP 5: Extract and Sync Contract Addresses
# ============================================================================
echo -e "${BLUE}🔗 Step 5/8: Syncing contract addresses to frontend/src/contracts.ts...${NC}"

python3 <<'SYNC_ADDRESSES'
import json

# Read Crypto deployment
with open('broadcast/DeployMantleTestnet.s.sol/5003/run-latest.json', 'r') as f:
    crypto_data = json.load(f)

# Extract Crypto addresses
crypto_addrs = {}
for tx in crypto_data['transactions']:
    if tx.get('contractName'):
        name = tx['contractName']
        addr = tx['contractAddress']
        if name not in crypto_addrs:
            crypto_addrs[name] = addr

# Get token addresses in order
weth = usdc = weth_vault = usdc_vault = weth_strategy = usdc_strategy = None
for tx in crypto_data['transactions']:
    name = tx.get('contractName')
    addr = tx['contractAddress']
    if name == 'MockERC20':
        if not weth:
            weth = addr
        elif not usdc:
            usdc = addr
    elif name == 'ERC4626Vault':
        if not weth_vault:
            weth_vault = addr
        elif not usdc_vault:
            usdc_vault = addr
    elif name == 'MockStrategy':
        if not weth_strategy:
            weth_strategy = addr
        elif not usdc_strategy:
            usdc_strategy = addr

# Read RWA deployment
with open('broadcast/DeployRWAMantleTestnet.s.sol/5003/run-latest.json', 'r') as f:
    rwa_data = json.load(f)

# Extract RWA addresses
rwa_addrs = {}
for tx in rwa_data['transactions']:
    if tx.get('contractName') and tx.get('contractAddress'):
        name = tx['contractName']
        addr = tx['contractAddress']
        if name not in rwa_addrs:
            rwa_addrs[name] = addr

# Read Bundle Pool deployment
bundle_addr = ''
try:
    with open('broadcast/DeployBundlePoolMantleTestnet.s.sol/5003/run-latest.json', 'r') as f:
        bundle_data = json.load(f)
        for tx in bundle_data['transactions']:
            if tx.get('contractName') == 'BundlePool':
                bundle_addr = tx['contractAddress']
                break
except:
    pass

# Generate contracts.ts
contracts_ts = f"""// ============================================================================
// Orbit Finance - Contract Addresses
// ============================================================================
// This file is AUTO-GENERATED by .mantle-deploy.sh
// DO NOT EDIT MANUALLY - All changes will be overwritten
// ============================================================================

// Mantle Sepolia Testnet (Chain ID: 5003)
export const CONTRACTS = {{
    // Crypto Mode Contracts
    AccountFactory: '{crypto_addrs.get("AccountFactory", "")}' as `0x${{string}}`,
    DebtManager: '{crypto_addrs.get("DebtManager", "")}' as `0x${{string}}`,
    VaultRegistry: '{crypto_addrs.get("VaultRegistry", "")}' as `0x${{string}}`,
    PriceOracle: '{crypto_addrs.get("MockPriceOracle", "")}' as `0x${{string}}`,
    orUSD: '{crypto_addrs.get("orUSD", "")}' as `0x${{string}}`,
    WETH: '{weth}' as `0x${{string}}`,
    USDC: '{usdc}' as `0x${{string}}`,
    WETH_Vault: '{weth_vault}' as `0x${{string}}`,
    USDC_Vault: '{usdc_vault}' as `0x${{string}}`,
    WETH_Strategy: '{weth_strategy}' as `0x${{string}}`,
    USDC_Strategy: '{usdc_strategy}' as `0x${{string}}`,
    
    // RWA Mode Contracts
    MockUSDC: '{rwa_addrs.get("MockUSDC", "")}' as `0x${{string}}`,
    IdentityRegistry: '{rwa_addrs.get("IdentityRegistry", "")}' as `0x${{string}}`,
    RWAIncomeNFT: '{rwa_addrs.get("RWAIncomeNFT", "")}' as `0x${{string}}`,
    OrbitRWAPool: '{rwa_addrs.get("OrbitRWAPool", "")}' as `0x${{string}}`,
    SPVManager: '{rwa_addrs.get("SPVManager", "")}' as `0x${{string}}`,
    SeniorTranche: '{rwa_addrs.get("SeniorTranche", "")}' as `0x${{string}}`,
    JuniorTranche: '{rwa_addrs.get("JuniorTranche", "")}' as `0x${{string}}`,
    WaterfallDistributor: '{rwa_addrs.get("WaterfallDistributor", "")}' as `0x${{string}}`,
    BundlePool: '{bundle_addr}' as `0x${{string}}`,
}};

// Network Configuration
export const NETWORK = {{
    chainId: 5003,
    name: 'Mantle Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    explorer: 'https://sepolia.mantlescan.xyz',
    currency: 'MNT',
}};

// Test Account (Anvil default - for reference only)
export const TEST_ACCOUNT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
"""

with open('frontend/src/contracts.ts', 'w') as f:
    f.write(contracts_ts)

print('✅ Contract addresses synced to frontend/src/contracts.ts')
print('')
print('📍 Deployed Addresses:')
print(f'  AccountFactory: {crypto_addrs.get("AccountFactory")}')
print(f'  WETH: {weth}')
print(f'  USDC: {usdc}')
print(f'  MockUSDC (RWA): {rwa_addrs.get("MockUSDC")}')
print(f'  RWAIncomeNFT: {rwa_addrs.get("RWAIncomeNFT")}')
print(f'  BundlePool: {bundle_addr}')
SYNC_ADDRESSES

echo ""

# ============================================================================
# STEP 6: Update Hook Files
# ============================================================================
echo -e "${BLUE}🔧 Step 6/8: Updating frontend hooks...${NC}"

# Remove old useContracts hook (no longer needed)
rm -f frontend/src/hooks/useContracts.ts
rm -f frontend/src/hooks/useRWAContracts.ts

# Remove old addresses files
rm -f frontend/src/contracts/addresses.ts
rm -f frontend/src/config/rwaContracts.ts

echo -e "${GREEN}✅ Cleaned up old config files${NC}"
echo ""

# ============================================================================
# STEP 7: Update All Imports
# ============================================================================
echo -e "${BLUE}🔄 Step 7/8: Updating imports in frontend...${NC}"

python3 <<'UPDATE_IMPORTS'
import os
import re

# Find all TypeScript/TSX files
for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            
            with open(filepath, 'r') as f:
                content = f.read()
            
            original = content
            
            # Replace old imports
            content = re.sub(
                r"import \{ CONTRACTS \} from ['\"].*?contracts/addresses['\"];?",
                "import { CONTRACTS } from '../contracts';",
                content
            )
            content = re.sub(
                r"import \{ useContracts \} from ['\"].*?useContracts['\"];?",
                "import { CONTRACTS } from '../contracts';",
                content
            )
            content = re.sub(
                r"import \{ useRWAContracts \} from ['\"].*?useRWAContracts['\"];?",
                "import { CONTRACTS } from '../contracts';",
                content
            )
            
            # Remove useContracts() calls
            content = re.sub(r'const contracts = useContracts\(\);?\n\s*', '', content)
            content = re.sub(r'const contracts = useRWAContracts\(\);?\n\s*', '', content)
            
            # Replace contracts. with CONTRACTS.
            content = re.sub(r'\bcontracts\.', 'CONTRACTS.', content)
            
            if content != original:
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f'Updated: {filepath}')

print('✅ All imports updated')
UPDATE_IMPORTS

echo ""

# ============================================================================
# DEPLOYMENT COMPLETE
# ============================================================================
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "===================================================="
echo ""
echo -e "${GREEN}✅ All contracts deployed to Mantle Sepolia${NC}"
echo -e "${GREEN}✅ ABIs copied to frontend${NC}"
echo -e "${GREEN}✅ Addresses synced to frontend/src/contracts.ts${NC}"
echo -e "${GREEN}✅ Frontend imports updated${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "  1. Start frontend: cd frontend && npm run dev"
echo "  2. Connect MetaMask to Mantle Sepolia"
echo "  3. Test all functionality"
echo ""
echo -e "${YELLOW}⚠️  Frontend MUST be restarted to load new addresses${NC}"
echo ""


# ============================================================================
# STEP 8: Fix ALL RWA Imports and ABIs (Comprehensive)
# ============================================================================
echo -e "${BLUE}🔧 Step 8/9: Fixing ALL RWA imports and ABIs...${NC}"

python3 <<'FIX_ALL_RWA_COMPREHENSIVE'
import os
import re

print("Fixing all RWA-related imports and exports...\n")

# Step 1: Remove RWA_ADDRESSES export from useRWAContracts hook
hook_file = 'frontend/src/hooks/rwa/useRWAContracts.ts'
if os.path.exists(hook_file):
    with open(hook_file, 'r') as f:
        content = f.read()
    content = re.sub(r'export \{ RWA_ADDRESSES \};?\n?', '', content)
    with open(hook_file, 'w') as f:
        f.write(content)
    print(f'✓ Removed RWA_ADDRESSES export from {hook_file}')

# Step 2: Find ALL files importing from config/rwaContracts or using RWA_ADDRESSES
for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if not file.endswith(('.ts', '.tsx')):
            continue
            
        filepath = os.path.join(root, file)
        
        with open(filepath, 'r') as f:
            content = f.read()
        
        original = content
        
        # Skip if no RWA-related imports
        if 'config/rwaContracts' not in content and 'RWA_ADDRESSES' not in content:
            continue
        
        # Calculate import depth
        depth = filepath.count('/') - 2
        
        # Remove old imports
        content = re.sub(
            r"import \{[^}]*\} from ['\"].*?config/rwaContracts['\"];?\n?",
            "",
            content
        )
        
        # Remove RWA_ADDRESSES from imports
        content = re.sub(r',?\s*RWA_ADDRESSES,?', '', content)
        
        # Add CONTRACTS import if needed
        if 'CONTRACTS' in content and 'import { CONTRACTS }' not in content:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('import ') and 'from' in line:
                    lines.insert(i + 1, f"import {{ CONTRACTS }} from '{'../' * depth}contracts';")
                    break
            content = '\n'.join(lines)
        
        # Detect which ABIs are needed
        needed_abis = set()
        for contract in ['IdentityRegistry', 'RWAIncomeNFT', 'OrbitRWAPool', 'SPVManager', 
                        'SeniorTranche', 'JuniorTranche', 'MockUSDC', 'BundlePool', 'WaterfallDistributor']:
            if f'CONTRACTS.{contract}' in content or f'RWA_ADDRESSES.{contract}' in content:
                needed_abis.add(contract)
        
        # Add ABI imports
        for abi_name in needed_abis:
            abi_import = f"import {abi_name}ABI from '{'../' * depth}contracts/rwa-abis/{abi_name}.json';"
            if abi_import not in content and f'{abi_name}ABI' not in content:
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if 'import { CONTRACTS }' in line:
                        lines.insert(i + 1, abi_import)
                        break
                content = '\n'.join(lines)
        
        # Replace RWA_ADDRESSES with CONTRACTS
        content = re.sub(r'RWA_ADDRESSES\.', 'CONTRACTS.', content)
        
        # Replace getContractConfig calls
        content = re.sub(
            r'\.\.\.getContractConfig\([\'"](\w+)[\'"]\)',
            r'address: CONTRACTS.\1, abi: \1ABI.abi',
            content
        )
        content = re.sub(
            r'getContractConfig\([\'"](\w+)[\'"]\)',
            r'{ address: CONTRACTS.\1, abi: \1ABI.abi }',
            content
        )
        
        # Replace empty abi arrays
        for abi_name in needed_abis:
            content = re.sub(
                f'address: CONTRACTS.{abi_name}, abi: \\[\\]',
                f'address: CONTRACTS.{abi_name}, abi: {abi_name}ABI.abi',
                content
            )
        
        if content != original:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f'✓ Fixed: {filepath}')

print('\n✅ All RWA imports, exports, and ABIs fixed comprehensively')
FIX_ALL_RWA_COMPREHENSIVE

echo ""
echo -e "${GREEN}✅ RWA imports and ABIs fixed${NC}"

# ============================================================================
# STEP 9: Update Wagmi Config for Mantle Sepolia
# ============================================================================
echo -e "${BLUE}🔧 Step 9/10: Updating wagmi config...${NC}"

cat > frontend/src/lib/wagmi.ts << 'WAGMI_CONFIG'
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

const anvilChain = {
    id: 31337,
    name: 'Anvil',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: { http: ['http://localhost:8545'] },
        public: { http: ['http://localhost:8545'] },
    },
} as const;

const mantleSepolia = {
    id: 5003,
    name: 'Mantle Sepolia Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'MNT',
        symbol: 'MNT',
    },
    rpcUrls: {
        default: { http: ['https://rpc.sepolia.mantle.xyz'] },
        public: { http: ['https://rpc.sepolia.mantle.xyz'] },
    },
    blockExplorers: {
        default: { name: 'Mantlescan', url: 'https://sepolia.mantlescan.xyz' },
    },
} as const;

export const wagmiConfig = createConfig({
    chains: [mantleSepolia, anvilChain],
    connectors: [injected()],
    transports: {
        [mantleSepolia.id]: http('https://rpc.sepolia.mantle.xyz'),
        [anvilChain.id]: http('http://localhost:8545'),
    },
});
WAGMI_CONFIG

echo -e "${GREEN}✅ Wagmi config updated for Mantle Sepolia${NC}"
echo ""
