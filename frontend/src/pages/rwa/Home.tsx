import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { AlertTriangle, Globe, Briefcase, TrendingUp, Shield, Zap, BarChart3, ArrowRight, Layers } from 'lucide-react';
import { MetricCard } from '../../components/ui/MetricCard';
import { ProcessStep } from '../../components/rwa/ProcessStep';
import { protocolMetrics, assetPools, howItWorksSteps } from '../../services/rwa/mockData';
import { useKYCStatus } from '../../hooks/rwa/useKYC';
import { kycService } from '../../services/rwa/kycService';
import { useState, useEffect } from 'react';
import { Canvas, useFrame } from "@react-three/fiber";
import { Geometry, Base, Subtraction } from '@react-three/csg';
import { Stars } from '@react-three/drei';
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Bloom, N8AO, SMAA, EffectComposer } from '@react-three/postprocessing';
import { useRef } from "react";
import { Mesh } from "three";

function Shape() {
    const meshRef = useRef<Mesh>(null);
    const innerSphereRef = useRef<Mesh>(null);
    const ringRef = useRef<Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
            meshRef.current.rotation.y = time * 0.2;
        }
        if (innerSphereRef.current) {
            innerSphereRef.current.rotation.x = -time * 0.1;
            innerSphereRef.current.rotation.y = -time * 0.3;
        }
        if (ringRef.current) {
            ringRef.current.rotation.z = time * 0.5;
            ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.2) * 0.1;
        }
    });

    return (
        <>
            <mesh ref={meshRef}>
                <meshPhysicalMaterial
                    roughness={0.05}
                    metalness={1}
                    clearcoat={1}
                    color="#111111"
                    reflectivity={1}
                />
                <Geometry>
                    <Base>
                        <primitive object={new RoundedBoxGeometry(2.8, 2.8, 2.8, 10, 0.3)} />
                    </Base>
                    <Subtraction>
                        <sphereGeometry args={[1.8, 64, 64]} />
                    </Subtraction>
                </Geometry>
            </mesh>

            <mesh ref={innerSphereRef}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshPhysicalMaterial
                    color="#d4af37"
                    emissive="#d4af37"
                    emissiveIntensity={1.5}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3.5, 0.02, 16, 100]} />
                <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={2} />
            </mesh>
        </>
    );
}

function Environment() {
    return (
        <>
            <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#d4af37" />
            <directionalLight position={[0, -5, 10]} intensity={0.5} color="#ffffff" />
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 0]} intensity={1} color="#d4af37" distance={10} />
        </>
    );
}

