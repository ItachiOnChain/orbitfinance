import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import CryptoHome from '../pages/app/CryptoHome';
import RWAHome from '../pages/rwa/Home';

// Component to handle /app route based on mode
export function AppIndexRoute() {
  const { mode } = useAppStore();
  return mode === 'rwa' ? <RWAHome /> : <CryptoHome />;
}

// Route guard for RWA pages - redirect to /app if in crypto mode
export function RWARouteGuard({ children }: { children: React.ReactNode }) {
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
