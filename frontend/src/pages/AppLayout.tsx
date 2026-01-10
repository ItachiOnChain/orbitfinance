import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/layout/AppNavbar';
import { Sidebar } from '../components/layout/Sidebar';
import { RWASidebar } from '../components/rwa/RWASidebar';
import { useAppStore } from '../store/appStore';

export default function AppLayout() {
  const { mode, theme } = useAppStore();

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

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar - Conditional based on mode */}
        {mode === 'rwa' ? <RWASidebar /> : <Sidebar />}

        {/* Main Content - Always use Outlet for routes */}
        <main className="flex-1 overflow-y-auto p-16">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
