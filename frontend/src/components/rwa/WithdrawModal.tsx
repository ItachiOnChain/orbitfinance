import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    onWithdraw: (amount: number) => void;
    trancheType: 'senior' | 'junior';
    currentBalance: number;
    earnedYield: number;
    lockupPeriod?: number;
    lockupComplete?: boolean;
}

export function WithdrawModal({
    isOpen,
    onClose,
    onWithdraw,
    trancheType,
    currentBalance,
    earnedYield,
    lockupPeriod,
    lockupComplete = true,
}: WithdrawModalProps) {
    const [amount, setAmount] = useState(0);

    const isSenior = trancheType === 'senior';
    const accentColor = isSenior ? 'text-[#00D4FF]' : 'text-[#FFB800]';
    const bgColor = isSenior ? 'bg-[#00D4FF]' : 'bg-[#FFB800]';

    const totalAvailable = currentBalance + earnedYield;

    const handleWithdraw = () => {
        if (amount > 0 && amount <= totalAvailable) {
            onWithdraw(amount);
        }
    };

    const setMaxAmount = () => {
        setAmount(totalAvailable);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#0A2342] border border-zinc-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Withdraw from {isSenior ? 'Senior' : 'Junior'} Tranche
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Current Position */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Current Balance</span>
                            <span className="text-white font-mono font-semibold">
                                ${currentBalance.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Earned Yield</span>
                            <span className="text-[#00F5A0] font-mono font-semibold">
                                +${earnedYield.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                            <span className="text-zinc-300 font-semibold">Total Available</span>
                            <span className={`font-mono font-bold ${accentColor}`}>
                                ${totalAvailable.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Lockup Warning (Junior only) */}
                    {lockupPeriod && !lockupComplete && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 font-semibold text-sm mb-1">
                                    Lockup Period Not Complete
                                </p>
                                <p className="text-zinc-400 text-xs">
                                    You must wait {lockupPeriod} days from your initial deposit before withdrawing. Early withdrawal is not permitted.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-zinc-400">
                                Amount to Withdraw
                            </label>
                            <button
                                onClick={setMaxAmount}
                                className="text-xs text-gold hover:text-gold/80 font-semibold transition-colors"
                            >
                                MAX
                            </button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                            <input
                                type="number"
                                value={amount || ''}
                                onChange={(e) => setAmount(Math.min(Number(e.target.value), totalAvailable))}
                                placeholder="0"
                                className="w-full pl-8 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:border-gold focus:outline-none transition-colors"
                                min="0"
                                max={totalAvailable}
                                disabled={!lockupComplete}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            Maximum: ${totalAvailable.toLocaleString()}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleWithdraw}
                            disabled={amount === 0 || amount > totalAvailable || !lockupComplete}
                            className={`flex-1 py-3 ${bgColor} hover:opacity-90 text-[#0A2342] font-bold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Withdraw ${amount.toLocaleString()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
