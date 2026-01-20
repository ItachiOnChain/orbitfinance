import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { useAppStore } from '../store/appStore';
import { LandingNavbar } from "../components/layout/LandingNavbar";
import { Footer } from "../components/ui/Footer";
import { Scene, BackgroundStars } from "../components/3d/Scene";
import {
    ArrowRight, ChevronRight, ShieldCheck,
    Activity, Globe, Zap,
    Cpu, Layers, Lock
} from 'lucide-react';

/* ================= UTIL ================= */
const Spacer = ({ size = "lg" }: { size?: "sm" | "md" | "lg" }) => {
    const heights = {
        sm: "h-16 md:h-24",
        md: "h-24 md:h-32",
        lg: "h-32 md:h-48"
    };
    return <div className={heights[size]} />;
};

/* ================= SCROLL REVEAL ================= */
const Reveal = ({ children, delay = 0, y = 32 }: any) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: y }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
        >
            {children}
        </motion.div>
    );
};

/* ================= ADVANCED FLOW ================= */
const AdvancedFlow = () => {
    const steps = ["DEPOSIT", "YIELD", "MINT", "REPAY"];
    const [active, setActive] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setActive(v => (v + 1) % steps.length), 2000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex items-center gap-4 justify-center">
            {steps.map((s, i) => (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                        <span
                            className={`text-[9px] font-mono tracking-[0.3em] transition-all duration-700
                  ${i === active ? "text-gold" : "text-white/20"}`}
                        >
                            {s}
                        </span>
                        <div className={`mt-2 h-[2px] w-8 transition-all duration-700 rounded-full ${i === active ? "bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" : "bg-white/5"}`} />
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

/* ================= TYPING WORDS ================= */
const typingWords = ["Future Yield", "Real-World Assets", "DeFi Liquidity"];
const TypingWords = () => {
    const [text, setText] = useState("");
    const [index, setIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = typingWords[index];
        const typingSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && charIndex < currentWord.length) {
            const timeout = setTimeout(() => {
                setText(prev => prev + currentWord[charIndex]);
                setCharIndex(prev => prev + 1);
            }, typingSpeed);
            return () => clearTimeout(timeout);
        } else if (isDeleting && charIndex > 0) {
            const timeout = setTimeout(() => {
                setText(prev => prev.slice(0, -1));
                setCharIndex(prev => prev - 1);
            }, typingSpeed);
            return () => clearTimeout(timeout);
        } else if (!isDeleting && charIndex === currentWord.length) {
            const timeout = setTimeout(() => setIsDeleting(true), 1200);
            return () => clearTimeout(timeout);
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setIndex(prev => (prev + 1) % typingWords.length);
        }
    }, [charIndex, isDeleting, index]);

    return (
        <span className="text-gold tracking-tighter inline-block min-w-[180px] md:min-w-[280px] lg:min-w-[340px] whitespace-nowrap">
            {text}<span className="animate-pulse bg-gold/40 w-1 inline-block h-6 md:h-10 ml-1" />
        </span>
    );
};

/* ================= COMPONENT: INFO CARD ================= */
const InfoCard = ({ title, subtitle, desc, icon: Icon, features, delay = 0, variant = "gold" }: any) => {
    const borderStyle = variant === "gold" ? "hover:border-gold/30 border-gold/10" : "hover:border-blue-400/30 border-white/10";
    const glowStyle = variant === "gold" ? "from-gold/5" : "from-blue-400/5";
    const iconStyle = variant === "gold" ? "text-gold bg-gold/5" : "text-blue-400 bg-blue-400/5";

    return (
        <Reveal delay={delay}>
            <div className={`group relative p-6 md:p-10 rounded-2xl border ${borderStyle} bg-black/40 backdrop-blur-3xl transition-all duration-1000 flex flex-col items-start text-left overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] hover:-translate-y-4`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${glowStyle} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
                
                <div className={`w-14 h-14 rounded-2xl ${iconStyle} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-700 shadow-inner`}>
                    <Icon size={28} strokeWidth={1.2} />
                </div>

                <div className="relative z-10 w-full mb-auto">
                    <span className="text-[10px] font-mono tracking-[0.5em] text-white/30 uppercase mb-3 block">{subtitle}</span>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white mb-4 group-hover:text-gold transition-colors duration-700">{title}</h3>
                    <p className="text-white/50 leading-[1.6] mb-4 text-sm md:text-base font-light max-w-2xl">
                        {desc}
                    </p>
                </div>

                {features && features.length > 0 && (
                    <div className="relative z-10 w-full pt-8 border-t border-white/5 flex flex-col gap-y-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                        {features.map((f: string, i: number) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`w-1.5 h-1.5 rounded-full ${variant === "gold" ? "bg-gold/60" : "bg-blue-400/60"}`}   />
                                <span className="group-hover:text-white transition-colors duration-500">{f}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Reveal>
    );
};

/* ================= SECTION ================= */
const Section = ({ id, label, title, subtitle, children, fullWidth = false }: any) => (
    <section id={id} className="relative w-full py-20 md:py-32 flex flex-col items-center overflow-hidden">
        <div className={`container mx-auto px-6 md:px-12 flex flex-col items-center ${fullWidth ? 'max-w-none' : 'max-w-7xl'}`}>
            <Reveal>
                <div className="flex flex-col items-center gap-6 mb-20 text-center">
                    {label && (
                        <div className="flex items-center gap-4">
                            <div className="h-px w-8 bg-gold/40" />
                            <span className="text-[10px] font-mono tracking-[0.5em] uppercase text-gold/80 bg-gold/5 px-4 py-1.5 rounded-full border border-gold/10">
                                {label}
                            </span>
                            <div className="h-px w-8 bg-gold/40" />
                        </div>
                    )}
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto font-light leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </Reveal>
            <div className="w-full">
                {children}
            </div>
        </div>
    </section>
);

/* ================= MAIN ================= */
export default function LandingPage() {
    const navigate = useNavigate();
    const { isConnected } = useAccount();
    const { connectAsync, connectors } = useConnect();
    const { setMode } = useAppStore();

    const handleConnect = async () => {
        if (isConnected) {
            navigate('/app/crypto');
            return;
        }

        const connector = connectors.find(c => c.id === 'injected') || connectors[0];
        if (connector) {
            try {
                await connectAsync({ connector });
                setMode('crypto');
            } catch (error) {
                console.error('Connection failed:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden selection:bg-gold selection:text-black flex flex-col items-center">

            {/* GLOBAL BACKGROUND - Fixed and layered */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Canvas dpr={[1, 2]}>
                    <Suspense fallback={null}>
                        <BackgroundStars />
                    </Suspense>
                </Canvas>
                
                {/* Visual depth overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-transparent to-[#020202] z-10 opacity-70" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020202_100%)] opacity-80 z-10" />
                
                {/* Dynamic Liquid Glows */}
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-gold/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
                <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-white/5 blur-[180px] rounded-full pointer-events-none" />
                <div className="absolute top-[40%] left-[30%] w-[20%] h-[20%] bg-gold/5 blur-[100px] rounded-full animate-bounce duration-[10000ms] pointer-events-none" />
            </div>

            <LandingNavbar />

            {/* ================= HERO ================= */}
            <section id="hero" className="relative min-h-[95vh] lg:min-h-screen w-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Canvas dpr={[1, 2]}>
                        <Suspense fallback={null}>
                            <Scene />
                            <EffectComposer>
                                <Bloom intensity={1.5} luminanceThreshold={0.4} luminanceSmoothing={0.9} />
                                <Noise opacity={0.03} />
                                <Vignette darkness={0.8} />
                            </EffectComposer>
                        </Suspense>
                    </Canvas>
                </div>

                {/* Hero Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent z-10" />
                
                <div className="relative z-20 container mx-auto px-6 md:px-12 flex flex-col items-center justify-center text-center">
                    <div className="max-w-5xl flex flex-col items-center">
                        <Reveal delay={0.1}><AdvancedFlow /></Reveal>

                        <Reveal delay={0.25} y={48}>
                            <h1 className="mt-8 md:mt-12 text-4xl sm:text-5xl md:text-7xl xl:text-8xl font-black leading-[1.1] uppercase tracking-tighter text-white">
                                <span className="block mb-2">BORROW AGAINST</span>
                                <span className="block text-gold">YOUR <TypingWords /></span>
                            </h1>
                        </Reveal>

                        <Reveal delay={0.4}>
                            <div className="mt-10 max-w-2xl">
                                <p className="text-sm md:text-base text-white/50 font-light leading-relaxed tracking-[0.05em]">
                                    The first self-repaying decentralized credit bridge. <br className="hidden md:block" /> 
                                    Institutional yield architecture meets decentralized liquidity.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={0.6}>
                            <div className="mt-14 flex flex-wrap gap-8 justify-center">
                                <button
                                    onClick={handleConnect}
                                    className="group relative z-10 inline-flex h-12 md:h-14 cursor-pointer items-center justify-center rounded-2xl border-0 px-10 md:px-16 py-3 font-outfit text-[11px] md:text-xs font-black tracking-[0.3em] uppercase text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] blur-0 opacity-100 before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)] before:transition-opacity hover:before:animate-[buttonMovingGradientBg_3s_linear_infinite] hover:before:opacity-70 shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 transition-all"
                                >
                                    <span className="relative z-10 flex items-center gap-3 translate-x-1">
                                        {isConnected ? "Launch Protocol" : "Secure Flight"} 
                                    </span>
                                </button>
                                <button
                                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="group relative z-10 inline-flex h-12 md:h-14 cursor-pointer items-center justify-center rounded-2xl border-0 px-10 md:px-16 py-3 font-outfit text-[11px] md:text-xs font-bold tracking-[0.3em] uppercase text-white bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(rgba(255,255,255,0.05),rgba(255,255,255,0.05)),linear-gradient(90deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1),rgba(255,255,255,0.1))] blur-0 opacity-100 hover:border-white/20 transition-all duration-500 hover:scale-105"
                                >
                                    <span className="relative z-10 flex items-center gap-3 translate-x-1">
                                        Documentation <ChevronRight size={18} />
                                    </span>
                                </button>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            <Spacer />

            {/* ================= CORE ENGINE ================= */}
            <Section
                id="about"
                label="THE ARCHITECTURE"
                title="The Core Engine"
                subtitle="Dual modules engineered for maximum capital efficiency."
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 w-full max-w-6xl mx-auto px-6 ">
                    <InfoCard 
                        subtitle="CRYPTO MODULE"
                        title="Self-Repaying DeFi" 
                        desc="Unlock the value of your yield-bearing assets. Deposit WETH or USDC into Orbit vaults and receive orUSD instantly. Your debt is automatically settled in real-time as your collateral generates yield across top-tier DeFi protocols—liquid borrowing simplified."
                        icon={Activity}
                        variant="gold"
                        features={[]}
                    />
                    <InfoCard 
                        subtitle="RWA MODULE"
                        title="Institutional RWA" 
                        delay={0.1}
                        desc="Orbit bridges the gap between on-chain liquidity and real-world stability. Collateralize tokenized US Treasuries and Private Credit certificates via our compliant Mantle-native infrastructure. Institutional security meets decentralized efficiency."
                        icon={ShieldCheck}
                        variant="blue"
                        features={[]}
                    />
                </div>
            </Section>

            <Spacer size="md" />

            {/* ================= HOW IT WORKS ================= */}
            <Section
                id="how-it-works"
                label="TECHNICAL WORKFLOW"
                title="The Credit Cycle"
                subtitle="A fully autonomous feedback loop engineered for safety and scale."
            >
                <div className="relative max-w-6xl mx-auto py-12 w-full">
                    {/* Centered Desktop Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent hidden md:block" />

                    <div className="space-y-24 md:space-y-48">
                        {[
                            {
                                title: "Institutional Deposit",
                                desc: "Lock your digital assets or RWA-tokenized certificates into Orbit's secure, audited vaults built on Mantle.",
                                icon: Lock,
                                color: "bg-gold"
                            },
                            {
                                title: "Smart Yield Aggregation",
                                desc: "Collateral is deployed to top-tier institutional yield strategies, harvesting maximum returns in real-time.",
                                icon: Cpu,
                                color: "bg-zinc-700"
                            },
                            {
                                title: "Autonomous Repayment",
                                desc: "No monthly payments. Harvested yield is automatically routed to pay down your debt until your loan is fully settled.",
                                icon: Zap,
                                color: "bg-gold"
                            }
                        ].map((step, i) => (
                            <div key={i} className={`relative flex flex-col md:flex-row items-center justify-center gap-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                {/* Connecting Flow Animation (Desktop) */}
                                {i < 2 && (
                                    <div className="absolute left-1/2 top-full -translate-x-1/2 h-24 md:h-48 w-px bg-white/5 hidden md:block">
                                        <motion.div 
                                            className="w-full bg-gold shadow-[0_0_20px_rgba(212,175,55,0.8)]"
                                            initial={{ height: 0, top: 0 }}
                                            animate={{ height: ["0%", "100%", "0%"], top: ["0%", "0%", "100%"] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        />
                                    </div>
                                )}

                                {/* Content Card */}
                                <div className="w-full md:w-[45%]">
                                    <Reveal delay={i * 0.1} y={20}>
                                        <div className={`p-8 md:p-12 rounded-[3.5rem] bg-[#080808]/60 backdrop-blur-3xl border border-white/5 hover:border-gold/30 transition-all duration-700 shadow-2xl group ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                            <div className="text-gold/20 text-5xl md:text-7xl font-black mb-8 group-hover:text-gold/40 transition-all duration-500 font-mono tracking-tighter">{`0${i + 1}`}</div>
                                            <h3 className="text-2xl md:text-4xl font-black uppercase text-white mb-6 tracking-tighter">{step.title}</h3>
                                            <p className="text-white/40 leading-relaxed font-light text-base md:text-lg">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </Reveal>
                                </div>

                                {/* Center Orb */}
                                <div className="flex md:absolute left-1/2 md:-translate-x-1/2 justify-center items-center z-20">
                                    <div className={`w-5 h-5 rounded-full ${step.color} shadow-[0_0_30px_rgba(212,175,55,1)] border-[6px] border-[#020202] scale-110`} />
                                </div>

                                {/* Placeholder for visual balance */}
                                <div className="hidden md:block w-[45%]" />
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            <Spacer />

            {/* ================= METRICS / SCALE ================= */}
            <Section
                label="THE SCALE"
                title="Global Footprint"
                subtitle="Institutional trust and verifiable market efficiency."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto">
                    {[
                        { label: "Total Value Locked", val: "$4.8B+", sub: "Across all pools" },
                        { label: "Yield Generated", val: "$124M", sub: "Paid to users" },
                        { label: "Institutional Partners", val: "40+", sub: "Verified entities" },
                        { label: "Network Security", val: "99.9%", sub: "Uptime and safety" },
                    ].map((m, i) => (
                        <Reveal key={i} delay={i * 0.1}>
                            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col items-center text-center group hover:bg-gold/5 transition-all duration-500">
                                <span className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase mb-4">{m.label}</span>
                                <span className="text-4xl md:text-5xl font-black text-white group-hover:text-gold transition-colors">{m.val}</span>
                                <span className="mt-4 text-[10px] text-white/20 font-bold uppercase tracking-widest">{m.sub}</span>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </Section>

            <Spacer />

            {/* ================= ECOSYSTEM ================= */}
            <Section
                id="ecosystem"
                label="PARTNERSHIPS"
                title="Built on Giants"
                subtitle="Leveraging top-tier infrastructure for high-fidelity credit."
            >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                    {[
                        { name: "Mantle", icon: Globe, val: "Network L2" },
                        { name: "Chainlink", icon: Cpu, val: "Oracle Infra" },
                        { name: "OpenZeppelin", icon: Lock, val: "Audit Standard" },
                        { name: "MakerDAO", icon: Layers, val: "Liquidity" },
                        { name: "Aave", icon: Activity, val: "Yield Engine" },
                    ].map((p, i) => (
                        <Reveal key={i} delay={i * 0.05}>
                            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:bg-white/10 transition-all duration-500">
                                <p.icon className="text-white" size={32} strokeWidth={1} />
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-black uppercase text-white tracking-widest">{p.name}</span>
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">{p.val}</span>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </Section>

            <Spacer size="lg" />

            {/* ================= FINAL CTA - STRICT CENTERING ================= */}
            <section className="relative w-full py-24 flex flex-col items-center justify-center">
                <div className="container mx-auto px-6 flex flex-col items-center">
                    <Reveal>
                        <div className="relative w-full max-w-5xl px-8 py-20 md:py-32 rounded-[3.5rem] bg-gradient-to-br from-gold/15 to-zinc-950 border border-gold/20 flex flex-col items-center text-center overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                            {/* Decorative Background Glows */}
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
                            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full" />
                            
                            <h2 className="relative z-10 text-5xl md:text-8xl font-black uppercase tracking-tighter mb-12 text-white">
                                Start Your Flight
                            </h2>
                            
                            <div className="relative z-10 flex flex-col items-center gap-8">
                                <button 
                                    onClick={handleConnect}
                                    className="group relative z-10 inline-flex h-14 md:h-16 cursor-pointer items-center justify-center rounded-[2rem] border-0 px-12 md:px-20 py-4 font-outfit text-xs md:text-sm font-black tracking-[0.4em] uppercase text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] blur-0 opacity-100 before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)] before:transition-opacity hover:before:animate-[buttonMovingGradientBg_3s_linear_infinite] hover:before:opacity-80 shadow-[0_0_60px_rgba(212,175,55,0.25)] hover:scale-110 transition-all"
                                >
                                    <span className="relative z-10 flex items-center gap-4 translate-x-1">
                                        Deploy Capital 
                                    </span>
                                </button>
                                <p className="text-white/30 font-mono text-[10px] tracking-[0.5em] uppercase">
                                    Mantle Network • Self-Repaying • Institutional Grade
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            <Spacer size="lg" />
            <Footer />
        </div>
    );
}
