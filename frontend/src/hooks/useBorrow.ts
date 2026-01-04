import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';

export function useBorrow() {
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const borrow = async (
        accountAddress: `0x${string}`,
        amount: string,
        debtTokenAddress: `0x${string}`,
        decimals: number
    ) => {
        const parsedAmount = parseUnits(amount, decimals);

        await writeContract({
            address: accountAddress,
            abi: OrbitAccountABI.abi,
            functionName: 'borrow',
            args: [parsedAmount, debtTokenAddress],
        });
    };

    return { borrow, isPending, isConfirming, isSuccess, hash };
}
