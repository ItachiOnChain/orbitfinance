import type { ReactNode } from 'react';

interface AssetCardProps {
    icon: ReactNode;
    name: string;
    apy: string;
    ltv: string;
}

export function AssetCard({ icon, name, apy, ltv }: AssetCardProps) {
    return (
        <div className="p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-gold/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] group">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-gold">
                    {icon}
                </div>
                <h3 className="text-xl font-light text-white">{name}</h3>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400 font-light">APY</span>
                    <span className="text-sm text-gold font-light">{apy}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400 font-light">Max LTV</span>
                    <span className="text-sm text-white font-light">{ltv}</span>
                </div>
            </div>
        </div>
    );
}
