
interface FilterTabsProps {
    activeFilter: 'all' | 'upcoming' | 'raising' | 'staking' | 'finalRedemption' | 'ended';
    onFilterChange: (filter: 'all' | 'upcoming' | 'raising' | 'staking' | 'finalRedemption' | 'ended') => void;
}

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'raising', label: 'Raising' },
        { id: 'staking', label: 'Staking' },
        { id: 'finalRedemption', label: 'Final Redemption' },
        { id: 'ended', label: 'Ended' },
    ];

    return (
        <div className="flex items-center gap-2">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onFilterChange(tab.id as any)}
                    className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] transition-all relative group ${activeFilter === tab.id
                            ? 'text-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]'
                            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                        } rounded-xl`}
                >
                    <span className="relative z-10">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
