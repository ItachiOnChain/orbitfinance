import type { ReactNode } from 'react';

interface MetricCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    valueClassName?: string;
}

export function MetricCard({ title, value, icon, valueClassName = 'text-white' }: MetricCardProps) {
    return (
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-zinc-400 font-light">{title}</span>
                <div className="text-zinc-500">{icon}</div>
            </div>
            <div className={`text-3xl font-light ${valueClassName}`}>
                {value}
            </div>
        </div>
    );
}
