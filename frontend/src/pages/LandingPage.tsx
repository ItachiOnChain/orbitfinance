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
    Activity, Terminal, Palette, Users, Code, Zap
} from 'lucide-react';

/* ================= UTIL ================= */
const Spacer = () => <div className="h-32 md:h-44" />;

/* ================= SCROLL REVEAL ================= */
const Reveal = ({ children, delay = 0 }: any) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
        >
            {children}
        </motion.div>
    );
};

/* ================= ADVANCED FLOW ================= */
const AdvancedFlow = () => {
    const steps = ["COLLATERAL", "YIELD", "REPAY", "AUTO-REPAY"];
    const [active, setActive] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setActive(v => (v + 1) % steps.length), 1500);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex items-center gap-3 justify-center lg:justify-start">
            {steps.map((s, i) => (
                <React.Fragment key={s}>
                    <span
                        className={`text-[10px] font-mono tracking-[0.25em] transition-all duration-500
              ${i === active ? "text-gold" : "text-white/30"}`}
                    >
                        {s}
                    </span>
                    {i < steps.length - 1 && (
                        <div className={`h-[1px] w-6 transition-all duration-500 ${i === active ? "bg-gold" : "bg-white/10"}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

/* ================= TYPING WORDS ================= */
const typingWords = ["Crypto Assets", "RWA Assets", "Future Yield"];

const TypingWords = () => {
    const [text, setText] = useState("");
    const [index, setIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = typingWords[index];
        const typingSpeed = isDeleting ? 50 : 100;

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
            const timeout = setTimeout(() => setIsDeleting(true), 1500);
            return () => clearTimeout(timeout);
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setIndex(prev => (prev + 1) % typingWords.length);
        }
    }, [charIndex, isDeleting, index]);

    return (
        <span className="text-gold/80 inline-block min-w-[220px]">
            {text}<span className="animate-pulse">|</span>
        </span>
    );
};

/* ================= HERO MODULE CARDS ================= */
// Unused component - keeping for future use
// const HeroModuleCard = ({ title, desc, icon: Icon, delay }: any) => (
//   <Reveal delay={delay}>
//     <div className="w-full lg:w-72 h-[450px] rounded-[2.5rem] border border-gold/20 bg-black/40 backdrop-blur-xl p-10 flex flex-col justify-between relative overflow-hidden group hover:border-gold/50 transition-all duration-500">
//       <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//       
//       <div>
//         <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
//           <Icon className="text-gold" size={28} />
//         </div>
//         <h3 className="text-2xl font-black tracking-tight uppercase mb-4">{title}</h3>
//         <p className="text-sm text-white/50 leading-relaxed font-medium">
//           {desc}
//         </p>
//       </div>
//
//       <div className="space-y-6">
//         <div className="h-[1px] w-12 bg-gold/30 group-hover:w-full transition-all duration-500" />
//         <div className="space-y-3 text-[10px] font-mono text-gold/60 uppercase tracking-widest">
//           <div className="flex items-center gap-2">
//             <div className="w-1 h-1 rounded-full bg-gold" />
//             Self-Repaying
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-1 h-1 rounded-full bg-gold" />
//             0% Liquidation
//           </div>
//         </div>
//       </div>
//     </div>
//   </Reveal>
// );


/* ================= SECTIONS ================= */
const Section = ({ label, title, subtitle, children }: any) => (
    <section className="relative w-full py-20 md:py-32 text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
            <Reveal>
                <div className="flex flex-col items-center gap-4 mb-16">
                    <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-gold/60">
                        {label}
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
                        {title}
                    </h2>
                    <p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>
            </Reveal>
            {children}
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
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">

            {/* GLOBAL STARS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Canvas>
                    <Suspense fallback={null}>
                        <BackgroundStars />
                    </Suspense>
                </Canvas>
            </div>

            <LandingNavbar />

            {/* ================= HERO ================= */}
            <section id="hero" className="relative min-h-screen flex items-center translate-x-7 translate-y-7">
                <div className="absolute inset-0 z-0">
                    <Canvas dpr={[1, 2]}>
                        <Suspense fallback={null}>
                            <Scene />
                            <EffectComposer>
                                <Bloom intensity={1.2} />
                                <Noise opacity={0.025} />
                                <Vignette darkness={1.1} />
                            </EffectComposer>
                        </Suspense>
                    </Canvas>
                </div>

                {/* softer overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/70 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />

                <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-6 text-center lg:text-left">
                        <Reveal><AdvancedFlow /></Reveal>

                        <Reveal delay={0.1}>
                            <h1 className="mt-6 md:mt-10 text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] uppercase text-gold">
                                Borrow Against<br />
                                Your <TypingWords /><br />
                            </h1>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <div className="mt-6 md:mt-8 space-y-4">
                                <p className="max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-white/80">
                                    A self-repaying lending protocol powered by institutional-grade RWA infrastructure.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">

                                </div>
                            </div>
                        </Reveal>
                        <br />
                        <br />

                        <Reveal delay={0.3}>
                            <div className="mt-6 md:mt-10 flex flex-wrap gap-4 md:gap-6 justify-center lg:justify-start">
                                <button
                                    onClick={handleConnect}
                                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gold text-black font-bold rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                >
                                    {isConnected ? "Launch Protocol" : "Connect Wallet"}
                                    <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={() => document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border border-white/20 rounded-xl text-xs uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
                                >
                                    Docs <ChevronRight size={14} />
                                </button>
                            </div>
                        </Reveal>
                    </div>

                    <div className="hidden lg:flex lg:col-span-6 justify-end gap-6">

                    </div>
                </div>
            </section>

            <Spacer />

            {/* ================= EXPLANATION ================= */}
            <Section
                label="ABOUT"
                title="What is Orbit"
                subtitle="A new primitive for decentralized credit"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto px-4">
                    <Reveal delay={0.1}>
                        <div className="p-6 md:p-10 rounded-3xl border border-gold/20 bg-white/5 backdrop-blur-sm hover:border-gold/50 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <Activity className="text-gold" size={24} />
                            </div>

                            <h3 className="text-2xl font-bold uppercase mb-4 tracking-tight">
                                Crypto Module
                            </h3>

                            <p className="text-white/60 leading-relaxed mb-6">
                                Unlock the value of your liquid DeFi assets. Deposit yield-bearing tokens as collateral and borrow with zero liquidation risk.
                            </p>

                            <ul className="space-y-3 text-sm text-white/40 font-mono">
                                <li className="flex gap-2"><span className="text-gold">▹</span> Self-Repaying Debt</li>
                                <li className="flex gap-2"><span className="text-gold">▹</span> Automated Yield</li>
                                <li className="flex gap-2"><span className="text-gold">▹</span> Multi-Chain</li>
                            </ul>
                        </div>
                    </Reveal>

                    <Reveal delay={0.2}>
                        <div className="p-6 md:p-10 rounded-3xl border border-gold/20 bg-white/5 backdrop-blur-sm hover:border-gold/50 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="text-gold" size={24} />
                            </div>

                            <h3 className="text-2xl font-bold uppercase mb-4 tracking-tight">
                                RWA Module
                            </h3>

                            <p className="text-white/60 leading-relaxed mb-6">
                                Use tokenized real-world assets as collateral for compliant, institutional-grade credit.
                            </p>

                            <ul className="space-y-3 text-sm text-white/40 font-mono">
                                <li className="flex gap-2"><span className="text-gold">▹</span> Institutional Infra</li>
                                <li className="flex gap-2"><span className="text-gold">▹</span> Real-World Yield</li>
                                <li className="flex gap-2"><span className="text-gold">▹</span> On-Chain Compliance</li>
                            </ul>
                        </div>
                    </Reveal>
                </div>
            </Section>


            <Spacer />

            {/* ================= HOW IT WORKS ================= */}
            <Section
                label="HOW IT WORKS"
                title="Self-Repaying Credit"
                subtitle="In Three Steps"
            >
                <div className="relative max-w-4xl mx-auto py-8 md:py-12 px-4">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gold/30 to-transparent -translate-x-1/2 hidden md:block" />

                    <div className="space-y-24 md:space-y-0">
                        {[
                            {
                                title: "Deposit Collateral",
                                desc: "Securely lock your digital assets or RWA tokens into Orbit's institutional-grade vaults.",
                                icon: ShieldCheck
                            },
                            {
                                title: "Generate Yield",
                                desc: "Your collateral is automatically deployed to high-performance yield strategies across DeFi and TradFi.",
                                icon: Activity
                            },
                            {
                                title: "Automatic Repayment",
                                desc: "The generated yield is used to pay down your loan balance in real-time. No manual intervention required.",
                                icon: Terminal
                            }
                        ].map((step, i) => (
                            <div key={i} className={`relative flex items-center justify-between md:mb-24 last:mb-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                {/* Content */}
                                <div className="w-full md:w-[42%]">
                                    <Reveal delay={i * 0.1}>
                                        <div className={`p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-gold/30 transition-colors group ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                            <div className={`text-gold/20 text-5xl font-black mb-4 group-hover:text-gold/40 transition-colors`}>{`0${i + 1}`}</div>
                                            <h3 className="text-xl font-bold uppercase mb-4 tracking-tight">{step.title}</h3>
                                            <p className="text-white/60 leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </Reveal>
                                </div>

                                {/* Center Dot */}
                                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gold border-4 border-[#050505] z-20 hidden md:block" />

                                {/* Spacer for the other side */}
                                <div className="hidden md:block w-[42%]" />
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            <Spacer />

            {/* ================= ECOSYSTEM ================= */}
            <Section
                label="ECOSYSTEM"
                title="Built for everyone"
                subtitle="who values their assets"
            >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 translate-x-10">
                    {[
                        {
                            title: "Institutional",
                            desc: "Treasury management with automated yield harvesting and risk-mitigated borrowing.",
                            icon: ShieldCheck,
                        },
                        {
                            title: "DeFi Natives",
                            desc: "Maximize capital efficiency by borrowing against your yield-bearing assets without liquidation risk.",
                            icon: Activity,
                        },
                        {
                            title: "RWA Investors",
                            desc: "Bridge real-world value to on-chain liquidity. Use your tokenized assets as collateral.",
                            icon: Palette,
                        },
                        {
                            title: "DAOs",
                            desc: "Sustainable debt for protocol growth, repaid automatically by treasury yields.",
                            icon: Users,
                        },
                        {
                            title: "Creatives",
                            desc: "Borrow against IP royalties and future earnings without losing ownership.",
                            icon: Zap,
                        },
                        {
                            title: "Developers",
                            desc: "Build capital-efficient protocols on our modular SDK and liquidity layers.",
                            icon: Code,
                        }
                    ].map((item, i) => (
                        <Reveal key={i} delay={i * 0.05}>
                            <div className="h-[400px] p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between hover:border-gold/50 transition-all group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10">
                                    <item.icon className="text-gold mb-6 group-hover:scale-110 transition-transform translate-x-4 translate-y-3group-hover:translate-y-0" size={28} />
                                    <h4 className="text-lg font-bold uppercase mb-4 tracking-tight leading-tight translate-x-4 translate-y-5 group-hover:translate-y-0">{item.title}</h4>
                                </div>

                                <div className="relative z-10">
                                    <p className="text-[11px] text-white/0 group-hover:text-white/50 leading-relaxed transition-all duration-500 transform translate-y-10 group-hover:-translate-y-4">
                                        {item.desc}
                                    </p>
                                    <div className="mt-6 h-[1px] w-8 bg-gold/30 group-hover:w-full transition-all duration-500" />
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </Section>

            <div id="docs" />
            <br />
            <br />


            <Footer />
        </div>
    );
}
