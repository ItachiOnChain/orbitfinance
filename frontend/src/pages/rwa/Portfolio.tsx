import { useEffect, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Download } from 'lucide-react';
import { MetricCard } from '../../components/rwa/MetricCard';
import {
    useUserNFTTokens,
    useUserDebt,
    useUserCollateralNFTs,
    useSeniorTrancheBalance,
    useJuniorTrancheBalance,
} from '../../hooks/rwa/useRWAContracts';
import { getContractConfig } from '../../config/rwaContracts';
import { useReadContracts } from 'wagmi';
import { adminService } from '../../services/rwa/adminService';
import { portfolioService } from '../../services/rwa/portfolioService';

interface NFTAsset {
    tokenId: number;
    name: string;
    type: string;
    totalValue: number;
    monthlyIncome: number;
    status: 'pending' | 'minted' | 'locked';
}

export default function Portfolio() {
    const { address } = useAccount();
    const { data: nftTokenIds } = useUserNFTTokens();
    const { data: userDebt } = useUserDebt();
    const { data: collateralNFTIds } = useUserCollateralNFTs();
    const { data: seniorBalance } = useSeniorTrancheBalance();
    const { data: juniorBalance } = useJuniorTrancheBalance();

    const [mintedAssets, setMintedAssets] = useState<NFTAsset[]>([]);
    const [pendingAssets, setPendingAssets] = useState<any[]>([]);

    // Combine owned and locked NFTs
    const allNFTIds = [...(nftTokenIds as bigint[] || []), ...(collateralNFTIds as bigint[] || [])];
    const uniqueNFTIds = useMemo(() =>
        Array.from(new Set(allNFTIds.map(id => id.toString()))).map(id => BigInt(id)),
        [nftTokenIds, collateralNFTIds]
    );

    // Fetch NFT metadata
    const nftMetadataContracts = useMemo(() => uniqueNFTIds.flatMap((tokenId) => [
        {
            ...getContractConfig('RWAIncomeNFT'),
            functionName: 'getMetadata',
            args: [tokenId],
        },
        {
            ...getContractConfig('OrbitRWAPool'),
            functionName: 'isNFTLocked',
            args: [tokenId],
        },
    ]), [uniqueNFTIds]);

    const { data: nftData } = useReadContracts({
        contracts: nftMetadataContracts,
    });

    // Fetch pending assets
    useEffect(() => {
        if (!address) return;

        const interval = setInterval(async () => {
            const pending = await adminService.getPendingAssets();
            const userPending = pending.filter((a: any) =>
                a.user && address && a.user.toLowerCase() === address.toLowerCase()
            );
            setPendingAssets(userPending);
        }, 2000);

        return () => clearInterval(interval);
    }, [address]);

    // Process NFT data
    useEffect(() => {
        if (uniqueNFTIds.length === 0 || !nftData) {
            setMintedAssets([]);
            return;
        }

        const assetTypeMap = ['RENTAL', 'INVOICE', 'BOND'];
        const assets: NFTAsset[] = [];

        console.log('Processing NFT data:', { uniqueNFTIds: uniqueNFTIds.length, nftData: nftData?.length });

        uniqueNFTIds.forEach((tokenId, index) => {
            const metadataIndex = index * 2;
            const lockedIndex = index * 2 + 1;

            const metadata = nftData[metadataIndex];
            const locked = nftData[lockedIndex];

            console.log(`NFT ${tokenId}:`, {
                metadata: metadata?.result,
                locked: locked?.result
            });

            if (metadata?.result) {
                const md = metadata.result as any;
                // Access object properties, not array indices
                const rawTotalValue = md.totalValue;
                const rawMonthlyIncome = md.monthlyIncome;

                console.log(`NFT ${tokenId} raw values:`, {
                    rawTotalValue,
                    rawMonthlyIncome,
                    totalValueType: typeof rawTotalValue,
                    monthlyIncomeType: typeof rawMonthlyIncome
                });

                const totalValue = rawTotalValue ? Number(rawTotalValue) / 1e6 : 0;
                const monthlyIncome = rawMonthlyIncome ? Number(rawMonthlyIncome) / 1e6 : 0;

                console.log(`NFT ${tokenId} calculated:`, { totalValue, monthlyIncome });

                assets.push({
                    tokenId: Number(tokenId),
                    name: md.assetName || `Asset ${tokenId}`,
                    type: assetTypeMap[Number(md.assetType)] || 'RENTAL',
                    totalValue: isNaN(totalValue) ? 0 : totalValue,
                    monthlyIncome: isNaN(monthlyIncome) ? 0 : monthlyIncome,
                    status: locked?.result ? 'locked' : 'minted',
                });
            }
        });

        console.log('Final assets:', assets);
        setMintedAssets(assets);
    }, [nftData]);

    // Calculate metrics
    const debtAmount = userDebt ? Number(userDebt) / 1e6 : 0;
    const hasActiveDebt = debtAmount > 0;

    // Tranche investments
    const seniorBalanceFormatted = seniorBalance ? Number(seniorBalance) / 1e6 : 0;
    const juniorBalanceFormatted = juniorBalance ? Number(juniorBalance) / 1e6 : 0;
    const totalTrancheInvestments = seniorBalanceFormatted + juniorBalanceFormatted;

    // Asset values
    const pendingValue = pendingAssets.reduce((sum, a) => sum + (a.totalValue || 0), 0);
    const mintedValue = mintedAssets.reduce((sum, a) => sum + a.totalValue, 0);

    // Total Earnings = Sum of monthly income from all assets (SPV earnings)
    const totalEarnings = mintedAssets.reduce((sum, a) => sum + a.monthlyIncome, 0);

    // Net Worth = Tokenized assets + Under review + Tranche investments + Earnings
    const netWorth = pendingValue + mintedValue + totalTrancheInvestments + totalEarnings;

    // Collateral Value = Only locked assets (in active financing)
    const lockedAssets = mintedAssets.filter(a => a.status === 'locked');
    const collateralValue = hasActiveDebt ? lockedAssets.reduce((sum, a) => sum + a.totalValue, 0) : 0;

    const handleExport = () => {
        portfolioService.exportToCSV({
            metrics: {
                netWorth,
                totalDebt: debtAmount,
                collateralValue,
                totalEarnings,
            },
            assets: [], // This would need to be populated with actual asset data
            investments: [], // This would need to be populated with actual investment data
            history: [],
        });
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-7xl font-bold text-white mb-3 font-outfit tracking-tight translate-y-2 translate-x-100">My <span className="text-yellow-500">Portfolio</span></h1>
                    <br />
                    <p className="text-zinc-500 font-medium uppercase tracking-widest text-[11px] translate-x-95"></p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-yellow-500/20 rounded-xl text-yellow-500 text-[20px] font-bold uppercase tracking-widest hover:bg-yellow-500/5 hover:border-yellow-500/40 transition-all"
                >
                    <Download className="w-4 h-4" />
                    Export Report
                </button>
            </div>
            <br />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 translate-y-2 ">
                <MetricCard
                    label="Net Worth"
                    value={`$${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <MetricCard
                    label="Collateral Value"
                    value={`$${collateralValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <MetricCard
                    label="Total Earnings"
                    value={`$${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    color="#4ADE80"
                />
                <MetricCard
                    label="Outstanding Debt"
                    value={`$${debtAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    color="#F87171"
                />
            </div>
            <br />
            <br />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Asset Summary */}
                <div className="bg-zinc-950 border border-yellow-500/10 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-yellow-500/20 transition-all duration-500">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/5 blur-[100px] rounded-full" />
                    
                    <h3 className="text-xl font-bold text-white mb-8 font-outfit tracking-tight relative z-10">Asset <span className="text-yellow-500">Summary</span></h3>
                    
                    <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-center p-4 bg-black/40 border border-yellow-500/5 rounded-2xl">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Total Assets</span>
                            <span className="text-white font-mono font-bold text-lg">{pendingAssets.length + mintedAssets.length}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-black/20 border border-yellow-500/5 rounded-2xl text-center">
                                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-2">Under Review</p>
                                <p className="text-yellow-500 font-mono font-bold text-xl">{pendingAssets.length}</p>
                            </div>
                            <div className="p-4 bg-black/20 border border-yellow-500/5 rounded-2xl text-center">
                                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-2">Tokenized</p>
                                <p className="text-green-400 font-mono font-bold text-xl">{mintedAssets.length}</p>
                            </div>
                            <div className="p-4 bg-black/20 border border-yellow-500/5 rounded-2xl text-center">
                                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-2">Collateral</p>
                                <p className="text-orange-400 font-mono font-bold text-xl">{lockedAssets.length}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-yellow-500/10 flex justify-between items-center">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Total Portfolio Value</span>
                            <span className="text-white font-outfit font-bold text-2xl">
                                ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Net Worth Breakdown */}
                <div className="bg-zinc-950 border border-yellow-500/10 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-yellow-500/20 transition-all duration-500">
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-500/5 blur-[100px] rounded-full" />
                    
                    <h3 className="text-xl font-bold text-white mb-8 font-outfit tracking-tight relative z-10 translate-x-1">Net Worth <span className="text-yellow-500">Breakdown</span></h3>
                    
                    <div className="space-y-4 relative z-10 translate-x-1">
                        {[
                            { label: 'Pending Assets', value: pendingValue, color: 'text-zinc-400' },
                            { label: 'Tokenized Assets', value: mintedValue, color: 'text-zinc-400' },
                            { label: 'Tranche Investments', value: totalTrancheInvestments, color: 'text-zinc-400' },
                            { label: 'Monthly Earnings', value: totalEarnings, color: 'text-green-400' },
                            { label: 'Outstanding Debt', value: -debtAmount, color: 'text-red-400' },
                        ].map((item, i) => (
                            <div key={i} className="w-full flex justify-between items-center text-sm px-2 py-1 hover:bg-white/5 rounded-lg transition-colors -translate-x-1">
                                <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{item.label}</span>
                                <span className={`${item.color} font-mono font-bold text-right min-w-[100px]`}>
                                    {item.value >= 0 ? '+' : ''}${Math.abs(item.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                        
                        <div className="pt-6 mt-6 border-t border-yellow-500/20 flex justify-between items-center">
                            <span className="text-yellow-500 font-black uppercase tracking-[0.2em] text-xs">Total Net Worth</span>
                            <span className="text-yellow-500 font-outfit font-black text-3xl -translate-x-1">
                                ${(netWorth - debtAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
