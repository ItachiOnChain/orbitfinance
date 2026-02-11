import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Orbit } from 'lucide-react';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020202]/60 backdrop-blur-xl border-b border-white/5 h-16 md:h-20">
      <div className="container mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollToSection('hero')}>
          <div className="relative">
            <div className="text-gold animate-[spin_15s_linear_infinite]">
              <Orbit size={24} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-[0.1em] text-white font-outfit uppercase">ORBIT</span>
            <span className="text-[8px] font-bold tracking-[0.3em] text-gold/80 -mt-0.5 uppercase">FINANCE</span>
          </div>
        </div>

        {/* Center: Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { name: 'Process', id: 'process' },
            { name: 'Dashboard', id: 'dashboard' },
            { name: 'Advantages', id: 'advantages' },
            { name: 'FAQ', id: 'faq' },
            { name: 'Built For', id: 'built-for' },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-[11px] font-bold tracking-[0.2em] text-white/50 hover:text-white uppercase transition-colors"
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Right: Connect */}
        <div className="flex items-center gap-6">
          {isConnected && address ? (
            <>
              <button
                onClick={handleLaunchApp}
                className="hidden sm:block text-[11px] font-bold tracking-[0.2em] text-white/50 hover:text-white uppercase transition-colors"
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
            </>
          ) : (
            <button
              onClick={handleConnect}
              className="px-8 py-3 rounded-none bg-gold text-black text-[11px] font-black tracking-[0.2em] hover:bg-white transition-all duration-500 uppercase shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
