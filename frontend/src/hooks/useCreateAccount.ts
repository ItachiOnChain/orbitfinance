import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import AccountFactoryABI from '../contracts/abis/AccountFactory.json';

export function useCreateAccount() {
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const createAccount = async () => {
        await writeContract({
            address: CONTRACTS.anvil.AccountFactory as `0x${string}`,
            abi: AccountFactoryABI.abi,
            functionName: 'createAccount',
            args: [],
        });
    };

    return {
        createAccount,
        isPending,
        isConfirming,
        isSuccess,
        hash,
    };
}
