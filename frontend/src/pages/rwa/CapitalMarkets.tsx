import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { TrancheCard } from '../../components/rwa/TrancheCard';
import { TranchingExplainer } from '../../components/rwa/TranchingExplainer';
import { TrancheComparison } from '../../components/rwa/TrancheComparison';
import { DepositModal } from '../../components/rwa/DepositModal';
import { WithdrawModal } from '../../components/rwa/WithdrawModal';
import {
    useSeniorTrancheTVL,
    useJuniorTrancheTVL,
    useSeniorTrancheBalance,
    useJuniorTrancheBalance,
    useApproveUSDC,
    useDepositToSeniorTranche,
    useDepositToJuniorTranche,
    useWithdrawFromSeniorTranche,
    useWithdrawFromJuniorTranche,
    RWAContractCalls,
} from '../../hooks/rwa/useRWAContracts';
import { CONTRACTS } from '../../contracts';
import SeniorTrancheABI from '../../contracts/rwa-abis/SeniorTranche.json';
import JuniorTrancheABI from '../../contracts/rwa-abis/JuniorTranche.json';
import MockUSDCABI from '../../contracts/rwa-abis/MockUSDC.json';

export default function CapitalMarkets() {
    const { address } = useAccount();

    // Contract reads
    const { data: seniorTVL, refetch: refetchSeniorTVL } = useSeniorTrancheTVL();
    const { data: juniorTVL, refetch: refetchJuniorTVL } = useJuniorTrancheTVL();
    const { data: seniorBalance, refetch: refetchSeniorBalance } = useSeniorTrancheBalance();
    const { data: juniorBalance, refetch: refetchJuniorBalance } = useJuniorTrancheBalance();

    // Contract writes
    const { writeContract: approveUSDC, data: approveHash } = useApproveUSDC();
    const { writeContract: depositSenior, data: depositSeniorHash } = useDepositToSeniorTranche();
    const { writeContract: depositJunior, data: depositJuniorHash } = useDepositToJuniorTranche();
    const { writeContract: withdrawSenior, data: withdrawSeniorHash } = useWithdrawFromSeniorTranche();
    const { writeContract: withdrawJunior, data: withdrawJuniorHash } = useWithdrawFromJuniorTranche();

    // Transaction receipts
    const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isLoading: isDepositingSenior, isSuccess: depositSeniorSuccess } = useWaitForTransactionReceipt({ hash: depositSeniorHash });
    const { isLoading: isDepositingJunior, isSuccess: depositJuniorSuccess } = useWaitForTransactionReceipt({ hash: depositJuniorHash });
    const { isLoading: isWithdrawingSenior, isSuccess: withdrawSeniorSuccess } = useWaitForTransactionReceipt({ hash: withdrawSeniorHash });
    const { isLoading: isWithdrawingJunior, isSuccess: withdrawJuniorSuccess } = useWaitForTransactionReceipt({ hash: withdrawJuniorHash });

    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [selectedTranche, setSelectedTranche] = useState<'senior' | 'junior'>('senior');
    const [pendingTx, setPendingTx] = useState<'approve' | 'deposit' | 'withdraw' | null>(null);
    const [pendingAmount, setPendingAmount] = useState<bigint>(0n);

    // Auto-refetch after successful transactions
    useEffect(() => {
        if (depositSeniorSuccess || depositJuniorSuccess || withdrawSeniorSuccess || withdrawJuniorSuccess) {
            refetchSeniorTVL();
            refetchJuniorTVL();
            refetchSeniorBalance();
            refetchJuniorBalance();
            setShowDepositModal(false);
            setShowWithdrawModal(false);
            setPendingTx(null);
            setPendingAmount(0n);
        }
    }, [depositSeniorSuccess, depositJuniorSuccess, withdrawSeniorSuccess, withdrawJuniorSuccess, refetchSeniorTVL, refetchJuniorTVL, refetchSeniorBalance, refetchJuniorBalance]);

    // Chain deposit after approval
    useEffect(() => {
        if (approveSuccess && pendingTx === 'approve' && address && pendingAmount > 0n) {
            setPendingTx('deposit');
            if (selectedTranche === 'senior') {
                depositSenior(RWAContractCalls.depositToSeniorTranche(pendingAmount, address));
            } else {
                depositJunior(RWAContractCalls.depositToJuniorTranche(pendingAmount, address));
            }
        }
    }, [approveSuccess, pendingTx, address, pendingAmount, selectedTranche, depositSenior, depositJunior]);

    const handleDeposit = (tranche: 'senior' | 'junior') => {
        setSelectedTranche(tranche);
        setShowDepositModal(true);
    };

    const handleWithdraw = (tranche: 'senior' | 'junior') => {
        setSelectedTranche(tranche);
        setShowWithdrawModal(true);
    };

    const handleDepositSubmit = async (amount: number) => {
        if (!address) return;

        const amountWei = parseUnits(amount.toString(), 6);
        setPendingAmount(amountWei);
        const trancheAddress = selectedTranche === 'senior' ? CONTRACTS.SeniorTranche : CONTRACTS.JuniorTranche;

        try {
            setPendingTx('approve');
            approveUSDC(RWAContractCalls.approveUSDC(trancheAddress, amountWei));
        } catch (error) {
            console.error('Deposit failed:', error);
            setPendingTx(null);
        }
    };

    const handleWithdrawSubmit = async (amount: number) => {
        if (!address) return;

        const amountWei = parseUnits(amount.toString(), 6);

        try {
            setPendingTx('withdraw');
            if (selectedTranche === 'senior') {
                withdrawSenior(RWAContractCalls.withdrawFromSeniorTranche(amountWei, address, address));
            } else {
                withdrawJunior(RWAContractCalls.withdrawFromJuniorTranche(amountWei, address, address));
            }
        } catch (error) {
            console.error('Withdraw failed:', error);
            setPendingTx(null);
        }
    };

    // Format values from wei
    const seniorTVLFormatted = seniorTVL ? Number(formatUnits(seniorTVL, 6)) : 0;
    const juniorTVLFormatted = juniorTVL ? Number(formatUnits(juniorTVL, 6)) : 0;
    const seniorBalanceFormatted = seniorBalance ? Number(formatUnits(seniorBalance, 6)) : 0;
    const juniorBalanceFormatted = juniorBalance ? Number(formatUnits(juniorBalance, 6)) : 0;

    const totalPosition = seniorBalanceFormatted + juniorBalanceFormatted;
    const seniorAPY = 5.2;
    const juniorAPY = 14.8;

    const isLoading = isApproving || isDepositingSenior || isDepositingJunior || isWithdrawingSenior || isWithdrawingJunior;

    return (
        <div className="space-y-8">
            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-[#0A2342] border border-gold rounded-xl p-8 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto mb-4"></div>
                        <p className="text-white font-bold text-lg">
                            {pendingTx === 'approve' && 'Approving USDC...'}
                            {pendingTx === 'deposit' && 'Depositing...'}
                            {pendingTx === 'withdraw' && 'Withdrawing...'}
                        </p>
                        <p className="text-zinc-400 text-sm mt-2">Please confirm in your wallet</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Capital Markets</h1>
                    <p className="text-zinc-400">Invest in senior or junior tranches</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-zinc-500 mb-1">Your Total Position</p>
                    <p className="text-2xl font-bold font-mono text-gold">
                        ${totalPosition.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Tranche Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrancheCard
                    type="senior"
                    apy={seniorAPY}
                    tvl={seniorTVLFormatted}
                    userPosition={seniorBalanceFormatted}
                    riskLevel="low"
                    priority={1}
                    onDeposit={() => handleDeposit('senior')}
                    onWithdraw={() => handleWithdraw('senior')}
                />

                <TrancheCard
                    type="junior"
                    apy={juniorAPY}
                    tvl={juniorTVLFormatted}
                    userPosition={juniorBalanceFormatted}
                    riskLevel="high"
                    priority={2}
                    lockupPeriod={3}
                    onDeposit={() => handleDeposit('junior')}
                    onWithdraw={() => handleWithdraw('junior')}
                />
            </div>

            {/* How Tranching Works */}
            <TranchingExplainer />

            {/* Feature Comparison */}
            <TrancheComparison />

            {/* Modals */}
            <DepositModal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                onDeposit={handleDepositSubmit}
                trancheType={selectedTranche}
                apy={selectedTranche === 'senior' ? seniorAPY : juniorAPY}
                lockupPeriod={selectedTranche === 'junior' ? 3 : undefined}
            />

            <WithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onWithdraw={handleWithdrawSubmit}
                trancheType={selectedTranche}
                currentBalance={selectedTranche === 'senior' ? seniorBalanceFormatted : juniorBalanceFormatted}
                earnedYield={0}
                lockupPeriod={selectedTranche === 'junior' ? 3 : undefined}
                lockupComplete={true}
            />
        </div>
    );
}
