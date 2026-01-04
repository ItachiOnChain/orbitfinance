import { Twitter, Github } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-dark-bg py-24 px-6 border-t border-zinc-900/50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                {/* Left: Brand */}
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-black tracking-[0.2em] text-white font-outfit">ORBIT</span>
                        <span className="text-[10px] font-bold tracking-[0.4em] text-gold">FINANCE</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 font-bold tracking-[0.2em] uppercase">
                        Unlocking your future yield, now.
                    </p>
                </div>

                {/* Center: Links */}
                <div className="flex gap-12">
                    <a href="#" className="text-[11px] font-bold tracking-[0.3em] text-zinc-500 hover:text-white transition-colors uppercase">Docs</a>
                    <a href="#" className="text-[11px] font-bold tracking-[0.3em] text-zinc-500 hover:text-white transition-colors uppercase">Audit</a>
                    <a href="#" className="text-[11px] font-bold tracking-[0.3em] text-zinc-500 hover:text-white transition-colors uppercase">FAQ</a>
                    <a href="#" className="text-[11px] font-bold tracking-[0.3em] text-zinc-500 hover:text-white transition-colors uppercase">Terms</a>
                </div>

                {/* Right: Socials */}
                <div className="flex gap-8">
                    <a href="#" className="text-zinc-600 hover:text-white transition-colors">
                        <Twitter size={20} />
                    </a>
                    <a href="#" className="text-zinc-600 hover:text-white transition-colors">
                        <Github size={20} />
                    </a>
                </div>
            </div>
            
            <div className="mt-24 text-center">
                <p className="text-[10px] text-zinc-800 font-bold tracking-[0.3em] uppercase">
                    © 2026 Orbit Finance Protocol
                </p>
            </div>
        </footer>
    );
}
