import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAccount } from 'wagmi';
import {
    Home,
    FileText,
    Briefcase,
    Settings,
    Shield,
    Lock,
    Moon,
    Sun,
    DollarSign,
    Twitter,
    LayoutGrid
} from 'lucide-react';
import { isAdmin } from '../../utils/rwa/adminCheck';
import { useKYCStatus } from '../../hooks/rwa/useKYC';
import { useAppStore } from '../../store/appStore';

export function RWASidebar() {
    const { address } = useAccount();
    const { data: isVerified } = useKYCStatus();
    const { theme, toggleTheme } = useAppStore();
    const [isVisible, setIsVisible] = useState(true);
    const showAdminLink = isAdmin(address);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY <= 800);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            className={`hidden lg:flex w-80 sticky top-24 h-[calc(100vh-8rem)]
      transition-all duration-500
      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
        >
            {/* Sidebar Shell */}
            <div
                className={`flex-1 flex flex-col rounded-3xl border
        ${theme === 'light'
                        ? 'bg-white/80 backdrop-blur-md border-zinc-200'
                        : 'bg-zinc-950/50 backdrop-blur-xl border-zinc-900/60'
                    }`}
            >
                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-8 flex flex-col gap-6">

                        {/* Header */}
                        <header>
                            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-zinc-500">
                                RWA Navigation
                            </p>
                        </header>

                        {/* Navigation */}
                        <nav className="flex flex-col gap-3">
                            <NavLink to="/app" end className={linkClass}>
                                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                    <span />
                                    <span className="text-sm font-medium tracking-wide">Home</span>
                                    <Home size={18} className="text-gold/60" />
                                </div>
                            </NavLink>

                            <NavLink to="/app/kyc" className={linkClass}>
                                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                    <span />
                                    <span className="text-sm font-medium tracking-wide">KYC</span>
                                    <div className="flex items-center justify-end gap-1">
                                        {isVerified && <span className="text-[10px] text-green-400">✓</span>}
                                        <Shield size={18} className="text-gold/60" />
                                    </div>
                                </div>
                            </NavLink>

                            <NavLink
                                to="/app/bundle-pool"
                                className={({ isActive }) => `${linkClass({ isActive })} ${!isVerified ? 'opacity-50' : ''}`}
                                onClick={(e) => !isVerified && e.preventDefault()}
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
                                onClick={(e) => !isVerified && e.preventDefault()}
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
                                onClick={(e) => !isVerified && e.preventDefault()}
                            >
                                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                    <span />
                                    <span className="text-sm font-medium tracking-wide">My Portfolio</span>
                                    {!isVerified ? <Lock size={14} className="text-zinc-600" /> : <Briefcase size={18} className="text-gold/60" />}
                                </div>
                            </NavLink>

                            {showAdminLink && (
                                <NavLink to="/app/admin/spv" className={linkClass}>
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
                    className={`mt-8 px-6 py-6 border-t
          ${theme === 'light'
                            ? 'border-zinc-200 bg-zinc-50/50'
                            : 'border-zinc-900/60 bg-zinc-900/20'
                        }`}
                >
                    <div className="grid grid-cols-4 items-center">
                        <div className="flex justify-start">
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

                        <div className="flex justify-center">
                            <button
                                className={`p-2.5 rounded-xl transition-all
                ${theme === 'light'
                                        ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                                        : 'text-zinc-500 hover:text-gold hover:bg-zinc-900'
                                    }`}
                            >
                                <DollarSign size={18} />
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <button
                                className={`p-2.5 rounded-xl transition-all
                ${theme === 'light'
                                        ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                                        : 'text-zinc-500 hover:text-gold hover:bg-zinc-900'
                                    }`}
                            >
                                <FileText size={18} />
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button
                                className={`p-2.5 rounded-xl transition-all
                ${theme === 'light'
                                        ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                                        : 'text-zinc-500 hover:text-gold hover:bg-zinc-900'
                                    }`}
                            >
                                <Twitter size={18} />
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </aside>
    );
}

