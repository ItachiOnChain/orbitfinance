import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppNavbar } from '../components/layout/AppNavbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAppStore } from '../store/appStore';

export default function AppLayout() {
  const { mode, theme } = useAppStore();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === 'light' ? 'bg-[#f0f2f5]' : 'bg-dark-bg'
      }`}
    >
      {/* Top Navbar */}
      <AppNavbar />

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {mode !== 'rwa' && <Sidebar />}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {mode === 'rwa' ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold tracking-tight text-white mb-8 text-glow font-outfit">
                  RWA Module
                </h1>
                <p className="text-2xl text-zinc-500 font-medium tracking-wide">
                  Coming Soon
                </p>
              </div>
            </div>
          ) : (
            <main className={`flex-1 overflow-y-auto ${isLandingPage ? 'pl-12' : 'p-16'}`}>
              <div className={isLandingPage ? '' : 'max-w-7xl mx-auto'}>
                <Outlet />
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}
