import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';

export function usePendingYield(accountAddress: `0x${string}` | undefined) {
    const [pendingYield, setPendingYield] = useState<bigint>(0n);
    const [updateCount, setUpdateCount] = useState(0);

    console.log('🔵 usePendingYield called with accountAddress:', accountAddress);

    // Get storage keys for this account
    const getStorageKey = (key: string) => accountAddress ? `${accountAddress}_${key}` : null;

    // Initialize UI values from localStorage or default to 0n
    const [uiDebt, setUiDebt] = useState<bigint>(() => {
        const key = getStorageKey('uiDebt');
        if (!key) return 0n;
        const stored = localStorage.getItem(key);
        const value = stored ? BigInt(stored) : 0n;
        console.log('🟢 Initial uiDebt from localStorage:', formatEther(value), 'orUSD');
        return value;
    });

    const [uiCredit, setUiCredit] = useState<bigint>(() => {
        const key = getStorageKey('uiCredit');
        if (!key) return 0n;
        const stored = localStorage.getItem(key);
        const value = stored ? BigInt(stored) : 0n;
        console.log('🟢 Initial uiCredit from localStorage:', formatEther(value), 'orUSD');
        return value;
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

    console.log('🔵 On-chain totalDebt:', totalDebt ? formatEther(totalDebt) : 'undefined', 'orUSD');
    console.log('🔵 On-chain accumulatedCredit:', accumulatedCredit ? formatEther(accumulatedCredit) : 'undefined', 'orUSD');

    // Initialize UI values ONLY if localStorage is empty (first time)
    useEffect(() => {
        if (!accountAddress) return;

        const debtKey = getStorageKey('uiDebt');
        const creditKey = getStorageKey('uiCredit');

        if (!debtKey || !creditKey) return;

        const hasStoredDebt = localStorage.getItem(debtKey);
        const hasStoredCredit = localStorage.getItem(creditKey);

        console.log('🟡 hasStoredDebt:', !!hasStoredDebt, 'hasStoredCredit:', !!hasStoredCredit);

        // Only initialize from on-chain if no stored values exist
        if (!hasStoredDebt && totalDebt !== undefined) {
            console.log('🟠 Initializing uiDebt from on-chain:', formatEther(totalDebt), 'orUSD');
            setUiDebt(totalDebt);
            localStorage.setItem(debtKey, totalDebt.toString());
            setPendingYield(0n);
            setUpdateCount(0);
        }

        if (!hasStoredCredit && accumulatedCredit !== undefined) {
            console.log('🟠 Initializing uiCredit from on-chain:', formatEther(accumulatedCredit), 'orUSD');
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
            console.log('💾 Saved uiDebt to localStorage:', formatEther(uiDebt), 'orUSD');
        }
    }, [uiDebt, accountAddress]);

    useEffect(() => {
        if (!accountAddress) return;
        const key = getStorageKey('uiCredit');
        if (key) {
            localStorage.setItem(key, uiCredit.toString());
            console.log('💾 Saved uiCredit to localStorage:', formatEther(uiCredit), 'orUSD');
        }
    }, [uiCredit, accountAddress]);

    // Generate yield at intervals: 10s updates for visibility
    useEffect(() => {
        console.log('⏰ Yield timer effect triggered. uiDebt:', formatEther(uiDebt), 'orUSD');

        if (!uiDebt || uiDebt === 0n) {
            console.log('❌ No debt, skipping yield timer');
            return;
        }

        console.log('✅ Setting up yield timer - first update in 10 seconds');

        const updateYield = () => {
            const debtNumber = Number(formatEther(uiDebt));
            console.log('🔄 updateYield called! Current debt:', debtNumber, 'orUSD');

            // Increased rate for visibility: 1% of debt every 10 seconds
            const yieldPercentage = 0.01; // 1% per update
            const yieldAmount = BigInt(Math.floor(debtNumber * yieldPercentage * 1e18));

            console.log('💰 Calculated yieldAmount:', formatEther(yieldAmount), 'orUSD (1% of debt)');

            if (yieldAmount > 0n) {
                console.log('✨ Applying yield update:');
                console.log('  - Decreasing debt by:', formatEther(yieldAmount), 'orUSD');
                console.log('  - Increasing credit by:', formatEther(yieldAmount), 'orUSD');

                setPendingYield(prev => prev + yieldAmount);
                setUiDebt(prev => {
                    const newDebt = prev > yieldAmount ? prev - yieldAmount : 0n;
                    console.log('  - New debt will be:', formatEther(newDebt), 'orUSD');
                    return newDebt;
                });
                setUiCredit(prev => {
                    const newCredit = prev + yieldAmount;
                    console.log('  - New credit will be:', formatEther(newCredit), 'orUSD');
                    return newCredit;
                });
                setUpdateCount(prev => prev + 1);
            } else {
                console.log('⚠️ yieldAmount is 0, no update applied');
            }
        };

        // First update after 10 seconds, then every 10 seconds
        console.log('⏱️ Starting 10-second timer...');
        const firstTimeout = setTimeout(() => {
            console.log('⏰ 10 seconds elapsed! Running first update...');
            updateYield();
            console.log('🔁 Setting up recurring 10-second interval...');
            const interval = setInterval(() => {
                console.log('⏰ 10-second interval triggered!');
                updateYield();
            }, 10000);
            return () => {
                console.log('🛑 Clearing interval');
                clearInterval(interval);
            };
        }, 10000);

        return () => {
            console.log('🛑 Clearing timeout');
            clearTimeout(firstTimeout);
        };
    }, [uiDebt, updateCount]);

    console.log('📊 Current state - uiDebt:', formatEther(uiDebt), 'uiCredit:', formatEther(uiCredit));

    return {
        pendingYield,
        uiDebt,
        uiCredit,
        onChainDebt: totalDebt,
        onChainCredit: accumulatedCredit,
    };
}
