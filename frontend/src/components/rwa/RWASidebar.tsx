import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import {
    Home,
    FileText,
    Briefcase,
    Settings,
    Shield,
    Lock,
    Moon,
    Sun,
    LayoutGrid
} from 'lucide-react';
import { isAdmin } from '../../utils/rwa/adminCheck';
import { useKYCStatus } from '../../hooks/rwa/useKYC';
import { useAppStore } from '../../store/appStore';
import { WalletDropdown } from '../WalletDropdown';

interface RWASidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function RWASidebar({ isOpen = false, onClose }: RWASidebarProps) {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { connect, connectors } = useConnect();
    const { data: isVerified } = useKYCStatus();
    const { theme, toggleTheme, mode, toggleMode } = useAppStore();
    const [isVisible, setIsVisible] = useState(true);
    const showAdminLink = isAdmin(address);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY <= 800);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = () => {
        // Close mobile menu when nav item is clicked
        if (onClose) onClose();
    };

    const handleModeToggle = () => {
        toggleMode();
        navigate('/app');
        if (onClose) onClose();
    };

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `
    group relative
    w-full h-14
    rounded-xl
    px-5
    flex items-center
    transition-all duration-300
    ${isActive
            ? `
          bg-zinc-900/70
          border border-gold/40
          shadow-[0_0_24px_rgba(212,175,55,0.18)]
          text-gold
        `
            : `
          bg-transparent
          border border-transparent
          text-zinc-400
          hover:bg-zinc-900/50
          hover:border-zinc-800
          hover:text-zinc-200
        `
        }
    `;

    return (
        <aside
            className={`
        fixed lg:sticky top-0 lg:top-24 h-screen lg:h-[calc(100vh-8rem)]
        w-80 z-40
        transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isVisible ? 'lg:opacity-100' : 'lg:opacity-0 lg:-translate-x-4 lg:pointer-events-none'}
      `}
        >
            {/* Sidebar Shell */}
            <div
                className={`flex-1 flex flex-col h-full rounded-none lg:rounded-3xl border-r lg:border
        ${theme === 'light'
                        ? 'bg-white/80 backdrop-blur-md border-zinc-200'
                        : 'bg-zinc-950/50 backdrop-blur-xl border-zinc-900/60'
                    }`}
            >
                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-8 pt-24 lg:pt-8 flex flex-col gap-6">

                        {/* Header */}
                        <header>
                            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-zinc-500">
                                RWA Navigation
                            </p>
                        </header>

                        {/* Navigation */}
                        <nav className="flex flex-col gap-3">
                            <NavLink to="/app" end className={linkClass} onClick={handleNavClick}>
                                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                    <span />
                                    <span className="text-sm font-medium tracking-wide">Home</span>
                                    <Home size={18} className="text-gold/60" />
                                </div>
                            </NavLink>

                            <NavLink to="/app/kyc" className={linkClass} onClick={handleNavClick}>
                                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                    <span />
                                    <span className="text-sm font-medium tracking-wide">KYC</span>
                                    <div className="flex items-center justify-end gap-1">
                                        {(isVerified ? <span className="text-[10px] text-green-400">✓</span> : null) as React.ReactNode}
                                        <Shield size={18} className="text-gold/60" />
                                    </div>
                                </div>
                            </NavLink>

                            <NavLink
                                to="/app/bundle-pool"
                                className={({ isActive }) => `${linkClass({ isActive })} ${!isVerified ? 'opacity-50' : ''}`}
                                onClick={(e) => { handleNavClick(); if (!isVerified) e.preventDefault(); }}
                            >
                                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                    <span />
                                    <span className="text-sm font-medium tracking-wide">Bundle Pool</span>
                                    {!isVerified ? <Lock size={14} className="text-zinc-600" /> : <LayoutGrid size={18} className="text-gold/60" />}
                                </div>
                            </NavLink>

                            <NavLink
                                to="/app/origination"
                                className={({ isActive }) => `${linkClass({ isActive })} ${!isVerified ? 'opacity-50' : ''}`}
                                onClick={(e) => { handleNavClick(); if (!isVerified) e.preventDefault(); }}
                            >
                                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                    <span />
                                    <span className="text-sm font-medium tracking-wide">Asset Origination</span>
                                    {!isVerified ? <Lock size={14} className="text-zinc-600" /> : <FileText size={18} className="text-gold/60" />}
                                </div>
                            </NavLink>

                            <NavLink
                                to="/app/portfolio"
                                className={({ isActive }) => `${linkClass({ isActive })} ${!isVerified ? 'opacity-50' : ''}`}
                                onClick={(e) => { handleNavClick(); if (!isVerified) e.preventDefault(); }}
                            >
                                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                    <span />
                                    <span className="text-sm font-medium tracking-wide">My Portfolio</span>
                                    {!isVerified ? <Lock size={14} className="text-zinc-600" /> : <Briefcase size={18} className="text-gold/60" />}
                                </div>
                            </NavLink>

                            {showAdminLink && (
                                <NavLink to="/app/admin/spv" className={linkClass} onClick={handleNavClick}>
                                    <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                        <span />
                                        <span className="text-sm font-medium tracking-wide">SPV Simulator</span>
                                        <Settings size={18} className="text-red-400/60" />
                                    </div>
                                </NavLink>
                            )}
                        </nav>
                    </div>
                </div>

                {/* Footer */}
                <footer
                    className={`mt-auto px-6 py-6 border-t space-y-4
          ${theme === 'light'
                            ? 'border-zinc-200 bg-zinc-50/50'
                            : 'border-zinc-900/60 bg-zinc-900/20'
                        }`}
                >
                    {/* Mode Toggle - Mobile Only */}
                    <div className="lg:hidden flex flex-col gap-2">
                        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-zinc-500 mb-2">
                            Mode
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleModeToggle}
                                className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${mode === 'crypto'
                                    ? 'bg-gold/20 text-gold border border-gold/40'
                                    : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 hover:text-zinc-400'
                                    }`}
                            >
                                Crypto
                            </button>
                            <button
                                onClick={handleModeToggle}
                                className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${mode === 'rwa'
                                    ? 'bg-gold/20 text-gold border border-gold/40'
                                    : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 hover:text-zinc-400'
                                    }`}
                            >
                                RWA
                            </button>
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <div className="flex justify-between items-center pt-2">
                        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-zinc-500">
                            Theme
                        </p>
                        <button
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-xl transition-all
                ${theme === 'light'
                                    ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200 hover:bg-zinc-100'
                                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-gold hover:bg-zinc-800'
                                }`}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                    </div>

                    {/* Wallet Controls - Mobile Only - AT THE BOTTOM */}
                    <div className="lg:hidden">
                        {isConnected && address ? (
                            <WalletDropdown
                                address={address}
                                onDisconnect={() => {
                                    disconnect();
                                    navigate('/');
                                    if (onClose) onClose();
                                }}
                                theme={theme}
                            />
                        ) : (
                            <button
                                onClick={() => {
                                    connect({ connector: connectors[0] });
                                    if (onClose) onClose();
                                }}
                                className="w-full px-4 py-3 bg-gold/10 border border-gold/40 rounded-xl text-gold text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-gold/20 transition-all"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </footer>
            </div>
        </aside>
    );
}
