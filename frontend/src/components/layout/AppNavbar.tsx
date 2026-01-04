import { useAccount, useDisconnect } from 'wagmi';
import { useAppStore } from '../../store/appStore';
import { Orbit, Hexagon } from 'lucide-react';

export function AppNavbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { mode, toggleMode, theme } = useAppStore();

  return (
    <nav
      className={`border-b sticky top-0 z-50 h-20 transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-white/95 backdrop-blur-md border-zinc-200 shadow-sm'
          : 'bg-dark-bg/90 backdrop-blur-md border-zinc-900/50 shadow-xl'
      }`}
    >
      <div className="w-full h-full px-8 py-0 grid grid-cols-3 items-center">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="text-gold animate-[spin_10s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]">
                <Orbit size={32} strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-gold">
                <Hexagon size={16} fill="currentColor" className="opacity-20" />
                <div className="absolute w-1 h-1 bg-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]" />
              </div>
            </div>

            <div className={`flex flex-col font-outfit ${
              theme === 'light' ? 'text-zinc-900' : 'text-white'
            }`}>
              <span className="text-lg font-black tracking-[0.15em] leading-none">ORBIT</span>
              <span className="text-[9px] font-bold tracking-[0.4em] text-gold mt-0.5">FINANCE</span>
            </div>
          </div>

          {/* Center: Mode Toggle */}
          <div className="flex justify-center">
            <div
              className={`flex items-center p-1 border transition-colors duration-300 rounded-lg ${
                theme === 'light'
                  ? 'bg-zinc-100 border-zinc-200'
                  : 'bg-zinc-900/80 border-zinc-800'
              }`}
            >
              <button
                onClick={toggleMode}
                className={`px-10 py-3 text-[11px] font-bold tracking-[0.3em] rounded-lg transition-all ${
                  mode === 'crypto'
                    ? theme === 'light'
                      ? 'bg-white text-gold shadow-md'
                      : 'bg-zinc-800 text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                    : 'text-zinc-500'
                }`}
              >
                CRYPTO
              </button>

              <button
                onClick={toggleMode}
                className={`px-10 py-3 text-[11px] font-bold tracking-[0.3em] rounded-lg transition-all ${
                  mode === 'rwa'
                    ? theme === 'light'
                      ? 'bg-white text-gold shadow-md'
                      : 'bg-zinc-800 text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                    : 'text-zinc-500'
                }`}
              >
                RWA
              </button>
            </div>
          </div>

          {/* Right: Wallet Section */}
          <div className="flex justify-end items-center gap-6">
            {isConnected ? (
              <div className="flex items-center gap-6">
                <span
                  className={`text-xs font-bold font-mono tracking-widest ${
                    theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>

                <button
                  onClick={() => disconnect()}
                  className={`px-12 py-4 text-[12px] font-bold tracking-[0.3em] border rounded-lg transition-all ${
                    theme === 'light'
                      ? 'text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                      : 'text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <button
                className="px-20 py-6 bg-zinc-900 text-gold border border-gold/50 rounded-lg
                           text-[15px] font-bold tracking-[0.4em] hover:bg-zinc-800
                           transition-all shadow-[0_0_40px_rgba(212,175,55,0.25)] hover:scale-105"
              >
                CONNECT WALLET
              </button>
            )}
          </div>
      </div>
    </nav>
  );
}
