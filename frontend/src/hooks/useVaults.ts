import { CONTRACTS } from '../contracts';

export interface Vault {
    address: string;
    asset: string;
    name: string;
    tvl: bigint;
    cap: bigint;
    ltv: number;
    apy: string;
}

export function useVaults() {
    // Vault data queries removed - using static configuration
    const vaults: Vault[] = [
        {
            address: CONTRACTS.WETH_Vault,
            asset: CONTRACTS.WETH,
            name: 'WETH Vault',
            tvl: 0n,
            cap: 0n,
            ltv: 50,
            apy: '5.2',
        },
        {
            address: CONTRACTS.USDC_Vault,
            asset: CONTRACTS.USDC,
            name: 'USDC Vault',
            tvl: 0n,
            cap: 0n,
            ltv: 75,
            apy: '8.5',
        },
    ];

    return { vaults, isLoading: false };
}
