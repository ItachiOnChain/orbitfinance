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
  Twitter
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export function Sidebar() {
  const { theme, toggleTheme } = useAppStore();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Threshold for hero section height (approx 800px)
      const currentScrollY = window.scrollY;
      if (currentScrollY > 800) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between
     px-6 py-6
     rounded-xl border
     transition-all duration-300
     ${
       isActive
         ? 'text-gold bg-zinc-900/80 border-gold/40 shadow-[0_8px_24px_rgba(212,175,55,0.15)]'
         : theme === 'light'
         ? 'text-zinc-500 bg-zinc-50/60 border-zinc-200 hover:text-zinc-900 hover:bg-white hover:border-zinc-300'
         : 'text-zinc-500 bg-zinc-900/40 border-zinc-800/50 hover:text-zinc-200 hover:bg-zinc-900/60 hover:border-gold/30'
     }`;

  const linkTextClass =
    'text-[11px] font-bold tracking-[0.3em] uppercase font-outfit';

  return (
    <aside
      className={`w-80 border-r hidden lg:flex flex-col h-[calc(100vh-5rem)] sticky top-20 transition-all duration-700 ${
        theme === 'light'
          ? `bg-white ${isVisible ? 'border-zinc-200' : 'border-transparent'}`
          : `bg-sidebar-bg ${isVisible ? 'border-zinc-900/50' : 'border-transparent'}`
      }`}
    >
      <div className={`flex flex-col flex-1 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Navigation */}
        <div className="px-6 py-10 flex-1 overflow-y-auto">
          <p className="text-[10px] font-bold tracking-[0.45em] text-zinc-500 mb-12 uppercase font-outfit px-1">
            Navigation
          </p>

          {/* KEY CHANGE: visible vertical spacing */}
          <nav className="space-y-12">
            <NavLink to="/app/account" className={linkClass}>
              <span className={linkTextClass}>Vaults</span>
              <LayoutDashboard size={18} className="text-gold/60" />
            </NavLink>

            <NavLink to="/app/transmuter" className={linkClass}>
              <span className={linkTextClass}>Transmuters</span>
              <Repeat size={18} className="text-gold/60" />
            </NavLink>

            <NavLink to="/app/bridge" className={linkClass}>
              <span className={linkTextClass}>Bridge</span>
              <ArrowLeftRight size={18} className="text-gold/60" />
            </NavLink>

            <NavLink to="/app/farms" className={linkClass}>
              <span className={linkTextClass}>Farms</span>
              <Tractor size={18} className="text-gold/60" />
            </NavLink>

            <NavLink to="/app/governance" className={linkClass}>
              <span className={linkTextClass}>Governance</span>
              <Gavel size={18} className="text-gold/60" />
            </NavLink>

            <NavLink to="/app/utilities" className={linkClass}>
              <span className={linkTextClass}>Utilities</span>
              <Wrench size={18} className="text-gold/60" />
            </NavLink>
          </nav>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-5 flex items-center justify-between border-t ${
            theme === 'light' ? 'border-zinc-200' : 'border-zinc-900/50'
          }`}
        >
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg transition ${
              theme === 'light'
                ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                : 'text-zinc-500 hover:text-gold hover:bg-zinc-900'
            }`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {[DollarSign, FileText, Twitter].map((Icon, i) => (
            <button
              key={i}
              className={`p-2.5 rounded-lg transition ${
                theme === 'light'
                  ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  : 'text-zinc-500 hover:text-gold hover:bg-zinc-900'
              }`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
