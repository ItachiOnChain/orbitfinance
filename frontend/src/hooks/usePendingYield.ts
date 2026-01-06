import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useEffect, useState, useRef } from 'react';

export function usePendingYield(accountAddress: `0x${string}` | undefined) {
    const [pendingYield, setPendingYield] = useState<bigint>(0n);
    const [initialized, setInitialized] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // State for UI values
    const [uiDebt, setUiDebt] = useState<bigint>(0n);
    const [uiCredit, setUiCredit] = useState<bigint>(0n);

    console.log('🔵 On-chain totalDebt:', totalDebt ? formatEther(totalDebt) : 'undefined', 'orUSD');
    console.log('🔵 On-chain accumulatedCredit:', accumulatedCredit ? formatEther(accumulatedCredit) : 'undefined', 'orUSD');

    // Initialize from localStorage or on-chain values
    useEffect(() => {
        if (!accountAddress || initialized) return;
        if (!totalDebt) return; // Wait for on-chain data

        const debtKey = getStorageKey('uiDebt');
        const creditKey = getStorageKey('uiCredit');

        if (!debtKey || !creditKey) return;

        // Always use on-chain debt as the source of truth
        console.log('🔄 Initializing from on-chain - debt:', formatEther(totalDebt));
        setUiDebt(totalDebt);
        setUiCredit(accumulatedCredit || 0n);
        localStorage.setItem(debtKey, totalDebt.toString());
        localStorage.setItem(creditKey, (accumulatedCredit || 0n).toString());
        setInitialized(true);
    }, [totalDebt, accumulatedCredit, accountAddress, initialized]);

    // Persist UI values to localStorage whenever they change
    useEffect(() => {
        if (!accountAddress || !initialized || uiDebt === 0n) return;
        const key = getStorageKey('uiDebt');
        if (key) {
            localStorage.setItem(key, uiDebt.toString());
            console.log('💾 Saved uiDebt to localStorage:', formatEther(uiDebt), 'orUSD');
        }
    }, [uiDebt, accountAddress, initialized]);

    useEffect(() => {
        if (!accountAddress || !initialized) return;
        const key = getStorageKey('uiCredit');
        if (key) {
            localStorage.setItem(key, uiCredit.toString());
            console.log('💾 Saved uiCredit to localStorage:', formatEther(uiCredit), 'orUSD');
        }
    }, [uiCredit, accountAddress, initialized]);

    // Generate yield at intervals: 10s updates with realistic 5% APY
    // IMPORTANT: No updateCount in dependencies to prevent multiple timers!
    useEffect(() => {
        if (!initialized) {
            console.log('⏰ Waiting for initialization...');
            return;
        }

        console.log('⏰ Yield timer effect triggered. uiDebt:', formatEther(uiDebt), 'orUSD');

        if (!uiDebt || uiDebt === 0n) {
            console.log('❌ No debt, skipping yield timer');
            return;
        }

        // Clear any existing timers
        if (timerRef.current) {
            console.log('🧹 Clearing existing timer');
            clearTimeout(timerRef.current);
        }
        if (intervalRef.current) {
            console.log('🧹 Clearing existing interval');
            clearInterval(intervalRef.current);
        }

        console.log('✅ Setting up yield timer - first update in 10 seconds');

        const updateYield = () => {
            setUiDebt(currentDebt => {
                const debtNumber = Number(formatEther(currentDebt));
                console.log('🔄 updateYield called! Current debt:', debtNumber, 'orUSD');

                // Realistic 5% APY calculation
                const secondsElapsed = 10;
                const yieldPerSecond = debtNumber * 0.05 / 31536000;
                const yieldAmount = BigInt(Math.floor(yieldPerSecond * secondsElapsed * 1e18));

                console.log('💰 Calculated yieldAmount:', formatEther(yieldAmount), 'orUSD (5% APY over 10s)');

                if (yieldAmount > 0n) {
                    console.log('✨ Applying yield update');

                    setPendingYield(prev => prev + yieldAmount);
                    setUiCredit(prev => {
                        const newCredit = prev + yieldAmount;
                        console.log('  - New credit:', formatEther(newCredit), 'orUSD');
                        return newCredit;
                    });

                    const newDebt = currentDebt > yieldAmount ? currentDebt - yieldAmount : 0n;
                    console.log('  - New debt:', formatEther(newDebt), 'orUSD');
                    return newDebt;
                }

                return currentDebt;
            });
        };

        console.log('⏱️ Starting 10-second timer...');
        timerRef.current = setTimeout(() => {
            console.log('⏰ 10 seconds elapsed! Running first update...');
            updateYield();
            console.log('🔁 Setting up recurring 10-second interval...');
            intervalRef.current = setInterval(() => {
                console.log('⏰ 10-second interval triggered!');
                updateYield();
            }, 10000);
        }, 10000);

        return () => {
            console.log('🛑 Cleanup: clearing timers');
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [initialized, uiDebt]); // Only re-run if initialized changes or initial debt changes

    console.log('📊 Current state - uiDebt:', formatEther(uiDebt), 'uiCredit:', formatEther(uiCredit), 'initialized:', initialized);

    return {
        pendingYield,
        uiDebt,
        uiCredit,
        onChainDebt: totalDebt,
        onChainCredit: accumulatedCredit,
    };
}
