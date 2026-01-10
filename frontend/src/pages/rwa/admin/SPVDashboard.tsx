import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import {
    AlertTriangle,
    Wallet,
    CheckCircle,
    Copy,
    Users,
    FileCheck,
    RefreshCw,
    ArrowUpRight,
    Search,
    Info
} from 'lucide-react';
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
import { CONTRACTS } from '../../../contracts';
import { kycService, type KYCSubmission } from '../../../services/rwa/kycService';
import OrbitRWAPoolABI from '../../../contracts/rwa-abis/OrbitRWAPool.json';
import MockUSDCABI from '../../../contracts/rwa-abis/MockUSDC.json';

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

    // Hooks for selected borrower
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

        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    // Remove from pending after successful tx
    useEffect(() => {
        if (txSuccess) {
            adminService.getPendingAssets().then(setPendingAssets);
        }
    }, [txSuccess]);

    const handleApprove = async (asset: PendingAsset) => {
        try {
            const assetTypeMap: Record<string, number> = {
                'RENTAL': 0,
                'INVOICE': 1,
                'BOND': 2,
            };

            const assetType = assetTypeMap[asset.assetType] || 0;
            const monthlyIncome = parseUnits((asset.estimatedValue / 48).toString(), 6);
            const duration = BigInt(48);
            const totalValue = parseUnits(asset.estimatedValue.toString(), 6);

            writeContract(RWAContractCalls.mintNFT(
                asset.userAddress as `0x${string}`,
                asset.assetName,
                assetType,
                monthlyIncome,
                duration,
                totalValue
            ));

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
            const verifyCall = RWAContractCalls.verifyUser(kyc.userAddress as `0x${string}`);
            writeContract(verifyCall);
            await kycService.updateStatus(kyc.userAddress, 'approved');
            setPendingKYC(pendingKYC.filter(k => k.userAddress !== kyc.userAddress));
        } catch (error) {
            console.error('KYC approval failed:', error);
        }
    };

    const handleRejectKYC = async (kyc: KYCSubmission) => {
        try {
            await kycService.updateStatus(kyc.userAddress, 'rejected', 'Documents do not meet requirements');
            setPendingKYC(pendingKYC.filter(k => k.userAddress !== kyc.userAddress));
        } catch (error) {
            console.error('KYC rejection failed:', error);
        }
    };

    const handleManualRepay = async () => {
        if (!selectedBorrower || repayAmount === 0) return;

        try {
            const usdcAddress = { address: CONTRACTS.MockUSDC, abi: MockUSDCABI.abi }.address;
            const rwaPoolAddress = { address: CONTRACTS.OrbitRWAPool, abi: OrbitRWAPoolABI.abi }.address;
            const amountInWei = parseUnits(repayAmount.toString(), 6);

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

    useEffect(() => {
        if (approveSuccess && selectedBorrower && repayAmount > 0 && !repaySuccess) {
            const amountInWei = parseUnits(repayAmount.toString(), 6);
            repayDebt(RWAContractCalls.repayDebt(amountInWei));
        }
    }, [approveSuccess, selectedBorrower, repayAmount, repaySuccess, repayDebt]);

    useEffect(() => {
        if (repaySuccess) {
            setTimeout(() => {
                refetchDebt();
            }, 500);
        }
    }, [repaySuccess, refetchDebt]);

    useEffect(() => {
        if (repaySuccess && borrowerDebt !== undefined && Number(borrowerDebt) === 0 && borrowerCollateralNFTs && Array.isArray(borrowerCollateralNFTs) && borrowerCollateralNFTs.length > 0 && nftsToWithdraw.length === 0) {
            setTimeout(() => {
                setNftsToWithdraw(borrowerCollateralNFTs as bigint[]);
                setCurrentWithdrawIndex(0);
            }, 0);
        }
    }, [repaySuccess, borrowerDebt, borrowerCollateralNFTs, nftsToWithdraw.length]);

    useEffect(() => {
        if (nftsToWithdraw.length > 0 && currentWithdrawIndex < nftsToWithdraw.length && !withdrawSuccess) {
            const tokenId = nftsToWithdraw[currentWithdrawIndex];
            withdrawCollateral(RWAContractCalls.withdrawCollateral(tokenId));
        }
    }, [nftsToWithdraw, currentWithdrawIndex, withdrawSuccess, withdrawCollateral]);

    useEffect(() => {
        if (withdrawSuccess && nftsToWithdraw.length > 0) {
            setTimeout(() => {
                const nextIndex = currentWithdrawIndex + 1;
                if (nextIndex < nftsToWithdraw.length) {
                    setCurrentWithdrawIndex(nextIndex);
                } else {
                    setNftsToWithdraw([]);
                    setCurrentWithdrawIndex(0);
                    setSelectedBorrower('');
                    setRepayAmount(0);
                }
            }, 0);
        }
    }, [withdrawSuccess, currentWithdrawIndex, nftsToWithdraw.length]);

    if (!isAdmin(address)) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 ml-6">
            {/* Loading overlay */}
            {isTxPending && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-zinc-950 border border-yellow-500/30 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto mb-4"></div>
                        <p className="text-white font-bold text-lg">Processing Transaction...</p>
                        <p className="text-zinc-400 text-sm mt-2">Please confirm in your wallet</p>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {txSuccess && (
                <div className="fixed top-24 right-8 z-50 bg-zinc-950/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-yellow-500/20">
                    <CheckCircle size={24} className="text-yellow-400" />
                    <div>
                        <p className="font-bold text-yellow-200">Action Successful</p>
                        <p className="text-sm text-zinc-400">The transaction has been confirmed</p>
                    </div>
                </div>
            )}

            {/* Header & Warning */}
            <div className="space-y-8 text-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center">
                        <h1 className="text-6xl font-bold text-yellow-200 mb-4 font-outfit tracking-tight" style={{ textShadow: '0 0 18px rgba(234,179,8,0.45)' }}>
                            SPV Simulator
                        </h1>
                        <p className="text-zinc-300 text-xl font-light max-w-2xl leading-relaxed">
                            Institutional asset management and compliance dashboard for Orbit Finance SPV operations.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-yellow-500/60 text-[10px] font-bold tracking-[0.2em] uppercase">
                        <AlertTriangle size={12} />
                        <span>Demo Environment</span>
                    </div>
                </div>

                <div className="bg-zinc-900/20 border border-zinc-800/30 rounded-xl px-5 py-3 flex items-center justify-center gap-4 text-xs text-zinc-500">
                    <Info size={16} className="text-zinc-600" />
                    <p>Approval actions in this simulator will trigger automated smart contract interactions for demonstration purposes.</p>
                </div>
            </div>

            {/* SPV Wallet Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                {/* Primary Stat: USDC Liquidity */}
                <div className="lg:col-span-6 bg-zinc-950/40 backdrop-blur-2xl border border-yellow-500/10 rounded-2xl p-12 shadow-2xl relative overflow-hidden group text-center">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <Wallet size={160} className="text-yellow-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse" />
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">USDC Liquidity Pool</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-7xl font-bold bg-gradient-to-b from-yellow-100 via-yellow-200 to-yellow-400 bg-clip-text text-transparent font-outfit tracking-tighter" style={{ filter: 'drop-shadow(0 0 8px rgba(234,179,8,0.25))' }}>
                                ${spvBalance.toLocaleString()}
                            </p>
                            <p className="text-sm text-zinc-400 font-light">Available for immediate distribution</p>
                        </div>
                    </div>
                    {/* Subtle glow */}
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-500/5 blur-[100px] pointer-events-none" />
                </div>

                {/* Secondary Stats */}
                <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/30 rounded-2xl p-10 flex flex-col justify-between group hover:border-yellow-500/20 transition-all text-center">
                        <div>
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Total Assets</p>
                                <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-yellow-500/50 transition-colors" />
                            </div>
                            <p className="text-4xl font-bold text-yellow-100 font-outfit" style={{ textShadow: '0 0 8px rgba(234,179,8,0.2)' }}>$1,245,000</p>
                        </div>
                        <p className="text-xs text-zinc-500 mt-6 font-light">Managed across 12 active pools</p>
                    </div>

                    <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/30 rounded-2xl p-10 flex flex-col justify-between group hover:border-yellow-500/20 transition-all text-center">
                        <div>
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">SPV Wallet</p>
                                <Copy size={14} className="text-zinc-700 group-hover:text-yellow-500/50 transition-colors cursor-pointer" />
                            </div>
                            <p className="text-sm font-mono text-zinc-400 truncate">0x9599...07B1</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Mainnet Proxy</p>
                        </div>
                    </div>
                </div>
            </div>

            <br />

            {/* Approvals Section */}
            <div className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-zinc-800/50" />
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.4em]">Pending Approvals Queue</h2>
                    <div className="h-px flex-1 bg-zinc-800/50" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* KYC Approvals */}
                    <div className="bg-zinc-950/20 rounded-2xl border border-zinc-800/30 flex flex-col min-h-[400px]">
                        <div className="px-8 py-6 border-b border-zinc-800/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users size={18} className="text-zinc-500" />
                                <h3 className="text-sm font-bold text-yellow-200 uppercase tracking-widest" style={{ textShadow: '0 0 8px rgba(234,179,8,0.35)' }}>Identity Verification</h3>
                            </div>
                            {pendingKYC.length > 0 && (
                                <span className="text-[10px] font-bold text-yellow-500/80 bg-yellow-500/5 px-2 py-1 rounded border border-yellow-500/10">
                                    {pendingKYC.length} ACTION REQUIRED
                                </span>
                            )}
                        </div>

                        <div className="flex-1">
                            {pendingKYC.length > 0 ? (
                                <div className="divide-y divide-zinc-800/20">
                                    {pendingKYC.map((kyc) => (
                                        <div key={kyc.userAddress} className="px-8 py-6 hover:bg-zinc-900/10 transition-colors flex items-center justify-between gap-6">
                                            <div className="min-w-0 text-left">
                                                <p className="text-zinc-200 font-medium text-lg tracking-tight">{kyc.fullName}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 font-light">
                                                    <span className="font-mono">{kyc.userAddress.slice(0, 8)}...{kyc.userAddress.slice(-6)}</span>
                                                    <span className="text-zinc-800">|</span>
                                                    <span>{kyc.country}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleApproveKYC(kyc)}
                                                    className="p-3 bg-zinc-900/50 hover:bg-green-500/10 text-zinc-500 hover:text-green-400 rounded-xl border border-zinc-800/50 hover:border-green-500/20 transition-all"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleRejectKYC(kyc)}
                                                    className="p-3 bg-zinc-900/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-xl border border-zinc-800/50 hover:border-red-500/20 transition-all"
                                                >
                                                    <AlertTriangle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-center px-8">
                                    <div className="w-16 h-16 rounded-full bg-zinc-900/30 flex items-center justify-center mb-6 border border-zinc-800/30">
                                        <Users size={24} className="text-zinc-700" />
                                    </div>
                                    <h4 className="text-zinc-200 font-medium mb-2">Queue Clear</h4>
                                    <p className="text-sm text-zinc-500 font-light max-w-[240px]">All identity verification requests have been processed.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Asset Origination */}
                    <div className="bg-zinc-950/20 rounded-2xl border border-zinc-800/30 flex flex-col min-h-[400px]">
                        <div className="px-8 py-6 border-b border-zinc-800/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileCheck size={18} className="text-zinc-500" />
                                <h3 className="text-sm font-bold text-yellow-200 uppercase tracking-widest" style={{ textShadow: '0 0 8px rgba(234,179,8,0.35)' }}>Asset Origination</h3>
                            </div>
                            {pendingAssets.length > 0 && (
                                <span className="text-[10px] font-bold text-yellow-500/80 bg-yellow-500/5 px-2 py-1 rounded border border-yellow-500/10">
                                    {pendingAssets.length} ACTION REQUIRED
                                </span>
                            )}
                        </div>

                        <div className="flex-1">
                            {pendingAssets.length > 0 ? (
                                <div className="divide-y divide-zinc-800/20">
                                    {pendingAssets.map((asset, index) => (
                                        <div key={index} className="px-8 py-6 hover:bg-zinc-900/10 transition-colors flex items-center justify-between gap-6">
                                            <div className="min-w-0 text-left">
                                                <p className="text-zinc-200 font-medium text-lg tracking-tight">{asset.assetName}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 font-light">
                                                    <span className="px-2 py-0.5 bg-zinc-900 rounded text-[9px] font-bold text-zinc-400 border border-zinc-800">{asset.assetType}</span>
                                                    <span className="text-zinc-800">|</span>
                                                    <span className="text-green-400/80 font-mono">${asset.estimatedValue.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleApprove(asset)}
                                                    className="px-5 py-2.5 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-500/80 hover:text-yellow-500 text-[10px] font-bold rounded-xl border border-yellow-500/10 hover:border-yellow-500/30 transition-all uppercase tracking-widest"
                                                >
                                                    Approve & Mint
                                                </button>
                                                <button
                                                    onClick={() => handleReject(asset)}
                                                    className="p-3 bg-zinc-900/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-xl border border-zinc-800/50 hover:border-red-500/20 transition-all"
                                                >
                                                    <AlertTriangle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-24 text-center px-12">
                                    <div className="w-16 h-16 rounded-full bg-zinc-900/30 flex items-center justify-center mb-6 border border-zinc-800/30">
                                        <FileCheck size={24} className="text-zinc-700" />
                                    </div>
                                    <h4 className="text-yellow-200/80 font-bold uppercase tracking-widest text-sm mb-3">No Pending Assets</h4>
                                    <p className="text-sm text-zinc-500 font-light max-w-[280px] leading-relaxed">All asset origination requests have been successfully processed.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* SPV Auto-Repayment Section */}
            <div className="bg-zinc-950/40 backdrop-blur-3xl border border-yellow-500/20 rounded-3xl p-16 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none">
                    <RefreshCw size={240} className="text-yellow-500" />
                </div>

                <div className="relative z-10">
                    {/* Header Area: Centered */}
                    <div className="flex flex-col items-center text-center mb-16">
                        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-8">
                            <RefreshCw size={32} className="text-yellow-500" />
                        </div>
                        <h3 className="text-4xl font-bold text-yellow-200 font-outfit tracking-tight mb-4" style={{ textShadow: '0 0 12px rgba(234,179,8,0.35)' }}>
                            SPV Auto-Repayment
                        </h3>
                        <p className="text-zinc-300 font-light max-w-xl leading-relaxed">
                            Automated debt servicing and collateral management for institutional borrowers.
                        </p>
                    </div>

                    {/* Form Container: Centered Column */}
                    <div className="space-y-12 pb-12">
                        {/* Borrower Selector */}
                        <div className="space-y-4 w-full">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] text-center">
                                Select Target Borrower
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedBorrower}
                                    onChange={(e) => setSelectedBorrower(e.target.value)}
                                    className="w-full px-6 py-5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl text-zinc-200 font-outfit focus:border-yellow-500/40 focus:outline-none appearance-none transition-all hover:bg-zinc-900/50"
                                >
                                    <option value="" className="bg-zinc-950">Choose borrower address...</option>
                                    <option value="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" className="bg-zinc-950">0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Institutional Demo)</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                    <Search size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Repayment Amount */}
                        <div className="space-y-4 w-full">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] text-center">
                                Repayment Amount (USDC)
                            </label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 font-mono group-focus-within:text-yellow-500/50 transition-colors">$</span>
                                <input
                                    type="number"
                                    value={repayAmount || ''}
                                    onChange={(e) => setRepayAmount(Number(e.target.value))}
                                    placeholder="0.00"
                                    className="w-full pl-14 pr-6 py-5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl text-zinc-200 font-mono focus:border-yellow-500/40 focus:outline-none transition-all hover:bg-zinc-900/50"
                                />
                            </div>
                        </div>

                        {/* Outstanding Debt Summary: Inner Card */}
                        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-10 text-center min-h-[160px] flex flex-col justify-center relative overflow-hidden w-full">
                            {selectedBorrower ? (
                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">Current Outstanding Debt</p>
                                        <p className="text-6xl font-bold text-red-400/90 font-mono tracking-tighter">
                                            ${borrowerDebt ? (Number(borrowerDebt) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                        </p>
                                    </div>
                                    {((borrowerCollateralNFTs && Array.isArray(borrowerCollateralNFTs) && borrowerCollateralNFTs.length > 0) ? (
                                        <div className="flex items-center justify-center gap-3 text-zinc-400 bg-zinc-950/40 px-5 py-3 rounded-lg border border-zinc-800/50 mx-auto w-fit">
                                            <FileCheck size={16} className="text-yellow-500/50" />
                                            <p className="text-xs font-medium">
                                                {(borrowerCollateralNFTs as any[]).length} Asset NFT{borrowerCollateralNFTs.length !== 1 ? 's' : ''} Locked
                                            </p>
                                        </div>
                                    ) : null) as React.ReactNode}
                                </div>
                            ) : (
                                <div className="text-center py-4 relative z-10">
                                    <p className="text-sm text-zinc-500 italic font-light">Select a borrower to analyze debt and collateral status</p>
                                </div>
                            )}
                            {/* Subtle background glow */}
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none" />
                        </div>

                        {/* CTA Button: Centered */}
                        <div className="flex justify-center pt-6">
                            <button
                                onClick={handleManualRepay}
                                disabled={!selectedBorrower || repayAmount === 0}
                                className="w-full max-w-md py-6 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-zinc-950 font-bold rounded-2xl shadow-[0_10px_40px_rgba(234,179,8,0.2)] hover:shadow-[0_15px_50px_rgba(234,179,8,0.3)] transition-all active:scale-[0.98] disabled:opacity-10 disabled:grayscale disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-[0.3em] text-xs"
                            >
                                Execute Institutional Repayment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
