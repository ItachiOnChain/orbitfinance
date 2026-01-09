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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-zinc-950 border border-yellow-500/20 rounded-3xl p-10 max-w-2xl w-full mx-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-bold text-white font-outfit tracking-tight">Manage <span className="text-yellow-500">Asset</span></h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Asset Details */}
                    <div className="bg-black/40 border border-yellow-500/5 rounded-2xl p-8 space-y-6">
                        <h3 className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-[0.3em]">Asset Information</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Asset Name</span>
                                <p className="text-white font-outfit font-medium text-lg">{asset.name}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Token ID</span>
                                <p className="text-white font-mono text-lg">#{asset.tokenId}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Total Value</span>
                                <p className="text-yellow-500 font-outfit font-bold text-xl">
                                    ${asset.totalValue.toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Monthly Income</span>
                                <p className="text-white font-outfit font-bold text-xl">
                                    ${asset.monthlyIncome.toLocaleString()} <span className="text-[10px] text-zinc-500 uppercase tracking-widest">/mo</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Borrowing Options */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-[0.3em]">Borrowing Options</h3>

                        {/* Amount Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Amount to Borrow</span>
                                <span className="text-white font-outfit font-bold text-2xl">
                                    ${Number(borrowAmount).toLocaleString()}
                                </span>
                            </div>

                            <div className="relative pt-2">
                                <input
                                    type="range"
                                    min="0"
                                    max={maxBorrowable}
                                    step="1000"
                                    value={borrowAmount}
                                    onChange={(e) => setBorrowAmount(e.target.value)}
                                    className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                                <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-3">
                                    <span>$0</span>
                                    <span>Max: ${maxBorrowable.toLocaleString()} (50% LTV)</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${borrowPercentage > 90 ? 'bg-red-500' : borrowPercentage > 70 ? 'bg-yellow-600' : 'bg-yellow-500'
                                        }`}
                                    style={{ width: `${borrowPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Manual Input */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Or enter amount manually</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-outfit font-bold">$</span>
                                <input
                                    type="number"
                                    value={borrowAmount || ''}
                                    onChange={(e) => setBorrowAmount(String(Math.min(Number(e.target.value), maxBorrowable)))}
                                    className="w-full pl-10 pr-5 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white font-outfit text-lg focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/40 transition-all outline-none placeholder:text-zinc-700"
                                    placeholder="0"
                                    min="0"
                                    max={maxBorrowable}
                                />
                            </div>
                        </div>

                        {/* Auto-Repayment */}
                        <div className="bg-black/40 border border-yellow-500/5 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="autoRepay"
                                        checked={autoRepay}
                                        onChange={(e) => setAutoRepay(e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-800 bg-zinc-900 text-yellow-500 focus:ring-yellow-500/20 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="autoRepay" className="text-white font-bold text-sm cursor-pointer flex items-center gap-2 uppercase tracking-wider">
                                        Enable Auto-Repayment
                                        <div className="group relative">
                                            <Info size={14} className="text-zinc-500 hover:text-yellow-500 cursor-help transition-colors" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block w-72 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 shadow-2xl z-10 leading-relaxed">
                                                Your monthly income will automatically be routed to repay this loan. The SPV handles this process seamlessly.
                                            </div>
                                        </div>
                                    </label>
                                    <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                                        Monthly income of <span className="text-white font-bold">${asset.monthlyIncome.toLocaleString()}</span> will automatically repay your debt
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Borrow Button */}
                    <button
                        onClick={handleBorrow}
                        disabled={isProcessing || currentBorrowAmount === 0 || currentBorrowAmount > maxBorrowable}
                        className="w-full py-5 bg-gradient-to-r from-[#FFD36A] to-[#E6B84F] hover:from-[#FFE082] hover:to-[#F5C860] text-black font-black rounded-xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.15)] hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-[12px] uppercase tracking-[0.3em]"
                    >
                        {isProcessing ? 'Processing...' : 'Confirm Borrow'}
                    </button>
                </div>
            </div>
        </div>
    );
}
