# Mantle Testnet Deployment Guide

## Prerequisites

Before deploying to Mantle Testnet, ensure you have:

1. **Funded Wallet**: A wallet with MNT tokens on Mantle Testnet
   - Get test MNT from: https://faucet.sepolia.mantle.xyz
   - Minimum recommended: 0.5 MNT for gas fees

2. **Private Key**: Your wallet's private key (keep this secure!)

3. **Environment Setup**: Foundry installed and working

## Quick Start

### 1. Configure Environment

Copy the example environment file and add your private key:

```bash
cp .env.mantle.example .env
```

Edit `.env` and add your private key:

```bash
MANTLE_PRIVATE_KEY=0x...  # Your private key here
```

### 2. Deploy All Contracts

Run the deployment script:

```bash
./deploy-mantle.sh
```

This will:
- Deploy all Crypto contracts (WETH, USDC, vaults, etc.)
- Deploy all RWA contracts (NFTs, tranches, pool, etc.)
- Deploy Bundle Pool contract
- Copy ABIs to frontend
- Update frontend configuration with new addresses

### 3. Verify Deployment

The script will output all deployed contract addresses. You can verify them on:
- **Mantle Testnet Explorer**: https://sepolia.mantlescan.xyz

Deployment addresses are saved to:
- `deployments/mantle-rwa.json` (RWA contracts)
- `frontend/src/contracts/addresses.ts` (Crypto contracts)

## Frontend Integration

### Add Mantle Testnet to MetaMask

1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Enter the following details:
   - **Network Name**: Mantle Testnet
   - **RPC URL**: https://rpc.sepolia.mantle.xyz
   - **Chain ID**: 5003
   - **Currency Symbol**: MNT
   - **Block Explorer**: https://sepolia.mantlescan.xyz

### Test Frontend

1. Switch MetaMask to Mantle Testnet
2. Open frontend: `http://localhost:5174`
3. Connect your wallet
4. Test both Crypto and RWA modes

## Deployed Contracts

After deployment, you'll have:

### Crypto Mode
- AccountFactory
- DebtManager
- VaultRegistry
- PriceOracle
- orUSD (stablecoin)
- WETH & USDC (mock tokens)
- WETH_Vault & USDC_Vault
- Yield Strategies

### RWA Mode
- IdentityRegistry (KYC)
- RWAIncomeNFT (asset tokenization)
- OrbitRWAPool (lending pool)
- SPVManager (institutional management)
- SeniorTranche & JuniorTranche
- WaterfallDistributor (yield distribution)
- MockUSDC (RWA stablecoin)
- BundlePool (Mantle integration)

## Troubleshooting

### "MANTLE_PRIVATE_KEY not set"
- Make sure you've added your private key to `.env`
- The key should start with `0x`

### "Insufficient funds for gas"
- Get more test MNT from the faucet
- Check your balance on Mantle Explorer

### "Transaction reverted"
- Check if you have enough MNT for gas
- Verify the RPC URL is correct
- Try again with `--legacy` flag (already included in script)

### Frontend not detecting Mantle
- Make sure MetaMask is on Mantle Testnet
- Clear browser cache and reload
- Check browser console for errors

## Re-deploying

To redeploy all contracts:

```bash
./deploy-mantle.sh
```

The script is idempotent and will:
- Deploy fresh contracts
- Update all addresses
- Overwrite previous deployment data

## Contract Verification (Optional)

To verify contracts on Mantle Explorer:

1. Get an API key from https://sepolia.mantlescan.xyz
2. Add to `.env`:
   ```bash
   MANTLE_EXPLORER_API_KEY=your_api_key
   ```
3. Verify each contract:
   ```bash
   forge verify-contract <ADDRESS> <CONTRACT_NAME> \
     --chain-id 5003 \
     --etherscan-api-key $MANTLE_EXPLORER_API_KEY
   ```

## Support

For issues or questions:
- Check deployment logs for error messages
- Verify all prerequisites are met
- Ensure Mantle Testnet RPC is accessible
- Check Mantle Testnet status: https://status.mantle.xyz

## Next Steps

After successful deployment:
1. ✅ Test Crypto mode functionality
2. ✅ Test RWA mode functionality
3. ✅ Test Bundle Pool investments
4. ✅ Verify all contract interactions work
5. ✅ Document any issues or improvements needed
