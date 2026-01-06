export function TrancheComparison() {
    const features = [
        { name: 'APY', senior: '5.2% (Fixed)', junior: '14.8% (Variable)' },
        { name: 'Risk', senior: 'Low', junior: 'High' },
        { name: 'Payment Priority', senior: '1st', junior: '2nd' },
        { name: 'Liquidity', senior: 'Instant', junior: '30-day lockup' },
        { name: 'Minimum Deposit', senior: '$1,000', junior: '$1,000' },
        { name: 'Best For', senior: 'Conservative investors', junior: 'Risk-tolerant investors' },
    ];

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-zinc-900/80 border-b border-zinc-800">
                <h3 className="text-lg font-bold text-white">Feature Comparison</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-zinc-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Feature</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#00D4FF]">Senior Tranche</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFB800]">Junior Tranche</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {features.map((feature, index) => (
                            <tr
                                key={feature.name}
                                className={`${index % 2 === 0 ? 'bg-zinc-900/20' : 'bg-transparent'
                                    } hover:bg-zinc-900/40 transition-colors`}
                            >
                                <td className="px-6 py-4 text-zinc-300 font-medium">{feature.name}</td>
                                <td className="px-6 py-4 text-white">{feature.senior}</td>
                                <td className="px-6 py-4 text-white">{feature.junior}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
