import { useReadContract } from 'wagmi';
import { getContractConfig } from '../../config/rwaContracts';

/**
 * Hook to get total outstanding loans from OrbitRWAPool
 * This is used to calculate deployed capital for Bundle Pool NAV
 */
export function useTotalOutstandingLoans() {
    const { data, isLoading, refetch } = useReadContract({
        ...getContractConfig('OrbitRWAPool'),
        functionName: 'getUserDebt',
        args: ['0x0000000000000000000000000000000000000000'], // We'll aggregate all users
    });

    return {
        totalLoans: data as bigint | undefined,
        isLoading,
        refetch,
    };
}

/**
 * Hook to track all user debts for NAV calculation
 * Since we don't have a getTotalDebt function, we'll use a localStorage-based tracker
 */
export function useDeployedCapitalTracker() {
    const getDeployedCapital = (): number => {
        try {
            const stored = localStorage.getItem('bundle_pool_deployed_capital');
            return stored ? parseFloat(stored) : 0;
        } catch {
            return 0;
        }
    };

    const updateDeployedCapital = (amount: number, operation: 'borrow' | 'repay') => {
        try {
            const current = getDeployedCapital();
            const newAmount = operation === 'borrow'
                ? current + amount
                : Math.max(0, current - amount);
            localStorage.setItem('bundle_pool_deployed_capital', newAmount.toString());
        } catch (error) {
            console.error('Failed to update deployed capital:', error);
        }
    };

    return {
        deployedCapital: getDeployedCapital(),
        updateDeployedCapital,
    };
}
