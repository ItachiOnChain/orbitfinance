import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { AlertTriangle } from 'lucide-react';
import { MetricCard } from '../../components/rwa/MetricCard';
import { ProcessStep } from '../../components/rwa/ProcessStep';
import { protocolMetrics, assetPools, howItWorksSteps } from '../../services/rwa/mockData';
import { useKYCStatus } from '../../hooks/rwa/useKYC';
import { kycService } from '../../services/rwa/kycService';
import { useState, useEffect } from 'react';

export default function RWAHome() {
    const navigate = useNavigate();
    const { address } = useAccount();
    const { data: isVerified } = useKYCStatus();
    const [kycSubmission, setKycSubmission] = useState<any>(null);

    useEffect(() => {
        const loadKYC = async () => {
            if (address) {
                const submission = await kycService.getUserSubmission(address);
                setKycSubmission(submission);
            }
        };
        loadKYC();
    }, [address]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="space-y-20">
            {/* KYC Banner */}
            {address && !isVerified && (
                <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <AlertTriangle className="text-yellow-400 flex-shrink-0" size={32} />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-yellow-400 mb-1">
                                KYC Verification Required
                            </h3>
                            <p className="text-zinc-300">
                                {kycSubmission?.status === 'pending'
                                    ? 'Your KYC is pending approval. You\'ll be notified once verified.'
                                    : 'Complete your KYC verification to access Asset Origination, Capital Markets, and Portfolio features.'
                                }
                            </p>
                        </div>
                        {kycSubmission?.status !== 'pending' && (
                            <button
                                onClick={() => navigate('/app/kyc')}
                                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors flex-shrink-0"
                            >
                                Complete KYC
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="text-center space-y-8 py-12">
                <h1 className="text-6xl font-bold tracking-tight text-white text-glow font-outfit leading-tight">
                    Unlock Capital from<br />Real-World Income
                </h1>
                <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                    Tokenize your rent, invoices, or bonds. Borrow against them. Let SPV auto-repay.
                </p>

                {/* CTA Buttons */}
                <div className="flex gap-4 justify-center items-center pt-4">
                    <button
                        onClick={() => navigate('/app/origination')}
                        className="group relative z-10 inline-flex h-14 cursor-pointer items-center justify-center rounded-xl border-0 px-12 py-4 font-outfit text-[13px] font-bold tracking-[0.3em] uppercase text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] blur-0 opacity-100 before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)] before:transition-opacity hover:before:animate-[buttonMovingGradientBg_3s_linear_infinite] hover:before:opacity-70 shadow-[0_0_40px_rgba(212,175,55,0.25)] hover:scale-105 transition-transform"
                    >
                        <span className="relative z-10">Tokenize Asset</span>
                    </button>

                    <button
                        onClick={() => navigate('/app/markets')}
                        className="px-12 py-4 text-[13px] font-bold tracking-[0.3em] uppercase border border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-gold/50 transition-all"
                    >
                        Browse Markets
                    </button>

                    <button
                        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-[13px] font-bold tracking-[0.3em] uppercase text-zinc-500 hover:text-gold transition-colors"
                    >
                        Learn More →
                    </button>
                </div>
            </div>

            {/* Protocol Metrics */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Protocol Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <MetricCard
                        label="Total Value Locked"
                        value={formatCurrency(protocolMetrics.totalValueLocked)}
                        icon="💎"
                        color="#00F5A0"
                    />
                    <MetricCard
                        label="Assets Tokenized"
                        value={protocolMetrics.assetsTokenized}
                        icon="📄"
                        color="#00D4FF"
                    />
                    <MetricCard
                        label="Active Loans"
                        value={protocolMetrics.activeLoans}
                        icon="💰"
                        color="#FFB800"
                    />
                    <MetricCard
                        label="Senior TVL"
                        value={formatCurrency(protocolMetrics.seniorTVL)}
                        icon="🛡️"
                        color="#00F5A0"
                    />
                    <MetricCard
                        label="Junior TVL"
                        value={formatCurrency(protocolMetrics.juniorTVL)}
                        icon="⚡"
                        color="#FFB800"
                    />
                    <MetricCard
                        label="Average Yield"
                        value={`${protocolMetrics.averageYield}%`}
                        icon="📊"
                        color="#00D4FF"
                    />
                </div>
            </div>

            {/* How It Works */}
            <div id="how-it-works">
                <h2 className="text-3xl font-bold text-white mb-4 text-center">How It Works</h2>
                <p className="text-zinc-400 text-center mb-12 max-w-2xl mx-auto">
                    Three simple steps to unlock liquidity from your real-world assets
                </p>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-4">
                    {howItWorksSteps.map((step, index) => (
                        <ProcessStep
                            key={step.number}
                            stepNumber={step.number}
                            title={step.title}
                            description={step.description}
                            icon={step.icon}
                            isLast={index === howItWorksSteps.length - 1}
                        />
                    ))}
                </div>
            </div>

            {/* Active Asset Pools */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-4 text-center">Active Asset Pools</h2>
                <p className="text-zinc-400 text-center mb-12 max-w-2xl mx-auto">
                    Choose from our curated pools of income-generating assets
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {assetPools.map((pool) => (
                        <div
                            key={pool.id}
                            onClick={() => navigate('/app/markets')}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 cursor-pointer hover:border-gold/50 hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">
                                    {pool.name}
                                </h3>
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: pool.color }}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 text-sm">APY</span>
                                    <span className="text-2xl font-bold font-mono" style={{ color: pool.color }}>
                                        {pool.apy}%
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 text-sm">Max LTV</span>
                                    <span className="text-lg font-semibold text-white">
                                        {pool.ltv}%
                                    </span>
                                </div>

                                <div className="pt-4 border-t border-zinc-800">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500">Total Value</span>
                                        <span className="text-zinc-400 font-mono">
                                            {formatCurrency(pool.totalValue)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mt-2">
                                        <span className="text-zinc-500">Active Assets</span>
                                        <span className="text-zinc-400 font-mono">
                                            {pool.activeAssets}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <span className="text-gold text-sm font-semibold group-hover:underline">
                                    Explore Pool →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
