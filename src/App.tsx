/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AuthFlow } from './components/AuthFlow';
import { FarmerDashboard } from './components/FarmerDashboard';
import { BuyerMarketplace } from './components/BuyerMarketplace';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, role } = useApp();

  // If user is not logged in, show clean welcome & login screen
  if (!isAuthenticated) {
    return (
      <>
        <AuthFlow />
        <Toast />
      </>
    );
  }

  const renderRoleDashboard = () => {
    switch (role) {
      case 'FARMER':
        return <FarmerDashboard />;
      case 'BUYER':
        return <BuyerMarketplace />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <FarmerDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-950">
      {/* Role-Specific Minimal Navbar */}
      <Navbar />

      {/* Role-Specific Minimal Content */}
      <main className="flex-1 w-full">
        {renderRoleDashboard()}
      </main>

      {/* Interactive Toast Notifications */}
      <Toast />

      {/* Clean Minimal Footer */}
      <footer className="bg-white border-t border-stone-200/80 mt-auto py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700 font-serif">FarmDirect</span>
            <span>·</span>
            <span>Direct farm-to-buyer agricultural marketplace</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Transparent pricing · Shared cold-chain transport
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="FarmDirect Application Notice">
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
