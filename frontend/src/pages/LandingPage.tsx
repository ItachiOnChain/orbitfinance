import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { useAppStore } from '../store/appStore';
import { LandingNavbar } from "../components/layout/LandingNavbar";
import { Footer } from "../components/ui/Footer";
import {
    Activity, Globe, Zap,
    ShieldCheck, Plus, Terminal, Orbit
} from 'lucide-react';
import { BackgroundOrbit } from '../components/ui/BackgroundOrbit';

/* ================= UTIL ================= */


const Reveal = ({ children, delay = 0, y = 40 }: any) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: y }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
            {children}
        </motion.div>
    );
};

/* ================= COMPONENTS ================= */



const FeatureCard = ({ icon: Icon, title, desc, delay }: any) => (
    <Reveal delay={delay}>
        <div className="flex flex-col items-center text-center p-12 rounded-[3.5rem] bg-[#080808] border border-white/5 hover:border-gold/40 transition-all duration-1000 h-full shadow-2xl">
            <div className="w-20 h-20 rounded-[2rem] bg-gold/5 flex items-center justify-center text-gold mb-10 group-hover:scale-110 transition-transform shadow-inner border border-gold/10">
                <Icon size={36} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-black text-white mb-5 uppercase tracking-tighter font-outfit">{title}</h3>
            <p className="text-white/40 text-base leading-relaxed font-light">{desc}</p>
        </div>
    </Reveal>
);


const PersonaCard = ({ icon: Icon, title, delay }: any) => (
    <Reveal delay={delay}>
        <div className="group relative aspect-square flex flex-col items-center justify-center text-center overflow-hidden bg-[#080808] border border-white/5 p-8 transition-all duration-500 hover:border-gold/40 hover:bg-gold/[0.02]">
            <div className="absolute top-0 left-0 w-[1px] h-0 bg-gold/40 group-hover:h-full transition-all duration-700" />
            <div className="absolute top-0 left-0 w-0 h-[1px] bg-gold/40 group-hover:w-full transition-all duration-700 delay-100" />
            
            <div className="mb-6 text-white/20 group-hover:text-gold transition-colors duration-500 scale-125 md:scale-150">
                <Icon size={32} strokeWidth={1} />
            </div>
            
            <h3 className="text-xl md:text-2xl font-black text-white/70 group-hover:text-gold transition-colors font-outfit uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,215,0,0)] group-hover:drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                {title}
            </h3>
        </div>
    </Reveal>
);

