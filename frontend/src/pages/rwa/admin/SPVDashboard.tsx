import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { AlertTriangle, Wallet, CheckCircle } from 'lucide-react';
import { isAdmin } from '../../../utils/rwa/adminCheck';
import { adminService, type PendingAsset } from '../../../services/rwa/adminService';
import {
    RWAContractCalls,
    useUserDebt,
    useUserCollateralNFTs,
    useApproveUSDC,
    useRepayDebt,
    useWithdrawCollateral,
} from '../../../hooks/rwa/useRWAContracts';
import { getContractConfig } from '../../../config/rwaContracts';
import { kycService, type KYCSubmission } from '../../../services/rwa/kycService';

export default function SPVDashboard() {
    const { address } = useAccount();
    const navigate = useNavigate();

    // Contract writes
    const { writeContract, data: txHash } = useWriteContract();

    // Transaction status
    const { isLoading: isTxPending, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);
    const [spvBalance] = useState(500000);
    const [selectedBorrower, setSelectedBorrower] = useState('');
    const [repayAmount, setRepayAmount] = useState(0);
    const [nftsToWithdraw, setNftsToWithdraw] = useState<bigint[]>([]);
    const [currentWithdrawIndex, setCurrentWithdrawIndex] = useState(0);

    // KYC state
    const [pendingKYC, setPendingKYC] = useState<KYCSubmission[]>([]);

    // Hooks for selected borrower - pass selectedBorrower address to query their data
    const { data: borrowerDebt, refetch: refetchDebt } = useUserDebt(selectedBorrower as `0x${string}`);
    const { data: borrowerCollateralNFTs } = useUserCollateralNFTs(selectedBorrower as `0x${string}`);

    // Repayment hooks
    const { writeContractAsync: approveUSDC, isSuccess: approveSuccess } = useApproveUSDC();
    const { writeContractAsync: repayDebt, isSuccess: repaySuccess } = useRepayDebt();
    const { writeContract: withdrawCollateral, isSuccess: withdrawSuccess } = useWithdrawCollateral();

    // Access control
    useEffect(() => {
        if (!isAdmin(address)) {
            navigate('/app');
        }
    }, [address, navigate]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            const [assets, kyc] = await Promise.all([
                adminService.getPendingAssets(),
                kycService.getPendingSubmissions(),
            ]);

            setPendingAssets(assets);
            setPendingKYC(kyc);
        };

        fetchData();

        // Poll every 3 seconds
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    // Remove from pending after successful tx
    useEffect(() => {
        if (txSuccess) {
            // Refresh pending assets
            adminService.getPendingAssets().then(setPendingAssets);
        }
    }, [txSuccess]);

    const handleApprove = async (asset: PendingAsset) => {
        try {
            // Map asset type to enum
            const assetTypeMap: Record<string, number> = {
                'RENTAL': 0,
                'INVOICE': 1,
                'BOND': 2,
            };

            const assetType = assetTypeMap[asset.assetType] || 0;
            const monthlyIncome = parseUnits((asset.estimatedValue / 48).toString(), 6); // Estimate monthly
            const duration = BigInt(48); // 48 months
            const totalValue = parseUnits(asset.estimatedValue.toString(), 6);

            // Mint NFT directly (approval + minting in one step for demo)
            writeContract(RWAContractCalls.mintNFT(
                asset.userAddress as `0x${string}`,
                asset.assetName,
                assetType,
                monthlyIncome,
                duration,
                totalValue
            ));

            // Remove from pending after a delay
            setTimeout(() => {
                setPendingAssets(pendingAssets.filter(a => a !== asset));
            }, 3000);
        } catch (error) {
            console.error('Approval failed:', error);
        }
    };

    const handleReject = async (asset: PendingAsset) => {
        await adminService.rejectAsset(asset.userAddress, 'Does not meet criteria');
        setPendingAssets(pendingAssets.filter(a => a !== asset));
    };

    const handleApproveKYC = async (kyc: KYCSubmission) => {
        try {
            // Call IdentityRegistry.verifyUser(address)
            const verifyCall = RWAContractCalls.verifyUser(kyc.userAddress as `0x${string}`);
            writeContract(verifyCall);

            // Update local storage status
            await kycService.updateStatus(kyc.userAddress, 'approved');

            // Remove from pending list
            setPendingKYC(pendingKYC.filter(k => k.userAddress !== kyc.userAddress));
        } catch (error) {
            console.error('KYC approval failed:', error);
        }
    };

    const handleRejectKYC = async (kyc: KYCSubmission) => {
        try {
            // Update local storage status
            await kycService.updateStatus(kyc.userAddress, 'rejected', 'Documents do not meet requirements');

            // Remove from pending list
            setPendingKYC(pendingKYC.filter(k => k.userAddress !== kyc.userAddress));
        } catch (error) {
            console.error('KYC rejection failed:', error);
        }
    };

    const handleDistributeYield = async (amount: number) => {
        try {
            const amountWei = parseUnits(amount.toString(), 6);
            writeContract(RWAContractCalls.distributeYield(amountWei));
        } catch (error) {
            console.error('Distribution failed:', error);
        }
    };

    const handleManualRepay = async () => {
        if (!selectedBorrower || repayAmount === 0) return;

        try {
            const usdcAddress = getContractConfig('MockUSDC').address;
            const rwaPoolAddress = getContractConfig('OrbitRWAPool').address;
            const amountInWei = parseUnits(repayAmount.toString(), 6);

            console.log('Step 1: Approving USDC...');
            await approveUSDC({
                address: usdcAddress,
                abi: [
                    {
                        name: 'approve',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [
                            { name: 'spender', type: 'address' },
                            { name: 'amount', type: 'uint256' }
                        ],
                        outputs: [{ name: '', type: 'bool' }]
                    }
                ],
                functionName: 'approve',
                args: [rwaPoolAddress, amountInWei],
            });
        } catch (error) {
            console.error('Manual repayment failed:', error);
        }
    };

    // Step 2: After USDC approval, repay debt (only once)
    useEffect(() => {
        if (approveSuccess && selectedBorrower && repayAmount > 0 && !repaySuccess) {
            const amountInWei = parseUnits(repayAmount.toString(), 6);

            console.log('Step 2: Repaying debt...');
            repayDebt(RWAContractCalls.repayDebt(amountInWei));
        }
    }, [approveSuccess]);

    // Step 3: After repayment, check if debt is 0 and start withdrawal
    useEffect(() => {
        if (repaySuccess) {
            setTimeout(() => {
                refetchDebt();
            }, 500);
        }
    }, [repaySuccess, refetchDebt]);

    // Step 4: When debt becomes 0, start withdrawing NFTs (only once)
    useEffect(() => {
        console.log('🔍 Step 4 CHECK:', {
            repaySuccess,
            borrowerDebt: borrowerDebt ? Number(borrowerDebt) / 1e6 : 'undefined',
            borrowerDebtRaw: borrowerDebt,
            borrowerCollateralNFTs,
            nftsToWithdraw: nftsToWithdraw.length,
            allConditions: {
                repaySuccess: !!repaySuccess,
                debtDefined: borrowerDebt !== undefined,
                debtIsZero: borrowerDebt !== undefined && Number(borrowerDebt) === 0,
                hasCollateral: !!(borrowerCollateralNFTs && borrowerCollateralNFTs.length > 0),
                notWithdrawing: nftsToWithdraw.length === 0,
            }
        });

        if (repaySuccess && borrowerDebt !== undefined && Number(borrowerDebt) === 0 && borrowerCollateralNFTs && borrowerCollateralNFTs.length > 0 && nftsToWithdraw.length === 0) {
            console.log('✅ Starting NFT withdrawal!', borrowerCollateralNFTs);
            setNftsToWithdraw(borrowerCollateralNFTs as bigint[]);
            setCurrentWithdrawIndex(0);
        }
    }, [repaySuccess, borrowerDebt, borrowerCollateralNFTs, nftsToWithdraw.length]);

    // Step 5: Sequential NFT withdrawal (only when index changes)
    useEffect(() => {
        if (nftsToWithdraw.length > 0 && currentWithdrawIndex < nftsToWithdraw.length && !withdrawSuccess) {
            const tokenId = nftsToWithdraw[currentWithdrawIndex];
            console.log(`Withdrawing NFT ${tokenId} (${currentWithdrawIndex + 1}/${nftsToWithdraw.length})`);
            withdrawCollateral(RWAContractCalls.withdrawCollateral(tokenId));
        }
    }, [nftsToWithdraw, currentWithdrawIndex]);

    // Step 6: Move to next NFT after successful withdrawal
    useEffect(() => {
        if (withdrawSuccess && nftsToWithdraw.length > 0) {
            const nextIndex = currentWithdrawIndex + 1;
            if (nextIndex < nftsToWithdraw.length) {
                console.log(`Moving to next NFT: ${nextIndex}`);
                setCurrentWithdrawIndex(nextIndex);
            } else {
                // All NFTs withdrawn
                console.log('All NFTs withdrawn successfully!');
                setNftsToWithdraw([]);
                setCurrentWithdrawIndex(0);
                setSelectedBorrower('');
                setRepayAmount(0);
            }
        }
    }, [withdrawSuccess]);

    if (!isAdmin(address)) {
        return null;
    }

    return (
        <div className="space-y-8">
            {/* Loading overlay */}
            {isTxPending && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-[#0A2342] border border-gold rounded-xl p-8 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto mb-4"></div>
                        <p className="text-white font-bold text-lg">Minting NFT...</p>
                        <p className="text-zinc-400 text-sm mt-2">Please confirm in your wallet</p>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {txSuccess && (
                <div className="fixed top-24 right-8 z-50 bg-[#00F5A0] text-[#0A2342] px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                        <p className="font-bold">NFT Minted!</p>
                        <p className="text-sm">Asset approved and NFT created</p>
                    </div>
                </div>
            )}

            {/* Warning Banner */}
            <div className="bg-[#FFB800]/10 border-2 border-[#FFB800] rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle size={24} className="text-[#FFB800]" />
                <div>
                    <p className="text-[#FFB800] font-bold">🔧 SPV Simulator - Demo Purposes Only</p>
                    <p className="text-zinc-400 text-sm">Approval will automatically mint NFT for user</p>
                </div>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">SPV Simulator</h1>
                <p className="text-zinc-400">Manage asset approvals, yield distribution, and auto-repayments</p>
            </div>

            {/* SPV Wallet Status */}
            <div className="bg-[#0A2342] border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">SPV Wallet Status</h3>
                    <Wallet size={20} className="text-zinc-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                        <p className="text-sm text-zinc-400 mb-1">SPV Wallet Address</p>
                        <p className="text-white font-mono text-sm">0x9599...07B1</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-400 mb-1">USDC Balance</p>
                        <p className="text-[#00F5A0] font-mono font-bold text-xl">
                            ${spvBalance.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-400 mb-1">Total Managed Assets</p>
                        <p className="text-white font-mono font-semibold">$1,245,000</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => adminService.fundSPVWallet(100000)}
                        className="px-4 py-2 bg-[#00F5A0]/10 hover:bg-[#00F5A0]/20 text-[#00F5A0] font-semibold rounded-lg transition-colors"
                    >
                        Fund SPV Wallet
                    </button>
                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors">
                        View Transaction History
                    </button>
                </div>
            </div>

            {/* Pending KYC Approvals */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Pending KYC Approvals</h3>
                    <span className="text-sm text-zinc-500">{pendingKYC.length} pending</span>
                </div>

                {pendingKYC.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-900/50">
                                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                                    <th className="px-6 py-3">User Address</th>
                                    <th className="px-6 py-3">Full Name</th>
                                    <th className="px-6 py-3">Country</th>
                                    <th className="px-6 py-3">Submitted</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {pendingKYC.map((kyc) => (
                                    <tr key={kyc.userAddress} className="hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-white">
                                                {kyc.userAddress.slice(0, 6)}...{kyc.userAddress.slice(-4)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white">{kyc.fullName}</td>
                                        <td className="px-6 py-4 text-zinc-400">{kyc.country}</td>
                                        <td className="px-6 py-4 text-zinc-400 text-sm">
                                            {new Date(kyc.submittedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveKYC(kyc)}
                                                    className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-semibold rounded-lg transition-colors text-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectKYC(kyc)}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg transition-colors text-sm"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center text-zinc-500">
                        No pending KYC approvals
                    </div>
                )}
            </div>

            {/* Pending Asset Approvals */}
            <div className="bg-zinc-900/50 border-2 border-[#FFB800] rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-zinc-900/80 border-b border-[#FFB800]">
                    <h3 className="text-lg font-bold text-white">Pending Asset Approvals</h3>
                </div>

                {pendingAssets.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Asset Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {pendingAssets.map((asset, index) => (
                                    <tr key={index} className="hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-6 py-4 text-zinc-300 font-mono text-sm">
                                            {asset.userAddress.slice(0, 6)}...{asset.userAddress.slice(-4)}
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">{asset.assetName}</td>
                                        <td className="px-6 py-4 text-zinc-400">{asset.assetType}</td>
                                        <td className="px-6 py-4 text-[#00F5A0] font-mono font-semibold">
                                            ${asset.estimatedValue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(asset)}
                                                    className="px-3 py-1.5 bg-[#00F5A0]/10 hover:bg-[#00F5A0]/20 text-[#00F5A0] text-sm rounded transition-colors"
                                                >
                                                    Approve & Mint NFT
                                                </button>
                                                <button
                                                    onClick={() => handleReject(asset)}
                                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center text-zinc-500">
                        No pending approvals
                    </div>
                )}
            </div>

            {/* SPV Auto-Repayment */}
            <div className="bg-[#0A2342] border-2 border-[#00D4FF] rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">SPV Auto-Repayment</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">
                            Select Borrower
                        </label>
                        <select
                            value={selectedBorrower}
                            onChange={(e) => setSelectedBorrower(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-[#00D4FF] focus:outline-none transition-colors"
                        >
                            <option value="">Choose borrower...</option>
                            <option value="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266">0xf39F...2266</option>
                        </select>
                    </div>

                    {selectedBorrower && (
                        <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
                            <p className="text-sm text-zinc-400 mb-1">Current Debt</p>
                            <p className="text-2xl font-bold text-red-400 font-mono">
                                ${borrowerDebt ? (Number(borrowerDebt) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                            </p>
                            {borrowerCollateralNFTs && borrowerCollateralNFTs.length > 0 && (
                                <p className="text-xs text-zinc-500 mt-1">
                                    {borrowerCollateralNFTs.length} NFT{borrowerCollateralNFTs.length !== 1 ? 's' : ''} locked as collateral
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">
                            Repayment Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                            <input
                                type="number"
                                value={repayAmount || ''}
                                onChange={(e) => setRepayAmount(Number(e.target.value))}
                                placeholder="2,500"
                                className="w-full pl-8 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-[#00D4FF] focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleManualRepay}
                        disabled={!selectedBorrower || repayAmount === 0}
                        className="w-full py-3 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0A2342] font-bold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply Auto-Repayment
                    </button>
                </div>
            </div>
        </div>
    );
}
