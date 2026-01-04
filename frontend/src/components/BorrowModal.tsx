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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-sidebar-bg border border-zinc-900 rounded-3xl p-10 max-w-lg w-full shadow-[0_0_80px_rgba(0,0,0,0.6)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl font-bold text-white tracking-tight font-outfit">Borrow</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">✕</button>
                </div>

                <div className="space-y-8">
                    <div className="bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800/50">
                        <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase mb-3">Max Borrowable</p>
                        <p className="text-4xl font-bold text-emerald-400 tracking-tight font-outfit">
                            {maxBorrowableDisplay} <span className="text-sm font-medium text-emerald-400/60 ml-2 uppercase tracking-widest font-space">orUSD</span>
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase">Borrow Amount</label>
                            <button
                                onClick={setBorrowMax}
                                className="text-[10px] font-bold tracking-[0.3em] text-gold hover:text-gold/80 transition-colors"
                            >
                                MAX
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-8 py-5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white text-xl focus:outline-none focus:border-gold/50 transition-all font-space"
                            />
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold tracking-[0.2em] text-zinc-600 uppercase pointer-events-none font-space">
                                orUSD
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleBorrow}
                        disabled={!amount || isPending}
                        className="w-full px-10 py-5 bg-gold text-black rounded-2xl text-xs font-bold tracking-[0.3em] hover:bg-gold/90 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
                    >
                        {isPending ? 'BORROWING...' : `BORROW ${amount || '0'} orUSD`}
                    </button>

                    {isSuccess && (
                        <p className="text-center text-xs font-bold tracking-[0.3em] text-emerald-400 animate-pulse">
                            ✓ BORROW CONFIRMED! REFRESHING...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}


