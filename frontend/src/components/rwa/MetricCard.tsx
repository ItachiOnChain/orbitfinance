interface MetricCardProps {
    label: string;
    value: string | number;
    icon?: string;
    color?: string;
}

export function MetricCard({ label, value, icon, color = '#00F5A0' }: MetricCardProps) {
    return (
        <div className="bg-[#0A2342] border border-zinc-800 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-2">
                <span className="text-zinc-500 text-sm font-medium">{label}</span>
                {icon && <span className="text-2xl">{icon}</span>}
            </div>
            <div
                className="text-3xl font-bold font-mono tracking-tight"
                style={{ color }}
            >
                {value}
            </div>
        </div>
    );
}
