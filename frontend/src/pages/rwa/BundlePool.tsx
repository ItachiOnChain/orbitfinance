import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { LayoutGrid } from 'lucide-react';
import { BUNDLE_POOL_ADDRESS, BUNDLE_POOL_ABI } from '../../contracts/bundlePoolConfig';
import { PoolCard } from '../../components/rwa/PoolCard';
import { FilterTabs } from '../../components/rwa/FilterTabs';
import { EmptyState } from '../../components/rwa/EmptyState';

export default function BundlePoolPage() {
    useAccount();
    const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'raising' | 'staking' | 'finalRedemption' | 'ended'>('all');
    const [pools, setPools] = useState<any[]>([]);

    // Fetch all pools
    const { data: allPools, isLoading, refetch } = useReadContract({
        address: BUNDLE_POOL_ADDRESS as `0x${string}`,
        abi: BUNDLE_POOL_ABI,
        functionName: 'getAllPools',
    });

    useEffect(() => {
        if (allPools) {
            setPools(allPools as any[]);
        }
    }, [allPools]);

    // Filter pools based on active tab
    const filteredPools = pools.filter(pool => {
        if (activeFilter === 'all') return true;

        const statusMap: { [key: string]: number } = {
            'upcoming': 0,
            'raising': 1,
            'staking': 2,
            'finalRedemption': 3,
            'ended': 4
        };

        return pool.status === statusMap[activeFilter];
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <LayoutGrid className="w-8 h-8 text-[#5B5FED]" />
                                <h1 className="text-3xl font-bold text-gray-900">Bundle Pool</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-[#5B5FED]/10 px-4 py-2 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Mantel Network</span>
                            </div>
                        </div>
                    </div>

                    {/* Co-branded Badge */}
                    <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-[#5B5FED]/10 to-purple-100 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-2xl font-bold text-[#5B5FED]">O</span>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-2xl font-bold text-purple-600">M</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Orbit Finance × Mantel</h2>
                                <p className="text-sm text-gray-600">Institutional DeFi Investment Pools</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Powered by</p>
                            <p className="text-sm font-semibold text-[#5B5FED]">Mantel Blockchain</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            </div>

            {/* Pool Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B5FED]"></div>
                    </div>
                ) : filteredPools.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-6">
                        {filteredPools.map((pool, index) => (
                            <PoolCard key={index} pool={pool} poolId={index} onInvestmentSuccess={refetch} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
