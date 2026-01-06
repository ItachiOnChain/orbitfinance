// Wagmi hooks for RWA contracts
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { getContractConfig, RWA_ADDRESSES } from '../../config/rwaContracts';

// ============================================================================
// Read Hooks
// ============================================================================

export function useUserDebt(userAddress?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = userAddress || connectedAddress;

    return useReadContract({
        ...getContractConfig('OrbitRWAPool'),
        functionName: 'getUserDebt',
        args: targetAddress ? [targetAddress] : undefined,
        query: {
            enabled: !!targetAddress,
        },
    });
}

export function useUserNFTBalance() {
    const { address } = useAccount();
    return useReadContract({
        ...getContractConfig('RWAIncomeNFT'),
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

export function useUserNFTTokens() {
    const { address } = useAccount();
    return useReadContract({
        ...getContractConfig('RWAIncomeNFT'),
        functionName: 'tokensOfOwner',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

export function useNFTMetadata(tokenId: bigint | undefined) {
    return useReadContract({
        ...getContractConfig('RWAIncomeNFT'),
        functionName: 'getMetadata',
        args: tokenId !== undefined ? [tokenId] : undefined,
        query: {
            enabled: tokenId !== undefined,
        },
    });
}

export function useIsNFTLocked(tokenId: bigint | undefined) {
    return useReadContract({
        ...getContractConfig('OrbitRWAPool'),
        functionName: 'isNFTLocked',
        args: tokenId !== undefined ? [tokenId] : undefined,
        query: {
            enabled: tokenId !== undefined,
        },
    });
}

export function useSeniorTrancheTVL() {
    return useReadContract({
        ...getContractConfig('SeniorTranche'),
        functionName: 'totalAssets',
    });
}

export function useJuniorTrancheTVL() {
    return useReadContract({
        ...getContractConfig('JuniorTranche'),
        functionName: 'totalAssets',
    });
}

export function useSeniorTrancheBalance() {
    const { address } = useAccount();
    return useReadContract({
        ...getContractConfig('SeniorTranche'),
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

export function useJuniorTrancheBalance() {
    const { address } = useAccount();
    return useReadContract({
        ...getContractConfig('JuniorTranche'),
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

export function useUSDCBalance() {
    const { address } = useAccount();
    return useReadContract({
        ...getContractConfig('MockUSDC'),
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

export function useIsKYCVerified() {
    const { address } = useAccount();
    return useReadContract({
        ...getContractConfig('IdentityRegistry'),
        functionName: 'isVerified',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

// ============================================================================
// Write Hooks
// ============================================================================

export function useMintNFT() {
    return useWriteContract();
}

export function useDepositAndBorrow() {
    return useWriteContract();
}

export function useApproveNFT() {
    return useWriteContract();
}

export function useApproveUSDC() {
    return useWriteContract();
}

export function useDepositToSeniorTranche() {
    return useWriteContract();
}

export function useDepositToJuniorTranche() {
    return useWriteContract();
}

export function useWithdrawFromSeniorTranche() {
    return useWriteContract();
}

export function useWithdrawFromJuniorTranche() {
    return useWriteContract();
}

export function useDistributeYield() {
    return useWriteContract();
}

export function useApproveAsset() {
    return useWriteContract();
}

export function useUserCollateralNFTs(userAddress?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = userAddress || connectedAddress;

    return useReadContract({
        ...getContractConfig('OrbitRWAPool'),
        functionName: 'getUserCollateralNFTs',
        args: targetAddress ? [targetAddress] : undefined,
        query: {
            enabled: !!targetAddress,
        },
    });
}

export function useRepayDebt() {
    return useWriteContract();
}

export function useRepayDebtOnBehalfOf() {
    return useWriteContract();
}

export function useWithdrawCollateral() {
    return useWriteContract();
}

// ============================================================================
// Helper functions for write operations
// ============================================================================

export const RWAContractCalls = {
    mintNFT: (to: string, assetName: string, assetType: number, monthlyIncome: bigint, duration: bigint, totalValue: bigint) => ({
        ...getContractConfig('RWAIncomeNFT'),
        functionName: 'mint' as const,
        args: [to as `0x${string}`, assetName, assetType, monthlyIncome, duration, totalValue] as const,
    }),

    approveNFT: (spender: string, tokenId: bigint) => ({
        ...getContractConfig('RWAIncomeNFT'),
        functionName: 'approve' as const,
        args: [spender as `0x${string}`, tokenId] as const,
    }),

    depositAndBorrow: (nftId: bigint, amount: bigint, enableAutoRepay: boolean) => ({
        ...getContractConfig('OrbitRWAPool'),
        functionName: 'depositAndBorrow' as const,
        args: [nftId, amount, enableAutoRepay] as const,
    }),

    approveUSDC: (spender: string, amount: bigint) => ({
        ...getContractConfig('MockUSDC'),
        functionName: 'approve' as const,
        args: [spender as `0x${string}`, amount] as const,
    }),

    depositToSeniorTranche: (assets: bigint, receiver: string) => ({
        ...getContractConfig('SeniorTranche'),
        functionName: 'deposit' as const,
        args: [assets, receiver as `0x${string}`] as const,
    }),

    depositToJuniorTranche: (assets: bigint, receiver: string) => ({
        ...getContractConfig('JuniorTranche'),
        functionName: 'deposit' as const,
        args: [assets, receiver as `0x${string}`] as const,
    }),

    withdrawFromSeniorTranche: (assets: bigint, receiver: string, owner: string) => ({
        ...getContractConfig('SeniorTranche'),
        functionName: 'withdraw' as const,
        args: [assets, receiver as `0x${string}`, owner as `0x${string}`] as const,
    }),

    withdrawFromJuniorTranche: (assets: bigint, receiver: string, owner: string) => ({
        ...getContractConfig('JuniorTranche'),
        functionName: 'withdraw' as const,
        args: [assets, receiver as `0x${string}`, owner as `0x${string}`] as const,
    }),

    distributeYield: (amount: bigint) => ({
        ...getContractConfig('WaterfallDistributor'),
        functionName: 'distributeYield' as const,
        args: [amount] as const,
    }),

    approveAsset: (user: string, metadata: string) => ({
        ...getContractConfig('SPVManager'),
        functionName: 'approveAsset' as const,
        args: [user as `0x${string}`, metadata] as const,
    }),

    repayDebt: (amount: bigint) => ({
        ...getContractConfig('OrbitRWAPool'),
        functionName: 'repay' as const,
        args: [amount] as const,
    }),

    repayDebtOnBehalfOf: (borrower: string, amount: bigint) => ({
        ...getContractConfig('OrbitRWAPool'),
        functionName: 'repayOnBehalfOf' as const,
        args: [borrower as `0x${string}`, amount] as const,
    }),

    withdrawCollateral: (nftId: bigint) => ({
        ...getContractConfig('OrbitRWAPool'),
        functionName: 'withdrawCollateral' as const,
        args: [nftId] as const,
    }),

    verifyUser: (userAddress: `0x${string}`) => ({
        ...getContractConfig('IdentityRegistry'),
        functionName: 'verifyUser' as const,
        args: [userAddress] as const,
    }),
};

// Export contract addresses for easy access
export { RWA_ADDRESSES };
