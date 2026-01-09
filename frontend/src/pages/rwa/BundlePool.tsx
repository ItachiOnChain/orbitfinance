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
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header Section */}
            <div className="border-b border-yellow-500/10 bg-black/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-8 py-12">
                    <div className="flex flex-col items-start space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 translate-x-90">
                                <LayoutGrid className="w-6 h-6 text-yellow-500" />
                            </div>
                            <h1 className="text-6xl font-bold text-yellow-200 font-outfit tracking-tight shadow-yellow-500/20 text-glow translate-x-90">
                                Bundle Pool
                            </h1>
                        </div>
                        
                        
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-white font-outfit translate-x-105">
                                Orbit Finance × Mantle
                            </h2>
                            <br />
                            
                        </div>

                        <div className="flex items-center space-x-3 pt-2">
                            <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
                                <span className="text-3xl font-bold text-yellow-500 uppercase tracking-[0.2em]">Mantle Network</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full">
                                <span className="text-3xl font-bold text-zinc-500 uppercase tracking-[0.2em]">Powered by Mantle Blockchain</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <br />

            {/* Filter Tabs */}
            <div className="max-w-10xl mx-auto px-8 py-10">
                <div className="bg-zinc-900/30 backdrop-blur-md border border-yellow-500/5 rounded-2xl p-1">
                    <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </div>
            </div>


            {/* Pool Cards */}
            <div className="max-w-10xl mx-auto px-8 pb-24">
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
                            <PoolCard key={index} pool={pool} poolId={index} onInvestmentSuccess={refetch} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
