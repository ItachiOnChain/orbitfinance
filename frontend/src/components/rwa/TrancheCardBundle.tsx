import { formatUnits } from 'viem';
import { Info } from 'lucide-react';

interface TrancheCardProps {
    type: 'junior' | 'senior';
    data: {
        name: string;
        pricePerUnit: bigint;
        totalInvested: bigint;
        currentNAV: bigint;
        currentAPY: bigint;
        distributionPercentage: bigint;
    };
    onInvest: () => void;
}

export function TrancheCard({ type, data, onInvest }: TrancheCardProps) {
    const isJunior = type === 'junior';
    const iconBg = isJunior ? 'bg-gradient-to-br from-orange-400 to-yellow-500' : 'bg-gradient-to-br from-blue-500 to-purple-600';
    const iconLetter = isJunior ? 'J' : 'S';

    const formatCurrency = (value: bigint) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(Number(formatUnits(value, 6)));
    };

    return (
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-2xl font-bold">{iconLetter}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.pricePerUnit)}</p>
                        <p className="text-sm text-gray-500">Per Token</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Distribution</p>
                    <p className="text-xl font-bold text-gray-900">{Number(data.distributionPercentage)}%</p>
                </div>

                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Investment</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(data.totalInvested)}</p>
                    <p className="text-xs text-gray-500">USDT</p>
                </div>

                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">NAV</p>
                    <p className="text-lg font-semibold text-[#5B5FED]">{formatCurrency(data.currentNAV)}</p>
                    <p className="text-xs text-gray-500">USDT</p>
                </div>

                <div className="flex flex-col justify-between">
                    <div className="flex items-center space-x-1 text-gray-500 mb-2">
                        <Info className="w-4 h-4" />
                        <span className="text-xs">Current APY: {(Number(data.currentAPY) / 100).toFixed(1)}%</span>
                    </div>
                    <button
                        onClick={onInvest}
                        className="w-full bg-[#5B5FED] hover:bg-[#4A4ED4] text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                        Invest Now
                    </button>
                </div>
            </div>
        </div>
    );
}
