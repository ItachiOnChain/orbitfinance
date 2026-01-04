import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import AccountFactoryABI from '../contracts/abis/AccountFactory.json';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';
import ERC4626VaultABI from '../contracts/abis/ERC4626Vault.json';

export function useOrbitAccount(userAddress: `0x${string}` | undefined) {
    const { data: accountAddress } = useReadContract({
        address: CONTRACTS.anvil.AccountFactory as `0x${string}`,
        abi: AccountFactoryABI.abi,
        functionName: 'getAccount',
        args: userAddress ? [userAddress] : undefined,
        query: {
            enabled: !!userAddress,
        },
    });

    const { data: totalDebt } = useReadContract({
        address: accountAddress as `0x${string}`,
        abi: OrbitAccountABI.abi,
        functionName: 'totalDebt',
        query: {
            enabled: !!accountAddress,
        },
    });

    const { data: accumulatedCredit } = useReadContract({
        address: accountAddress as `0x${string}`,
        abi: OrbitAccountABI.abi,
        functionName: 'accumulatedCredit',
        query: {
            enabled: !!accountAddress,
        },
    });

    const { data: depositedAssets } = useReadContract({
        address: accountAddress as `0x${string}`,
        abi: OrbitAccountABI.abi,
        functionName: 'getDepositedAssets',
        query: {
            enabled: !!accountAddress,
        },
    });

    // Fetch vault shares for WETH and USDC vaults with refetch
    const { data: vaultBalances, refetch } = useReadContracts({
        contracts: [
            {
                address: CONTRACTS.anvil.WETH_Vault as `0x${string}`,
                abi: ERC4626VaultABI.abi,
                functionName: 'balanceOf',
                args: accountAddress ? [accountAddress] : undefined,
            },
            {
                address: CONTRACTS.anvil.USDC_Vault as `0x${string}`,
                abi: ERC4626VaultABI.abi,
                functionName: 'balanceOf',
                args: accountAddress ? [accountAddress] : undefined,
            },
        ],
        query: {
            enabled: !!accountAddress,
            refetchInterval: 3000, // Refetch every 3 seconds
        },
    });

    const wethShares = vaultBalances?.[0]?.result as bigint | undefined;
    const usdcShares = vaultBalances?.[1]?.result as bigint | undefined;

    return {
        accountAddress: accountAddress as `0x${string}` | undefined,
        totalDebt: totalDebt as bigint | undefined,
        accumulatedCredit: accumulatedCredit as bigint | undefined,
        depositedAssets: depositedAssets as readonly `0x${string}`[] | undefined,
        wethShares,
        usdcShares,
        refetch,
    };
}
