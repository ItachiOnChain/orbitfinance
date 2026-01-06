import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { getContractConfig } from '../../config/rwaContracts';

/**
 * Hook to check if a user's KYC is verified on-chain
 * @param userAddress Optional address to check (defaults to connected wallet)
 */
export function useKYCStatus(userAddress?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = userAddress || connectedAddress;

    return useReadContract({
        ...getContractConfig('IdentityRegistry'),
        functionName: 'isVerified',
        args: targetAddress ? [targetAddress] : undefined,
        query: {
            enabled: !!targetAddress,
        },
    });
}

/**
 * Hook to check if an address is an admin in IdentityRegistry
 */
export function useIsKYCAdmin(userAddress?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = userAddress || connectedAddress;

    return useReadContract({
        ...getContractConfig('IdentityRegistry'),
        functionName: 'isAdmin',
        args: targetAddress ? [targetAddress] : undefined,
        query: {
            enabled: !!targetAddress,
        },
    });
}

/**
 * Hook to verify a user's KYC (admin only)
 */
export function useVerifyUser() {
    return useWriteContract();
}
