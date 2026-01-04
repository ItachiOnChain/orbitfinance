import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { DepositForm } from './DepositForm';
import { WithdrawForm } from './WithdrawForm';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatEther } from 'viem';
import type { Vault } from '../hooks/useVaults';

interface VaultCardProps {
    vault: Vault;
    isExpanded: boolean;
    onToggle: () => void;
    userDeposit?: bigint;
}

export function VaultCard({ vault, isExpanded, onToggle, userDeposit = 0n }: VaultCardProps) {
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'info'>('deposit');

    const formatCurrency = (value: bigint) => {
        return `$${parseFloat(formatEther(value)).toFixed(2)}`;
    };

    return (
        <Card className="hover:border-gold/30 transition-colors">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-xl font-light text-white">{vault.name}</h3>
                        <p className="text-sm text-zinc-400 mt-1">
                            LTV: {vault.ltv}%
                        </p>
                        {userDeposit > 0n && (
                            <p className="text-sm mt-2 text-emerald-400">
                                Your Deposit: {formatCurrency(userDeposit)}
                            </p>
                        )}
                    </div>

                    <div className="text-right">
                        <p className="text-emerald-400 text-2xl font-light">
                            {vault.apy}% APY
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Asset: {vault.asset.slice(0, 6)}...{vault.asset.slice(-4)}
                        </p>
                    </div>

                    <button
                        onClick={onToggle}
                        className="ml-4 px-4 py-2 text-sm font-light text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                Collapse
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                Expand
                            </>
                        )}
                    </button>
                </div>

                {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-zinc-800">
                        <div className="flex gap-2 border-b border-zinc-800 mb-6">
                            <button
                                onClick={() => setActiveTab('deposit')}
                                className={`px-4 py-2 text-sm font-light transition-colors ${activeTab === 'deposit'
                                        ? 'text-gold border-b-2 border-gold'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                Deposit
                            </button>
                            <button
                                onClick={() => setActiveTab('withdraw')}
                                className={`px-4 py-2 text-sm font-light transition-colors ${activeTab === 'withdraw'
                                        ? 'text-gold border-b-2 border-gold'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                Withdraw
                            </button>
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`px-4 py-2 text-sm font-light transition-colors ${activeTab === 'info'
                                        ? 'text-gold border-b-2 border-gold'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                Info
                            </button>
                        </div>

                        {activeTab === 'deposit' && <DepositForm vault={vault} />}
                        {activeTab === 'withdraw' && <WithdrawForm vault={vault} />}
                        {activeTab === 'info' && (
                            <div className="text-zinc-400 font-light text-sm space-y-2">
                                <p>Vault Address: {vault.address}</p>
                                <p>Asset Address: {vault.asset}</p>
                                <p>Max LTV: {vault.ltv}%</p>
                                <p>Current APY: {vault.apy}%</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
