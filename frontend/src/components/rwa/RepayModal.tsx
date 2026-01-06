import { useState } from 'react';
import { X, Info, AlertCircle } from 'lucide-react';

interface RepayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRepay: (amount: number) => void;
    totalDebt: number;
    collateralCount: number;
}

export function RepayModal({ isOpen, onClose, onRepay, totalDebt, collateralCount }: RepayModalProps) {
    const [repayAmount, setRepayAmount] = useState(0);
    const [repayPercentage, setRepayPercentage] = useState(0);

    const handleAmountChange = (amount: number) => {
        const capped = Math.min(amount, totalDebt);
        setRepayAmount(capped);
        setRepayPercentage((capped / totalDebt) * 100);
    };

    const handlePercentageChange = (percentage: number) => {
        const amount = (totalDebt * percentage) / 100;
        setRepayAmount(amount);
        setRepayPercentage(percentage);
    };

    const handleRepay = () => {
        if (repayAmount > 0 && repayAmount <= totalDebt) {
            onRepay(repayAmount);
            onClose();
        }
    };

    const remainingDebt = totalDebt - repayAmount;
    const willUnlockCollateral = remainingDebt === 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#0A2342] border border-zinc-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Repay Debt</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Current Debt Summary */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Current Position</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-zinc-400 mb-1">Outstanding Debt</p>
                                <p className="text-red-400 font-mono font-bold text-2xl">
                                    ${totalDebt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-400 mb-1">Locked Collateral</p>
                                <p className="text-white font-semibold text-xl">
                                    {collateralCount} Asset{collateralCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Repayment Amount */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Repayment Amount</h3>

                        {/* Quick Percentage Buttons */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[25, 50, 75, 100].map((pct) => (
                                <button
                                    key={pct}
                                    onClick={() => handlePercentageChange(pct)}
                                    className={`py-2 px-4 rounded-lg font-semibold transition-colors ${repayPercentage === pct
                                            ? 'bg-gold text-[#0A2342]'
                                            : 'bg-zinc-900/50 border border-zinc-800 text-white hover:border-gold'
                                        }`}
                                >
                                    {pct}%
                                </button>
                            ))}
                        </div>

                        {/* Amount Slider */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Amount to Repay</span>
                                <span className="text-white font-mono font-semibold">
                                    ${repayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max={totalDebt}
                                step={totalDebt / 100}
                                value={repayAmount}
                                onChange={(e) => handleAmountChange(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold"
                            />

                            <div className="flex justify-between text-xs text-zinc-500">
                                <span>$0</span>
                                <span>Max: ${totalDebt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-300 bg-gold"
                                    style={{ width: `${repayPercentage}%` }}
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
                                    value={repayAmount || ''}
                                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-gold focus:outline-none transition-colors"
                                    placeholder="0"
                                    min="0"
                                    max={totalDebt}
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>

                    {/* After Repayment Summary */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">After Repayment</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Remaining Debt</span>
                                <span className={`font-mono font-semibold ${remainingDebt === 0 ? 'text-[#00F5A0]' : 'text-red-400'}`}>
                                    ${remainingDebt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Collateral Status</span>
                                <span className={`font-semibold ${willUnlockCollateral ? 'text-[#00F5A0]' : 'text-yellow-400'}`}>
                                    {willUnlockCollateral ? '✅ Unlocked' : '🔒 Locked'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info Banner */}
                    {willUnlockCollateral && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
                            <Info size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="text-green-400 font-semibold mb-1">Full Repayment</p>
                                <p className="text-zinc-400">
                                    Your collateral will be unlocked and available for withdrawal after this repayment.
                                </p>
                            </div>
                        </div>
                    )}

                    {!willUnlockCollateral && repayAmount > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="text-yellow-400 font-semibold mb-1">Partial Repayment</p>
                                <p className="text-zinc-400">
                                    Collateral remains locked until full debt repayment. You can make additional repayments anytime.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Repay Button */}
                    <button
                        onClick={handleRepay}
                        disabled={repayAmount === 0 || repayAmount > totalDebt}
                        className="w-full py-4 bg-gold hover:bg-gold/90 text-[#0A2342] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {willUnlockCollateral ? 'Repay & Unlock Collateral' : `Repay $${repayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    </button>

                    <p className="text-xs text-zinc-500 text-center">
                        This will trigger two transactions: (1) Approve USDC, (2) Repay debt
                    </p>
                </div>
            </div>
        </div>
    );
}
