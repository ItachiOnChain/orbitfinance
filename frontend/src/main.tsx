import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './lib/wagmi';
import LandingPage from './pages/LandingPage';
import AppLayout from './pages/AppLayout';
import AccountPage from './pages/app/Account';
import VaultsPage from './pages/app/Vaults';
import { ComingSoon } from './components/ComingSoon';
import RWAHome from './pages/rwa/Home';
import KYC from './pages/rwa/KYC';
import AssetOrigination from './pages/rwa/AssetOrigination';
import CapitalMarkets from './pages/rwa/CapitalMarkets';
import Portfolio from './pages/rwa/Portfolio';
import SPVDashboard from './pages/rwa/admin/SPVDashboard';
import BundlePool from './pages/rwa/BundlePool';
import './index.css';
import { useAppStore } from './store/appStore';

const queryClient = new QueryClient();

// Component to handle /app route based on mode
function AppIndexRoute() {
  const { mode } = useAppStore();
  return mode === 'rwa' ? <RWAHome /> : <AccountPage />;
}

// Route guard for RWA pages - redirect to /app if in crypto mode
function RWARouteGuard({ children }: { children: React.ReactNode }) {
  const { mode } = useAppStore();
  const location = useLocation();

  // If in crypto mode and trying to access RWA pages, redirect to /app
  if (mode === 'crypto' && (
    location.pathname.includes('/origination') ||
    location.pathname.includes('/markets') ||
    location.pathname.includes('/portfolio') ||
    location.pathname.includes('/admin/spv')
  )) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app">
                <Route index element={<AppIndexRoute />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="vaults" element={<VaultsPage />} />
                <Route path="kyc" element={<KYC />} />
                <Route path="bundle-pool" element={<BundlePool />} />
                <Route path="origination" element={<RWARouteGuard><AssetOrigination /></RWARouteGuard>} />
                <Route path="markets" element={<RWARouteGuard><CapitalMarkets /></RWARouteGuard>} />
                <Route path="portfolio" element={<RWARouteGuard><Portfolio /></RWARouteGuard>} />
                <Route path="admin/spv" element={<RWARouteGuard><SPVDashboard /></RWARouteGuard>} />
                <Route path="transmuter" element={<ComingSoon />} />
                <Route path="farms" element={<ComingSoon />} />
                <Route path="bridge" element={<ComingSoon />} />
                <Route path="governance" element={<ComingSoon />} />
                <Route path="utilities" element={<ComingSoon />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
