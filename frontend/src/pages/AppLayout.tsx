import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AppNavbar } from '../components/layout/AppNavbar';
import { Sidebar } from '../components/layout/Sidebar';
import { RWASidebar } from '../components/rwa/RWASidebar';
import { useAppStore } from '../store/appStore';
import { useMobileMenu } from '../hooks/useMobileMenu';

export default function AppLayout() {
  const { mode, theme } = useAppStore();
  const { isOpen, toggle, close } = useMobileMenu();

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'light' ? 'bg-[#f0f2f5]' : 'bg-dark-bg'
        }`}
    >
      {/* Top Navbar */}
      <AppNavbar />

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={toggle}
        className="lg:hidden fixed top-6 left-4 z-50 p-3 rounded-xl bg-zinc-900/90 border border-gold/40 text-gold hover:bg-zinc-800 transition-all shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={close}
        />
      )}

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar - Conditional based on mode */}
        {mode === 'rwa' ? (
          <RWASidebar isOpen={isOpen} onClose={close} />
        ) : (
          <Sidebar isOpen={isOpen} onClose={close} />
        )}

        {/* Main Content - Always use Outlet for routes */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-16">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
