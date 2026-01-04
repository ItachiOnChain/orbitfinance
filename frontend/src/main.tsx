import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './lib/wagmi';
import LandingPage from './pages/LandingPage';
import AppLayout from './pages/AppLayout';
import AccountPage from './pages/app/Account';
import VaultsPage from './pages/app/Vaults';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<AccountPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="vaults" element={<VaultsPage />} />
              <Route path="transmuter" element={<div className="text-white">Transmuter</div>} />
              <Route path="farms" element={<div className="text-white">Farms</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
