import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useEffect, useState, useRef } from 'react';

export function usePendingYield(accountAddress: `0x${string}` | undefined) {
    const [pendingYield, setPendingYield] = useState<bigint>(0n);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Get storage keys for this account
    const getStorageKey = (key: string) => accountAddress ? `${accountAddress}_${key}` : null;

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

    // Initialize from localStorage FIRST, then on-chain if needed
    const [uiDebt, setUiDebt] = useState<bigint>(() => {
        if (!accountAddress) return 0n;
        const key = getStorageKey('uiDebt');
        if (!key) return 0n;
        const stored = localStorage.getItem(key);
        if (stored && BigInt(stored) > 0n) {
            console.log('🟢 Loaded uiDebt from localStorage:', formatEther(BigInt(stored)));
            return BigInt(stored);
        }
        return 0n;
    });

    const [uiCredit, setUiCredit] = useState<bigint>(() => {
        if (!accountAddress) return 0n;
        const key = getStorageKey('uiCredit');
        if (!key) return 0n;
        const stored = localStorage.getItem(key);
        if (stored) {
            console.log('🟢 Loaded uiCredit from localStorage:', formatEther(BigInt(stored)));
            return BigInt(stored);
        }
        return 0n;
    });

    // Only sync with on-chain if localStorage is empty
    useEffect(() => {
        if (!accountAddress || !totalDebt) return;
        if (uiDebt > 0n) return; // Already have localStorage value

        console.log('🔄 No localStorage, initializing from on-chain:', formatEther(totalDebt));
        setUiDebt(totalDebt);
        setUiCredit(accumulatedCredit || 0n);
    }, [totalDebt, accumulatedCredit, accountAddress, uiDebt]);

    // Persist to localStorage
    useEffect(() => {
        if (!accountAddress || uiDebt === 0n) return;
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

    // Yield timer - ONLY runs once, no dependencies on uiDebt
    useEffect(() => {
        if (!accountAddress || uiDebt === 0n) return;

        console.log('✅ Setting up ONE-TIME yield timer');

        const updateYield = () => {
            setUiDebt(currentDebt => {
                if (currentDebt === 0n) return 0n;

                const debtNumber = Number(formatEther(currentDebt));
                const yieldPerSecond = debtNumber * 0.05 / 31536000;
                const yieldAmount = BigInt(Math.floor(yieldPerSecond * 10 * 1e18));

                if (yieldAmount > 0n) {
                    setUiCredit(prev => prev + yieldAmount);
                    setPendingYield(prev => prev + yieldAmount);
                    return currentDebt > yieldAmount ? currentDebt - yieldAmount : 0n;
                }
                return currentDebt;
            });
        };

        timerRef.current = setTimeout(() => {
            updateYield();
            intervalRef.current = setInterval(updateYield, 10000);
        }, 10000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [accountAddress]); // Only depends on accountAddress!

    return {
        pendingYield,
        uiDebt,
        uiCredit,
        onChainDebt: totalDebt,
        onChainCredit: accumulatedCredit,
    };
}
