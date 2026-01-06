import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';

interface AccountChartProps {
    totalDeposit: number;
    debtLimit: number;
    withdrawable: number;
    debt: number;
    interest: number;
}

export function AccountChart({ totalDeposit, debtLimit, withdrawable, debt, interest }: AccountChartProps) {
    const data = [
        {
            name: 'Withdrawable',
            value: withdrawable,
            color: '#d4af37', // Gold
        },
        {
            name: 'Debt',
            value: debt,
            color: '#c2410c', // Dark Orange/Red
        },
        {
            name: 'Interest',
            value: interest,
            color: '#d4af37', // Gold
        },
    ];

    // Calculate max value for Y axis domain to ensure reference lines are visible
    const maxValue = Math.max(totalDeposit, debtLimit, withdrawable, debt, interest) * 1.2;

    return (
        <div className="w-full h-[350px] bg-zinc-900/40 rounded-2xl p-6 relative overflow-hidden border border-zinc-800/50 shadow-[0_0_40px_rgba(0,0,0,0.3)] group">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gold/5 blur-3xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Legend / Stats Header */}
            <div className="relative flex gap-12 mb-10 text-sm font-outfit border-b border-zinc-800/50 pb-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Total Deposit</span>
                    </div>
                    <span className="text-white text-xl font-light">ETH {totalDeposit.toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Debt Limit</span>
                    </div>
                    <span className="text-white text-xl font-light">ETH {debtLimit.toFixed(2)}</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="75%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                    barSize={100}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.3} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={({ x, y, payload }) => {
                            const item = data.find(d => d.name === payload.value);
                            return (
                                <g transform={`translate(${x},${y})`}>
                                    <text x={0} y={0} dy={20} textAnchor="middle" fill="#71717a" fontSize={11} fontFamily="var(--font-outfit)" className="uppercase tracking-[0.1em]">
                                        {payload.value}
                                    </text>
                                    <text x={0} y={0} dy={40} textAnchor="middle" fill="#d4af37" fontSize={13} fontFamily="var(--font-outfit)" fontWeight={500}>
                                        {item?.displayValue || ''}
                                    </text>
                                </g>
                            );
                        }}
                        height={70}
                    />
                    <YAxis
                        hide={true}
                        domain={[0, maxValue]}
                    />

                    {/* Total Deposit Line */}
                    <ReferenceLine
                        y={totalDeposit}
                        stroke="#f97316"
                        strokeDasharray="3 3"
                        strokeOpacity={0.5}
                        label={{
                            position: 'left',
                            value: `ETH ${totalDeposit.toFixed(2)}`,
                            fill: '#f97316',
                            fontSize: 10,
                            fontFamily: 'var(--font-outfit)',
                            dx: -10
                        }}
                    />

                    {/* Debt Limit Line */}
                    <ReferenceLine
                        y={debtLimit}
                        stroke="#d4af37"
                        strokeDasharray="3 3"
                        strokeOpacity={0.5}
                        label={{
                            position: 'left',
                            value: `ETH ${debtLimit.toFixed(2)}`,
                            fill: '#d4af37',
                            fontSize: 10,
                            fontFamily: 'var(--font-outfit)',
                            dx: -10
                        }}
                    />

                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                style={{ filter: `drop-shadow(0 0 10px ${entry.color}40)` }}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
