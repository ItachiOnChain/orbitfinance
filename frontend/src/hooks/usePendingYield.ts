import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useEffect, useState, useRef } from 'react';

export function usePendingYield(accountAddress: `0x${string}` | undefined) {
    const [pendingYield, setPendingYield] = useState<bigint>(0n);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const initializedRef = useRef(false);

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

    const [uiDebt, setUiDebt] = useState<bigint>(0n);
    const [uiCredit, setUiCredit] = useState<bigint>(0n);

    // Initialize ONCE from localStorage or on-chain
    useEffect(() => {
        if (!accountAddress || initializedRef.current) return;

        const debtKey = getStorageKey('uiDebt');
        const creditKey = getStorageKey('uiCredit');
        if (!debtKey || !creditKey) return;

        // Try localStorage first
        const storedDebt = localStorage.getItem(debtKey);
        const storedCredit = localStorage.getItem(creditKey);

        if (storedDebt && BigInt(storedDebt) > 0n) {
            // Use localStorage values
            setUiDebt(BigInt(storedDebt));
            setUiCredit(storedCredit ? BigInt(storedCredit) : 0n);
            initializedRef.current = true;
        } else if (totalDebt && totalDebt > 0n) {
            // First time: use on-chain
            setUiDebt(totalDebt);
            setUiCredit(accumulatedCredit || 0n);
            localStorage.setItem(debtKey, totalDebt.toString());
            localStorage.setItem(creditKey, (accumulatedCredit || 0n).toString());
            initializedRef.current = true;
        }
    }, [accountAddress, totalDebt, accumulatedCredit]);

    // Save to localStorage when values change
    useEffect(() => {
        if (!accountAddress || uiDebt === 0n) return;
        const key = getStorageKey('uiDebt');
        if (key) localStorage.setItem(key, uiDebt.toString());
    }, [uiDebt, accountAddress]);

    useEffect(() => {
        if (!accountAddress) return;
        const key = getStorageKey('uiCredit');
        if (key) localStorage.setItem(key, uiCredit.toString());
    }, [uiCredit, accountAddress]);

    // Start timer ONCE when initialized
    useEffect(() => {
        if (!initializedRef.current || uiDebt === 0n) return;
        if (timerRef.current) return; // Already started

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
    }, [initializedRef.current, uiDebt]);

    return {
        pendingYield,
        uiDebt,
        uiCredit,
        onChainDebt: totalDebt,
        onChainCredit: accumulatedCredit,
    };
}
