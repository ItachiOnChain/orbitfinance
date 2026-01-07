import React from 'react';

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
        <div className="flex space-x-2 border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onFilterChange(tab.id as any)}
                    className={`px-6 py-3 text-sm font-medium transition-all relative ${activeFilter === tab.id
                            ? 'text-[#5B5FED] border-b-2 border-[#5B5FED]'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
