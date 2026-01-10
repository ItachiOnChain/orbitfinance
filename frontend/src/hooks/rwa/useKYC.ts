import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACTS } from '../../contracts';
import IdentityRegistryABI from '../../contracts/rwa-abis/IdentityRegistry.json';

/**
 * Hook to check if a user's KYC is verified on-chain
 * @param userAddress Optional address to check (defaults to connected wallet)
 */
export function useKYCStatus(userAddress?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = userAddress || connectedAddress;

    return useReadContract({
        ...{ address: CONTRACTS.IdentityRegistry, abi: IdentityRegistryABI.abi },
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
        ...{ address: CONTRACTS.IdentityRegistry, abi: IdentityRegistryABI.abi },
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
