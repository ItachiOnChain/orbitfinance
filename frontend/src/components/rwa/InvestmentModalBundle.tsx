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
];

export function InvestmentModal({ poolId, tranche, trancheData, onClose, onSuccess }: InvestmentModalProps) {
    const { address } = useAccount();
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'input' | 'approving' | 'investing'>('input');

    // Get USDT balance
    const { data: usdtBalance } = useReadContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'balanceOf',
        args: [address],
    });

    // Get USDT allowance
    const { data: allowance } = useReadContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'allowance',
        args: [address, BUNDLE_POOL_ADDRESS],
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
            approveUSDT({
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
            invest({
                address: BUNDLE_POOL_ADDRESS as `0x${string}`,
                abi: BUNDLE_POOL_ABI,
                functionName: tranche === 'junior' ? 'investJuniorTranche' : 'investSeniorTranche',
                args: [BigInt(poolId), amountBigInt],
            });
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
    const totalInvested = trancheData ? Number(formatUnits(trancheData[2], 6)) : 0;
    const userShare = totalInvested > 0 ? ((investmentAmount / (totalInvested + investmentAmount)) * 100).toFixed(2) : '100.00';
    const expectedAPY = trancheData ? Number(trancheData[4]) : 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        Invest in {tranche === 'junior' ? 'Junior' : 'Senior'} Tranche
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Investment Amount (USDT)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5FED] focus:border-transparent"
                                disabled={step !== 'input'}
                            />
                            <button
                                onClick={handleMaxClick}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B5FED] font-semibold text-sm hover:text-[#4A4ED4]"
                                disabled={step !== 'input'}
                            >
                                MAX
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Your Balance: {usdtBalance ? formatCurrency(formatUnits(usdtBalance as bigint, 6)) : '$0.00'} USDT
                        </p>
                    </div>

                    {/* Investment Preview */}
                    {amount && parseFloat(amount) > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <h3 className="font-semibold text-gray-900 mb-3">Investment Preview</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Your Investment:</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Current Tranche NAV:</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(currentNAV.toString())}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">New Tranche NAV:</span>
                                <span className="font-semibold text-[#5B5FED]">{formatCurrency(newNAV.toString())}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Your Share:</span>
                                <span className="font-semibold text-gray-900">{userShare}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Expected APY:</span>
                                <span className="font-semibold text-green-600">{expectedAPY}%</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={step !== 'input'}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!amount || parseFloat(amount) <= 0 || step !== 'input'}
                        className="flex-1 px-6 py-3 bg-[#5B5FED] text-white font-semibold rounded-lg hover:bg-[#4A4ED4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 'approving' ? 'Approving...' : step === 'investing' ? 'Investing...' : 'Confirm Investment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
