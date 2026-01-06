import { useState } from 'react';
import { Zap } from 'lucide-react';

interface YieldSimulatorProps {
    onDistribute: (amount: number) => void;
}

export function YieldSimulator({ onDistribute }: YieldSimulatorProps) {
    const [amount, setAmount] = useState(0);

    const autoRepay = amount * 0.7;
    const senior = amount * 0.2;
    const junior = amount * 0.1;

    const handleDistribute = () => {
        if (amount > 0) {
            onDistribute(amount);
        }
    };

    return (
        <div className="bg-[#0A2342] border-2 border-[#00F5A0] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <Zap size={24} className="text-[#00F5A0]" />
                <h3 className="text-xl font-bold text-white">Yield Distribution Simulator</h3>
            </div>

            <div className="space-y-6">
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-semibold text-zinc-400 mb-2">
                        Total Yield Amount (USDC)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                        <input
                            type="number"
                            value={amount || ''}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder="25,000"
                            className="w-full pl-8 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                            min="0"
                        />
                    </div>
                </div>

                {/* Distribution Preview */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-white mb-2">Distribution Preview</h4>

                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Auto-Repay Borrowers (70%)</span>
                        <span className="text-[#00F5A0] font-mono font-semibold">
                            ${autoRepay.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Senior Tranche Yield (20%)</span>
                        <span className="text-[#00D4FF] font-mono font-semibold">
                            ${senior.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Junior Tranche Yield (10%)</span>
                        <span className="text-[#FFB800] font-mono font-semibold">
                            ${junior.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-white font-mono font-bold">
                            ${amount.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleDistribute}
                    disabled={amount === 0}
                    className="w-full py-3 bg-[#00F5A0] hover:bg-[#00F5A0]/90 text-[#0A2342] font-bold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Trigger Yield Distribution
                </button>
            </div>
        </div>
    );
}
