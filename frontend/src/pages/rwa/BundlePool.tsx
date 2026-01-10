import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '../../contracts';
import BundlePoolABI from '../../contracts/rwa-abis/BundlePool.json';
import { PoolCard } from '../../components/rwa/PoolCard';
import { FilterTabs } from '../../components/rwa/FilterTabs';
import { EmptyState } from '../../components/rwa/EmptyState';

export default function BundlePoolPage() {
    useAccount();
    const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'raising' | 'staking' | 'finalRedemption' | 'ended'>('all');
    const [pools, setPools] = useState<any[]>([]);

    // Fetch all pools
    const { data: allPools, isLoading, refetch } = useReadContract({
        address: CONTRACTS.BundlePool,
        abi: BundlePoolABI.abi,
        functionName: 'getAllPools',
    });

    useEffect(() => {
        if (allPools) {
            const poolsArray = allPools as any[];

            // Filter out duplicate pools (pool 0 and pool 1 are identical)
            // Only show the latest pool (pool 1)
            const uniquePools = poolsArray.length > 1
                ? poolsArray.slice(-1) // Take only the last pool
                : poolsArray;

            setPools(uniquePools);
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
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header Section */}
            <div className="border-b border-yellow-500/10 bg-black/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-8 py-12">
                    <div className="flex flex-col items-start space-y-4">
                        <h1 className="text-6xl font-bold text-yellow-200 font-outfit tracking-tight shadow-yellow-500/20 text-glow">
                            Bundle Pool
                        </h1>

                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-white font-outfit">
                                Orbit Finance × Mantle
                            </h2>
                            <br />
                        </div>
                    </div>
                </div>
            </div>
            <br />

            {/* Filter Tabs */}
            <div className="max-w-6xl mx-auto px-8 py-10 ml-6">
                <div className="bg-zinc-900/30 backdrop-blur-md border border-yellow-500/5 rounded-2xl p-1">
                    <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </div>
            </div>


            {/* Pool Cards */}
            <div className="max-w-6xl mx-auto px-8 pb-24 ml-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Loading Pools...</p>
                    </div>
                ) : filteredPools.length === 0 ? (
                    <div className="py-20">
                        <EmptyState />
                    </div>
                ) : (
                    <div className="space-y-12">
                        {filteredPools.map((pool, index) => (
                            <PoolCard
                                key={`pool-${pool.createdAt || index}`}
                                pool={pool}
                                poolId={index + 1}
                                onInvestmentSuccess={refetch}
                            />
                        ))}
                    </div>
                )}            </div>
        </div>
    );
}
