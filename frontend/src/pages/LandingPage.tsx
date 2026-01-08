import { LandingNavbar } from "../components/layout/LandingNavbar";
import { Footer } from "../components/ui/Footer";
import { Orbit, Hexagon, Shield, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            <LandingNavbar />
            
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
                {/* Background Accents */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex justify-center mb-12">
                        <div className="relative group">
                            <div className="text-gold animate-[spin_20s_linear_infinite]">
                                <Orbit size={80} strokeWidth={1} />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center text-gold">
                                <Hexagon size={40} fill="currentColor" className="opacity-20" />
                                <div className="absolute w-2 h-2 bg-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,1)]" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 font-outfit uppercase">
                        Orbit <span className="text-gold">Finance</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-zinc-400 font-light mb-16 leading-relaxed max-w-2xl mx-auto">
                        The future of capital efficiency. Self-repaying loans, real-world assets, 
                        and institutional-grade DeFi infrastructure.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col items-center">
                            <Zap className="text-gold mb-4" size={32} />
                            <h3 className="text-white font-bold mb-2">Crypto Module</h3>
                            <p className="text-zinc-500 text-sm">Self-repaying loans with zero liquidation risk.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col items-center">
                            <Globe className="text-gold mb-4" size={32} />
                            <h3 className="text-white font-bold mb-2">RWA Module</h3>
                            <p className="text-zinc-500 text-sm">Institutional real-world assets on-chain.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col items-center">
                            <Shield className="text-gold mb-4" size={32} />
                            <h3 className="text-white font-bold mb-2">Secure</h3>
                            <p className="text-zinc-500 text-sm">Audited and battle-tested infrastructure.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

