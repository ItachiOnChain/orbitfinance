import { useAccount } from 'wagmi';
import { useOrbitAccount } from '../../hooks/useOrbitAccount';
import { useSyncYield } from '../../hooks/useSyncYield';
import { usePendingYield } from '../../hooks/usePendingYield';
import { MetricCard } from '../../components/ui/MetricCard';
import { DollarSign, TrendingDown, Coins, Target, RefreshCw, TrendingUp } from 'lucide-react';
import { formatEther, formatUnits } from 'viem';

export default function AccountPage() {
    const { address } = useAccount();
    const { accountAddress, totalDebt, accumulatedCredit, depositedAssets, wethShares, usdcShares } = useOrbitAccount(address);
    const { syncYield, isPending } = useSyncYield();
    const { pendingYield, uiDebt, uiCredit, onChainDebt } = usePendingYield(accountAddress);

    const formatCurrency = (value: bigint | undefined) => {
        if (!value) return '$0.00';
        const etherValue = parseFloat(formatEther(value));
        // Show more decimals for very small values
        if (etherValue < 0.01 && etherValue > 0) {
            return `$${etherValue.toFixed(6)}`;
        }
        return `$${etherValue.toFixed(2)}`;
    };

    const formatDebtWithPrecision = (value: bigint | undefined) => {
        if (!value) return '0.000000000000000000 orUSD';
        // Show full 18 decimal precision to see tiny changes
        return `${formatEther(value)} orUSD`;
    };

    const formatSharesWETH = (value: bigint | undefined) => {
        if (!value) return '0';
        return parseFloat(formatEther(value)).toFixed(4);
    };

    const formatSharesUSDC = (value: bigint | undefined) => {
        if (!value) return '0';
        return parseFloat(formatUnits(value, 6)).toFixed(2);
    };

    // Calculate max borrowable: 50% LTV on deposits minus current debt
    const WETH_PRICE = 3000;
    const USDC_PRICE = 1;
    const wethValue = wethShares ? parseFloat(formatEther(wethShares)) * WETH_PRICE : 0;
    const usdcValue = usdcShares ? parseFloat(formatUnits(usdcShares, 6)) * USDC_PRICE : 0;
    const totalDepositsUSD = wethValue + usdcValue;
    const maxBorrowableUSD = (totalDepositsUSD * 0.5) - (totalDebt ? parseFloat(formatEther(totalDebt)) : 0);
    const maxBorrowable = maxBorrowableUSD > 0 ? BigInt(Math.floor(maxBorrowableUSD * 1e18)) : 0n;

    if (!address) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400 font-light">Please connect your wallet</p>
            </div>
        );
    }

    if (!accountAddress) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-light tracking-tight text-white">
                    My Account
                </h1>
                <div className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
                    <p className="text-zinc-400 font-light mb-4">No account found</p>
                    <p className="text-sm text-zinc-500 font-light">
                        Create an account by making your first deposit
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-light tracking-tight text-white mb-2">
                    My Account
                </h1>
                <p className="text-sm text-zinc-400 font-light">
                    {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Deposits"
                    value={`$${totalDepositsUSD.toFixed(2)}`}
                    icon={<DollarSign className="w-5 h-5" />}
                    valueClassName="text-emerald-400"
                />
                <MetricCard
                    title="Current Debt (Reducing)"
                    value={formatDebtWithPrecision(uiDebt || totalDebt)}
                    icon={<TrendingDown className="w-5 h-5" />}
                    valueClassName="text-red-400 text-xs"
                />
                <MetricCard
                    title="Accumulated Credit"
                    value={formatCurrency(uiCredit || accumulatedCredit)}
                    icon={<Coins className="w-5 h-5" />}
                    valueClassName="text-gold"
                />
                <MetricCard
                    title="Max Borrowable"
                    value={formatCurrency(maxBorrowable)}
                    icon={<Target className="w-5 h-5" />}
                    valueClassName="text-blue-400"
                />
            </div>

            {/* Auto-Repay Yield Card */}
            {totalDebt && totalDebt > 0n && (
                <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <span className="text-2xl">🌱</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Auto-Repay Active</h3>
                            <p className="text-xs text-emerald-400">Your debt is reducing automatically</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-zinc-900/50 rounded-lg p-3">
                            <p className="text-xs text-zinc-400 mb-1">Yield APY</p>
                            <p className="text-xl font-semibold text-emerald-400">5.00%</p>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3">
                            <p className="text-xs text-zinc-400 mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                <p className="text-sm text-white">Earning</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => accountAddress && syncYield(accountAddress)}
                        disabled={isPending}
                        className="w-full mb-4 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
                        {isPending ? 'Syncing Yield...' : 'Sync Yield Now'}
                    </button>

                    <div className="bg-zinc-900/30 rounded-lg p-4 border border-zinc-800">
                        <p className="text-xs text-zinc-400 mb-2">How it works:</p>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                            Your deposited collateral is earning 5% APY in yield-generating strategies.
                            This yield automatically reduces your debt every block without any action needed from you.
                        </p>
                    </div>
                </div>
            )}

            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <h2 className="text-xl font-light text-white mb-4">Active Vaults</h2>
                <div className="space-y-3">
                    {wethShares && wethShares > 0n && (
                        <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-zinc-300 font-light">WETH Vault</p>
                                    <p className="text-lg text-emerald-400 font-light mt-1">
                                        {formatSharesWETH(wethShares)} shares
                                    </p>
                                </div>
                                <p className="text-xl text-white font-light">
                                    ${wethValue.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}
                    {usdcShares && usdcShares > 0n && (
                        <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-zinc-300 font-light">USDC Vault</p>
                                    <p className="text-lg text-emerald-400 font-light mt-1">
                                        {formatSharesUSDC(usdcShares)} shares
                                    </p>
                                </div>
                                <p className="text-xl text-white font-light">
                                    ${usdcValue.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}
                    {(!wethShares || wethShares === 0n) && (!usdcShares || usdcShares === 0n) && (
                        <p className="text-zinc-500 font-light text-sm">No active deposits</p>
                    )}
                </div>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <h2 className="text-xl font-light text-white mb-4">Loan Repayment Progress</h2>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-zinc-500 font-light text-sm">Chart coming soon</p>
                </div>
            </div>
        </div>
    );
}
