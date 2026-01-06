import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface FinancingPosition {
    nftId: number;
    assetName: string;
    assetType: string;
    collateralValue: number;
    monthlyIncome: number;
}

interface ActiveFinancingTableProps {
    positions: FinancingPosition[];
    totalDebt: number;
    onRepay: () => void;
}

export function ActiveFinancingTable({ positions, totalDebt, onRepay }: ActiveFinancingTableProps) {
    if (positions.length === 0) {
        return (
            <div className="px-6 py-12 text-center text-zinc-500">
                No active financing. Finance your assets to access liquidity.
            </div>
        );
    }

    const totalCollateralValue = positions.reduce((sum, p) => sum + p.collateralValue, 0);
    const avgDebtPerAsset = positions.length > 0 ? totalDebt / positions.length : 0;
    const ltv = totalCollateralValue > 0 ? (totalDebt / totalCollateralValue) * 100 : 0;

    return (
        <div className="px-6 py-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                    <p className="text-sm text-zinc-400 mb-1">Financed Assets</p>
                    <p className="text-2xl font-bold text-white">{positions.length}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                    <p className="text-sm text-zinc-400 mb-1">Total Collateral</p>
                    <p className="text-2xl font-bold text-[#00F5A0]">
                        ${totalCollateralValue.toLocaleString()}
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                    <p className="text-sm text-zinc-400 mb-1">Outstanding Debt</p>
                    <p className="text-2xl font-bold text-red-400">
                        ${totalDebt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                    <p className="text-sm text-zinc-400 mb-1">LTV Ratio</p>
                    <p className={`text-2xl font-bold ${ltv > 45 ? 'text-red-400' : 'text-[#00D4FF]'}`}>
                        {ltv.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Financing Positions Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">Asset</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">Type</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-400">Collateral Value</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-400">Monthly Income</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-400">Est. Debt</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-zinc-400">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions.map((position) => (
                            <tr key={position.nftId} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-gold/20 to-gold/5 rounded-lg flex items-center justify-center">
                                            <DollarSign size={20} className="text-gold" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{position.assetName || 'Unknown Asset'}</p>
                                            <p className="text-xs text-zinc-500">Token #{position.nftId || 'N/A'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        {position.assetType || 'Unknown Type'}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <p className="text-white font-mono font-semibold">
                                        ${(position.collateralValue || 0).toLocaleString()}
                                    </p>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <TrendingUp size={14} className="text-[#00D4FF]" />
                                        <p className="text-[#00D4FF] font-mono">
                                            ${(position.monthlyIncome || 0).toLocaleString()}/mo
                                        </p>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <p className="text-red-400 font-mono">
                                        ${avgDebtPerAsset.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </p>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                        Locked
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-zinc-700">
                            <td colSpan={4} className="py-4 px-4 text-right font-semibold text-white">
                                Total Outstanding Debt:
                            </td>
                            <td className="py-4 px-4 text-right">
                                <p className="text-red-400 font-mono font-bold text-lg">
                                    ${totalDebt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                            </td>
                            <td className="py-4 px-4 text-center">
                                <button
                                    onClick={onRepay}
                                    className="px-4 py-2 bg-gold hover:bg-gold/90 text-[#0A2342] font-semibold rounded-lg transition-colors text-sm"
                                >
                                    Repay Debt
                                </button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Info Banner */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="text-blue-400 font-semibold mb-1">RWA Financing Model</p>
                    <p className="text-zinc-400">
                        Debt is aggregated across all financed assets. Estimated debt per asset is calculated proportionally.
                        Repay your debt to unlock collateral assets. Auto-repayment uses monthly income to service debt.
                    </p>
                </div>
            </div>
        </div>
    );
}
