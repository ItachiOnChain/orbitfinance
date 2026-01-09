import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Orbit, Hexagon } from 'lucide-react';
import { WalletDropdown } from '../WalletDropdown';
import { useAppStore } from '../../store/appStore';

export function LandingNavbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { setMode } = useAppStore();
  const navigate = useNavigate();

  const handleConnect = async () => {
    if (connectors[0]) {
      try {
        await connect({ connector: connectors[0] });
        setMode('crypto');
        navigate('/app/crypto');
      } catch (error) {
        console.error('Connection failed:', error);
      }
    }
  };

  const handleLaunchApp = () => {
    setMode('crypto');
    navigate('/app/crypto');
  };

  return (
    <nav className="bg-dark-bg/90 backdrop-blur-md border-b border-zinc-900/50 h-20 sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto h-full px-6 lg:px-12 flex items-center justify-between">
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

          <div className="flex flex-col font-outfit text-white">
            <span className="text-lg font-black tracking-[0.15em] leading-none uppercase">ORBIT</span>
            <span className="text-[9px] font-bold tracking-[0.4em] text-gold mt-0.5 uppercase">FINANCE</span>
          </div>
        </div>

        {/* Right: Wallet Section */}
        <div className="flex items-center gap-6">
          {isConnected && address ? (
            <div className="flex items-center gap-4">
              <button
                onClick={handleLaunchApp}
                className="text-zinc-400 hover:text-white text-[11px] font-bold tracking-[0.2em] uppercase transition-colors"
              >
                Launch App
              </button>
              <WalletDropdown
                address={address}
                onDisconnect={() => {
                  disconnect();
                  navigate('/');
                }}
                theme="dark"
              />
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="group relative z-10 inline-flex h-12 cursor-pointer items-center justify-center rounded-xl border-0 px-10 py-3 font-outfit text-[11px] font-bold tracking-[0.3em] uppercase text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] blur-0 opacity-100 before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)] before:transition-opacity hover:before:animate-[buttonMovingGradientBg_3s_linear_infinite] hover:before:opacity-70 shadow-[0_0_40px_rgba(212,175,55,0.25)] hover:scale-105"
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
