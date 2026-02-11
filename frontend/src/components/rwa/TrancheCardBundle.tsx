import { formatUnits } from 'viem';
import { Info } from 'lucide-react';

interface TrancheCardProps {
    type: 'junior' | 'senior';
    data: {
        name: string;
        pricePerUnit: bigint;
        totalInvested: bigint;
        currentNAV: bigint;
        currentAPY: bigint;
        distributionPercentage: bigint;
    };
    onInvest: () => void;
}

export function TrancheCard({ type, data, onInvest }: TrancheCardProps) {
    const iconLetter = type === 'junior' ? 'J' : 'S';

    const formatCurrency = (value: bigint) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(Number(formatUnits(value, 6)));
    };

    return (
        <div className="border border-white/5 rounded-2xl p-8 transition-all bg-zinc-900/40 backdrop-blur-xl hover:bg-zinc-900/60 hover:border-gold/30 group shadow-2xl">
            <div className="flex items-start justify-between mb-10">
                <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center shadow-xl group-hover:border-gold/40 transition-all duration-500`}>
                        <span className="text-gold text-2xl font-black font-outfit">{iconLetter}</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">{data.name}</h3>
                        <div className="flex items-baseline space-x-2">
                            <p className="text-3xl font-bold text-white font-outfit tracking-tight">{formatCurrency(data.pricePerUnit)}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Per Token</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-8 items-end">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] translate-x-1">Distribution</p>
                    <p className="text-2xl font-bold text-white font-outfit translate-x-1">{Number(data.distributionPercentage)}%</p>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] translate-x-1">Total Investment</p>
                    <div className="flex items-baseline space-x-1">
                        <p className="text-xl font-bold text-white font-outfit">{formatCurrency(data.totalInvested)}</p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">USDT</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em]">NAV</p>
                    <div className="flex items-baseline space-x-1">
                        <p className="text-xl font-bold text-yellow-500 font-outfit">{formatCurrency(data.currentNAV)}</p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">USDT</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-zinc-500">
                        <Info className="w-3.5 h-3.5 text-yellow-500/50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">APY: {(Number(data.currentAPY) / 100).toFixed(1)}%</span>
                    </div>
                    <button
                        onClick={onInvest}
                        className="w-full bg-gradient-to-r from-[#FFD36A] to-[#E6B84F] hover:from-[#FFE082] hover:to-[#F5C860] text-black font-black py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-[1.02] active:scale-[0.98] text-[11px] uppercase tracking-[0.2em]"
                    >
                        Invest Now
                    </button>
                </div>
            </div>
        </div>
    );
}
