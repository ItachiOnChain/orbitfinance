import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useVaults } from '../../hooks/useVaults';
import { useOrbitAccount } from '../../hooks/useOrbitAccount';
import { usePendingYield } from '../../hooks/usePendingYield';
import { VaultCard } from '../../components/VaultCard';
import { BorrowModal } from '../../components/BorrowModal';
import { RepayModal } from '../../components/RepayModal';
import { LiquidateModal } from '../../components/LiquidateModal';
import { LayoutGrid, Coins, Banknote, ArrowUpDown, RefreshCw, Eye } from 'lucide-react';
import { formatEther, formatUnits } from 'viem';

export default function VaultsPage() {
    const { address } = useAccount();
    const { vaults, isLoading } = useVaults();
    const { accountAddress, totalDebt, accumulatedCredit, wethShares, usdcShares } = useOrbitAccount(address);
    const { uiDebt, uiCredit } = usePendingYield(accountAddress);

    const [expandedVault, setExpandedVault] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'weth' | 'usdc'>('all');

    // Modal states
    const [borrowModalOpen, setBorrowModalOpen] = useState(false);
    const [repayModalOpen, setRepayModalOpen] = useState(false);
    const [liquidateModalOpen, setLiquidateModalOpen] = useState(false);

    // Calculate totals for display
    const WETH_PRICE = 3000;
    const USDC_PRICE = 1;
    const wethValue = wethShares ? parseFloat(formatEther(wethShares)) * WETH_PRICE : 0;
    const usdcValue = usdcShares ? parseFloat(formatUnits(usdcShares, 6)) * USDC_PRICE : 0;
    const totalDepositsUSD = wethValue + usdcValue;
    const currentDebtUSD = uiDebt ? parseFloat(formatEther(uiDebt)) : (totalDebt ? parseFloat(formatEther(totalDebt)) : 0);
    const accumulatedCreditUSD = uiCredit ? parseFloat(formatEther(uiCredit)) : (accumulatedCredit ? parseFloat(formatEther(accumulatedCredit)) : 0);

    const formatCurrency = (value: number) => {
        if (value < 0.01 && value > 0) {
            return `$${value.toFixed(6)}`;
        }
        return `$${value.toFixed(2)}`;
    };

    const filteredVaults = vaults.filter(vault => {
        if (activeTab === 'all') return true;
        if (activeTab === 'weth') return vault.asset.toLowerCase().includes('weth') || vault.name.toLowerCase().includes('weth');
        if (activeTab === 'usdc') return vault.asset.toLowerCase().includes('usdc') || vault.name.toLowerCase().includes('usdc');
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400 font-light">Loading vaults...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-start gap-6">
                <div className="p-4 rounded-full border border-gold/20 bg-gold/5 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                    <LayoutGrid className="w-8 h-8 text-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                </div>
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                        Vaults
                    </h1>
                    <br />

                    <p className="text-zinc-400 font-light">
                        Deposit collateral and borrow your future yield right away.
                    </p>
                </div>
            </div>

            <br />
            {/* Golden Separator Line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
            <br />

            {/* Filter Tabs */}
            <div className="flex gap-4 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50 w-fit">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-light transition-all ${activeTab === 'all'
                            ? 'bg-zinc-800 text-gold border border-gold/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    All Vaults
                </button>
                <button
                    onClick={() => setActiveTab('weth')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-light transition-all ${activeTab === 'weth'
                            ? 'bg-zinc-800 text-gold border border-gold/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                >
                    <Coins className="w-4 h-4" />
                    WETH
                </button>
                <button
                    onClick={() => setActiveTab('usdc')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-light transition-all ${activeTab === 'usdc'
                            ? 'bg-zinc-800 text-gold border border-gold/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                >
                    <Banknote className="w-4 h-4" />
                    USDC
                </button>
            </div>
            <br />

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-8 bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/50 hover:border-gold/20 transition-colors duration-500">
                <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total Deposit</p>
                    <p className="text-2xl font-light text-gold drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">{formatCurrency(totalDepositsUSD)}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Current Debt</p>
                    <p className="text-2xl font-light text-gold drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">{formatCurrency(currentDebtUSD)}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Accumulated Credit</p>
                    <p className="text-2xl font-light text-gold drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">{formatCurrency(accumulatedCreditUSD)}</p>
                </div>
                <div className="border-l border-zinc-800 pl-8">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Global TVL</p>
                    <p className="text-2xl font-light text-gold drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">$43,054,683.64</p>
                </div>
            </div>
            <br />

            {/* Action Buttons */}
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4">
                <button
                    onClick={() => setBorrowModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800 transition-all group"
                >
                    <ArrowUpDown className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    <span className="font-light">Borrow</span>
                </button>
                <button
                    onClick={() => setRepayModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800 transition-all group"
                >
                    <ArrowUpDown className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    <span className="font-light">Repay</span>
                </button>
                <button
                    onClick={() => setLiquidateModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800 transition-all group"
                >
                    <RefreshCw className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    <span className="font-light">Liquidate</span>
                </button>
                <button className="px-6 py-4 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800 transition-all">
                    <Eye className="w-5 h-5 text-zinc-400" />
                </button>
            </div>
            <br />

            {/* Strategies List */}
            <div className="space-y-4">
                <div className="flex gap-6 px-4">
                    <button className="text-sm font-medium text-zinc-300 bg-zinc-800/50 px-3 py-1 rounded-md">Your Strategies</button>
                    <button className="text-sm font-medium text-zinc-500 hover:text-zinc-300 px-3 py-1 rounded-md transition-colors">All Strategies</button>
                    <button className="text-sm font-medium text-zinc-500 hover:text-zinc-300 px-3 py-1 rounded-md transition-colors">Unused Strategies</button>
                </div>
                <br />

                <div className="space-y-4">
                    {filteredVaults.map((vault) => (
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
            </div>


            {/* Modals */}
            <BorrowModal isOpen={borrowModalOpen} onClose={() => setBorrowModalOpen(false)} />
            <RepayModal isOpen={repayModalOpen} onClose={() => setRepayModalOpen(false)} />
            <LiquidateModal isOpen={liquidateModalOpen} onClose={() => setLiquidateModalOpen(false)} />
        </div>
    );
}
