import { useState } from 'react';
import { useVaults } from '../../hooks/useVaults';
import { Card } from '../../components/ui/Card';
import { VaultCard } from '../../components/VaultCard';
import { BorrowModal } from '../../components/BorrowModal';
import { RepayModal } from '../../components/RepayModal';

export default function VaultsPage() {
    const { vaults, isLoading } = useVaults();
    const [expandedVault, setExpandedVault] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'your' | 'all' | 'unused'>('all');

    // Modal states
    const [borrowModalOpen, setBorrowModalOpen] = useState(false);
    const [repayModalOpen, setRepayModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400 font-light">Loading vaults...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-white mb-2">
                        Vaults
                    </h1>
                    <p className="text-zinc-400 font-light">
                        Deposit collateral and borrow your future yield right away.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setBorrowModalOpen(true)}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-light transition-colors"
                    >
                        Borrow
                    </button>
                    <button
                        onClick={() => setRepayModalOpen(true)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-light transition-colors"
                    >
                        Repay
                    </button>
                </div>
            </div>

            <div className="flex gap-2 border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab('your')}
                    className={`px-4 py-2 text-sm font-light transition-colors ${activeTab === 'your'
                            ? 'text-gold border-b-2 border-gold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Your Strategies
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 text-sm font-light transition-colors ${activeTab === 'all'
                            ? 'text-gold border-b-2 border-gold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    All Strategies
                </button>
                <button
                    onClick={() => setActiveTab('unused')}
                    className={`px-4 py-2 text-sm font-light transition-colors ${activeTab === 'unused'
                            ? 'text-gold border-b-2 border-gold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Unused Strategies
                </button>
            </div>

            <div className="space-y-4">
                {activeTab === 'your' && (
                    <Card className="p-8 text-center">
                        <p className="text-zinc-400 font-light">
                            No active strategies. Deposit to get started.
                        </p>
                    </Card>
                )}

                {activeTab === 'all' &&
                    vaults.map((vault) => (
                        <VaultCard
                            key={vault.address}
                            vault={vault}
                            isExpanded={expandedVault === vault.address}
                            onToggle={() =>
                                setExpandedVault(expandedVault === vault.address ? null : vault.address)
                            }
                        />
                    ))}

                {activeTab === 'unused' &&
                    vaults.map((vault) => (
                        <VaultCard
                            key={vault.address}
                            vault={vault}
                            isExpanded={expandedVault === vault.address}
                            onToggle={() =>
                                setExpandedVault(expandedVault === vault.address ? null : vault.address)
                            }
                        />
                    ))}
            </div>

            {/* Modals */}
            <BorrowModal isOpen={borrowModalOpen} onClose={() => setBorrowModalOpen(false)} />
            <RepayModal isOpen={repayModalOpen} onClose={() => setRepayModalOpen(false)} />
        </div>
    );
}
