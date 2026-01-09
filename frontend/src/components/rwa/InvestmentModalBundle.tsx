import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { X } from 'lucide-react';
import { BUNDLE_POOL_ADDRESS, BUNDLE_POOL_ABI } from '../../contracts/bundlePoolConfig';

interface InvestmentModalProps {
    poolId: number;
    tranche: 'junior' | 'senior';
    trancheData: any;
    onClose: () => void;
    onSuccess: () => void;
}

const USDT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const USDT_ABI = [
    {
        "type": "function",
        "name": "balanceOf",
        "inputs": [{ "name": "account", "type": "address" }],
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "approve",
        "inputs": [
            { "name": "spender", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "allowance",
        "inputs": [
            { "name": "owner", "type": "address" },
            { "name": "spender", "type": "address" }
        ],
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view"
    }
] as const;

export function InvestmentModal({ poolId, tranche, trancheData, onClose, onSuccess }: InvestmentModalProps) {
    const { address } = useAccount();
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'input' | 'approving' | 'investing'>('input');

    // Get USDT balance
    const { data: usdtBalance } = useReadContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address
        }
    });

    // Get USDT allowance
    const { data: allowance } = useReadContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'allowance',
        args: address ? [address, BUNDLE_POOL_ADDRESS] : undefined,
        query: {
            enabled: !!address
        }
    }) as { data: bigint | undefined };

    // Approve USDT
    const { writeContract: approveUSDT, data: approveHash } = useWriteContract();
    const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    // Invest
    const { writeContract: invest, data: investHash } = useWriteContract();
    const { isSuccess: isInvestSuccess } = useWaitForTransactionReceipt({ hash: investHash });

    React.useEffect(() => {
        if (isApproveSuccess && step === 'approving') {
            handleInvest();
        }
    }, [isApproveSuccess]);

    React.useEffect(() => {
        if (isInvestSuccess) {
            onSuccess();
        }
    }, [isInvestSuccess]);

    const handleMaxClick = () => {
        if (usdtBalance) {
            setAmount(formatUnits(usdtBalance as bigint, 6));
        }
    };

    const handleApprove = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            console.error('Please enter a valid amount');
            return;
        }

        const amountBigInt = parseUnits(amount, 6);

        if (usdtBalance && amountBigInt > (usdtBalance as bigint)) {
            console.error('Insufficient USDT balance');
            return;
        }

        setStep('approving');
        console.log('Approving USDT spending...');

        try {
            (approveUSDT as any)({
                address: USDT_ADDRESS as `0x${string}`,
                abi: USDT_ABI,
                functionName: 'approve',
                args: [BUNDLE_POOL_ADDRESS, amountBigInt],
            });
        } catch (error) {
            console.error('Approval error:', error);
            setStep('input');
        }
    };

    const handleInvest = async () => {
        setStep('investing');
        console.log('Processing investment...');

        const amountBigInt = parseUnits(amount, 6);

        try {
            if (tranche === 'junior') {
                (invest as any)({
                    address: BUNDLE_POOL_ADDRESS as `0x${string}`,
                    abi: BUNDLE_POOL_ABI,
                    functionName: 'investJuniorTranche',
                    args: [BigInt(poolId), amountBigInt],
                });
            } else {
                (invest as any)({
                    address: BUNDLE_POOL_ADDRESS as `0x${string}`,
                    abi: BUNDLE_POOL_ABI,
                    functionName: 'investSeniorTranche',
                    args: [BigInt(poolId), amountBigInt],
                });
            }
        } catch (error) {
            console.error('Investment error:', error);
            setStep('input');
        }
    };

    const handleSubmit = () => {
        const amountBigInt = parseUnits(amount, 6);

        if (allowance && (allowance as bigint) >= amountBigInt) {
            handleInvest();
        } else {
            handleApprove();
        }
    };

    const formatCurrency = (value: string) => {
        const num = parseFloat(value || '0');
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(num);
    };

    const currentNAV = trancheData ? Number(formatUnits(trancheData[3], 6)) : 0;
    const investmentAmount = parseFloat(amount || '0');
    const newNAV = currentNAV + investmentAmount;
    const expectedAPY = trancheData ? Number(trancheData[4]) : 0;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-950 border border-yellow-500/20 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-yellow-500/10 bg-black/40">
                    <h2 className="text-xl font-bold text-white font-outfit tracking-tight translate-x-1 translate-y-2">
                        Invest in <span className="text-yellow-500">{tranche === 'junior' ? 'Junior' : 'Senior'} Tranche</span>
                    </h2>
                    
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <br />

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Amount Input */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] translate-x-1">
                            Investment Amount (USDT)
                        </label>
                        <br />
                        <div className="relative group">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-white font-outfit text-lg focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/40 transition-all outline-none placeholder:text-zinc-700"
                                disabled={step !== 'input'}
                            />
                            <button
                                onClick={handleMaxClick}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500 font-bold text-[10px] uppercase tracking-widest hover:text-yellow-400 transition-colors"
                                disabled={step !== 'input'}
                            >
                                MAX
                            </button>
                        </div>
                        <br />
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                Available Balance
                            </p>
                            <p className="text-[10px] text-white font-bold">
                                {usdtBalance ? formatCurrency(formatUnits(usdtBalance as bigint, 6)) : '$0.00'} USDT
                            </p>
                        </div>
                    </div>

                    {/* Investment Preview */}
                    {amount && parseFloat(amount) > 0 && (
                        <div className="bg-black/40 border border-yellow-500/5 rounded-2xl p-6 space-y-4">
                            <h3 className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-[0.3em] mb-4">Investment Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Your Investment</span>
                                    <span className="text-sm font-bold text-white font-outfit">{formatCurrency(amount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Current Tranche NAV</span>
                                    <span className="text-sm font-bold text-zinc-400 font-outfit">{formatCurrency(currentNAV.toString())}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-yellow-500/5">
                                    <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">New Tranche NAV</span>
                                    <span className="text-sm font-bold text-yellow-500 font-outfit">{formatCurrency(newNAV.toString())}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Expected APY</span>
                                    <span className="text-sm font-bold text-green-400 font-outfit">{expectedAPY}%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex space-x-4 p-8 bg-black/40 border-t border-yellow-500/10">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 border border-zinc-800 text-zinc-500 font-bold text-[11px] uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-900 hover:text-white transition-all"
                        disabled={step !== 'input'}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!amount || parseFloat(amount) <= 0 || step !== 'input'}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-[#FFD36A] to-[#E6B84F] text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        {step === 'approving' ? 'Approving...' : step === 'investing' ? 'Investing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
