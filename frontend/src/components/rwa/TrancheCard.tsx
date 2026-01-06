interface TrancheCardProps {
    type: 'senior' | 'junior';
    apy: number;
    tvl: number;
    userPosition: number;
    riskLevel: 'low' | 'high';
    priority: number;
    lockupPeriod?: number;
    onDeposit: () => void;
    onWithdraw: () => void;
}

export function TrancheCard({
    type,
    apy,
    tvl,
    userPosition,
    riskLevel,
    priority,
    lockupPeriod,
    onDeposit,
    onWithdraw,
}: TrancheCardProps) {
    const isSenior = type === 'senior';
    const bgColor = isSenior ? 'bg-[#00D4FF]/5' : 'bg-[#FFB800]/5';
    const borderColor = isSenior ? 'border-[#00D4FF]' : 'border-[#FFB800]';
    const accentColor = isSenior ? 'text-[#00D4FF]' : 'text-[#FFB800]';
    const glowColor = isSenior ? 'hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]' : 'hover:shadow-[0_0_30px_rgba(255,184,0,0.2)]';

    return (
        <div className={`${bgColor} border-2 ${borderColor} rounded-2xl p-8 transition-all duration-300 ${glowColor} hover:-translate-y-1`}>
            {/* Header */}
            <div className="mb-6">
                <h3 className={`text-2xl font-bold ${accentColor} mb-1 tracking-wide`}>
                    {type.toUpperCase()} TRANCHE
                </h3>
                <p className="text-zinc-500 text-sm">
                    {isSenior ? '(Protected Capital)' : '(First-Loss Capital)'}
                </p>
            </div>

            {/* APY */}
            <div className="mb-6">
                <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold font-mono ${accentColor}`}>
                        {apy}%
                    </span>
                    <span className="text-zinc-400 text-sm">APY</span>
                    {!isSenior && (
                        <span className="text-xs text-zinc-500 ml-2">(variable)</span>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Total Value Locked</span>
                    <span className="text-white font-mono font-semibold">
                        ${tvl.toLocaleString()}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Your Position</span>
                    <span className={`font-mono font-semibold ${userPosition > 0 ? accentColor : 'text-zinc-500'}`}>
                        ${userPosition.toLocaleString()}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Risk Level</span>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {Array.from({ length: riskLevel === 'low' ? 1 : 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${riskLevel === 'low' ? 'bg-[#00F5A0]' : 'bg-[#FFB800]'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className={`text-sm font-semibold ${riskLevel === 'low' ? 'text-[#00F5A0]' : 'text-[#FFB800]'
                            }`}>
                            {riskLevel === 'low' ? 'Low' : 'High'}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Payment Priority</span>
                    <span className="text-white font-semibold">
                        {priority === 1 ? '1st' : '2nd'}
                    </span>
                </div>

                {lockupPeriod && (
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Lockup Period</span>
                        <span className="text-white font-semibold">
                            {lockupPeriod} days
                        </span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onDeposit}
                    className={`flex-1 py-3 ${isSenior ? 'bg-[#00D4FF]' : 'bg-[#FFB800]'} hover:opacity-90 text-[#0A2342] font-bold rounded-lg transition-opacity`}
                >
                    Deposit
                </button>
                <button
                    onClick={onWithdraw}
                    disabled={userPosition === 0}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Withdraw
                </button>
            </div>
        </div>
    );
}
