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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Portfolio</h1>
                <p className="text-zinc-400">Track your RWA investments and performance</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                />
                <MetricCard
                    label="Outstanding Debt"
                    value={`$${debtAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
            </div>

            {/* Asset Summary */}
            <div className="bg-[#0A2342] border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Asset Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Total Assets</span>
                        <span className="text-white font-mono font-semibold">{pendingAssets.length + mintedAssets.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Under Review</span>
                        <span className="text-yellow-400 font-mono font-semibold">{pendingAssets.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Tokenized</span>
                        <span className="text-[#00F5A0] font-mono font-semibold">{mintedAssets.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Locked as Collateral</span>
                        <span className="text-[#FFB800] font-mono font-semibold">
                            {lockedAssets.length}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-zinc-700">
                        <span className="text-zinc-400 font-semibold">Total Value</span>
                        <span className="text-white font-mono font-bold">
                            ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Net Worth Breakdown */}
            <div className="bg-gradient-to-br from-gold/5 to-transparent border border-gold/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Net Worth Calculation</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Pending Assets (Under Review)</span>
                        <span className="text-white font-mono">+${pendingValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Tokenized Assets</span>
                        <span className="text-white font-mono">+${mintedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Tranche Investments</span>
                        <span className="text-white font-mono">+${totalTrancheInvestments.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Total Earnings (Monthly)</span>
                        <span className="text-[#00F5A0] font-mono">+${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Outstanding Debt</span>
                        <span className="text-red-400 font-mono">-${debtAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gold/30">
                        <span className="text-gold font-bold">Net Worth</span>
                        <span className="text-gold font-mono font-bold text-lg">
                            ${(netWorth - debtAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
}
