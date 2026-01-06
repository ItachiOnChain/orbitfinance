import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function TranchingExplainer() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-900/80 transition-colors"
            >
                <h3 className="text-lg font-bold text-white">How Tranching Works</h3>
                {isExpanded ? (
                    <ChevronUp size={20} className="text-zinc-400" />
                ) : (
                    <ChevronDown size={20} className="text-zinc-400" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-6 pb-6 space-y-8">
                    {/* Yield Waterfall */}
                    <div>
                        <h4 className="text-md font-semibold text-white mb-4">Yield Waterfall</h4>
                        <div className="flex flex-col items-center space-y-4">
                            {/* Step 1 */}
                            <div className="w-full max-w-md bg-zinc-800 rounded-lg p-4 text-center">
                                <p className="text-white font-medium">💰 Yield arrives from SPV</p>
                                <p className="text-zinc-400 text-sm mt-1">Monthly income from RWA assets</p>
                            </div>

                            {/* Arrow */}
                            <div className="flex flex-col items-center">
                                <div className="w-0.5 h-8 bg-gradient-to-b from-zinc-600 to-[#00D4FF]"></div>
                                <svg width="20" height="20" viewBox="0 0 20 20" className="text-[#00D4FF]">
                                    <path d="M10 15L5 10H15L10 15Z" fill="currentColor" />
                                </svg>
                            </div>

                            {/* Step 2 */}
                            <div className="w-full max-w-md bg-[#00D4FF]/10 border border-[#00D4FF] rounded-lg p-4 text-center">
                                <p className="text-[#00D4FF] font-medium">🛡️ Senior Tranche paid first</p>
                                <p className="text-zinc-400 text-sm mt-1">Fixed 5.2% APY guaranteed</p>
                            </div>

                            {/* Arrow */}
                            <div className="flex flex-col items-center">
                                <div className="w-0.5 h-8 bg-gradient-to-b from-[#00D4FF] to-[#FFB800]"></div>
                                <svg width="20" height="20" viewBox="0 0 20 20" className="text-[#FFB800]">
                                    <path d="M10 15L5 10H15L10 15Z" fill="currentColor" />
                                </svg>
                            </div>

                            {/* Step 3 */}
                            <div className="w-full max-w-md bg-[#FFB800]/10 border border-[#FFB800] rounded-lg p-4 text-center">
                                <p className="text-[#FFB800] font-medium">⚡ Remaining goes to Junior</p>
                                <p className="text-zinc-400 text-sm mt-1">Variable APY (~14.8%)</p>
                            </div>
                        </div>
                    </div>

                    {/* Loss Protection */}
                    <div>
                        <h4 className="text-md font-semibold text-white mb-4">Loss Protection</h4>
                        <div className="bg-zinc-800 rounded-lg p-6">
                            <p className="text-zinc-300 mb-4">
                                If a borrower defaults, the Junior Tranche absorbs losses first, protecting Senior capital.
                            </p>

                            {/* Visual representation */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-12 bg-[#00D4FF]/20 border-2 border-[#00D4FF] rounded-lg flex items-center justify-center">
                                        <span className="text-[#00D4FF] font-semibold text-sm">Senior: Protected</span>
                                    </div>
                                    <span className="text-[#00F5A0] text-xl">✓</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-12 bg-[#FFB800]/20 border-2 border-[#FFB800] rounded-lg flex items-center justify-center">
                                        <span className="text-[#FFB800] font-semibold text-sm">Junior: First Loss</span>
                                    </div>
                                    <span className="text-zinc-500 text-xl">🛡️</span>
                                </div>
                            </div>

                            <p className="text-zinc-400 text-sm mt-4">
                                This structure allows Senior investors to enjoy lower risk, while Junior investors earn higher returns for taking on additional risk.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
