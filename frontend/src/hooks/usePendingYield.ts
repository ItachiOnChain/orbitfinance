import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';

export function usePendingYield(accountAddress: `0x${string}` | undefined) {
    const [pendingYield, setPendingYield] = useState<bigint>(0n);
    const [updateCount, setUpdateCount] = useState(0);
    const [initialized, setInitialized] = useState(false);

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
        if (!totalDebt && !accumulatedCredit) return; // Wait for on-chain data

        const debtKey = getStorageKey('uiDebt');
        const creditKey = getStorageKey('uiCredit');

        if (!debtKey || !creditKey) return;

        // Try to load from localStorage
        const storedDebt = localStorage.getItem(debtKey);
        const storedCredit = localStorage.getItem(creditKey);

        if (storedDebt && BigInt(storedDebt) > 0n) {
            // Use stored values if they exist and are > 0
            const debtValue = BigInt(storedDebt);
            const creditValue = storedCredit ? BigInt(storedCredit) : 0n;
            console.log('🟢 Loading from localStorage - debt:', formatEther(debtValue), 'credit:', formatEther(creditValue));
            setUiDebt(debtValue);
            setUiCredit(creditValue);
        } else if (totalDebt && totalDebt > 0n) {
            // Initialize from on-chain if no valid localStorage
            console.log('🔄 Initializing from on-chain - debt:', formatEther(totalDebt));
            setUiDebt(totalDebt);
            setUiCredit(accumulatedCredit || 0n);
            localStorage.setItem(debtKey, totalDebt.toString());
            localStorage.setItem(creditKey, (accumulatedCredit || 0n).toString());
        }

        setInitialized(true);
        setUpdateCount(0);
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

        console.log('✅ Setting up yield timer - first update in 10 seconds');

        const updateYield = () => {
            const debtNumber = Number(formatEther(uiDebt));
            console.log('🔄 updateYield called! Current debt:', debtNumber, 'orUSD');

            // Realistic 5% APY calculation
            const secondsElapsed = 10;
            const yieldPerSecond = debtNumber * 0.05 / 31536000;
            const yieldAmount = BigInt(Math.floor(yieldPerSecond * secondsElapsed * 1e18));

            console.log('💰 Calculated yieldAmount:', formatEther(yieldAmount), 'orUSD (5% APY over 10s)');

            if (yieldAmount > 0n) {
                console.log('✨ Applying yield update:');

                setPendingYield(prev => prev + yieldAmount);
                setUiDebt(prev => {
                    const newDebt = prev > yieldAmount ? prev - yieldAmount : 0n;
                    console.log('  - New debt:', formatEther(newDebt), 'orUSD');
                    return newDebt;
                });
                setUiCredit(prev => {
                    const newCredit = prev + yieldAmount;
                    console.log('  - New credit:', formatEther(newCredit), 'orUSD');
                    return newCredit;
                });
                setUpdateCount(prev => prev + 1);
            }
        };

        console.log('⏱️ Starting 10-second timer...');
        const firstTimeout = setTimeout(() => {
            console.log('⏰ 10 seconds elapsed! Running first update...');
            updateYield();
            const interval = setInterval(() => {
                console.log('⏰ 10-second interval triggered!');
                updateYield();
            }, 10000);
            return () => clearInterval(interval);
        }, 10000);

        return () => clearTimeout(firstTimeout);
    }, [uiDebt, updateCount, initialized]);

    console.log('📊 Current state - uiDebt:', formatEther(uiDebt), 'uiCredit:', formatEther(uiCredit), 'initialized:', initialized);

    return {
        pendingYield,
        uiDebt,
        uiCredit,
        onChainDebt: totalDebt,
        onChainCredit: accumulatedCredit,
    };
}
