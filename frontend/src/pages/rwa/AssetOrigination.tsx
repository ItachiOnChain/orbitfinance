import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { Plus, DollarSign, Clock } from 'lucide-react';
import { TokenizeAssetModal, type AssetFormData } from '../../components/rwa/TokenizeAssetModal';
import { ManageAssetModal } from '../../components/rwa/ManageAssetModal';
import { ActiveFinancingTable } from '../../components/rwa/ActiveFinancingTable';
import { RepayModal } from '../../components/rwa/RepayModal';
import { adminService } from '../../services/rwa/adminService';
import {
    useUserNFTTokens,
    useUserDebt,
    useDepositAndBorrow,
    useApproveNFT,
    useUserCollateralNFTs,
    useRepayDebt,
    useApproveUSDC,
    useWithdrawCollateral,
    RWAContractCalls,
} from '../../hooks/rwa/useRWAContracts';
import { getContractConfig, RWA_ADDRESSES } from '../../config/rwaContracts';

interface NFTAsset {
    tokenId: number;
    name: string;
    type: string;
    monthlyIncome: number;
    totalValue: number;
    status: 'minted' | 'locked';
}

export default function AssetOrigination() {
    const { address } = useAccount();

    // Contract reads
    const { data: nftTokenIds, refetch: refetchNFTs } = useUserNFTTokens();
    const { data: userDebt, refetch: refetchDebt } = useUserDebt();
    const { data: collateralNFTIds } = useUserCollateralNFTs();

    // Contract writes
    const { writeContract: approveNFT, data: approveHash } = useApproveNFT();
    const { writeContract: depositAndBorrow, data: borrowHash } = useDepositAndBorrow();
    const { writeContract: approveUSDC, data: approveUSDCHash } = useApproveUSDC();
    const { writeContract: repayDebt, data: repayHash } = useRepayDebt();
    const { writeContract: withdrawCollateral, data: withdrawHash } = useWithdrawCollateral();

    // Transaction status
    const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isLoading: isBorrowing, isSuccess: borrowSuccess } = useWaitForTransactionReceipt({ hash: borrowHash });
    const { isSuccess: approveUSDCSuccess } = useWaitForTransactionReceipt({ hash: approveUSDCHash });
    const { isSuccess: repaySuccess } = useWaitForTransactionReceipt({ hash: repayHash });
    const { isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

    const [showTokenizeModal, setShowTokenizeModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<NFTAsset | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [pendingAssets, setPendingAssets] = useState<any[]>([]);
    const [mintedAssets, setMintedAssets] = useState<NFTAsset[]>([]);
    const [pendingBorrow, setPendingBorrow] = useState<{ amount: bigint; autoRepay: boolean } | null>(null);
    const [showRepayModal, setShowRepayModal] = useState(false);
    const [pendingRepay, setPendingRepay] = useState<bigint | null>(null);
    const [nftsToWithdraw, setNftsToWithdraw] = useState<bigint[]>([]);
    const [currentWithdrawIndex, setCurrentWithdrawIndex] = useState(0);

    // Fetch pending assets
    useEffect(() => {
        const fetchPending = async () => {
            if (address) {
                const pending = await adminService.getPendingAssets();
                const userPending = pending.filter(
                    (asset) => asset.userAddress.toLowerCase() === address.toLowerCase()
                );
                setPendingAssets(userPending);
            }
        };
        fetchPending();

        const interval = setInterval(fetchPending, 3000);
        return () => clearInterval(interval);
    }, [address]);

    // Fetch NFT metadata using useReadContracts for batch queries
    // Combine owned NFTs and locked NFTs
    const allNFTIds = [...(nftTokenIds as bigint[] || []), ...(collateralNFTIds as bigint[] || [])];
    const uniqueNFTIds = Array.from(new Set(allNFTIds.map(id => id.toString()))).map(id => BigInt(id));

    const nftMetadataContracts = uniqueNFTIds.flatMap((tokenId) => [
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
    ]);

    const { data: nftData } = useReadContracts({
        contracts: nftMetadataContracts,
    });

    // Process NFT data
    useEffect(() => {
        if (uniqueNFTIds.length === 0 || !nftData) {
            setMintedAssets([]);
            return;
        }

        const assetTypeMap = ['RENTAL', 'INVOICE', 'BOND'];
        const assets: NFTAsset[] = [];

        uniqueNFTIds.forEach((tokenId, index) => {
            const metadataIndex = index * 2;
            const lockedIndex = index * 2 + 1;

            const metadata = nftData[metadataIndex];
            const locked = nftData[lockedIndex];

            if (metadata?.result) {
                const md = metadata.result as any;
                assets.push({
                    tokenId: Number(tokenId),
                    name: md.assetName || `Asset #${tokenId}`,
                    type: assetTypeMap[md.assetType] || 'RENTAL',
                    monthlyIncome: Number(formatUnits(md.monthlyIncome || 0n, 6)),
                    totalValue: Number(formatUnits(md.totalValue || 0n, 6)),
                    status: locked?.result ? 'locked' : 'minted',
                });
            }
        });

        setMintedAssets(assets);
    }, [nftData]); // Remove uniqueNFTIds from dependencies to prevent infinite loop

    // Auto-refetch after successful transactions
    useEffect(() => {
        if (borrowSuccess) {
            refetchDebt();
            refetchNFTs();
            setPendingBorrow(null);
        }
    }, [borrowSuccess, refetchDebt, refetchNFTs]);

    // After all NFTs withdrawn, refetch and close modal
    useEffect(() => {
        if (nftsToWithdraw.length > 0 && currentWithdrawIndex >= nftsToWithdraw.length) {
            console.log('All NFTs withdrawn, refreshing data...');
            refetchDebt();
            refetchNFTs();
            setPendingRepay(null);
            setShowRepayModal(false);
            setNftsToWithdraw([]);
            setCurrentWithdrawIndex(0);
        }
    }, [nftsToWithdraw.length, currentWithdrawIndex, refetchDebt, refetchNFTs]);

    // Chain depositAndBorrow after NFT approval
    useEffect(() => {
        if (approveSuccess && pendingBorrow && selectedAsset) {
            const nftId = BigInt(selectedAsset.tokenId);
            depositAndBorrow(RWAContractCalls.depositAndBorrow(nftId, pendingBorrow.amount, pendingBorrow.autoRepay));
        }
    }, [approveSuccess, pendingBorrow, selectedAsset, depositAndBorrow]);

    // Chain repayDebt after USDC approval
    useEffect(() => {
        if (approveUSDCSuccess && pendingRepay) {
            repayDebt(RWAContractCalls.repayDebt(pendingRepay));
        }
    }, [approveUSDCSuccess, pendingRepay, repayDebt]);

    // After successful repayment, check if debt is 0 and start withdrawal process
    useEffect(() => {
        if (repaySuccess) {
            // Small delay to ensure debt is updated on-chain
            setTimeout(() => {
                refetchDebt();
            }, 500);
        }
    }, [repaySuccess, refetchDebt]);

    // When debt becomes 0 after repayment, start withdrawing NFTs
    useEffect(() => {
        if (repaySuccess && userDebt !== undefined && Number(userDebt) === 0 && collateralNFTIds && collateralNFTIds.length > 0 && nftsToWithdraw.length === 0) {
            console.log('Debt is 0, starting NFT withdrawal for:', collateralNFTIds);
            // Start withdrawing all locked NFTs
            setNftsToWithdraw(collateralNFTIds as bigint[]);
            setCurrentWithdrawIndex(0);
        }
    }, [repaySuccess, userDebt, collateralNFTIds, nftsToWithdraw.length]);

    // Withdraw NFTs one by one
    useEffect(() => {
        if (nftsToWithdraw.length > 0 && currentWithdrawIndex < nftsToWithdraw.length && !withdrawSuccess) {
            const nftId = nftsToWithdraw[currentWithdrawIndex];
            console.log(`Withdrawing NFT ${nftId} (${currentWithdrawIndex + 1}/${nftsToWithdraw.length})`);
            withdrawCollateral(RWAContractCalls.withdrawCollateral(nftId));
        }
    }, [nftsToWithdraw, currentWithdrawIndex, withdrawCollateral]);

    // Move to next NFT after successful withdrawal
    useEffect(() => {
        if (withdrawSuccess && nftsToWithdraw.length > 0) {
            const nextIndex = currentWithdrawIndex + 1;
            console.log(`NFT withdrawn successfully. Moving to index ${nextIndex}/${nftsToWithdraw.length}`);

            if (nextIndex < nftsToWithdraw.length) {
                // More NFTs to withdraw
                setCurrentWithdrawIndex(nextIndex);
            } else {
                // All NFTs withdrawn
                console.log('All NFTs withdrawn successfully!');
                setNftsToWithdraw([]);
                setCurrentWithdrawIndex(0);
            }
        }
    }, [withdrawSuccess, currentWithdrawIndex, nftsToWithdraw.length]);

    const handleTokenizeSubmit = async (data: AssetFormData) => {
        setShowTokenizeModal(false);

        await adminService.submitAssetForApproval({
            assetName: data.assetName,
            assetType: data.assetType,
            monthlyIncome: data.monthlyIncome,
            duration: data.duration,
        });

        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
    };

    const handleFinanceAsset = (asset: NFTAsset) => {
        setSelectedAsset(asset);
        setShowManageModal(true);
    };


    const handleBorrow = async (amount: number, autoRepay: boolean) => {
        console.log('handleBorrow called', { amount, autoRepay, address, selectedAsset });

        if (!address || !selectedAsset) {
            console.error('Missing address or selectedAsset');
            return;
        }

        const rwaPoolAddress = getContractConfig('OrbitRWAPool').address;
        const nftId = BigInt(selectedAsset.tokenId);
        const borrowAmount = parseUnits(amount.toString(), 6);

        console.log('Approving NFT for borrowing...', { nftId, rwaPoolAddress });

        // Store pending borrow
        setPendingBorrow({ amount: borrowAmount, autoRepay });

        // Call approveNFT with correct arguments: (to, tokenId)
        const approveCall = RWAContractCalls.approveNFT(rwaPoolAddress, nftId);
        console.log('Approve call config:', approveCall);
        approveNFT(approveCall);
    };


    const handleRepay = async (amount: number) => {
        if (!address) return;

        try {
            const amountWei = parseUnits(amount.toString(), 6);

            // Step 1: Approve USDC for OrbitRWAPool
            setPendingRepay(amountWei);
            approveUSDC(RWAContractCalls.approveUSDC(RWA_ADDRESSES.OrbitRWAPool, amountWei));

            // Step 2 will happen automatically in useEffect after approval succeeds
        } catch (error) {
            console.error('Repayment failed:', error);
            setPendingRepay(null);
        }
    };

    const debtAmount = userDebt ? Number(userDebt) / 1e6 : 0;

    // Available assets = minted assets that are NOT locked (user still owns them)
    const availableAssets = mintedAssets.filter((a: any) => a.status !== 'locked');

    // Financing positions = assets that are locked with active debt
    const financingPositions = mintedAssets
        .filter((asset: any) => asset.status === 'locked')
        .map((asset: any) => ({
            nftId: asset.tokenId,
            assetName: asset.name,
            assetType: asset.type,
            collateralValue: asset.totalValue,
            monthlyIncome: asset.monthlyIncome,
            borrowed: debtAmount,
            ltv: asset.totalValue > 0 ? (debtAmount / asset.totalValue) * 100 : 0,
        }));

    return (
        <div className="space-y-8">
            {/* Loading overlay */}
            {isBorrowing && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-[#0A2342] border border-gold rounded-xl p-8 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto mb-4"></div>
                        <p className="text-white font-bold text-lg">Processing Financing...</p>
                        <p className="text-zinc-400 text-sm mt-2">Please confirm in your wallet</p>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed top-24 right-8 z-50 bg-[#00F5A0] text-[#0A2342] px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in">
                    <span className="text-2xl">✅</span>
                    <div>
                        <p className="font-bold">Asset Submitted!</p>
                        <p className="text-sm">Waiting for SPV approval</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Asset Origination</h1>
                    <p className="text-zinc-400">Tokenize your assets and access liquidity</p>
                </div>
                <button
                    onClick={() => setShowTokenizeModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold/90 text-[#0A2342] font-bold rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Tokenize New Asset
                </button>
            </div>

            {/* Under Review Section */}
            {pendingAssets.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Under Review</h2>
                    <div className="bg-[#FFB800]/10 border-2 border-[#FFB800] rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#FFB800]/20">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#FFB800] uppercase">Asset Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#FFB800] uppercase">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#FFB800] uppercase">Monthly Income</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#FFB800] uppercase">Estimated Value</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#FFB800] uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#FFB800]/20">
                                {pendingAssets.map((asset, index) => (
                                    <tr key={index} className="hover:bg-[#FFB800]/5 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{asset.assetName}</td>
                                        <td className="px-6 py-4 text-zinc-400">{asset.assetType}</td>
                                        <td className="px-6 py-4 text-[#00F5A0] font-mono">
                                            ${asset.monthlyIncome ? asset.monthlyIncome.toLocaleString() : 'N/A'}/mo
                                        </td>
                                        <td className="px-6 py-4 text-white font-mono">
                                            ${asset.estimatedValue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30 flex items-center gap-2 w-fit">
                                                <Clock size={14} />
                                                Pending SPV Approval
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* My Tokenized Assets */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">My Tokenized Assets</h2>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                    {availableAssets.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-zinc-900/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Asset Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Monthly Income</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Total Value</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Max Financing (50%)</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {availableAssets.map((asset) => (
                                    <tr key={asset.tokenId} className="hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{asset.name}</td>
                                        <td className="px-6 py-4 text-zinc-400">{asset.type}</td>
                                        <td className="px-6 py-4 text-[#00F5A0] font-mono">
                                            ${asset.monthlyIncome.toLocaleString()}/mo
                                        </td>
                                        <td className="px-6 py-4 text-white font-mono">
                                            ${asset.totalValue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gold font-mono font-semibold">
                                            ${(asset.totalValue * 0.5).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleFinanceAsset(asset)}
                                                className="px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold text-sm rounded transition-colors flex items-center gap-1"
                                            >
                                                <DollarSign size={14} />
                                                Finance
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-6 py-12 text-center text-zinc-500">
                            No assets yet. Tokenize your first asset above.
                        </div>
                    )}
                </div>
            </div>

            {/* Active Financing */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Active Financing</h2>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                    <ActiveFinancingTable
                        positions={financingPositions}
                        totalDebt={debtAmount}
                        onRepay={() => setShowRepayModal(true)}
                    />
                </div>
            </div>

            {/* Modals */}
            <TokenizeAssetModal
                isOpen={showTokenizeModal}
                onClose={() => setShowTokenizeModal(false)}
                onSubmit={handleTokenizeSubmit}
            />

            {selectedAsset && (
                <ManageAssetModal
                    isOpen={showManageModal}
                    onClose={() => setShowManageModal(false)}
                    onBorrow={handleBorrow}
                    asset={selectedAsset}
                />
            )}

            <RepayModal
                isOpen={showRepayModal}
                onClose={() => setShowRepayModal(false)}
                onRepay={handleRepay}
                totalDebt={debtAmount}
                collateralCount={financingPositions.length}
            />
        </div>
    );
}
