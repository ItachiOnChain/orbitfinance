import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useState, useEffect } from 'react';
import ERC20ABI from '../contracts/abis/ERC20.json';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';

export function useDeposit() {
    const { address } = useAccount();
    const { data: hash, writeContract, isPending, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const [step, setStep] = useState<'idle' | 'approving' | 'depositing'>('idle');

    // Reset state when transaction succeeds
    useEffect(() => {
        if (isSuccess) {
            setStep('idle');
            reset();
        }
    }, [isSuccess, reset]);

    const deposit = async (
        accountAddress: `0x${string}`,
        amount: string,
        assetAddress: `0x${string}`,
        decimals: number
    ) => {
        if (!address) throw new Error('No wallet connected');

        const parsedAmount = parseUnits(amount, decimals);

        try {
            // Step 1: Approve token to OrbitAccount (not vault!)
            setStep('approving');
            await writeContract({
                address: assetAddress,
                abi: ERC20ABI.abi,
                functionName: 'approve',
                args: [accountAddress, parsedAmount],
            });

            // Wait for approval to be mined
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Step 2: Deposit through OrbitAccount
            setStep('depositing');
            await writeContract({
                address: accountAddress,
                abi: OrbitAccountABI.abi,
                functionName: 'deposit',
                args: [parsedAmount, assetAddress],
            });
        } catch (error) {
            setStep('idle');
            throw error;
        }
    };

    return {
        deposit,
        isPending,
        isConfirming,
        isSuccess,
        hash,
        step,
    };
}
