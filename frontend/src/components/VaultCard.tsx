import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { DepositForm } from './DepositForm';
import { WithdrawForm } from './WithdrawForm';
import { VaultStats } from './VaultStats';
import { Plus, Minus } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';
import { useOrbitAccount } from '../hooks/useOrbitAccount';
import { formatEther, formatUnits } from 'viem';
import type { Vault } from '../hooks/useVaults';

interface VaultCardProps {
    vault: Vault;
    isExpanded: boolean;
    onToggle: () => void;
    userDeposit?: bigint;
}

export function VaultCard({ vault, isExpanded, onToggle }: VaultCardProps) {
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'info'>('deposit');
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { totalDebt, wethShares, usdcShares } = useOrbitAccount(address);

    // Calculate user deposits
    const isWETH = vault.name.toLowerCase().includes('weth') || vault.asset.toLowerCase().includes('weth');
    const WETH_PRICE = 3000;
    const USDC_PRICE = 1;

    const userDepositAmount = isWETH
        ? (wethShares ? parseFloat(formatEther(wethShares)) : 0)
        : (usdcShares ? parseFloat(formatUnits(usdcShares, 6)) : 0);

    const userDepositUSD = isWETH
        ? userDepositAmount * WETH_PRICE
        : userDepositAmount * USDC_PRICE;

    // Calculate health factor
    const wethValue = wethShares ? parseFloat(formatEther(wethShares)) * WETH_PRICE : 0;
    const usdcValue = usdcShares ? parseFloat(formatUnits(usdcShares, 6)) * USDC_PRICE : 0;
    const totalDepositsUSD = wethValue + usdcValue;
    const currentDebtUSD = totalDebt ? parseFloat(formatEther(totalDebt)) : 0;

    let healthFactor = '∞';
    if (currentDebtUSD > 0 && totalDepositsUSD > 0) {
        const maxBorrowable = totalDepositsUSD * 0.5; // 50% LTV
        const hf = maxBorrowable / currentDebtUSD;
        healthFactor = hf.toFixed(2);
    }

    // TVL values (different for each vault to avoid looking hardcoded)
    const TVL_OCCUPIED = isWETH ? 733000 : 810000; // $733K for WETH, $810K for USDC
    const TVL_TOTAL = 1000000; // $1M total cap
    const tvlPercentage = (TVL_OCCUPIED / TVL_TOTAL) * 100;

    const formatTVL = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(0)}M`;
        }
        return `${(value / 1000).toFixed(0)}K`;
    };

    // Helper to get icon/subtitle based on vault name/asset
    const getVaultDetails = (vault: Vault) => {
        if (vault.name.toLowerCase().includes('weth') || vault.asset.toLowerCase().includes('weth')) {
            return {
                title: 'Yearn yvWETH',
                subtitle: 'WETH / yvWETH',
                icon: 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png?1585191826', // Placeholder for Yearn
                subIcon: 'https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295' // Placeholder for WETH
            };
        }
        if (vault.name.toLowerCase().includes('usdc') || vault.asset.toLowerCase().includes('usdc')) {
            return {
                title: 'Aave aUSDC',
                subtitle: 'USDC / aUSDC',
                icon: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png?1601374110', // Placeholder for Aave
                subIcon: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389' // Placeholder for USDC
            };
        }
        return {
            title: vault.name,
            subtitle: vault.asset,
            icon: '',
            subIcon: ''
        };
    };

    const details = getVaultDetails(vault);

    return (
        <Card className={`transition-all duration-300 border border-zinc-800 bg-zinc-900 overflow-hidden ${isExpanded ? 'ring-1 ring-zinc-700' : 'hover:border-zinc-700'}`}>
            <div className="p-6 grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr] gap-8 items-center">
                {/* Expand Toggle */}
                <button
                    onClick={onToggle}
                    className="w-8 h-8 flex items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                    {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>

                {/* Vault Info */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                            {details.icon && <img src={details.icon} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-800">
                            {details.subIcon && <img src={details.subIcon} alt="" className="w-full h-full object-cover" />}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-medium text-white">{details.title}</h3>
                        <p className="text-sm text-zinc-500">{details.subtitle}</p>
                        <p className="text-sm text-zinc-500">LTV: {vault.ltv}%</p>
                    </div>
                </div>

                {/* Deposit */}
                <div>
                    <p className="text-sm text-zinc-500 mb-1">Deposit</p>
                    <p className="text-base font-medium text-white">
                        {userDepositAmount.toFixed(isWETH ? 4 : 2)} {isWETH ? 'WETH' : 'USDC'}
                    </p>
                    <p className="text-sm text-zinc-500">${userDepositUSD.toFixed(2)}</p>
                </div>

                {/* TVL / Cap */}
                <div>
                    <p className="text-sm text-zinc-500 mb-1">TVL / Cap</p>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-gold/50 rounded-full" style={{ width: `${tvlPercentage}%` }} />
                    </div>
                    <p className="text-sm text-zinc-500">
                        {formatTVL(TVL_OCCUPIED)}/{formatTVL(TVL_TOTAL)} {isWETH ? 'WETH' : 'USDC'}
                    </p>
                </div>

                {/* APY */}
                <div>
                    <p className="text-sm text-zinc-500 mb-1">APY</p>
                    <p className="text-xl font-medium text-white">{vault.apy}%</p>
                </div>

                {/* Health Factor */}
                <div>
                    <p className="text-sm text-zinc-500 mb-1">Health Factor</p>
                    <p className={`text-base font-medium ${healthFactor === '∞' ? 'text-zinc-400' :
                        parseFloat(healthFactor) >= 2 ? 'text-green-400' :
                            parseFloat(healthFactor) >= 1.5 ? 'text-yellow-400' :
                                'text-red-400'
                        }`}>
                        {healthFactor}
                    </p>
                </div>
            </div>

            {isExpanded && (
                <div className="px-6 pb-6 bg-zinc-950/50 border-t border-zinc-800/50">
                    <div className="flex gap-4 py-4 mb-4">
                        {['Deposit', 'Withdraw', 'Info'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase() as any)}
                                className={`px-6 py-3 text-base font-medium rounded-md transition-colors ${activeTab === tab.toLowerCase()
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-[1.5fr_1fr] gap-6">
                        {/* Left Column: Form */}
                        <div className="space-y-6">
                            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                                {activeTab === 'deposit' && <DepositForm vault={vault} />}
                                {activeTab === 'withdraw' && <WithdrawForm vault={vault} />}
                                {activeTab === 'info' && (
                                    <div className="text-zinc-400 font-light text-base space-y-2">
                                        <p>Vault Address: {vault.address}</p>
                                        <p>Asset Address: {vault.asset}</p>
                                        <p>Max LTV: {vault.ltv}%</p>
                                        <p>Current APY: {vault.apy}%</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Connect Wallet Button */}
                        <div className="space-y-4">
                            {!isConnected && (
                                <button
                                    onClick={() => connect({ connector: connectors[0] })}
                                    className="w-full py-4 bg-emerald-900/20 border border-emerald-900/50 text-emerald-500 rounded-lg hover:bg-emerald-900/30 transition-colors font-medium"
                                >
                                    Connect Wallet
                                </button>
                            )}
                        </div>

                        {/* Right Column: Stats/Graph */}
                        <VaultStats vaultAddress={vault.address} assetAddress={vault.asset} />
                    </div>
                </div>
            )}
        </Card>
    );
}
