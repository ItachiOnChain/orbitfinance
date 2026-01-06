import { useState } from 'react';
import { X, Info } from 'lucide-react';

interface ManageAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBorrow: (amount: number, autoRepay: boolean) => void;
    asset: {
        tokenId: number;
        name: string;
        totalValue: number;
        monthlyIncome: number;
    };
}

export function ManageAssetModal({ isOpen, onClose, onBorrow, asset }: ManageAssetModalProps) {
    const [borrowAmount, setBorrowAmount] = useState('');
    const [autoRepay, setAutoRepay] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const maxBorrowable = asset.totalValue * 0.5; // 50% LTV
    const currentBorrowAmount = parseFloat(borrowAmount) || 0;
    const borrowPercentage = (currentBorrowAmount / maxBorrowable) * 100;

    const handleBorrow = async () => {
        if (isProcessing) {
            console.log('Already processing, ignoring duplicate click');
            return;
        }

        const amount = parseFloat(borrowAmount);
        if (!amount || amount <= 0 || amount > maxBorrowable) {
            console.warn('Invalid borrow amount', { borrowAmount: amount, maxBorrowable });
            return;
        }

        console.log('ManageAssetModal handleBorrow clicked', { borrowAmount: amount, maxBorrowable, autoRepay });

        setIsProcessing(true);

        try {
            console.log('Calling onBorrow callback');
            await onBorrow(amount, autoRepay);
            // Optionally, close modal or show success message here
        } catch (error) {
            console.error('Borrow failed:', error);
            // Optionally, show error message to user
        } finally {
            // Reset after 3 seconds to allow retry if needed, or immediately if onBorrow handles closing
            setTimeout(() => {
                setIsProcessing(false);
            }, 3000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#0A2342] border border-zinc-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Manage Asset</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Asset Details */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Asset Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-zinc-400 text-sm">Asset Name</span>
                                <span className="text-white font-medium">{asset.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 text-sm">Token ID</span>
                                <span className="text-white font-mono">#{asset.tokenId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 text-sm">Total Value</span>
                                <span className="text-[#00F5A0] font-mono font-semibold">
                                    ${asset.totalValue.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 text-sm">Monthly Income</span>
                                <span className="text-[#00D4FF] font-mono">
                                    ${asset.monthlyIncome.toLocaleString()}/mo
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Borrowing Options */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Borrowing Options</h3>

                        {/* Amount Slider */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Amount to Borrow</span>
                                <span className="text-white font-mono font-semibold">
                                    ${borrowAmount.toLocaleString()}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max={maxBorrowable}
                                step="1000"
                                value={borrowAmount}
                                onChange={(e) => setBorrowAmount(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold"
                            />

                            <div className="flex justify-between text-xs text-zinc-500">
                                <span>$0</span>
                                <span>Max: ${maxBorrowable.toLocaleString()} (50% LTV)</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${borrowPercentage > 90 ? 'bg-red-500' : borrowPercentage > 70 ? 'bg-[#FFB800]' : 'bg-[#00F5A0]'
                                        }`}
                                    style={{ width: `${borrowPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Manual Input */}
                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-zinc-400 mb-2">Or enter amount manually</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                <input
                                    type="number"
                                    value={borrowAmount || ''}
                                    onChange={(e) => setBorrowAmount(String(Math.min(Number(e.target.value), maxBorrowable)))}
                                    className="w-full pl-8 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-gold focus:outline-none transition-colors"
                                    placeholder="0"
                                    min="0"
                                    max={maxBorrowable}
                                />
                            </div>
                        </div>

                        {/* Auto-Repayment */}
                        <div className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="autoRepay"
                                    checked={autoRepay}
                                    onChange={(e) => setAutoRepay(e.target.checked)}
                                    className="mt-1 w-4 h-4 accent-gold cursor-pointer"
                                />
                                <div className="flex-1">
                                    <label htmlFor="autoRepay" className="text-white font-semibold cursor-pointer flex items-center gap-2">
                                        Enable Auto-Repayment
                                        <div className="group relative">
                                            <Info size={16} className="text-zinc-500 hover:text-gold cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 shadow-xl z-10">
                                                Your monthly income will automatically be routed to repay this loan. The SPV handles this process seamlessly.
                                            </div>
                                        </div>
                                    </label>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        Monthly income of ${asset.monthlyIncome.toLocaleString()} will automatically repay your debt
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Borrow Button */}
                    <button
                        onClick={handleBorrow}
                        disabled={isProcessing || currentBorrowAmount === 0 || currentBorrowAmount > maxBorrowable}
                        className="w-full py-4 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0A2342] font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Borrow'}
                    </button>
                </div>
            </div>
        </div>
    );
}
