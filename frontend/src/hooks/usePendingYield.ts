import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';

export function usePendingYield(accountAddress: `0x${string}` | undefined) {
    const [pendingYield, setPendingYield] = useState<bigint>(0n);
    const [uiDebt, setUiDebt] = useState<bigint>(0n);
    const [uiCredit, setUiCredit] = useState<bigint>(0n);
    const [updateCount, setUpdateCount] = useState(0);

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

    // Initialize UI values when on-chain values change
    useEffect(() => {
        if (totalDebt !== undefined) {
            setUiDebt(totalDebt);
            setPendingYield(0n);
            setUpdateCount(0);
        }
        if (accumulatedCredit !== undefined) {
            setUiCredit(accumulatedCredit);
        }
    }, [totalDebt, accumulatedCredit]);

    // Generate yield at intervals: 10s first, then 30s afterwards
    useEffect(() => {
        if (!uiDebt || uiDebt === 0n) {
            return;
        }

        const updateYield = () => {
            const debtNumber = Number(formatEther(uiDebt));
            const secondsElapsed = updateCount === 0 ? 10 : 30;

            const yieldPerSecond = debtNumber * 0.05 / 31536000;
            const yieldAmount = BigInt(Math.floor(yieldPerSecond * secondsElapsed * 1e18));

            if (yieldAmount > 0n) {
                setPendingYield(prev => prev + yieldAmount);
                setUiDebt(prev => prev > yieldAmount ? prev - yieldAmount : 0n);
                setUiCredit(prev => prev + yieldAmount); // Increase accumulated credit
                setUpdateCount(prev => prev + 1);
            }
        };

        const firstTimeout = setTimeout(() => {
            updateYield();
            const interval = setInterval(updateYield, 30000);
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
