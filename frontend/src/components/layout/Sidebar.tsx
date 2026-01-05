import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Repeat,
  ArrowLeftRight,
  Tractor,
  Gavel,
  Wrench,
  Moon,
  Sun,
  DollarSign,
  FileText,
  Twitter,
  User
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export function Sidebar() {
  const { theme, toggleTheme } = useAppStore();
  const [isVisible, setIsVisible] = useState(true);

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
                Navigation
              </p>
            </header>

            {/* Navigation */}
            <nav className="flex flex-col gap-3">
              <NavLink to="/app/account" className={linkClass}>
                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                  <span />
                  <span className="text-sm font-medium tracking-wide">My Account</span>
                  <User size={18} className="text-gold/60" />
                </div>
              </NavLink>

              <NavLink to="/app/vaults" className={linkClass}>
                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                  <span />
                  <span className="text-sm font-medium tracking-wide">Vaults</span>
                  <LayoutDashboard size={18} className="text-gold/60" />
                </div>
              </NavLink>

              <NavLink to="/app/transmuter" className={linkClass}>
                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                  <span />
                  <span className="text-sm font-medium tracking-wide">Transmuters</span>
                  <Repeat size={18} className="text-gold/60" />
                </div>
              </NavLink>

              <NavLink to="/app/bridge" className={linkClass}>
                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                  <span />
                  <span className="text-sm font-medium tracking-wide">Bridge</span>
                  <ArrowLeftRight size={18} className="text-gold/60" />
                </div>
              </NavLink>

              <NavLink to="/app/farms" className={linkClass}>
                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                  <span />
                  <span className="text-sm font-medium tracking-wide">Farms</span>
                  <Tractor size={18} className="text-gold/60" />
                </div>
              </NavLink>

              <NavLink to="/app/governance" className={linkClass}>
                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                  <span />
                  <span className="text-sm font-medium tracking-wide">Governance</span>
                  <Gavel size={18} className="text-gold/60" />
                </div>
              </NavLink>

              <NavLink to="/app/utilities" className={linkClass}>
                <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                  <span />
                  <span className="text-sm font-medium tracking-wide">Utilities</span>
                  <Wrench size={18} className="text-gold/60" />
                </div>
              </NavLink>
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
            {/* Left */}
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

            {/* Center-left */}
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

            {/* Center-right */}
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

            {/* Right */}
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
