import type { ReactNode } from 'react';

interface AssetCardProps {
    icon: ReactNode;
    name: string;
    apy: string;
    ltv: string;
}

export function AssetCard({ icon, name, apy, ltv }: AssetCardProps) {
    return (
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-gold/30 transition-all duration-300 hover:transform hover:-translate-y-1">
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