const FAQItem = ({ question, answer }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10 w-full group">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-12 flex items-center justify-between text-left"
            >
                <span className="text-2xl md:text-3xl text-white/70 group-hover:text-gold group-hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.6)] transition-all duration-500 font-bold font-outfit uppercase tracking-tighter">{question}</span>
                <Plus size={28} className={`text-gold/40 transition-transform duration-700 ${isOpen ? 'rotate-45 text-gold' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-12 text-white/50 text-xl md:text-2xl leading-relaxed font-light max-w-4xl">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ================= MAIN ================= */
export default function LandingPage() {
    const navigate = useNavigate();
    const { isConnected } = useAccount();
    const { connectAsync, connectors } = useConnect();
    const { setMode } = useAppStore();
    const [dashMode, setDashMode] = useState<'crypto' | 'rwa'>('crypto');

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
        <div className="min-h-screen bg-[#020202] text-white selection:bg-gold selection:text-black font-inter flex flex-col items-center">
            <LandingNavbar />

            {/* ================= HERO ================= */}
            <section className="relative min-h-screen w-full flex flex-col items-center justify-center pt-32 pb-24 overflow-hidden bg-black">
                {/* 3D Background */}
                <BackgroundOrbit />

                {/* Technical Grid Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-20" 
                     style={{ 
                         backgroundImage: `linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)`,
                         backgroundSize: '40px 40px',
                         maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 10%, transparent 100%)'
                     }} 
                />
                
                {/* Background Glows (Layered on top of 3D and Grid for extra depth) */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] bg-gold/[0.03] blur-[150px] rounded-full pointer-events-none" />
                
                <div className="container mx-auto px-6 relative z-20 flex flex-col items-center text-center max-w-7xl">
                    <Reveal delay={0.1}>
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-none bg-black border border-gold/50 mb-16 shadow-[0_0_30px_rgba(255,215,0,0.2)] backdrop-blur-md">
                            <span className="w-2 h-2 bg-gold shadow-[0_0_15px_#FFD700]" />
                            <span className="text-[11px] font-black tracking-normal text-white uppercase">Institutional Grade Infrastructure</span>
                        </div>
                    </Reveal>

                    <Reveal delay={0.3}>
                        <h1 className="text-6xl md:text-8xl xl:text-9xl font-black tracking-tighter uppercase leading-[0.85] mb-12 max-w-6xl mx-auto font-outfit">
                            <span className="block mb-2 text-white/90">Crypto Finance</span>
                            <span className="block mb-4 text-white/30 font-light">meets</span>
                            <span className="relative inline-block text-polished-gold animate-orbit">
                                Modular RWA
                            </span>
                        </h1>
                    </Reveal>

                    <Reveal delay={0.5}>
                        <p className="text-visible-subtext text-xl md:text-2xl max-w-4xl font-light leading-relaxed mb-20 mx-auto">
                            Convert your Real World Assets into yield-generating collateral. 
                            Orbit Finance bridges institutional stability with decentralized modular liquidity.
                        </p>
                    </Reveal>

                    <Reveal delay={0.7}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full max-w-4xl mx-auto">
                          
                        </div>
                    </Reveal>
                </div>

                {/* Hero Gradient Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#020202] via-[#020202]/95 to-transparent z-10" />
            </section>

            {/* ================= HOW IT WORKS (PROCESS) ================= */}
            <section id="how-it-works" className="relative w-full py-48 md:py-64 flex flex-col items-center bg-[#020202] overflow-hidden">
                <div className="container mx-auto px-6 relative flex flex-col items-center max-w-7xl">
                    <Reveal>
                        <div className="flex flex-col items-center text-center relative mb-48">
                            <h2 className="text-[12vw] md:text-[10rem] font-black uppercase tracking-tighter text-gold/[0.1] select-none leading-none drop-shadow-[0_0_50px_rgba(255,215,0,0.15)]">
                                PROCESS
                            </h2>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-7xl mx-auto px-6">
                        {[
                            {
                                num: "01",
                                title: "Authorize",
                                desc: "Connect your secure vault entry point to the Orbit unified control layer with institutional multi-sig security protocols."
                            },
                            {
                                num: "02",
                                title: "Collateralize",
                                desc: "Deploy your asset tranches into audited vaults under automated real-time risk management and institutional oversight."
                            },
                            {
                                num: "03",
                                title: "Optimize",
                                desc: "Harvest yields automatically to offset credit costs while maintaining strategic market exposure and constant liquidity."
                            }
                        ].map((step, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="group relative bg-[#080808] border border-white/[0.05] py-16 px-12 md:py-20 md:px-14 rounded-2xl h-full min-h-[400px] flex flex-col justify-center transition-all duration-700 hover:border-gold/30 hover:bg-gold/[0.02] shadow-[0_0_50px_rgba(0,0,0,0.8)] hover:shadow-[0_0_80px_rgba(255,215,0,0.1)] overflow-hidden">
                                    {/* Premium Interior Glow */}
                                    <div className="absolute inset-0 bg-linear-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    
                                    <div className="text-9xl font-black text-white/[0.02] absolute top-8 right-10 group-hover:text-gold/[0.06] transition-all duration-700 select-none transform group-hover:scale-110">{step.num}</div>
                                    
                                    <div className="w-16 h-1 bg-gold mb-12 opacity-40 group-hover:opacity-100 group-hover:w-32 transition-all duration-700 shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                                    
                                    <h4 className="text-3xl md:text-4xl font-black text-white mb-8 uppercase tracking-tighter group-hover:text-gold transition-colors duration-500">{step.title}</h4>
                                    
                                    <p className="text-white/90 text-xl md:text-2xl leading-relaxed font-light tracking-wide relative z-10 transition-colors duration-500 group-hover:text-white">
                                        {step.desc}
                                    </p>
                                    
                                    {/* Bottom Border Accent */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/0 to-transparent group-hover:via-gold/40 transition-all duration-1000" />
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <br />

            {/* ================= DUAL DASHBOARD ================= */}
            <section id="dashboard" className="relative w-full py-48 md:py-64 flex flex-col items-center bg-[#050505] overflow-hidden border-b border-white/5">
                <div className="container mx-auto px-6 relative flex flex-col items-center max-w-7xl">
                    <Reveal>
                        <div className="flex flex-col items-center text-center relative mb-32">
                            <h2 className="text-[12vw] md:text-[10rem] font-black uppercase tracking-tighter text-gold/[0.1] select-none leading-none drop-shadow-[0_0_50px_rgba(255,215,0,0.15)]">
                                DASHBOARD
                            </h2>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full max-w-7xl mx-auto px-4">
                        {/* Left: Content Card */}
                        <Reveal delay={0.1}>
                            <div className="flex flex-col">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={dashMode}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 30 }}
                                        transition={{ duration: 0.6 }}
                                        className="bg-[#080808] border border-white/[0.05] p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden group min-h-[350px] flex flex-col justify-center"
                                    >
                                        <span className="text-[10px] font-black tracking-[0.5em] text-gold uppercase block mb-4 px-4 py-1 rounded-full bg-gold/5 border border-gold/10 w-fit">
                                            {dashMode === 'crypto' ? 'Liquidity Layer' : 'Certified Stability'}
                                        </span>
                                        <h4 className="text-2xl md:text-3xl font-black text-white mb-6 uppercase tracking-tighter leading-tight font-outfit">
                                            {dashMode === 'crypto' ? 'Crypto Module' : 'RWA Module'}
                                        </h4>
                                        <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed mb-10">
                                            {dashMode === 'crypto' 
                                                ? 'Access self-repaying DeFi infrastructure with automated harvest routing and non-custodial security.' 
                                                : 'Bridge physical value to on-chain liquidity through verified collateral pools and institutional-grade RWA modules.'}
                                        </p>
                                        
                                        <button
                                            onClick={() => setDashMode(dashMode === 'crypto' ? 'rwa' : 'crypto')}
                                            className="group/btn flex items-center gap-6 px-16 py-6 rounded-none bg-gold text-black font-black text-sm tracking-[0.3em] uppercase transition-all duration-500 hover:bg-white hover:scale-105 shadow-2xl self-center mt-auto"
                                        >
                                            <span>Next Module</span>
                                            <Zap size={20} className="transition-transform group-hover/btn:translate-x-2" />
                                        </button>
                                        
                                        {/* Premium Glow Overlay */}
                                        <div className="absolute inset-0 bg-linear-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </Reveal>

                        {/* Right: Scaled Image */}
                        <Reveal delay={0.2}>
                            <div className="relative group">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={dashMode}
                                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-transparent opacity-40 z-10 pointer-events-none" />
                                        <img 
                                            src={dashMode === 'crypto' ? '/crypto-dash.png' : '/rwa-dash.png'} 
                                            alt={`${dashMode} Dashboard`}
                                            className="w-full h-auto transition-transform duration-1000 scale-[1.02] group-hover:scale-[1.05]"
                                        />
                                    </motion.div>
                                </AnimatePresence>
                                
                                {/* Visual Accents */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/10 blur-[80px] rounded-full pointer-events-none" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>
            <br />
            <br />

            {/* ================= ADVANTAGES ================= */}
            <section id="ecosystem" className="relative w-full py-48 md:py-64 flex flex-col items-center bg-[#020202] overflow-hidden">
                <div className="container mx-auto px-6 relative flex flex-col items-center max-w-7xl">
                    <Reveal>
                        <div className="flex flex-col items-center text-center relative mb-40">
                            <h2 className="text-[12vw] md:text-[10rem] font-black uppercase tracking-tighter text-gold/[0.1] select-none leading-none drop-shadow-[0_0_50px_rgba(255,215,0,0.15)]">
                                ADVANTAGES
                            </h2>
                        </div>
                    </Reveal>
                    <br />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-20 w-full max-w-7xl mx-auto pt-10 px-4">
                        <FeatureCard 
                            icon={Activity}
                            title="Adaptive Liquidity"
                            desc="Auto-scaling debt positions based on real-time treasury returns."
                            delay={0.1}
                        />
                        <FeatureCard 
                            icon={ShieldCheck}
                            title="Military Security"
                            desc="Vault architectures audited by world-class security standards."
                            delay={0.2}
                        />
                        <FeatureCard 
                            icon={Globe}
                            title="Borderless Credit"
                            desc="Unified access to liquidity across all major global markets."
                            delay={0.3}
                        />
                        <FeatureCard 
                            icon={Zap}
                            title="Instant Maturity"
                            desc="No waiting periods. Collateralize and borrow in a single step."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>
            <br />

            {/* ================= FAQ ================= */}
            <section id="faq" className="relative w-full py-48 md:py-64 flex flex-col items-center bg-[#050505] overflow-hidden">
                <div className="container mx-auto px-6 relative flex flex-col items-center max-w-7xl">
                    <Reveal>
                        <div className="flex flex-col items-center text-center relative mb-40">
                            <h2 className="text-[12vw] md:text-[10rem] font-black uppercase tracking-tighter text-gold/[0.1] select-none leading-none drop-shadow-[0_0_50px_rgba(255,215,0,0.15)]">
                                FAQ
                            </h2>
                            <br />
                        </div>
                    </Reveal>

                    <div className="max-w-5xl w-full mx-auto px-4">
                        <FAQItem 
                            question="How exactly does the self-repaying mechanism work?"
                            answer="Deposited collateral is deployed to high-yield strategies. 100% of the yield is automatically routed to recursively settle your debt."
                        />
                        <br /><br />
                        <FAQItem 
                            question="What assets are currently supported for RWA?"
                            answer="We support tokenized US Treasuries, Private Credit, and Corporate Bonds via verified institutional partners."
                        />
                        <br /><br />
                        <FAQItem 
                            question="Is my collateral at risk during market volatility?"
                            answer="No. Our self-repaying vaults use yield for settlement, eliminating price-based liquidation risks found in traditional DeFi."
                        />
                        <br /><br />
                        <FAQItem 
                            question="Can I withdraw my collateral at any time?"
                            answer="Yes. Our vaults are non-custodial. You can withdraw 24/7 as long as the debt position is settled."
                        />
                    </div>
                </div>
            </section>
            <br />
            <br />

            {/* ================= BUILT FOR ================= */}
            <section id="built-for" className="relative w-full py-48 md:py-64 flex flex-col items-center bg-[#050505] overflow-hidden">
                <div className="container mx-auto px-6 relative flex flex-col items-center max-w-7xl">
                    <Reveal>
                        <div className="flex flex-col items-center text-center relative mb-40">
                            <h2 className="text-[12vw] md:text-[10rem] font-black uppercase tracking-tighter text-gold/[0.05] select-none leading-none drop-shadow-[0_0_50px_rgba(255,215,0,0.15)]">
                                BUILT FOR
                            </h2>
                        </div>
                    </Reveal>
                    <br />

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full max-w-[1440px] mx-auto px-4 mb-24">
                        <PersonaCard icon={Zap} title="Creators" delay={0.1} />
                        <PersonaCard icon={Terminal} title="Builders" delay={0.2} />
                        <PersonaCard icon={Globe} title="RWA Owners" delay={0.3} />
                        <PersonaCard icon={ShieldCheck} title="Institutional VCs" delay={0.4} />
                        <PersonaCard icon={Activity} title="Treasury Managers" delay={0.5} />
                        <PersonaCard icon={Orbit} title="DeFi Protocols" delay={0.6} />
                    </div>

                    <Reveal delay={0.6}>
                        <button
                            onClick={handleConnect}
                            className="px-24 py-8 rounded-none bg-gold text-black font-black text-sm tracking-[0.5em] uppercase transition-all duration-500 hover:bg-white hover:scale-110 shadow-[0_40px_100px_rgba(212,175,55,0.3)]"
                        >
                            Start Mission
                        </button>
                    </Reveal>
                </div>
            </section>
            <br />

            <Footer />
        </div>
    );
}
