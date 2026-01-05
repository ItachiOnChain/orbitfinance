import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useAppStore } from '../../store/appStore';
import { Orbit, Hexagon } from 'lucide-react';
import { WalletDropdown } from '../WalletDropdown';

export function AppNavbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
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
                className={`group relative z-10 inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border-0 px-10 py-3 font-outfit text-[11px] font-bold tracking-[0.3em] uppercase transition-all ${
                  mode === 'crypto'
                    ? 'text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)]'
                    : 'text-zinc-500 hover:text-zinc-400'
                }`}
                style={mode === 'crypto' ? { transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)' } : {}}
              >
                <span className="relative z-10">CRYPTO</span>
              </button>

              <button
                onClick={toggleMode}
                className={`group relative z-10 inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border-0 px-10 py-3 font-outfit text-[11px] font-bold tracking-[0.3em] uppercase transition-all ${
                  mode === 'rwa'
                    ? 'text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)]'
                    : 'text-zinc-500 hover:text-zinc-400'
                }`}
                style={mode === 'rwa' ? { transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)' } : {}}
              >
                <span className="relative z-10">RWA</span>
              </button>
            </div>
          </div>

          {/* Right: Wallet Section */}
          <div className="flex justify-end items-center gap-6">
            {isConnected && address ? (
              <WalletDropdown 
                address={address} 
                onDisconnect={() => disconnect()} 
                theme={theme}
              />
            ) : (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="group relative z-10 inline-flex h-14 cursor-pointer items-center justify-center rounded-xl border-0 px-12 py-4 font-outfit text-[13px] font-bold tracking-[0.3em] uppercase text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] blur-0 opacity-100 before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)] before:transition-opacity hover:before:animate-[buttonMovingGradientBg_3s_linear_infinite] hover:before:opacity-70 shadow-[0_0_40px_rgba(212,175,55,0.25)] hover:scale-105"
                style={{ transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                <span className="relative z-10">CONNECT WALLET</span>
              </button>
            )}
          </div>
      </div>
    </nav>
  );
}
