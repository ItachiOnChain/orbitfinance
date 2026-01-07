interface TrancheCardProps {
    type: 'senior' | 'junior';
    apy: string;
    tvl: string;
    userPosition: string;
    riskLevel: string;
    priority: number;
    onDeposit: () => void;
    onWithdraw: () => void;
}

export function TrancheCard({
    type,
    apy,
    tvl,
    userPosition,
    riskLevel,
    priority,
    onDeposit,
    onWithdraw
}: TrancheCardProps) {
    const isSenior = type === 'senior';
    const accentColor = isSenior ? '#00D4FF' : '#FFB800';
    const bgGradient = isSenior
        ? 'from-[#00D4FF]/10 to-blue-900/10'
        : 'from-[#FFB800]/10 to-orange-900/10';

    return (
        <div className={`bg-gradient-to-br ${bgGradient} border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-1" style={{ color: accentColor }}>
                        {isSenior ? 'Senior' : 'Junior'} Tranche
                    </h3>
                    <p className="text-sm text-zinc-400">
                        {isSenior ? 'Lower risk, stable returns' : 'Higher risk, higher returns'}
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${riskLevel === 'low' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                    {riskLevel.toUpperCase()} RISK
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-900/50 rounded-lg p-4">
                    <p className="text-xs text-zinc-500 mb-1">APY</p>
                    <p className="text-2xl font-bold text-white">{apy}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-4">
                    <p className="text-xs text-zinc-500 mb-1">Total Value Locked</p>
                    <p className="text-xl font-semibold text-white">${tvl}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-4">
                    <p className="text-xs text-zinc-500 mb-1">Your Position</p>
                    <p className="text-xl font-semibold" style={{ color: accentColor }}>
                        ${userPosition}
                    </p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-4">
                    <p className="text-xs text-zinc-500 mb-1">Payment Priority</p>
                    <p className="text-xl font-semibold text-white">#{priority}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onDeposit}
                    className="flex-1 bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-dark-bg font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-gold/20"
                >
                    Deposit
                </button>
                <button
                    onClick={onWithdraw}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                    Withdraw
                </button>
            </div>

            {/* Info Footer */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500">
                    {isSenior
                        ? 'Senior tranche holders receive fixed returns and are paid first in the waterfall distribution.'
                        : 'Junior tranche holders absorb first losses but receive higher variable returns from excess yields.'}
                </p>
            </div>
        </div>
    );
}
