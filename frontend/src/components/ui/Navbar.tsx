import { Link } from 'react-router-dom';

export function Navbar() {
    return (
        <nav className="absolute top-4 left-4 right-4 z-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-6 h-6 border border-gold rotate-45" />
                        <span className="text-xs font-light tracking-[0.2em] text-gold">
                            ORBIT FINANCE
                        </span>
                    </Link>

                    <div className="flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-xs font-light tracking-[0.2em] text-white/60 hover:text-white transition-colors"
                        >
                            HOME
                        </Link>
                        <Link
                            to="/vaults"
                            className="text-xs font-light tracking-[0.2em] text-white/60 hover:text-white transition-colors"
                        >
                            VAULTS
                        </Link>
                        <a
                            href="#"
                            className="text-xs font-light tracking-[0.2em] text-white/60 hover:text-white transition-colors"
                        >
                            DOCS
                        </a>
                    </div>
                </div>

                <button className="px-6 py-2 bg-gold text-dark text-xs font-light tracking-[0.2em] hover:bg-gold/90 transition-colors">
                    CONNECT WALLET
                </button>
            </div>
        </nav>
    );
}
