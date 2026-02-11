import { Twitter, Github, Mail, MessageSquare, Orbit } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#050505] py-32 md:py-48 px-10 border-t border-white/5 relative overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            
            <div className="max-w-[1440px] mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 md:gap-24 mb-32">
                    {/* Brand Column (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-10">
                        <div className="flex items-center gap-4">
                            <div className="text-gold">
                                <Orbit size={32} strokeWidth={1} />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black tracking-[0.2em] text-white font-outfit uppercase">ORBIT</span>
                                <span className="text-[10px] font-bold tracking-[0.5em] text-gold mt-1">FINANCE</span>
                            </div>
                        </div>
                        <p className="text-white/40 text-lg font-light leading-relaxed max-w-md">
                            The first self-repaying decentralized credit bridge. 
                            Institutional yield meeting decentralized liquidity. 
                            Built for the next generation of financial autonomy.
                        </p>
                        <div className="flex gap-6">
                            {[Twitter, Github, MessageSquare, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 rounded-none border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/30 hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-all duration-500">
                                    <Icon size={20} strokeWidth={1.5} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Grid (Span 7) */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                        {/* Solutions */}
                        <div>
                            <h4 className="text-white font-black tracking-[0.3em] uppercase text-[12px] mb-10 opacity-80">SOLUTIONS</h4>
                            <ul className="space-y-6">
                                {['Crypto Yield', 'RWA Credit', 'Stable Swaps', 'Vault Strategies'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-white/30 hover:text-gold transition-all duration-500 text-[11px] font-bold uppercase tracking-[0.2em]">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="text-white font-black tracking-[0.3em] uppercase text-[12px] mb-10 opacity-80">RESOURCES</h4>
                            <ul className="space-y-6">
                                {['Documentation', 'Developer Hub', 'Security Audits', 'Github'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-white/30 hover:text-gold transition-all duration-500 text-[11px] font-bold uppercase tracking-[0.2em]">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div className="hidden sm:block">
                            <h4 className="text-white font-black tracking-[0.3em] uppercase text-[12px] mb-10 opacity-80">COMPANY</h4>
                            <ul className="space-y-6">
                                {['About Us', 'Careers', 'Press Kit', 'Contact'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-white/30 hover:text-gold transition-all duration-500 text-[11px] font-bold uppercase tracking-[0.2em]">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
                    <p className="text-white/20 text-[10px] font-bold tracking-[0.4em] uppercase order-2 md:order-1">
                        © 2026 Orbit Finance Protocol. Institutional Grade Liquidity.
                    </p>
                    <div className="flex gap-12 order-1 md:order-2">
                        <a href="#" className="text-white/20 hover:text-gold text-[10px] font-bold tracking-[0.3em] uppercase transition-colors">Privacy Policy</a>
                        <a href="#" className="text-white/20 hover:text-gold text-[10px] font-bold tracking-[0.3em] uppercase transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
