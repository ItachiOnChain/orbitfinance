import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';

export function usePendingYield(accountAddress: `0x${string}` | undefined) {
    const [pendingYield, setPendingYield] = useState<bigint>(0n);
    const [updateCount, setUpdateCount] = useState(0);

    // Get storage keys for this account
    const getStorageKey = (key: string) => accountAddress ? `${accountAddress}_${key}` : null;

    // Initialize UI values from localStorage or default to 0n
    const [uiDebt, setUiDebt] = useState<bigint>(() => {
        const key = getStorageKey('uiDebt');
        if (!key) return 0n;
        const stored = localStorage.getItem(key);
        return stored ? BigInt(stored) : 0n;
    });

    const [uiCredit, setUiCredit] = useState<bigint>(() => {
        const key = getStorageKey('uiCredit');
        if (!key) return 0n;
        const stored = localStorage.getItem(key);
        return stored ? BigInt(stored) : 0n;
    });

    // Fetch current on-chain debt
    const { data: totalDebt } = useReadContract({
        address: accountAddress,
        abi: [{
            name: 'totalDebt',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ type: 'uint256' }],
        }],
        functionName: 'totalDebt',
        query: {
            enabled: !!accountAddress,
            refetchInterval: 12000,
        },
    });

    // Fetch current on-chain accumulated credit
    const { data: accumulatedCredit } = useReadContract({
        address: accountAddress,
        abi: [{
            name: 'accumulatedCredit',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ type: 'uint256' }],
        }],
        functionName: 'accumulatedCredit',
        query: {
            enabled: !!accountAddress,
            refetchInterval: 12000,
        },
    });

    // Initialize UI values ONLY if localStorage is empty (first time)
    useEffect(() => {
        if (!accountAddress) return;

        const debtKey = getStorageKey('uiDebt');
        const creditKey = getStorageKey('uiCredit');

        if (!debtKey || !creditKey) return;

        const hasStoredDebt = localStorage.getItem(debtKey);
        const hasStoredCredit = localStorage.getItem(creditKey);

        // Only initialize from on-chain if no stored values exist
        if (!hasStoredDebt && totalDebt !== undefined) {
            setUiDebt(totalDebt);
            localStorage.setItem(debtKey, totalDebt.toString());
            setPendingYield(0n);
            setUpdateCount(0);
        }

        if (!hasStoredCredit && accumulatedCredit !== undefined) {
            setUiCredit(accumulatedCredit);
            localStorage.setItem(creditKey, accumulatedCredit.toString());
        }
    }, [totalDebt, accumulatedCredit, accountAddress]);

    // Persist UI values to localStorage whenever they change
    useEffect(() => {
        if (!accountAddress) return;
        const key = getStorageKey('uiDebt');
        if (key) {
            localStorage.setItem(key, uiDebt.toString());
        }
    }, [uiDebt, accountAddress]);

    useEffect(() => {
        if (!accountAddress) return;
        const key = getStorageKey('uiCredit');
        if (key) {
            localStorage.setItem(key, uiCredit.toString());
        }
    }, [uiCredit, accountAddress]);

    // Generate yield at intervals: 10s updates for visibility
    useEffect(() => {
        if (!uiDebt || uiDebt === 0n) {
            return;
        }

        const updateYield = () => {
            const debtNumber = Number(formatEther(uiDebt));

            // Increased rate for visibility: 1% of debt every 10 seconds
            // This simulates earning yield that pays down debt
            const yieldPercentage = 0.01; // 1% per update
            const yieldAmount = BigInt(Math.floor(debtNumber * yieldPercentage * 1e18));

            if (yieldAmount > 0n) {
                setPendingYield(prev => prev + yieldAmount);
                setUiDebt(prev => prev > yieldAmount ? prev - yieldAmount : 0n);
                setUiCredit(prev => prev + yieldAmount); // Increase accumulated credit
                setUpdateCount(prev => prev + 1);
            }
        };

        // First update after 10 seconds, then every 10 seconds
        const firstTimeout = setTimeout(() => {
            updateYield();
            const interval = setInterval(updateYield, 10000); // Every 10 seconds
            return () => clearInterval(interval);
        }, 10000);

        return () => clearTimeout(firstTimeout);
    }, [uiDebt, updateCount]);

    return {
        pendingYield,
        uiDebt,
        uiCredit, // UI accumulated credit that increases
        onChainDebt: totalDebt,
        onChainCredit: accumulatedCredit,
    };
}
