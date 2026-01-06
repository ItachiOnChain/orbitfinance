import { useState } from 'react';
import { X } from 'lucide-react';

interface AssetDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: {
        tokenId: number;
        name: string;
        currentDebt: number;
        autoRepayEnabled: boolean;
        totalBorrowed: number;
        totalRepaid: number;
    };
}

export function AssetDetailsModal({ isOpen, onClose, asset }: AssetDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'debt' | 'schedule' | 'settings'>('overview');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#0A2342] border border-zinc-800 rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">{asset.name}</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-zinc-800">
                    {(['overview', 'debt', 'schedule', 'settings'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${activeTab === tab
                                    ? 'text-gold border-b-2 border-gold'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-white mb-3">NFT Metadata</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Token ID</span>
                                        <span className="text-white font-mono">#{asset.tokenId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Asset Type</span>
                                        <span className="text-white">Rental Income</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Monthly Income</span>
                                        <span className="text-[#00F5A0] font-mono">$2,500</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'debt' && (
                        <div className="space-y-4">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-white mb-3">Debt Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Total Borrowed</span>
                                        <span className="text-white font-mono">${asset.totalBorrowed.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Total Repaid</span>
                                        <span className="text-[#00F5A0] font-mono">${asset.totalRepaid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-zinc-800">
                                        <span className="text-white font-semibold">Remaining Debt</span>
                                        <span className="text-red-400 font-mono font-bold">${asset.currentDebt.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-white mb-3">Repayment Schedule</h3>
                            <p className="text-zinc-400 text-sm">
                                Monthly payments of $2,500 automatically deducted from rental income.
                            </p>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-white mb-3">Auto-Repay Settings</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-300">Auto-Repayment</span>
                                <span className={`font-semibold ${asset.autoRepayEnabled ? 'text-[#00F5A0]' : 'text-zinc-500'}`}>
                                    {asset.autoRepayEnabled ? '✅ Enabled' : '❌ Disabled'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button className="flex-1 py-3 bg-[#00F5A0]/10 hover:bg-[#00F5A0]/20 text-[#00F5A0] font-semibold rounded-lg transition-colors">
                        Repay Now
                    </button>
                    <button className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg transition-colors">
                        Close Position
                    </button>
                </div>
            </div>
        </div>
    );
}
