import type { ReactNode } from 'react';

interface MetricCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    valueClassName?: string;
}

export function MetricCard({ title, value, icon, valueClassName = 'text-white' }: MetricCardProps) {
    return (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm hover:border-gold/20 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-zinc-400 font-light font-outfit tracking-wide">{title}</span>
                    <div className="text-zinc-500 group-hover:text-gold transition-colors">{icon}</div>
                </div>
                <div className={`text-3xl font-light font-outfit ${valueClassName}`}>
                    {value}
                </div>
            </div>
        </div>
    );
}
