import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useBorrow } from '../hooks/useBorrow';
import { CONTRACTS } from '../contracts/addresses';
import AccountFactoryABI from '../contracts/abis/AccountFactory.json';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';
import { formatEther } from 'viem';

interface BorrowModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BorrowModal({ isOpen, onClose }: BorrowModalProps) {
    const { address } = useAccount();
    const [amount, setAmount] = useState('');
    const [maxBorrowableDisplay, setMaxBorrowableDisplay] = useState('0');

    const { data: accountAddress } = useReadContract({
        address: CONTRACTS.anvil.AccountFactory as `0x${string}`,
        abi: AccountFactoryABI.abi,
        functionName: 'getAccount',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Fetch current debt to subtract from max borrowable
    const { data: totalDebt } = useReadContract({
        address: accountAddress as `0x${string}`,
        abi: OrbitAccountABI.abi,
        functionName: 'totalDebt',
        query: {
            enabled: !!accountAddress,
        },
    });

    const { data: maxBorrowableRaw, refetch: refetchMaxBorrowable } = useReadContract({
        address: accountAddress as `0x${string}`,
        abi: OrbitAccountABI.abi,
        functionName: 'maxBorrowableAmount',
        args: [CONTRACTS.anvil.orUSD],
        query: {
            enabled: !!accountAddress,
            gcTime: 0,
            staleTime: 0,
        },
    });

    const { borrow, isPending, isSuccess } = useBorrow();

    // Calculate actual max borrowable: maxBorrowableRaw - totalDebt
    useEffect(() => {
        if (maxBorrowableRaw && totalDebt !== undefined && totalDebt !== null) {
            const debtAmount = BigInt(totalDebt.toString());
            const maxAmount = BigInt(maxBorrowableRaw.toString());
            const remaining = maxAmount > debtAmount ? maxAmount - debtAmount : 0n;
            setMaxBorrowableDisplay(formatEther(remaining));
        } else if (maxBorrowableRaw) {
            setMaxBorrowableDisplay(formatEther(maxBorrowableRaw as bigint));
        }
    }, [maxBorrowableRaw, totalDebt]);

    // Force refetch when modal opens
    useEffect(() => {
        if (isOpen && accountAddress) {
            const timer = setTimeout(() => {
                refetchMaxBorrowable();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, accountAddress, refetchMaxBorrowable]);

    useEffect(() => {
        if (isSuccess) {
            setAmount('');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }, [isSuccess]);

    const handleBorrow = async () => {
        if (!amount || parseFloat(amount) <= 0 || !accountAddress) {
            alert('Invalid amount or no account found');
            return;
        }

        try {
            await borrow(
                accountAddress as `0x${string}`,
                amount,
                CONTRACTS.anvil.orUSD as `0x${string}`,
                18
            );
        } catch (error) {
            console.error('Borrow failed:', error);
            alert(`Borrow failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const setBorrowMax = () => {
        setAmount(maxBorrowableDisplay);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-light text-white">Borrow</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-4">
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-sm text-zinc-400">Max Borrowable</p>
                        <p className="text-2xl font-light text-emerald-400">
                            {maxBorrowableDisplay} orUSD
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-zinc-400">Borrow Amount</label>
                            <button
                                onClick={setBorrowMax}
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
                        onClick={handleBorrow}
                        disabled={!amount || isPending}
                        className="w-full px-6 py-3 bg-gold text-black rounded-lg font-light hover:bg-gold/90 transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'Borrowing...' : `Borrow ${amount || '0'} orUSD`}
                    </button>

                    {isSuccess && (
                        <p className="text-sm text-emerald-400">✓ Borrow confirmed! Refreshing...</p>
                    )}
                </div>
            </div>
        </div>
    );
}
