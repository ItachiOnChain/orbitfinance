import { useReadContract } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import VaultRegistryABI from '../contracts/abis/VaultRegistry.json';

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
    const { data: wethVaultData } = useReadContract({
        address: CONTRACTS.anvil.WETH_Vault as `0x${string}`,
        abi: VaultRegistryABI.abi,
        functionName: 'asset',
    });

    const { data: usdcVaultData } = useReadContract({
        address: CONTRACTS.anvil.USDC_Vault as `0x${string}`,
        abi: VaultRegistryABI.abi,
        functionName: 'asset',
    });

    const vaults: Vault[] = [
        {
            address: CONTRACTS.anvil.WETH_Vault,
            asset: CONTRACTS.anvil.WETH,
            name: 'WETH Vault',
            tvl: 0n,
            cap: 0n,
            ltv: 50,
            apy: '5.2',
        },
        {
            address: CONTRACTS.anvil.USDC_Vault,
            asset: CONTRACTS.anvil.USDC,
            name: 'USDC Vault',
            tvl: 0n,
            cap: 0n,
            ltv: 75,
            apy: '8.5',
        },
    ];

    return { vaults, isLoading: false };
}
