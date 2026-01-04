import { Twitter, Github } from 'lucide-react';

export function Footer() {
    return (
        <footer className="relative bg-gradient-to-b from-[#0A0A0A] to-[#141825] border-t border-zinc-800/50">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div>
                        <h3 className="text-sm font-light tracking-[0.2em] text-white mb-4">ORBIT FINANCE</h3>
                        <p className="text-sm text-zinc-400 font-light leading-relaxed">
                            Self-repaying loans without liquidations
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-light tracking-[0.2em] text-zinc-400 mb-4 uppercase">Protocol</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-zinc-300 hover:text-gold transition-colors font-light">Vaults</a></li>
                            <li><a href="#" className="text-sm text-zinc-300 hover:text-gold transition-colors font-light">Docs</a></li>
                            <li><a href="#" className="text-sm text-zinc-300 hover:text-gold transition-colors font-light">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-light tracking-[0.2em] text-zinc-400 mb-4 uppercase">Resources</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-zinc-300 hover:text-gold transition-colors font-light">GitHub</a></li>
                            <li><a href="#" className="text-sm text-zinc-300 hover:text-gold transition-colors font-light">Audit</a></li>
                            <li><a href="#" className="text-sm text-zinc-300 hover:text-gold transition-colors font-light">Whitepaper</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-light tracking-[0.2em] text-zinc-400 mb-4 uppercase">Social</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-gold hover:bg-zinc-700 transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-gold hover:bg-zinc-700 transition-all">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-800/50">
                    <p className="text-xs text-zinc-500 font-light text-center">
                        © 2026 Orbit Finance. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
