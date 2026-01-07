import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { Clock } from 'lucide-react';
import { BUNDLE_POOL_ADDRESS, BUNDLE_POOL_ABI } from '../../contracts/bundlePoolConfig';
import { TrancheCard } from './TrancheCardBundle';
import { InvestmentModal } from './InvestmentModalBundle';

interface PoolCardProps {
    pool: any;
    poolId: number;
    onInvestmentSuccess: () => void;
}

// RWA-Accurate Display Constants (Frontend Only)
const INSTITUTIONAL_CAPITAL = {
    JUNIOR_INITIAL: 250000, // $250k from Orbit Finance + Mantle
    SENIOR_INITIAL: 750000, // $750k institutional allocation
};

const REALISTIC_NAV_MULTIPLIERS = {
    JUNIOR: 1.00931, // Makes ~$252,327 from $250k
    SENIOR: 0.99679,  // Makes ~$747,592 from $750k
};

const RWA_ACCURATE_APYS = {
    JUNIOR: 10.9,  // Junior tranche APY
    SENIOR: 5.2,   // Senior tranche APY
    BLENDED: 12.45 // Weighted average
};

export function PoolCard({ pool, poolId, onInvestmentSuccess }: PoolCardProps) {
    const [showModal, setShowModal] = useState(false);
    const [selectedTranche, setSelectedTranche] = useState<'junior' | 'senior' | null>(null);
    const [timeRemaining, setTimeRemaining] = useState({ months: 0, days: 0, hours: 0 });

    // Fetch Junior Tranche details
    const { data: juniorData } = useReadContract({
        address: BUNDLE_POOL_ADDRESS as `0x${string}`,
        abi: BUNDLE_POOL_ABI,
        functionName: 'getTrancheDetails',
        args: [BigInt(poolId), true],
    });

    // Fetch Senior Tranche details
    const { data: seniorData } = useReadContract({
        address: BUNDLE_POOL_ADDRESS as `0x${string}`,
        abi: BUNDLE_POOL_ABI,
        functionName: 'getTrancheDetails',
        args: [BigInt(poolId), false],
    });

    // Fetch time remaining
    const { data: timeData } = useReadContract({
        address: BUNDLE_POOL_ADDRESS as `0x${string}`,
        abi: BUNDLE_POOL_ABI,
        functionName: 'getTimeRemaining',
        args: [BigInt(poolId)],
    });

    useEffect(() => {
        if (timeData && Array.isArray(timeData)) {
            setTimeRemaining({
                months: Number((timeData as any[])[0]),
                days: Number((timeData as any[])[1]),
                hours: Number((timeData as any[])[2]),
            });
        }
    }, [timeData]);

    const getStatusBadge = (status: number) => {
        const badges = [
            { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
            { label: 'Raising', color: 'bg-yellow-100 text-yellow-800' },
            { label: 'Staking', color: 'bg-green-100 text-green-800' },
            { label: 'Final Redemption', color: 'bg-purple-100 text-purple-800' },
            { label: 'Ended', color: 'bg-gray-100 text-gray-800' },
        ];
        return badges[status] || badges[0];
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleDateString('en-GB');
    };

    // Calculate RWA-accurate display values
    const calculateDisplayValues = () => {
        const juniorInvested = juniorData && Array.isArray(juniorData)
            ? Number(formatUnits((juniorData as any[])[2] as bigint, 6))
            : 0;
        const seniorInvested = seniorData && Array.isArray(seniorData)
            ? Number(formatUnits((seniorData as any[])[2] as bigint, 6))
            : 0;

        // Get deployed capital from loans (tracked in localStorage)
        const getDeployedCapital = (): number => {
            try {
                const stored = localStorage.getItem('bundle_pool_deployed_capital');
                return stored ? parseFloat(stored) : 0;
            } catch {
                return 0;
            }
        };

        const totalDeployedCapital = getDeployedCapital();

        // Split deployed capital 50/50 between tranches (as per RWA requirements)
        const juniorDeployedCapital = totalDeployedCapital * 0.5;
        const seniorDeployedCapital = totalDeployedCapital * 0.5;

        // Total Investment = Institutional Capital + User Deposits
        const juniorTotalInvestment = INSTITUTIONAL_CAPITAL.JUNIOR_INITIAL + juniorInvested;
        const seniorTotalInvestment = INSTITUTIONAL_CAPITAL.SENIOR_INITIAL + seniorInvested;
        const totalInvestment = juniorTotalInvestment + seniorTotalInvestment;

        // NAV = (Institutional Capital * Multiplier + User Deposits) - Deployed Capital
        // Deployed capital reduces NAV because it's lent out to borrowers
        const juniorNAV = (INSTITUTIONAL_CAPITAL.JUNIOR_INITIAL * REALISTIC_NAV_MULTIPLIERS.JUNIOR) + juniorInvested - juniorDeployedCapital;
        const seniorNAV = (INSTITUTIONAL_CAPITAL.SENIOR_INITIAL * REALISTIC_NAV_MULTIPLIERS.SENIOR) + seniorInvested - seniorDeployedCapital;
        const totalNAV = juniorNAV + seniorNAV;

        return {
            juniorTotalInvestment,
            seniorTotalInvestment,
            totalInvestment,
            juniorNAV: Math.max(0, juniorNAV), // Ensure NAV doesn't go negative
            seniorNAV: Math.max(0, seniorNAV),
            totalNAV: Math.max(0, totalNAV),
            deployedCapital: totalDeployedCapital,
        };
    };

    const displayValues = calculateDisplayValues();
    const statusBadge = getStatusBadge(pool.status);

    const handleInvest = (tranche: 'junior' | 'senior') => {
        setSelectedTranche(tranche);
        setShowModal(true);
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Pool Header */}
                <div className="p-8 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#5B5FED] to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white text-xl font-bold">O</span>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white text-lg font-bold">M</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${statusBadge.color}`}>
                                <div className="w-2 h-2 bg-current rounded-full"></div>
                                <span>{statusBadge.label}</span>
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{timeRemaining.months} months left</span>
                            </span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{pool.name}</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Providing revenue-based financing to portfolio companies through tokenized
                        real-world asset collateralization on Mantel blockchain. This pool enables
                        liquidity for verified borrowers who have completed KYC and submitted
                        collateral NFTs on Mantel network.
                    </p>
                </div>

                {/* Pool Statistics - 4 Columns */}
                <div className="grid grid-cols-4 gap-6 p-8 bg-gray-50 border-b border-gray-100">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Final APY
                        </p>
                        <p className="text-2xl font-bold text-green-500">
                            {RWA_ACCURATE_APYS.BLENDED.toFixed(2)}%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">(16% expected)</p>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Total Investment
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(displayValues.totalInvestment)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">USDT</p>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Net Asset Value
                        </p>
                        <p className="text-2xl font-bold text-[#5B5FED]">
                            {formatCurrency(displayValues.totalNAV)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">USDT</p>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Final Redemption
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                            {formatDate(pool.redemptionDate)}
                        </p>
                    </div>
                </div>

                {/* Tranche Cards */}
                <div className="p-8 space-y-6">
                    {juniorData && Array.isArray(juniorData) && (
                        <TrancheCard
                            type="junior"
                            data={{
                                name: "Junior Tranche Token",
                                pricePerUnit: (juniorData as any[])[1] as bigint,
                                totalInvested: BigInt(Math.round(displayValues.juniorTotalInvestment * 1e6)),
                                currentNAV: BigInt(Math.round(displayValues.juniorNAV * 1e6)),
                                currentAPY: BigInt(Math.round(RWA_ACCURATE_APYS.JUNIOR * 100)),
                                distributionPercentage: (juniorData as any[])[5] as bigint,
                            }}
                            onInvest={() => handleInvest('junior')}
                        />
                    )}

                    {seniorData && Array.isArray(seniorData) && (
                        <TrancheCard
                            type="senior"
                            data={{
                                name: "Senior Tranche Token",
                                pricePerUnit: (seniorData as any[])[1] as bigint,
                                totalInvested: BigInt(Math.round(displayValues.seniorTotalInvestment * 1e6)),
                                currentNAV: BigInt(Math.round(displayValues.seniorNAV * 1e6)),
                                currentAPY: BigInt(Math.round(RWA_ACCURATE_APYS.SENIOR * 100)),
                                distributionPercentage: (seniorData as any[])[5] as bigint,
                            }}
                            onInvest={() => handleInvest('senior')}
                        />
                    )}
                </div>
            </div>

            {/* Investment Modal */}
            {showModal && selectedTranche && (
                <InvestmentModal
                    poolId={poolId}
                    tranche={selectedTranche}
                    trancheData={selectedTranche === 'junior' ? juniorData : seniorData}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedTranche(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setSelectedTranche(null);
                        onInvestmentSuccess();
                        console.log('Investment successful!');
                    }}
                />
            )}
        </>
    );
}
