import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';

export function useWithdraw() {
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const withdraw = async (
        accountAddress: `0x${string}`,
        amount: string,
        assetAddress: `0x${string}`,
        decimals: number
    ) => {
        const parsedAmount = parseUnits(amount, decimals);

        // Call OrbitAccount.withdraw() instead of vault.redeem()
        await writeContract({
            address: accountAddress,
            abi: OrbitAccountABI.abi,
            functionName: 'withdraw',
            args: [parsedAmount, assetAddress],
        });
    };

    return { withdraw, isPending, isConfirming, isSuccess, hash };
}
