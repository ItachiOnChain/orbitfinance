import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';

export function usePendingYield(accountAddress: `0x${string}` | undefined) {
    const [pendingYield, setPendingYield] = useState<bigint>(0n);
    const [updateCount, setUpdateCount] = useState(0);

    console.log('🔵 usePendingYield called with accountAddress:', accountAddress);

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

    // Initialize UI values from localStorage
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

    console.log('🔵 On-chain totalDebt:', totalDebt ? formatEther(totalDebt) : 'undefined', 'orUSD');
    console.log('🔵 On-chain accumulatedCredit:', accumulatedCredit ? formatEther(accumulatedCredit) : 'undefined', 'orUSD');

    // Sync with on-chain values ONLY when localStorage is empty or 0
    useEffect(() => {
        if (!accountAddress || !totalDebt) return;

        const debtKey = getStorageKey('uiDebt');
        if (!debtKey) return;

        const storedDebt = localStorage.getItem(debtKey);
        const storedValue = storedDebt ? BigInt(storedDebt) : 0n;

        // Only sync if stored is 0 but on-chain has debt
        if (storedValue === 0n && totalDebt > 0n) {
            console.log('🔄 Syncing uiDebt with on-chain debt:', formatEther(totalDebt), 'orUSD');
            setUiDebt(totalDebt);
            localStorage.setItem(debtKey, totalDebt.toString());
            setUpdateCount(0);
        }
    }, [totalDebt, accountAddress]);

    useEffect(() => {
        if (!accountAddress || !accumulatedCredit) return;

        const creditKey = getStorageKey('uiCredit');
        if (!creditKey) return;

        const storedCredit = localStorage.getItem(creditKey);
        const storedValue = storedCredit ? BigInt(storedCredit) : 0n;

        // Only sync if stored is 0 but on-chain has credit
        if (storedValue === 0n && accumulatedCredit > 0n) {
            console.log('🔄 Syncing uiCredit with on-chain credit:', formatEther(accumulatedCredit), 'orUSD');
            setUiCredit(accumulatedCredit);
            localStorage.setItem(creditKey, accumulatedCredit.toString());
        }
    }, [accumulatedCredit, accountAddress]);

    // Persist UI values to localStorage whenever they change
    useEffect(() => {
        if (!accountAddress || uiDebt === 0n) return;
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

    // Generate yield at intervals: 10s updates with realistic 5% APY
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

            // Realistic 5% APY calculation
            // 5% per year = 0.05 / 31536000 seconds per year
            const secondsElapsed = 10; // Update every 10 seconds
            const yieldPerSecond = debtNumber * 0.05 / 31536000;
            const yieldAmount = BigInt(Math.floor(yieldPerSecond * secondsElapsed * 1e18));

            console.log('💰 Calculated yieldAmount:', formatEther(yieldAmount), 'orUSD (5% APY over 10s)');

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
