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
import { ComingSoon } from './components/ComingSoon';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/app">
                  <Route index element={<AccountPage />} />
                  <Route path="account" element={<AccountPage />} />
                  <Route path="vaults" element={<VaultsPage />} />
                  <Route path="transmuter" element={<ComingSoon />} />
                  <Route path="farms" element={<ComingSoon />} />
                  <Route path="bridge" element={<ComingSoon />} />
                  <Route path="governance" element={<ComingSoon />} />
                  <Route path="utilities" element={<ComingSoon />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
