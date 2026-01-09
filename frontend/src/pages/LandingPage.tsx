import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { LandingNavbar } from "../components/layout/LandingNavbar";
import { Footer } from "../components/ui/Footer";
import { Scene } from "../components/3d/Scene";
import { 
    ArrowRight, Terminal, Activity, ShieldCheck, Zap, 
    Music, Palette, Film, BookOpen, Gamepad2, Lightbulb,
    ChevronRight, ChevronLeft
} from 'lucide-react';

/* ---------------- FLOW ANIMATION ---------------- */
const FlowAnimation = () => {
    const animSteps = ["COLLATERAL", "ORBIT YIELD", "ROYALTIES", "AUTO-REPAY"];
    const [active, setActive] = useState(0);

    useEffect(() => {
        const id = setInterval(
            () => setActive((prev) => (prev + 1) % animSteps.length),
            1300
        );
        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex items-center gap-2">
            {animSteps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                    <span
                        className={`text-[10px] lg:text-xs font-mono tracking-[0.22em] transition-all duration-500 
              ${i === active ? "text-gold" : "text-white/30"}`}
                    >
                        {s}
                    </span>
                    {i < animSteps.length - 1 && (
                        <div
                            className={`h-px w-4 lg:w-7 transition-all 
                ${i === active ? "bg-gold" : "bg-white/15"}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

/* ---------------- TYPING WORDS ---------------- */
const words = ["CREATIVITY", "TALENT", "VISION", "IMAGINATION", "ARTISTRY"];

const TypingWords = () => {
    const [text, setText] = useState("");
    const [index, setIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);

    useEffect(() => {
        const current = words[index];

        if (charIndex < current.length) {
            const t = setTimeout(() => {
                setText((prev) => prev + current[charIndex]);
                setCharIndex((prev) => prev + 1);
            }, 110);
            return () => clearTimeout(t);
        }

        const pause = setTimeout(() => {
            setText("");
            setCharIndex(0);
            setIndex((prev) => (prev + 1) % words.length);
        }, 1500);

        return () => clearTimeout(pause);
    }, [charIndex, index]);

    return (
        <span className="text-gold inline-block min-w-[220px]">
            {text}
        </span>
    );
};

/* ---------------- METRICS ---------------- */
const AnimatedMetrics = () => {
    const [tvl, setTvl] = useState(2138218);
    const [debt, setDebt] = useState(1200);
    const [assets, setAssets] = useState(3);

    useEffect(() => {
        const id = setInterval(() => {
            setTvl((v) => v + (Math.random() * 40 - 20));
            setDebt((d) => Math.max(0, d + (Math.random() * 30 - 15)));
            setAssets((a) => (Math.random() > 0.9 ? a + 1 : a));
        }, 1400);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="w-full max-w-sm p-7 rounded-3xl bg-black/40 border border-gold/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(212,175,55,0.1)] relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
            
            <MetricRow label="TVL" value={`$${tvl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} glow />
            <MetricRow
                label="TOTAL_DEBT"
                value={`$${debt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                negative={debt < 300}
            />
            <MetricRow label="ACTIVE_ASSETS" value={assets} />

            <div className="mt-9 pt-5 border-t border-gold/20">
                <div className="font-bold text-gold mb-3 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Terminal size={12} /> LIVE ACTIVITY
                </div>
                <div className="space-y-1.5 text-[11px] lg:text-xs opacity-60 font-mono leading-relaxed">
                    <div>&gt; Protocol responding to yield...</div>
                    <div>&gt; Repayment stream activated...</div>
                    <div>&gt; Credit channels stable...</div>
                </div>
            </div>
            
            {/* Decorative Element */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gold/5 blur-3xl rounded-full group-hover:bg-gold/10 transition-all duration-700" />
        </div>
    );
};

const MetricRow = ({ label, value, glow = false, negative = false }: any) => (
    <div className="flex justify-between items-center py-4 border-b border-white/5">
        <span className="text-zinc-500 tracking-widest text-[10px] uppercase font-bold">{label}</span>
        <span
            className={`
        font-mono text-lg transition-all duration-700 font-bold
        ${negative ? "text-red-400" : "text-white"}
        ${glow ? "drop-shadow-[0_0_12px_rgba(212,175,55,0.5)] text-gold" : ""}
      `}
        >
            {value}
        </span>
    </div>
);

/* ---------------- HOW IT WORKS TITLE ---------------- */
const HowTitle: React.FC = () => {
    const full = "HOW IT WORKS";
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState("");

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const obs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) setVisible(true);
        });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;
        let i = 0;
        setText("");
        const id = setInterval(() => {
            i += 1;
            setText(full.slice(0, i));
            if (i === full.length) clearInterval(id);
        }, 70);
        return () => clearInterval(id);
    }, [visible]);

    return (
        <div ref={ref} className="mb-16 flex items-center justify-center min-h-[60px]">
            <h2 className="text-4xl md:text-6xl font-black font-outfit tracking-tighter text-white uppercase">
                {text}
                {text.length < full.length && <span className="text-gold animate-pulse">|</span>}
            </h2>
        </div>
    );
};

/* ---------------- HOW IT WORKS LEFT STEPS ---------------- */
const steps = [
    { label: "DEPOSIT COLLATERAL" },
    { label: "ORBIT YIELD" },
    { label: "AUTONOMOUS REPAYMENT" },
];

const HowStepsLeftGrid: React.FC = () => {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setActive((prev) => (prev + 1) % steps.length);
        }, 1200);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[320px]">
            <div className="space-y-4 w-full max-w-xs">
                {steps.map((step, i) => {
                    const isActive = i === active;
                    return (
                        <div
                            key={step.label}
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl border 
                transition-all duration-300
                ${isActive
                                    ? "border-gold bg-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
                                    : "border-zinc-800/50 bg-zinc-900/20"
                                }`}
                        >
                            <div
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold
                  ${isActive
                                        ? "border-gold bg-gold text-black"
                                        : "border-zinc-700 text-zinc-700"
                                    }`}
                            >
                                {isActive ? "✓" : ""}
                            </div>
                            <span
                                className={`text-[11px] font-bold tracking-[0.2em] uppercase ${isActive ? "text-gold" : "text-zinc-500"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ---------------- HOW IT WORKS CAROUSEL ---------------- */
const cardDetails = [
    {
        title: "Deposit Collateral",
        description:
            "Supply stablecoins or real-world assets into Orbit. This creates a collateralized position with institutional-grade security.",
        bullets: ["Connect wallet", "Choose asset", "Confirm transaction"],
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2832&ixlib=rb-4.0.3",
    },
    {
        title: "Orbit Yield Generation",
        description:
            "Your assets are deployed into high-yield institutional strategies. Future earnings are automatically calculated.",
        bullets: ["Strategy deployment", "Yield tracking", "Risk management"],
        image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=2832&ixlib=rb-4.0.3",
    },
    {
        title: "Autonomous Repayment",
        description:
            "Yields stream in automatically and reduce your outstanding debt without any manual intervention.",
        bullets: ["Yield flows", "Debt reduces", "Full asset return"],
        image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=2832&ixlib=rb-4.0.3",
    },
];

const HowItWorksCarousel: React.FC = () => {
    const [index, setIndex] = useState(0);
    const step = cardDetails[index];

    const cardRef = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver((entry) => {
            setVisible(entry[0].isIntersecting);
        });
        if (cardRef.current) obs.observe(cardRef.current);
        return () => obs.disconnect();
    }, []);

    return (
        <div className="flex justify-end w-full">
            <div
                ref={cardRef}
                className={`w-full max-w-3xl border border-gold/20 bg-zinc-900/20 backdrop-blur-2xl rounded-3xl 
          p-6 md:p-8 shadow-[0_0_50px_rgba(212,175,55,0.05)]
          transition-all duration-700
          ${visible
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-8 scale-95"
                    }`}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black h-48 md:h-64">
                        <img src={step.image} className="w-full h-full object-cover opacity-60" alt={step.title} />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-gold/20" />
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-bold tracking-[0.3em] text-gold/60 uppercase">
                            STEP 0{index + 1}
                        </p>
                        <h3 className="text-2xl font-bold text-white font-outfit uppercase tracking-tight">{step.title}</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>

                        <ul className="space-y-2 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                            {step.bullets.map((b) => (
                                <li key={b} className="flex gap-2 items-center">
                                    <span className="text-gold">▹</span> {b}
                                </li>
                            ))}
                        </ul>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() =>
                                    setIndex((prev) => (prev - 1 + cardDetails.length) % cardDetails.length)
                                }
                                className="p-3 rounded-xl border border-zinc-800 text-white hover:bg-zinc-800 transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setIndex((prev) => (prev + 1) % cardDetails.length)}
                                className="flex-1 py-3 rounded-xl border border-gold/40 bg-gold/10 text-[11px] font-bold tracking-[0.2em] text-gold hover:bg-gold/20 transition-all uppercase"
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------------- WHY ORBIT ---------------- */
const WhyOrbit = () => {
    const [hover, setHover] = useState(false);

    const left = [
        { title: "Self-repaying credit", desc: "Yields reduce debt in real time automatically." },
        { title: "Assets as collateral", desc: "Borrow without selling your long-term positions." },
    ];

    const right = [
        { title: "Institutional Grade", desc: "Audited, secure, and fully compliant infrastructure." },
        { title: "Automated Efficiency", desc: "Repayments happen in the background via smart contracts." },
    ];

    return (
        <section className="w-full py-32 relative z-10">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <p className="text-xs font-bold tracking-[0.4em] text-gold uppercase mb-4">
                        WHY ORBIT FINANCE
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black font-outfit tracking-tighter text-white uppercase">
                        THE FLAGSHIP PRIMITIVE FOR <br />
                        <span className="text-gold">CAPITAL EFFICIENCY</span>
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
                    {/* LEFT FEATURES */}
                    <div className="flex flex-col space-y-12 lg:w-1/4 items-center lg:items-end text-center lg:text-right">
                        {left.map((f, i) => (
                            <div
                                key={i}
                                className={`transition-all duration-700 ${hover ? "opacity-100 translate-y-0" : "opacity-40 -translate-y-3"}`}
                            >
                                <p className="text-xl font-bold text-white mb-2 font-outfit uppercase tracking-tight">{f.title}</p>
                                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* CENTRAL IMAGE */}
                    <div
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        className={`
              relative rounded-[2rem] overflow-hidden cursor-pointer
              border border-gold/20 bg-zinc-900/20 backdrop-blur-xl
              shadow-[0_0_80px_rgba(212,175,55,0.1)]
              transition-all duration-700 ease-out
              ${hover ? "scale-105 shadow-[0_0_100px_rgba(212,175,55,0.2)]" : "scale-100"}
              max-w-2xl aspect-[16/9] w-full
            `}
                    >
                        <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2832" className="w-full h-full object-cover opacity-40" alt="Orbit Core" />
                        <div className={`absolute inset-0 bg-gold/10 transition-opacity duration-500 ${hover ? "opacity-40" : "opacity-0"}`} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`p-6 rounded-full bg-gold/20 border border-gold/40 backdrop-blur-md transition-all duration-500 ${hover ? "scale-110 rotate-90" : "scale-100"}`}>
                                <Zap className="text-gold" size={48} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FEATURES */}
                    <div className="flex flex-col space-y-12 lg:w-1/4 items-center lg:items-start text-center lg:text-left">
                        {right.map((f, i) => (
                            <div
                                key={i}
                                className={`transition-all duration-700 ${hover ? "opacity-100 translate-y-0" : "opacity-40 -translate-y-3"}`}
                            >
                                <p className="text-xl font-bold text-white mb-2 font-outfit uppercase tracking-tight">{f.title}</p>
                                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ---------------- BUILT FOR ---------------- */
const creatorRoles = [
    {
        title: "INSTITUTIONS",
        desc: "Access capital efficiency for large-scale RWA portfolios.",
        icon: ShieldCheck,
    },
    {
        title: "CREATIVES",
        desc: "Borrow against IP royalties without selling your vision.",
        icon: Palette,
    },
    {
        title: "TRADERS",
        desc: "Leverage your positions with zero liquidation risk.",
        icon: Activity,
    },
    {
        title: "DEVELOPERS",
        desc: "Build capital-efficient protocols on our modular SDK.",
        icon: Terminal,
    },
    {
        title: "INVESTORS",
        desc: "Earn institutional-grade yield on real-world assets.",
        icon: Lightbulb,
    },
    {
        title: "GAMERS",
        desc: "Monetize in-game assets and IP via self-repaying credit.",
        icon: Gamepad2,
    },
];

const BuiltFor = () => {
    return (
        <section className="w-full py-32 relative z-10">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <p className="text-xs font-bold tracking-[0.4em] text-gold uppercase mb-4">
                        WHO ORBIT EMPOWERS
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black font-outfit tracking-tighter text-white uppercase">
                        THE NEW FOUNDATION FOR <br />
                        <span className="text-gold">DECENTRALIZED CREDIT</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:flex w-full gap-6">
                    {creatorRoles.map((r, idx) => (
                        <div
                            key={idx}
                            className="
                lg:flex-1 h-[320px]
                group relative p-8 rounded-3xl
                bg-zinc-900/20 border border-zinc-800/50 backdrop-blur-xl
                flex flex-col justify-between overflow-hidden
                transition-all duration-500 ease-out
                lg:hover:flex-[1.8] hover:bg-zinc-900/40
                hover:border-gold/30 hover:shadow-[0_0_50px_rgba(212,175,55,0.1)]
              "
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/5 group-hover:text-gold/10 transition-all duration-500">
                                <r.icon size={120} strokeWidth={1} />
                            </div>

                            <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-gold transition-colors duration-300 relative z-10 font-outfit uppercase">
                                {r.title}
                            </h3>

                            <div className="relative z-10">
                                <div className="text-[10px] font-bold text-zinc-600 tracking-[0.2em] uppercase mb-4 group-hover:opacity-0 transition-opacity">
                                    Expand →
                                </div>
                                <p className="text-sm text-zinc-400 leading-relaxed opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                    {r.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ---------------- MAIN LANDING PAGE ---------------- */
export default function LandingPage() {
    const navigate = useNavigate();
    const { isConnected } = useAccount();

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-gold/30 selection:text-gold overflow-x-hidden font-outfit">
            <LandingNavbar />
            
            <main className="relative">
                {/* Hero Section */}
                <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                    {/* 3D Background */}
                    <div className="absolute inset-0 z-0">
                        <Canvas dpr={[1, 2]} gl={{ antialias: false }}>
                            <Suspense fallback={null}>
                                <Scene />
                                <EffectComposer>
                                    <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
                                    <Noise opacity={0.05} />
                                </EffectComposer>
                            </Suspense>
                        </Canvas>
                    </div>

                    {/* Grid Overlay */}
                    <div className="absolute inset-0 z-[1] pointer-events-none opacity-20" 
                         style={{ backgroundImage: 'linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                    <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#050505]" />

                    {/* Content */}
                    <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="lg:col-span-8"
                        >
                            <div className="mb-8">
                                <div className="text-[10px] font-bold text-zinc-500 tracking-[0.3em] uppercase mb-4 animate-pulse">
                                    SYS.STATUS: ONLINE
                                </div>
                                <FlowAnimation />
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10 uppercase">
                                BORROW AGAINST <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-white">
                                    YOUR <TypingWords />
                                </span>
                            </h1>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-xl mb-10">
                                <p className="text-lg md:text-xl font-mono text-white/90 leading-relaxed">
                                    {'>'} A self-repaying lending protocol powered by institutional-grade RWA infrastructure.
                                </p>
                            </div>

                            <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-10">
                                Your yields automatically repay your debt over time.
                            </p>

                            <div className="flex flex-wrap gap-6">
                                <button 
                                    onClick={() => navigate(isConnected ? "/app/crypto" : "/")}
                                    className="group relative px-10 py-5 bg-gold text-black font-bold uppercase tracking-widest text-xs rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(212,175,55,0.3)]"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isConnected ? "Launch Protocol" : "Connect Wallet"} <ArrowRight size={16} />
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                </button>
                                <button className="px-10 py-5 bg-zinc-900/50 border border-zinc-800 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2">
                                    Read Documentation
                                </button>
                            </div>
                        </motion.div>

                        {/* Metrics Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="lg:col-span-4 hidden lg:flex justify-center"
                        >
                            <AnimatedMetrics />
                        </motion.div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="relative z-10 py-32 bg-[#050505]">
                    <div className="container mx-auto px-6">
                        <HowTitle />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                            <HowStepsLeftGrid />
                            <div className="lg:col-span-2">
                                <HowItWorksCarousel />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Orbit Section */}
                <WhyOrbit />

                {/* Built For Section */}
                <BuiltFor />
            </main>

            <Footer />
        </div>
    );
}

