import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';
import { useEffect } from 'react';

export function useSyncYield() {
    const { data: hash, writeContract, isPending } = useWriteContract();

    const { isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }, [isSuccess]);

    const syncYield = async (accountAddress: `0x${string}`) => {
        try {
            await writeContract({
                address: accountAddress,
                abi: OrbitAccountABI.abi,
                functionName: 'sync',
            });
        } catch (error) {
            console.error('Sync failed:', error);
        }
    };

    return { syncYield, isPending, isSuccess };
}
