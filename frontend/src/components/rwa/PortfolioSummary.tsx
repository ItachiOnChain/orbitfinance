import type { LucideProps } from 'lucide-react';

interface PortfolioSummaryProps {
    label: string;
    value: string;
    icon: React.ComponentType<LucideProps>;
    trend?: {
        direction: 'up' | 'down';
        value: string;
    };
    valueColor?: string;
}

export function PortfolioSummary({
    label,
    value,
    icon: Icon,
    trend,
    valueColor = 'text-white',
}: PortfolioSummaryProps) {
    return (
        <div className="bg-[#0A2342] border border-zinc-800 rounded-xl p-6 hover:border-gold/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <span className="text-zinc-400 text-sm font-medium">{label}</span>
                <Icon size={20} className="text-zinc-500" />
            </div>

            <div className="space-y-2">
                <div className={`text-3xl font-bold font-mono ${valueColor}`}>
                    {value}
                </div>

                {trend && (
                    <div className="flex items-center gap-1">
                        <span className={`text-xs ${trend.direction === 'up' ? 'text-[#00F5A0]' : 'text-red-400'}`}>
                            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
                        </span>
                        <span className="text-xs text-zinc-500">vs last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}
