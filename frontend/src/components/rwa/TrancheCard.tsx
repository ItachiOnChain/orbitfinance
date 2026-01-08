import { motion } from 'framer-motion';
import { Shield, TrendingUp, BarChart3, Layers, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TrancheCardProps {
    type: 'senior' | 'junior';
    apy: number;
    tvl: number;
    userPosition: number;
    riskLevel: string;
    priority: number;
    lockupPeriod?: number;
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
    lockupPeriod,
    onDeposit,
    onWithdraw
}: TrancheCardProps) {
    const isSenior = type === 'senior';
    const accentColor = isSenior ? '#00D4FF' : '#FFB800';
    const glowColor = isSenior ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 184, 0, 0.2)';
    
    const bgGradient = isSenior
        ? 'from-[#00D4FF]/10 to-blue-900/10'
        : 'from-[#FFB800]/10 to-orange-900/10';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 group`}
            style={{ boxShadow: `0 10px 30px -10px ${glowColor}` }}
        >
            {/* Decorative background element */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-30" style={{ background: accentColor }} />

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50" style={{ color: accentColor }}>
                        {isSenior ? <Shield size={24} /> : <Layers size={24} />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1" style={{ color: accentColor }}>
                            {isSenior ? 'Senior' : 'Junior'} Tranche
                        </h3>
                        <p className="text-sm text-zinc-400">
                            {isSenior ? 'Lower risk, stable returns' : 'Higher risk, higher returns'}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] tracking-widest font-bold border ${
                    riskLevel.toLowerCase() === 'low' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                }`}>
                    {riskLevel.toUpperCase()} RISK
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800/30 hover:bg-zinc-900/60 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-zinc-500" />
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">APY</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{apy}%</p>
                </div>
                <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800/30 hover:bg-zinc-900/60 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 size={14} className="text-zinc-500" />
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">TVL</p>
                    </div>
                    <p className="text-xl font-semibold text-white">${tvl.toLocaleString()}</p>
                </div>
                <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800/30 hover:bg-zinc-900/60 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Your Position</p>
                    </div>
                    <p className="text-xl font-semibold" style={{ color: accentColor }}>
                        ${userPosition.toLocaleString()}
                    </p>
                </div>
                <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800/30 hover:bg-zinc-900/60 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Layers size={14} className="text-zinc-500" />
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Priority</p>
                    </div>
                    <p className="text-xl font-semibold text-white">#{priority}</p>
                </div>
                {lockupPeriod && (
                    <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800/30 hover:bg-zinc-900/60 transition-colors col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={14} className="text-zinc-500" />
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Lockup Period</p>
                        </div>
                        <p className="text-xl font-semibold text-white">{lockupPeriod} Months</p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={onDeposit}
                    className="flex-1 group/btn relative overflow-hidden bg-gold text-dark-bg font-bold py-3.5 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gold/10"
                >
                    <div className="flex items-center justify-center gap-2">
                        <span>Deposit</span>
                        <ArrowUpRight size={18} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </div>
                </button>
                <button
                    onClick={onWithdraw}
                    className="flex-1 bg-zinc-800/50 hover:bg-zinc-800 text-white font-bold py-3.5 px-6 rounded-xl border border-zinc-700/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="flex items-center justify-center gap-2">
                        <span>Withdraw</span>
                        <ArrowDownLeft size={18} />
                    </div>
                </button>
            </div>

            {/* Info Footer */}
            <div className="mt-6 pt-6 border-t border-zinc-800/50">
                <p className="text-xs text-zinc-500 leading-relaxed">
                    {isSenior
                        ? 'Senior tranche holders receive fixed returns and are paid first in the waterfall distribution.'
                        : 'Junior tranche holders absorb first losses but receive higher variable returns from excess yields.'}
                </p>
            </div>
        </motion.div>
    );
}
