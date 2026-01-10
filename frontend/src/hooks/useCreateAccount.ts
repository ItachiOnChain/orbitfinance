import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts';
import AccountFactoryABI from '../contracts/abis/AccountFactory.json';

export function useCreateAccount() {
    const {
        data: hash,
        writeContract,
        isPending,
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const createAccount = () => {
        writeContract({
            address: CONTRACTS.AccountFactory as `0x${string}`,
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
