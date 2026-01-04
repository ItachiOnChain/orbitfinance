import { useAccount, useDisconnect } from 'wagmi';
import { useAppStore } from '../../store/appStore';

export function AppNavbar() {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const { mode, toggleMode } = useAppStore();

    return (
        <nav className="border-b border-zinc-800 bg-[#0A0A0A] sticky top-0 z-50">
            <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
                <div className="text-sm font-light tracking-[0.2em] text-white">
                    ORBIT FINANCE
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleMode}
                        className={`px-4 py-2 text-xs font-light tracking-[0.2em] transition-colors ${mode === 'crypto' ? 'text-gold' : 'text-zinc-500'
                            }`}
                    >
                        CRYPTO
                    </button>

                    <button
                        onClick={toggleMode}
                        className="relative w-14 h-7 rounded-full bg-zinc-800 transition-colors"
                    >
                        <div
                            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-gold transition-transform ${mode === 'rwa' ? 'translate-x-7' : 'translate-x-0'
                                }`}
                        />
                    </button>

                    <button
                        onClick={toggleMode}
                        className={`px-4 py-2 text-xs font-light tracking-[0.2em] transition-colors ${mode === 'rwa' ? 'text-gold' : 'text-zinc-500'
                            }`}
                    >
                        RWA
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs font-light text-zinc-400">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                    <button
                        onClick={() => disconnect()}
                        className="px-4 py-2 text-xs font-light tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
                    >
                        DISCONNECT
                    </button>
                </div>
            </div>
        </nav>
    );
}
