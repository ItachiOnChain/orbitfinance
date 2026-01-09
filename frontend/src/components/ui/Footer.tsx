import { Twitter, Github, Mail, MessageSquare, Newspaper, Globe, ShieldCheck, Orbit, Hexagon } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#050505] py-24 px-6 border-t border-white/5 relative overflow-hidden">
            {/* Subtle Background Glow - Reduced */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-gold/[0.03] blur-[80px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative group">
                                    <div className="text-gold animate-[spin_10s_linear_infinite]">
                                        <Orbit size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center text-gold">
                                        <Hexagon size={16} fill="currentColor" className="opacity-20" />
                                        <div className="absolute w-1 h-1 bg-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]" />
                                    </div>
                                </div>

                                <div className="flex flex-col leading-none">
                                    <span className="text-lg font-black tracking-[0.15em] text-white font-outfit uppercase">ORBIT</span>
                                    <span className="text-[9px] font-bold tracking-[0.4em] text-gold mt-0.5">FINANCE</span>
                                </div>
                            </div>
                            <p className="text-zinc-600 text-[11px] font-bold tracking-[0.1em] mb-4">
                                © 2020-2026 Orbit Labs
                            </p>
                            <p className="text-zinc-500 text-[11px] font-light leading-relaxed max-w-[240px]">
                                All rights reserved, no guarantees given. 
                                DeFi tools are not toys. Use at your own risk.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Column */}
                    <div>
                        <h4 className="text-white font-bold tracking-[0.3em] uppercase text-[10px] mb-10 font-outfit">Navigation</h4>
                        <ul className="space-y-5">
                            {[
                                { name: 'Introduction', icon: Globe },
                                { name: 'Github', icon: Github },
                                { name: 'Documentation', icon: ShieldCheck },
                                { name: 'Snapshot', icon: Newspaper }
                            ].map((item) => (
                                <li key={item.name}>
                                    <a href="#" className="text-zinc-500 hover:text-white transition-colors text-[13px] font-light flex items-center gap-3 group">
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Column */}
                    <div>
                        <h4 className="text-white font-bold tracking-[0.3em] uppercase text-[10px] mb-10 font-outfit">Social</h4>
                        <ul className="space-y-5">
                            {[
                                { name: 'Medium', icon: Newspaper },
                                { name: 'Discord', icon: MessageSquare },
                                { name: 'Forum', icon: MessageSquare },
                                { name: 'X (Prev. Twitter)', icon: Twitter },
                                { name: 'Newsletter', icon: Mail }
                            ].map((item) => (
                                <li key={item.name}>
                                    <a href="#" className="text-zinc-500 hover:text-white transition-colors text-[13px] font-light flex items-center gap-3 group">
                                        <item.icon size={14} className="text-zinc-600 group-hover:text-gold transition-colors" />
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Proudly Using Column */}
                    <div className="flex flex-col gap-10">
                        <div>
                            <h4 className="text-white font-bold tracking-[0.3em] uppercase text-[10px] mb-8 font-outfit">Proudly Using</h4>
                            <div className="flex flex-col gap-3">
                                {[
                                    { name: 'DefiLlama', color: 'bg-[#1a2b3c]' },
                                    { name: 'LI.FI', color: 'bg-[#2a1b3c]' },
                                    { name: 'snapshot', color: 'bg-[#1b2a3c]' }
                                ].map((partner) => (
                                    <div key={partner.name} className={`flex items-center gap-3 px-4 py-2 rounded-lg border border-zinc-800/50 ${partner.color} bg-opacity-20 hover:bg-opacity-40 transition-all cursor-pointer group`}>
                                        <div className="w-4 h-4 rounded-sm bg-gold/20 border border-gold/40" />
                                        <span className="text-[11px] font-bold tracking-widest text-zinc-400 group-hover:text-white transition-colors uppercase">{partner.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Built on Ethereum Badge */}
                        <div className="mt-auto">
                            <div className="inline-flex items-center gap-3 px-4 py-3 border border-zinc-800 rounded-lg bg-zinc-900/30">
                                <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center">
                                    <div className="w-3 h-5 border border-zinc-600" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-[8px] font-black tracking-[0.2em] text-zinc-600 uppercase">Built on</span>
                                    <span className="text-[10px] font-black tracking-[0.1em] text-white uppercase mt-0.5">Ethereum</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
