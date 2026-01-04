import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRepay } from '../hooks/useRepay';
import { CONTRACTS } from '../contracts/addresses';
import AccountFactoryABI from '../contracts/abis/AccountFactory.json';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';
import { formatEther } from 'viem';

interface RepayModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RepayModal({ isOpen, onClose }: RepayModalProps) {
    const { address } = useAccount();
    const [amount, setAmount] = useState('');

    const { data: accountAddress } = useReadContract({
        address: CONTRACTS.anvil.AccountFactory as `0x${string}`,
        abi: AccountFactoryABI.abi,
        functionName: 'getAccount',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    const { data: currentDebt } = useReadContract({
        address: accountAddress as `0x${string}`,
        abi: OrbitAccountABI.abi,
        functionName: 'totalDebt',
        query: {
            enabled: !!accountAddress,
        },
    });

    const { repay, isPending, isSuccess, step } = useRepay();

    useEffect(() => {
        if (isSuccess) {
            setAmount('');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }, [isSuccess]);

    const handleRepay = async () => {
        if (!amount || parseFloat(amount) <= 0 || !accountAddress) {
            alert('Invalid amount or no account found');
            return;
        }

        try {
            await repay(
                accountAddress as `0x${string}`,
                amount,
                CONTRACTS.anvil.orUSD as `0x${string}`,
                18
            );
        } catch (error) {
            console.error('Repay failed:', error);
            alert(`Repay failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const setRepayMax = () => {
        if (currentDebt) {
            setAmount(formatEther(currentDebt as bigint));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-light text-white">Repay Debt</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-4">
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-sm text-zinc-400">Current Debt</p>
                        <p className="text-2xl font-light text-red-400">
                            {currentDebt ? formatEther(currentDebt as bigint) : '0'} orUSD
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-zinc-400">Repay Amount</label>
                            <button
                                onClick={setRepayMax}
                                className="text-xs text-gold hover:text-gold/80"
                            >
                                MAX
                            </button>
                        </div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-gold"
                        />
                    </div>

                    <button
                        onClick={handleRepay}
                        disabled={!amount || isPending}
                        className="w-full px-6 py-3 bg-gold text-black rounded-lg font-light hover:bg-gold/90 transition-colors disabled:opacity-50"
                    >
                        {isPending
                            ? step === 'approving'
                                ? 'Approving...'
                                : 'Repaying...'
                            : `Repay ${amount || '0'} orUSD`}
                    </button>

                    {step === 'approving' && (
                        <p className="text-xs text-zinc-400">Step 1/2: Approving orUSD</p>
                    )}
                    {step === 'repaying' && (
                        <p className="text-xs text-zinc-400">Step 2/2: Repaying debt</p>
                    )}

                    {isSuccess && (
                        <p className="text-sm text-emerald-400">✓ Repayment confirmed! Refreshing...</p>
                    )}
                </div>
            </div>
        </div>
    );
}
