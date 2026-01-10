// Removed unused import
import { formatEther } from 'viem';
import { useEffect, useState, useRef } from 'react';

export function usePendingYield(
    accountAddress: `0x${string}` | undefined,
    onChainDebt: bigint | undefined,
    onChainCredit: bigint | undefined
) {
    const [pendingYield, setPendingYield] = useState<bigint>(0n);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const initializedRef = useRef(false);

    // Get storage keys for this account
    const getStorageKey = (key: string) => accountAddress ? `${accountAddress}_${key}` : null;

    const [uiDebt, setUiDebt] = useState<bigint>(0n);
    const [uiCredit, setUiCredit] = useState<bigint>(0n);
    const lastOnChainDebtRef = useRef<bigint | undefined>(undefined);
    const lastOnChainCreditRef = useRef<bigint | undefined>(undefined);

    // Initialize ONCE from on-chain (source of truth) or localStorage (UI state)
    useEffect(() => {
        if (!accountAddress || initializedRef.current) return;

        const creditKey = getStorageKey('uiCredit');
        if (!creditKey) return;

        // Wait for on-chain data to load (source of truth)
        if (onChainDebt !== undefined && onChainCredit !== undefined) {
            // 🔹 DEBT: Always ephemeral - NEVER use localStorage
            // Always initialize from on-chain, discard any previous state
            setUiDebt(onChainDebt);

            // 🔹 CREDIT: Persistent - use localStorage if available
            if (onChainDebt > 0n) {
                const storedCredit = localStorage.getItem(creditKey);
                if (storedCredit && BigInt(storedCredit) > 0n) {
                    // Use localStorage (accumulated credit from previous session)
                    setUiCredit(BigInt(storedCredit));
                } else {
                    // First time with debt - initialize from on-chain
                    setUiCredit(onChainCredit);
                    localStorage.setItem(creditKey, onChainCredit.toString());
                }
            } else {
                // ✅ Zero-state account (no debt) - explicitly set to zero
                setUiDebt(0n);
                setUiCredit(0n);
                // Clear any stale localStorage from previous sessions
                localStorage.removeItem(creditKey);
            }

            // Track initial on-chain values for change detection
            lastOnChainDebtRef.current = onChainDebt;
            lastOnChainCreditRef.current = onChainCredit;
            initializedRef.current = true;
        }
    }, [accountAddress, onChainDebt, onChainCredit]);

    // 🔥 REBASE: Detect on-chain changes and update local state
    useEffect(() => {
        if (!initializedRef.current || !accountAddress) return;
        if (onChainDebt === undefined || onChainCredit === undefined) return;

        const creditKey = getStorageKey('uiCredit');
        if (!creditKey) return;

        // Check if on-chain values changed (transaction occurred)
        const debtChanged = lastOnChainDebtRef.current !== undefined &&
            lastOnChainDebtRef.current !== onChainDebt;

        const creditChanged = lastOnChainCreditRef.current !== undefined &&
            lastOnChainCreditRef.current !== onChainCredit;

        if (debtChanged || creditChanged) {
            console.log('🔄 On-chain mutation detected - rebasing', {
                oldDebt: lastOnChainDebtRef.current,
                newDebt: onChainDebt,
                oldCredit: lastOnChainCreditRef.current,
                newCredit: onChainCredit
            });

            // 🔹 DEBT: Always override with on-chain (ephemeral)
            setUiDebt(onChainDebt);

            // 🔹 CREDIT: Override with on-chain and update localStorage
            setUiCredit(onChainCredit);

            // Update localStorage for credit only
            if (onChainDebt > 0n) {
                localStorage.setItem(creditKey, onChainCredit.toString());
            } else {
                localStorage.removeItem(creditKey);
            }

            // Update tracking refs
            lastOnChainDebtRef.current = onChainDebt;
            lastOnChainCreditRef.current = onChainCredit;

            // Clear and restart timers
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            timerRef.current = null;
            intervalRef.current = null;
        }
    }, [onChainDebt, onChainCredit, accountAddress]);

    // Save credit to localStorage when it changes (always save, even if debt is 0)
    // 🔹 DEBT: Never saved to localStorage (ephemeral)
    // 🔹 CREDIT: Always saved to localStorage (persistent)
    useEffect(() => {
        if (!accountAddress || !initializedRef.current) return;
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

    // Manual rebase function for "Sync Yield" button
    const rebaseFromOnChain = () => {
        if (!accountAddress || onChainDebt === undefined || onChainCredit === undefined) return;

        const creditKey = getStorageKey('uiCredit');
        if (!creditKey) return;

        console.log('🔄 Manual sync - rebasing from on-chain');

        // 🔹 DEBT: Always override with on-chain (ephemeral)
        setUiDebt(onChainDebt);

        // 🔹 CREDIT: Override with on-chain and update localStorage
        setUiCredit(onChainCredit);

        // Update localStorage for credit only
        if (onChainDebt > 0n) {
            localStorage.setItem(creditKey, onChainCredit.toString());
        } else {
            localStorage.removeItem(creditKey);
        }

        // Update tracking refs
        lastOnChainDebtRef.current = onChainDebt;
        lastOnChainCreditRef.current = onChainCredit;

        // Clear and restart timers
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        timerRef.current = null;
        intervalRef.current = null;
    };

    return {
        pendingYield,
        uiDebt,
        uiCredit,
        onChainDebt,
        onChainCredit,
        rebaseFromOnChain,
    };
}
