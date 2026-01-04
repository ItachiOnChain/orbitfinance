import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useState } from 'react';
import ERC20ABI from '../contracts/abis/ERC20.json';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';

export function useRepay() {
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const [step, setStep] = useState<'idle' | 'approving' | 'repaying'>('idle');

    const repay = async (
        accountAddress: `0x${string}`,
        amount: string,
        debtTokenAddress: `0x${string}`,
        decimals: number
    ) => {
        const parsedAmount = parseUnits(amount, decimals);

        try {
            // Step 1: Approve debt token
            setStep('approving');
            await writeContract({
                address: debtTokenAddress,
                abi: ERC20ABI.abi,
                functionName: 'approve',
                args: [accountAddress, parsedAmount],
            });

            await new Promise(resolve => setTimeout(resolve, 3000));

            // Step 2: Repay
            setStep('repaying');
            await writeContract({
                address: accountAddress,
                abi: OrbitAccountABI.abi,
                functionName: 'repay',
                args: [parsedAmount],
            });

            setStep('idle');
        } catch (error) {
            setStep('idle');
            throw error;
        }
    };

    return { repay, isPending, isConfirming, isSuccess, hash, step };
}
