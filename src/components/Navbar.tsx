import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sprout, LogOut, ChevronDown, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    role, 
    setRole, 
    activeTab, 
    setActiveTab, 
    logout, 
    farmerName, 
    buyerName,
    orders 
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);

  // Define tabs based on role
  const getTabs = () => {
    if (role === 'FARMER') {
      return [
        { id: 'home', label: 'Home' },
        { id: 'produce', label: 'Produce' },
        { id: 'orders', label: 'Orders' },
        { id: 'market', label: 'Market' },
      ];
    } else if (role === 'BUYER') {
      return [
        { id: 'home', label: 'Home' },
        { id: 'marketplace', label: 'Marketplace' },
        { id: 'orders', label: 'Orders' },
      ];
    } else {
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'orders', label: 'Orders' },
        { id: 'logistics', label: 'Logistics' },
        { id: 'users', label: 'Users' },
      ];
    }
  };

  const tabs = getTabs();

  const getDisplayName = () => {
    if (role === 'FARMER') return `${farmerName} · Farmer`;
    if (role === 'BUYER') return 'FreshBasket · Buyer';
    return 'FarmDirect Admin';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div 
            onClick={() => setActiveTab(role === 'ADMIN' ? 'overview' : 'home')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-7 h-7 rounded-lg bg-[#0E3B2B] text-white flex items-center justify-center">
              <Sprout className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold text-lg tracking-tight text-stone-900 font-serif">
              Farm<span className="text-[#0E3B2B]">Direct</span>
            </span>
          </div>

          {/* Role Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {tabs.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0E3B2B] text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-xs font-medium text-stone-700 hover:text-stone-950 p-1.5 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline font-semibold">{getDisplayName()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-stone-100">
                  <div className="font-semibold text-stone-900 truncate">{getDisplayName()}</div>
                  <div className="text-[11px] text-stone-400 capitalize">{role.toLowerCase()} perspective</div>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-stone-400">
                    Switch Role
                  </div>
                  <button
                    onClick={() => {
                      setRole('FARMER');
                      setActiveTab('home');
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-50 cursor-pointer ${
                      role === 'FARMER' ? 'text-[#0E3B2B] font-bold' : 'text-stone-700'
                    }`}
                  >
                    Farmer (Rajesh Kumar)
                  </button>
                  <button
                    onClick={() => {
                      setRole('BUYER');
                      setActiveTab('home');
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-50 cursor-pointer ${
                      role === 'BUYER' ? 'text-[#0E3B2B] font-bold' : 'text-stone-700'
                    }`}
                  >
                    Buyer (FreshBasket)
                  </button>
                  <button
                    onClick={() => {
                      setRole('ADMIN');
                      setActiveTab('overview');
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-50 cursor-pointer ${
                      role === 'ADMIN' ? 'text-[#0E3B2B] font-bold' : 'text-stone-700'
                    }`}
                  >
                    Admin (FarmDirect Ops)
                  </button>
                </div>

                <div className="border-t border-stone-100 pt-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-stone-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