function Scene() {
    return (
        <Canvas className="w-full h-full" camera={{ position: [0, 0, 8], fov: 40 }}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment />
            <Shape />
            <EffectComposer multisampling={0}>
                <N8AO halfRes color="black" aoRadius={2} intensity={1} aoSamples={6} denoiseSamples={4} />
                <Bloom kernelSize={3} luminanceThreshold={0.2} luminanceSmoothing={0.4} intensity={0.4} />
                <SMAA />
            </EffectComposer>
        </Canvas>
    );
}

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
        <div className="space-y-8 max-w-7xl mx-auto pb-12 w-full px-4 lg:px-8">
            {/* KYC Banner */}
            {address && !isVerified && (
                <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-yellow-500/30 via-zinc-800 to-zinc-900 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                    <div className="absolute inset-0 bg-yellow-500/5 blur-3xl pointer-events-none" />
                    <div className="relative rounded-[23px] bg-zinc-950/90 backdrop-blur-xl p-6">
                        <div className="flex items-center gap-6">
                            <div className="p-3 rounded-full border border-yellow-500/20 bg-yellow-500/5">
                                <AlertTriangle className="text-yellow-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-yellow-400 mb-1 font-outfit">
                                    KYC Verification Required
                                </h3>
                                <p className="text-zinc-400 font-light">
                                    {kycSubmission?.status === 'pending'
                                        ? 'Your KYC is pending approval. You\'ll be notified once verified.'
                                        : 'Complete your KYC verification to access Asset Origination, Capital Markets, and Portfolio features.'
                                    }
                                </p>
                            </div>
                            {kycSubmission?.status !== 'pending' && (
                                <button
                                    onClick={() => navigate('/app/kyc')}
                                    className="px-8 py-3 bg-yellow-500/80 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:scale-105"
                                >
                                    Complete KYC
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-6">
                <div className="p-4 rounded-full border border-gold/20 bg-gold/5 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                    <Globe className="w-8 h-8 text-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                </div>
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-gold/100 mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] font-outfit">
                        Real-World Assets
                    </h1>
                </div>
            </div>
            <br />

            {/* Hero Section with Exact Orbit Animation */}
            <div className="relative h-[600px] w-full rounded-3xl overflow-hidden border border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
                <div className="absolute inset-0 opacity-60">
                    <Scene />
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 max-w-4xl mx-auto translate-x-8 md:translate-x-40">
                    <h2 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-8 font-outfit leading-tight drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                                   Unlock Capital from<br />
                        <span className="text-gold">Real-World Income</span>
                    </h2>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-12 font-light drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                        Tokenize your rent, invoices, or bonds. Borrow against them with self-repaying loans powered by Orbit's yield engine.
                    </p>
                    <br />
                    <div className="flex flex-col md:flex-row gap-6">
                        <button
                            onClick={() => navigate('/app/origination')}
                            className="group relative z-10 inline-flex h-16 cursor-pointer items-center justify-center rounded-xl border-0 px-12 py-4 font-outfit text-[13px] font-bold tracking-[0.3em] uppercase text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] blur-0 opacity-100 before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)] before:transition-opacity hover:before:animate-[buttonMovingGradientBg_3s_linear_infinite] hover:before:opacity-70 shadow-[0_0_40px_rgba(212,175,55,0.25)] hover:scale-105 transition-all"
                        >
                            <span className="relative z-10">TOKENIZE ASSET</span>
                        </button>
                        <button
                            onClick={() => navigate('/app/markets')}
                            className="px-12 py-4 text-[13px] font-bold tracking-[0.3em] uppercase border border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-gold/50 transition-all backdrop-blur-md bg-zinc-900/20"
                        >
                            BROWSE MARKETS
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
            </div>
            <br />
            <br />

            {/* Protocol Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Value Locked"
                    value={formatCurrency(protocolMetrics.totalValueLocked)}
                    icon={<Layers className="w-5 h-5 text-gold" />}
                    valueClassName="text-gold"
                />
                <MetricCard
                    title="Assets Tokenized"
                    value={protocolMetrics.assetsTokenized.toString()}
                    icon={<Briefcase className="w-5 h-5 text-zinc-400" />}
                    valueClassName="text-white"
                />
                <MetricCard
                    title="Active Loans"
                    value={protocolMetrics.activeLoans.toString()}
                    icon={<TrendingUp className="w-5 h-5 text-gold" />}
                    valueClassName="text-gold"
                />
            </div>
            <br />
            <br />

            {/* Active Asset Pools */}
            <div className="py-20">
                <div className="flex items-center justify-between mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gold font-outfit drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] translate-x-6 md:translate-x-80">
                        Active Asset Pools
                    </h2>
                    
                    <button
                        onClick={() => navigate('/app/markets')}
                        className="group flex items-center gap-3 text-gold hover:text-white transition-all text-sm font-bold tracking-[0.3em] uppercase"
                    >
                        View All <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                <br />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {assetPools.map((pool) => (
                        <div
                            key={pool.id}
                            onClick={() => navigate('/app/markets')}
                            className="relative group cursor-pointer"
                        >
                            {/* Animated Border/Glow */}
                            <div className="absolute -inset-[1px] bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-3xl group-hover:from-gold group-hover:to-zinc-800 transition-all duration-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(212,175,55,0.25)]" />
                            
                            <div className="relative p-10 rounded-[23px] bg-zinc-950/90 backdrop-blur-xl h-full flex flex-col min-h-[450px] group-hover:-translate-y-4 transition-all duration-700">
                                <div className="flex items-start justify-between mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-gold/50 transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                            {pool.name.includes('Real Estate') ? <Shield size={24} className="text-gold" /> :
                                                pool.name.includes('Invoices') ? <BarChart3 size={24} className="text-gold" /> :
                                                    <Zap size={24} className="text-gold" />}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white group-hover:text-gold transition-colors duration-500 font-outfit tracking-tight">
                                            {pool.name}
                                        </h3>
                                    </div>
                                    <div
                                        className="w-3 h-3 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-pulse"
                                        style={{ backgroundColor: '#d4af37' }}
                                    />
                                </div>
                                <br />

                                <div className="space-y-8 flex-1">
                                    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 group-hover:border-gold/20 transition-all duration-500 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative">
                                            <span className="text-zinc-500 text-[11px] font-bold font-outfit uppercase tracking-[0.3em] mb-2 block translate-x-6 md:translate-x-3">Target APY</span>
                                            <span className="text-5xl font-bold font-outfit tracking-tighter text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] translate-x-6 md:translate-x-12">
                                                {pool.apy}%
                                            </span>
                                        </div>
                                    </div>
                                    <br />
                                    <br />

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <span className="text-zinc-500 text-[11px] font-bold font-outfit uppercase tracking-[0.3em]">Max LTV</span>
                                            <br />
                                            <br />
                                            <p className="text-xl font-light text-white font-outfit">{pool.ltv}%</p>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-zinc-500 text-[11px] font-bold font-outfit uppercase tracking-[0.3em]">Active Assets</span>
                                            <br />
                                            <br />
                                            <p className="text-xl font-light text-white font-outfit">{pool.activeAssets}</p>
                                        </div>
                                    </div>
                                    <br />
                                    <br />

                                    <div className="pt-8 border-t border-zinc-800/50">
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-500 font-light text-sm tracking-wide">Total Pool Value</span>
                                            <span className="text-white font-bold font-mono text-lg">
                                                {formatCurrency(pool.totalValue)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-zinc-800/50 flex items-center justify-center">
                                    <span className="text-gold text-[12px] font-bold tracking-[0.4em] uppercase group-hover:tracking-[0.5em] transition-all flex items-center gap-3">
                                        EXPLORE POOL <ArrowRight size={16} />
                                    </span>
                                </div>

                                {/* Subtle Background Glow */}
                                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-gold/5 blur-[70px] rounded-full group-hover:bg-gold/10 transition-all duration-700" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <br />
            <br />

            {/* How It Works */}
            <div id="how-it-works" className="py-20 relative">
                <h2 className="text-4xl md:text-5xl font-bold text-gold mb-6 text-center font-outfit drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    The RWA Lifecycle
                </h2>
                <p className="text-zinc-400 text-center mb-20 max-w-2xl mx-auto font-light text-lg">
                    A seamless process from asset tokenization to automated yield-based repayment.
                </p>
                <br />

                {/* Vertical Timeline Container */}
                <div className="relative max-w-5xl mx-auto px-4">
                    {/* Central Golden Line */}
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent transform -translate-x-1/2 z-0 shadow-[0_0_15px_rgba(212,175,55,0.3)]" />

                    <div className="relative z-10">
                        {howItWorksSteps.map((step, index) => (
                            <ProcessStep
                                key={step.number}
                                stepNumber={step.number}
                                title={step.title}
                                description={step.description}
                                index={index}
                                isLast={index === howItWorksSteps.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


