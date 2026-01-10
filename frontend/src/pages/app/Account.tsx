import { useAccount } from 'wagmi';
import { useOrbitAccount } from '../../hooks/useOrbitAccount';
import { useSyncYield } from '../../hooks/useSyncYield';
import { usePendingYield } from '../../hooks/usePendingYield';
import { MetricCard } from '../../components/ui/MetricCard';
import { CreateAccountButton } from '../../components/CreateAccountButton';
import { TokenFaucet } from '../../components/TokenFaucet';
import { DollarSign, TrendingDown, Coins, Target, RefreshCw, User, Shield, Zap, Globe } from 'lucide-react';
import { formatEther, formatUnits } from 'viem';
import { AccountChart } from '../../components/AccountChart';

export default function AccountPage() {
    const { address } = useAccount();
    const { accountAddress, totalDebt, accumulatedCredit, wethShares, usdcShares } = useOrbitAccount(address);
    const { syncYield, isPending } = useSyncYield();
    const { uiDebt, uiCredit, rebaseFromOnChain } = usePendingYield(accountAddress, totalDebt, accumulatedCredit);



    const formatCurrency = (value: bigint | undefined) => {
        if (!value) return '$0.00';
        const etherValue = parseFloat(formatEther(value));
        if (etherValue < 0.01 && etherValue > 0) {
            return `$${etherValue.toFixed(6)}`;
        }
        return `$${etherValue.toFixed(2)}`;
    };

    const formatDebtWithPrecision = (value: bigint | undefined) => {
        if (!value) return '0.000000000000000000 orUSD';
        return `${formatEther(value)} orUSD`;
    };

    const formatCreditWithPrecision = (value: bigint | undefined) => {
        if (!value) return '0.000000000000000000 orUSD';
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

    const WETH_PRICE = 3000;
    const USDC_PRICE = 1;
    const wethValue = wethShares ? parseFloat(formatEther(wethShares)) * WETH_PRICE : 0;
    const usdcValue = usdcShares ? parseFloat(formatUnits(usdcShares, 6)) * USDC_PRICE : 0;
    const totalDepositsUSD = wethValue + usdcValue;
    const maxBorrowableUSD = (totalDepositsUSD * 0.5) - (totalDebt ? parseFloat(formatEther(totalDebt)) : 0);
    const maxBorrowable = maxBorrowableUSD > 0 ? BigInt(Math.floor(maxBorrowableUSD * 1e18)) : 0n;

    // Calculate weighted average interest rate based on deposit composition
    // WETH interest rate: 5.2%, USDC interest rate: 8.5%
    const WETH_INTEREST_RATE = 5.2;
    const USDC_INTEREST_RATE = 8.5;

    let weightedInterestRate = 0;
    if (totalDepositsUSD > 0) {
        const wethWeight = wethValue / totalDepositsUSD;
        const usdcWeight = usdcValue / totalDepositsUSD;
        weightedInterestRate = (wethWeight * WETH_INTEREST_RATE) + (usdcWeight * USDC_INTEREST_RATE);
    }

    // Chart Data
    const totalDepositsETH = totalDepositsUSD / WETH_PRICE;
    const debtETH = totalDebt ? parseFloat(formatEther(totalDebt)) / WETH_PRICE : 0;
    const debtLimitETH = totalDepositsETH * 0.5;
    const withdrawableETH = Math.max(0, totalDepositsETH - debtETH);

    if (!address) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400 font-light font-outfit">Please connect your wallet</p>
            </div>
        );
    }

    if (!accountAddress || accountAddress === '0x0000000000000000000000000000000000000000') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-12 w-full">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-yellow-200 font-outfit tracking-tight" style={{ textShadow: '0 0 15px rgba(234,179,8,0.3)' }}>
                        My Account
                    </h1>
                    <p className="text-zinc-400 text-lg font-light max-w-xl mx-auto">
                        Initialize your institutional Orbit Account to begin managing your decentralized assets.
                    </p>
                </div>

                <div className="max-w-4xl w-full px-4">
                    <div className="relative overflow-hidden rounded-[2.5rem] p-[1px] bg-gradient-to-br from-yellow-500/30 via-zinc-800 to-zinc-900 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                        <div className="absolute inset-0 bg-yellow-500/5 blur-3xl pointer-events-none" />
                        <div className="relative rounded-[2.4rem] bg-zinc-950/90 backdrop-blur-2xl p-16 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
                                <User className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            </div>

                            <div className="space-y-4 mb-12">
                                <h2 className="text-4xl font-bold text-white font-outfit tracking-tight">
                                    Initialize Account
                                </h2>
                                <p className="text-zinc-400 text-lg font-light max-w-lg leading-relaxed">
                                    Your Orbit Account is a secure, smart-contract based vault that enables self-repaying loans and automated yield management.
                                </p>
                            </div>

                            <div className="w-full max-w-md">
                                <CreateAccountButton />
                            </div>

                            <div className="mt-12 pt-12 border-t border-zinc-800/50 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex flex-col items-center gap-2">
                                    <Shield className="w-5 h-5 text-yellow-500/60" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Secure Vault</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500/60" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Instant Setup</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <Globe className="w-5 h-5 text-yellow-500/60" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Access</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-16 w-full px-8 ml-6">
            {/* Header */}
            <div className="flex items-start gap-6">
                <div className="p-4 rounded-full border border-gold/20 bg-gold/5 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                    <User className="w-8 h-8 text-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                </div>
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] font-outfit">
                        My Accounts
                    </h1>
                </div>
            </div>
            <br />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Deposits"
                    value={`$${totalDepositsUSD.toFixed(2)}`}
                    icon={<DollarSign className="w-5 h-5" />}
                    valueClassName="text-white/100"
                />
                <MetricCard
                    title="Current Debt (Reducing)"
                    value={formatDebtWithPrecision(uiDebt || totalDebt)}
                    icon={<TrendingDown className="w-5 h-5" />}
                    valueClassName="text-red-400 text-xs"
                />
                <MetricCard
                    title="Accumulated Credit"
                    value={formatCreditWithPrecision(uiCredit || accumulatedCredit)}
                    icon={<Coins className="w-5 h-5" />}
                    valueClassName="text-gold text-xs"
                />
                <MetricCard
                    title="Max Borrowable"
                    value={formatCurrency(maxBorrowable)}
                    icon={<Target className="w-5 h-5" />}
                    valueClassName="text-white-400"
                />
            </div>
            <br />

            {/* Chart Section */}
            <div className="flex justify-center w-full px-4">
                <div className="max-w-4xl w-full">
                    <div className="rounded-3xl p-[1px] bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="rounded-[23px] bg-zinc-950/80 backdrop-blur-xl p-1 overflow-hidden relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gold/50 blur-[100px] pointer-events-none"></div>
                            <AccountChart
                                totalDeposit={totalDepositsETH}
                                debtLimit={debtLimitETH}
                                withdrawable={withdrawableETH}
                                debt={debtETH}
                                interestRate={weightedInterestRate}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <br />

            {/* Auto-Repay Yield Card */}
            {/* Auto-Repay Yield Card */}
            {totalDebt && totalDebt > 0n && (
                <div className="flex justify-center w-full px-4">
                    <div className="max-w-4xl w-full">
                        <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-gold/30 via-zinc-800 to-zinc-900 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                            <div className="absolute inset-0 bg-gold/5 blur-3xl pointer-events-none" />
                            <div className="relative rounded-[23px] bg-zinc-950/90 backdrop-blur-xl p-10">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-5">
                                        <div>
                                            <h3 className="text-3xl font-bold text-gold font-outfit tracking-tight">Auto-Repay Engine</h3>
                                            <p className="text-lg text-zinc-400 font-light mt-1"></p>
                                        </div>
                                    </div>


                                </div>
                                <br />

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 hover:border-gold/30 transition-colors group">
                                        <p className="text-sm text-zinc-400 mb-2 font-outfit uppercase tracking-widest">Current Yield APY</p>
                                        <p className="text-4xl font-bold text-white font-outfit group-hover:text-gold transition-colors">5.00%</p>
                                    </div>
                                    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 hover:border-gold/30 transition-colors">
                                        <p className="text-sm text-zinc-400 mb-2 font-outfit uppercase tracking-widest">Yield Earned</p>
                                        <p className="text-4xl font-bold text-white font-outfit">
                                            {formatCreditWithPrecision(uiCredit || accumulatedCredit)}
                                        </p>
                                    </div>
                                </div>
                                <br />

                                <button
                                    onClick={() => accountAddress && syncYield(accountAddress)}
                                    disabled={isPending}
                                    className="w-full mb-8 px-8 py-5 bg-gradient-to-r from-gold/80 to-gold/60 hover:from-gold hover:to-gold/80 disabled:from-zinc-700 disabled:to-zinc-700 text-black rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 group transform hover:-translate-y-0.5"
                                >
                                    <RefreshCw className={`w-6 h-6 ${isPending ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                    {isPending ? 'SYNCING YIELD...' : 'SYNC YIELD NOW'}
                                </button>
                                <br />

                                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
                                    <p className="text-xs text-zinc-500 mb-2 font-outfit uppercase tracking-widest font-bold">HOW IT WORKS</p>
                                    <p className="text-base text-zinc-300 leading-relaxed font-light">
                                        Your deposited collateral is earning <span className="text-gold font-medium">5% APY</span> in yield-generating strategies.
                                        This yield automatically reduces your debt .
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <br />

            {/* Active Vaults */}
            <div className="flex justify-center w-full px-4 mb-8">
                <div className="max-w-4xl w-full">
                    <div className="p-8 rounded-3xl bg-zinc-950/50 border border-zinc-800/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-light text-white mb-6 font-outfit">Active Vaults</h2>
                        <div className="space-y-4">
                            {wethShares && wethShares > 0n && (
                                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors group">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-zinc-400 font-light font-outfit uppercase tracking-wider group-hover:text-zinc-300 transition-colors">WETH Vault</p>
                                            <p className="text-xl text-gold font-light mt-1 font-outfit">
                                                {formatSharesWETH(wethShares)} shares
                                            </p>
                                        </div>
                                        <p className="text-2xl text-white font-light font-outfit">
                                            ${wethValue.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {usdcShares && usdcShares > 0n && (
                                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors group">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-zinc-400 font-light font-outfit uppercase tracking-wider group-hover:text-zinc-300 transition-colors">USDC Vault</p>
                                            <p className="text-xl text-emerald-400 font-light mt-1 font-outfit">
                                                {formatSharesUSDC(usdcShares)} shares
                                            </p>
                                        </div>
                                        <p className="text-2xl text-white font-light font-outfit">
                                            ${usdcValue.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {(!wethShares || wethShares === 0n) && (!usdcShares || usdcShares === 0n) && (
                                <p className="text-zinc-500 font-light text-sm italic">No active deposits found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Token Faucet */}
            <div className="flex justify-center w-full px-4 mb-8">
                <div className="max-w-4xl w-full">
                    <TokenFaucet mode="crypto" />
                </div>
            </div>
        </div>
    );
}
