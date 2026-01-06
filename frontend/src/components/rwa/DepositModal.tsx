import { useState } from 'react';
import { X } from 'lucide-react';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeposit: (amount: number) => void;
    trancheType: 'senior' | 'junior';
    apy: number;
    lockupPeriod?: number;
}

export function DepositModal({
    isOpen,
    onClose,
    onDeposit,
    trancheType,
    apy,
    lockupPeriod,
}: DepositModalProps) {
    const [amount, setAmount] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (numAmount > 0 && numAmount >= 1000) {
            onDeposit(numAmount);
            setAmount('');
        }
    };

    const isSenior = trancheType === 'senior';
    const numAmount = parseFloat(amount) || 0;
    const expectedYield = numAmount * (apy / 100);
    const monthlyYield = expectedYield / 12;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0A2342] border-2 border-gold rounded-xl p-8 max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Deposit to {isSenior ? 'Senior' : 'Junior'} Tranche
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">
                            Amount (USDC)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="1000"
                                step="0.01"
                                className="w-full pl-8 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-gold focus:outline-none transition-colors"
                                required
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            Minimum: $1,000
                        </p>
                    </div>

                    {/* Expected Returns */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-zinc-400">You will receive:</h3>

                        <div className="flex justify-between">
                            <span className="text-zinc-400">Receipt Tokens</span>
                            <span className="text-white font-mono font-semibold">
                                {numAmount > 0 ? numAmount.toLocaleString() : '0'}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-zinc-400">APY</span>
                            <span className={`font-mono font-semibold ${isSenior ? 'text-[#00D4FF]' : 'text-[#FFB800]'}`}>
                                {apy}%
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-zinc-400">Expected Annual Yield</span>
                            <span className="text-[#00F5A0] font-mono font-semibold">
                                ${numAmount > 0 ? expectedYield.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-zinc-400">Paid Monthly to Wallet</span>
                            <span className="text-[#00F5A0] font-mono font-semibold">
                                ${numAmount > 0 ? monthlyYield.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}/mo
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-gold/10 border border-gold/30 rounded-lg p-3">
                        <p className="text-xs text-zinc-300">
                            <strong>Transaction steps:</strong>
                        </p>
                        <ol className="text-xs text-zinc-400 mt-2 space-y-1 ml-4 list-decimal">
                            <li>Approve USDC for tranche contract</li>
                            <li>Deposit USDC and receive receipt tokens</li>
                            <li>Start earning yield immediately</li>
                        </ol>
                    </div>

                    {!isSenior && lockupPeriod && (
                        <div className="bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-lg p-3">
                            <p className="text-xs text-[#FFB800]">
                                ⚠️ Junior tranche has a {lockupPeriod}-day withdrawal lockup period
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!amount || parseFloat(amount) < 1000}
                        className={`w-full py-3 ${isSenior ? 'bg-[#00D4FF]' : 'bg-[#FFB800]'} hover:opacity-90 text-[#0A2342] font-bold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Deposit ${numAmount > 0 ? numAmount.toLocaleString() : '0'}
                    </button>
                </form>
            </div>
        </div>
    );
}
