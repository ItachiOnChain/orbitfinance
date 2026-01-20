import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Orbit, Hexagon } from 'lucide-react';
import { WalletDropdown } from '../WalletDropdown';
import { useAppStore } from '../../store/appStore';

export function LandingNavbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectAsync, connectors } = useConnect();
  const { setMode } = useAppStore();
  const navigate = useNavigate();

  const handleConnect = async () => {
    const connector = connectors.find(c => c.id === 'injected') || connectors[0];
    if (connector) {
      try {
        await connectAsync({ connector });
        setMode('crypto');
      } catch (error) {
        console.error('Connection failed:', error);
      }
    }
  };

  const handleLaunchApp = () => {
    setMode('crypto');
    navigate('/app/crypto');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-black/60 backdrop-blur-3xl border-b border-white/5 h-20 sticky top-0 z-50 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
      <div className="container mx-auto h-full px-6 grid grid-cols-3 items-center">
        
        {/* 1. Left Column - Logo Section */}
        <div className="flex items-center justify-start">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="relative">
              <div className="text-gold animate-[spin_12s_linear_infinite] group-hover:animate-[spin_4s_linear_infinite]">
                <Orbit size={28} strokeWidth={1.2} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-gold">
                <Hexagon size={12} fill="currentColor" className="opacity-10" />
                <div className="absolute w-1 h-1 bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,1)]" />
              </div>
            </div>

            <div className="flex flex-col font-outfit text-white">
              <span className="text-base font-black tracking-[0.2em] leading-none uppercase">ORBIT</span>
              <span className="text-[7px] font-bold tracking-[0.4em] text-gold mt-1 uppercase">FINANCE</span>
            </div>
          </div>
        </div>

        {/* 2. Center Column - Navigation Links (Mathematically forced to center) */}
        <div className="hidden md:flex items-center justify-center gap-12 lg:gap-16">
          {[
            { name: 'About', id: 'about' },
            { name: 'How it Works', id: 'how-it-works' },
            { name: 'Ecosystem', id: 'ecosystem' },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="group relative flex flex-col items-center py-2"
            >
              <span className="text-[10px] font-bold tracking-[0.3em] text-white/60 group-hover:text-gold uppercase transition-all duration-500">
                {link.name}
              </span>
              <span className="absolute bottom-0 h-[1px] w-0 bg-gold/60 transition-all duration-500 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* 3. Right Column - Wallet Section */}
        <div className="flex items-center justify-end gap-8">
          {isConnected && address ? (
            <div className="flex items-center gap-6">
              <button
                onClick={handleLaunchApp}
                className="text-zinc-500 hover:text-white text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300"
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
              className="group relative z-10 inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border-0 px-8 py-2 font-outfit text-[10px] font-bold tracking-[0.3em] uppercase text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] blur-0 opacity-100 before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)] before:transition-opacity hover:before:animate-[buttonMovingGradientBg_3s_linear_infinite] hover:before:opacity-70 shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:scale-105 transition-all"
            >
              <span className="relative z-10">CONNECT</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
