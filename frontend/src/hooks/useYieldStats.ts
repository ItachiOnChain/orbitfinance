import { useReadContract } from 'wagmi';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';

export function useYieldStats(accountAddress: `0x${string}` | undefined) {
    // Fetch accumulated credit
    const { data: accumulatedCredit } = useReadContract({
        address: accountAddress,
        abi: OrbitAccountABI.abi,
        functionName: 'accumulatedCredit',
        query: {
            enabled: !!accountAddress,
            refetchInterval: 12000, // Refetch every block (~12 seconds)
        },
    });

    // Fetch total debt with auto-refresh
    const { data: totalDebt } = useReadContract({
        address: accountAddress,
        abi: OrbitAccountABI.abi,
        functionName: 'totalDebt',
        query: {
            enabled: !!accountAddress,
            refetchInterval: 12000, // Refetch every block to show debt decreasing
        },
    });

    return {
        accumulatedCredit: accumulatedCredit as bigint | undefined,
        totalDebt: totalDebt as bigint | undefined,
    };
}
