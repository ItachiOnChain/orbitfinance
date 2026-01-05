#!/bin/bash

# Orbit Finance - Deploy to Anvil and Sync Frontend
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying Orbit Finance to Anvil..."
echo ""

# 1. Deploy contracts
echo "📝 Deploying contracts..."
# Export private key for the script to use
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

forge script scripts/Deploy.s.sol --tc DeployOrbitFinance \
  --rpc-url http://localhost:8545 \
  --broadcast

echo ""
echo "✅ Contracts deployed!"
echo ""

# 2. Copy ABIs to frontend
echo "📋 Copying ABIs to frontend..."
mkdir -p frontend/src/contracts/abis
cp out/AccountFactory.sol/AccountFactory.json frontend/src/contracts/abis/
cp out/OrbitAccount.sol/OrbitAccount.json frontend/src/contracts/abis/
cp out/ERC4626Vault.sol/ERC4626Vault.json frontend/src/contracts/abis/
cp out/orUSD.sol/orUSD.json frontend/src/contracts/abis/

echo "✅ ABIs copied!"
echo ""

# 3. Extract and update contract addresses
echo "🔗 Updating contract addresses..."
python3 << 'PYTHON_SCRIPT'
import json

# Read deployment output
with open('broadcast/Deploy.s.sol/31337/run-latest.json', 'r') as f:
    data = json.load(f)

# Extract addresses in order of deployment
addresses = {}
for tx in data['transactions']:
    if tx.get('contractName'):
        name = tx['contractName']
        addr = tx['contractAddress']
        
        # Map contract names to our naming convention
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

print('✅ Addresses updated!')
print('')
print('📍 Contract Addresses:')
print(f'  AccountFactory: {addresses.get("AccountFactory", "")}')
print(f'  DebtManager: {addresses.get("DebtManager", "")}')
print(f'  VaultRegistry: {addresses.get("VaultRegistry", "")}')
print(f'  PriceOracle: {addresses.get("MockPriceOracle", "")}')
print(f'  orUSD: {addresses.get("orUSD", "")}')
print(f'  WETH: {weth}')
print(f'  USDC: {usdc}')
print(f'  WETH Vault: {weth_vault}')
print(f'  USDC Vault: {usdc_vault}')
PYTHON_SCRIPT

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Frontend will auto-reload with new addresses."
echo "Test account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo ""
