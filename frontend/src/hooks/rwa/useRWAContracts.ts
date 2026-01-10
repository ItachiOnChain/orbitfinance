// Wagmi hooks for RWA contracts
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CONTRACTS } from '../../contracts';
import IdentityRegistryABI from '../../contracts/rwa-abis/IdentityRegistry.json';
import RWAIncomeNFTABI from '../../contracts/rwa-abis/RWAIncomeNFT.json';
import OrbitRWAPoolABI from '../../contracts/rwa-abis/OrbitRWAPool.json';
import MockUSDCABI from '../../contracts/rwa-abis/MockUSDC.json';

// ============================================================================
// Read Hooks
// ============================================================================

export function useUserDebt(userAddress?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = userAddress || connectedAddress;

    return useReadContract({
        ...{ address: CONTRACTS.OrbitRWAPool, abi: OrbitRWAPoolABI.abi },
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
        ...{ address: CONTRACTS.RWAIncomeNFT, abi: RWAIncomeNFTABI.abi },
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
        ...{ address: CONTRACTS.RWAIncomeNFT, abi: RWAIncomeNFTABI.abi },
        functionName: 'tokensOfOwner',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

export function useNFTMetadata(tokenId: bigint | undefined) {
    return useReadContract({
        ...{ address: CONTRACTS.RWAIncomeNFT, abi: RWAIncomeNFTABI.abi },
        functionName: 'getMetadata',
        args: tokenId !== undefined ? [tokenId] : undefined,
        query: {
            enabled: tokenId !== undefined,
        },
    });
}

export function useIsNFTLocked(tokenId: bigint | undefined) {
    return useReadContract({
        ...{ address: CONTRACTS.OrbitRWAPool, abi: OrbitRWAPoolABI.abi },
        functionName: 'isNFTLocked',
        args: tokenId !== undefined ? [tokenId] : undefined,
        query: {
            enabled: tokenId !== undefined,
        },
    });
}

export function useSeniorTrancheTVL() {
    return useReadContract({
        ...{ address: CONTRACTS.SeniorTranche, abi: [] },
        functionName: 'totalAssets',
    });
}

export function useJuniorTrancheTVL() {
    return useReadContract({
        ...{ address: CONTRACTS.JuniorTranche, abi: [] },
        functionName: 'totalAssets',
    });
}

export function useSeniorTrancheBalance() {
    const { address } = useAccount();
    return useReadContract({
        ...{ address: CONTRACTS.SeniorTranche, abi: [] },
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
        ...{ address: CONTRACTS.JuniorTranche, abi: [] },
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
        ...{ address: CONTRACTS.MockUSDC, abi: [] },
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
        ...{ address: CONTRACTS.IdentityRegistry, abi: IdentityRegistryABI.abi },
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
        ...{ address: CONTRACTS.OrbitRWAPool, abi: OrbitRWAPoolABI.abi },
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
        ...{ address: CONTRACTS.RWAIncomeNFT, abi: RWAIncomeNFTABI.abi },
        functionName: 'mint' as const,
        args: [to as `0x${string}`, assetName, assetType, monthlyIncome, duration, totalValue] as const,
    }),

    approveNFT: (spender: string, tokenId: bigint) => ({
        ...{ address: CONTRACTS.RWAIncomeNFT, abi: RWAIncomeNFTABI.abi },
        functionName: 'approve' as const,
        args: [spender as `0x${string}`, tokenId] as const,
    }),

    depositAndBorrow: (nftId: bigint, amount: bigint, enableAutoRepay: boolean) => ({
        ...{ address: CONTRACTS.OrbitRWAPool, abi: OrbitRWAPoolABI.abi },
        functionName: 'depositAndBorrow' as const,
        args: [nftId, amount, enableAutoRepay] as const,
    }),

    approveUSDC: (spender: string, amount: bigint) => ({
        ...{ address: CONTRACTS.MockUSDC, abi: MockUSDCABI.abi },
        functionName: 'approve' as const,
        args: [spender as `0x${string}`, amount] as const,
    }),

    depositToSeniorTranche: (assets: bigint, receiver: string) => ({
        ...{ address: CONTRACTS.SeniorTranche, abi: [] },
        functionName: 'deposit' as const,
        args: [assets, receiver as `0x${string}`] as const,
    }),

    depositToJuniorTranche: (assets: bigint, receiver: string) => ({
        ...{ address: CONTRACTS.JuniorTranche, abi: [] },
        functionName: 'deposit' as const,
        args: [assets, receiver as `0x${string}`] as const,
    }),

    withdrawFromSeniorTranche: (assets: bigint, receiver: string, owner: string) => ({
        ...{ address: CONTRACTS.SeniorTranche, abi: [] },
        functionName: 'withdraw' as const,
        args: [assets, receiver as `0x${string}`, owner as `0x${string}`] as const,
    }),

    withdrawFromJuniorTranche: (assets: bigint, receiver: string, owner: string) => ({
        ...{ address: CONTRACTS.JuniorTranche, abi: [] },
        functionName: 'withdraw' as const,
        args: [assets, receiver as `0x${string}`, owner as `0x${string}`] as const,
    }),

    distributeYield: (amount: bigint) => ({
        ...{ address: CONTRACTS.WaterfallDistributor, abi: [] },
        functionName: 'distributeYield' as const,
        args: [amount] as const,
    }),

    approveAsset: (user: string, metadata: string) => ({
        ...{ address: CONTRACTS.SPVManager, abi: [] },
        functionName: 'approveAsset' as const,
        args: [user as `0x${string}`, metadata] as const,
    }),

    repayDebt: (amount: bigint) => ({
        ...{ address: CONTRACTS.OrbitRWAPool, abi: OrbitRWAPoolABI.abi },
        functionName: 'repay' as const,
        args: [amount] as const,
    }),

    repayDebtOnBehalfOf: (borrower: string, amount: bigint) => ({
        ...{ address: CONTRACTS.OrbitRWAPool, abi: OrbitRWAPoolABI.abi },
        functionName: 'repayOnBehalfOf' as const,
        args: [borrower as `0x${string}`, amount] as const,
    }),

    withdrawCollateral: (nftId: bigint) => ({
        ...{ address: CONTRACTS.OrbitRWAPool, abi: OrbitRWAPoolABI.abi },
        functionName: 'withdrawCollateral' as const,
        args: [nftId] as const,
    }),

    verifyUser: (userAddress: `0x${string}`) => ({
        ...{ address: CONTRACTS.IdentityRegistry, abi: IdentityRegistryABI.abi },
        functionName: 'verifyUser' as const,
        args: [userAddress] as const,
    }),
};

// Export contract addresses for easy access
