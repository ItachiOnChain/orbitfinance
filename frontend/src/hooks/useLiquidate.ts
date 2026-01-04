import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';

export function useLiquidate() {
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const liquidate = async (
        accountAddress: `0x${string}`,
        debtAmount: string,
        assetAddress: `0x${string}`,
        maxCollateralIn: string,
        decimals: number
    ) => {
        const parsedDebtAmount = parseUnits(debtAmount, decimals);
        const parsedMaxCollateral = parseUnits(maxCollateralIn, decimals);

        await writeContract({
            address: accountAddress,
            abi: OrbitAccountABI.abi,
            functionName: 'liquidate',
            args: [parsedDebtAmount, assetAddress, parsedMaxCollateral],
        });
    };

    return { liquidate, isPending, isConfirming, isSuccess, hash };
}
