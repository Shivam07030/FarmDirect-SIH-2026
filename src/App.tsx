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
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-950 pb-20 sm:pb-0">
      <Navbar />

      <main className="flex-1 w-full">
        {renderRoleDashboard()}
      </main>

      <Toast />

      <footer className="bg-white border-t border-stone-200/80 mt-auto py-6 mb-16 sm:mb-0">
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
