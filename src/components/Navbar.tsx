import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sprout, 
  LogOut, 
  ChevronDown, 
  Home, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Truck, 
  Users, 
  Store, 
  Globe,
  Download,
  ShieldCheck,
  SlidersHorizontal,
  LifeBuoy
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    role, 
    setRole, 
    activeTab, 
    setActiveTab, 
    logout, 
    farmerName, 
    buyerName,
    currentUser,
    orders,
    language,
    setLanguage
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);

  const getFarmerLabel = (id: string, def: string) => {
    if (language !== 'hi') return def;
    switch (id) {
      case 'home': return 'होम';
      case 'produce': return 'मेरी फसल';
      case 'orders': return 'ऑर्डर';
      case 'market': return 'मंडी भाव';
      default: return def;
    }
  };

  const getTabs = () => {
    if (role === 'FARMER') {
      return [
        { id: 'home', label: getFarmerLabel('home', 'Home'), icon: Home },
        { id: 'produce', label: getFarmerLabel('produce', 'Produce'), icon: Package },
        { id: 'orders', label: getFarmerLabel('orders', 'Orders'), icon: ShoppingBag },
        { id: 'market', label: getFarmerLabel('market', 'Market'), icon: TrendingUp },
      ];
    } else if (role === 'BUYER') {
      return [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'marketplace', label: 'Market', icon: Store },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
      ];
    } else {
      return [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'policy', label: 'Rationing Policy', icon: SlidersHorizontal },
        { id: 'kyc', label: 'Compliance & KYC', icon: ShieldCheck },
        { id: 'tickets', label: 'Disputes & Tickets', icon: LifeBuoy },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'logistics', label: 'Logistics', icon: Truck },
        { id: 'users', label: 'Users', icon: Users },
      ];
    }
  };

  const tabs = getTabs();

  const getDisplayName = () => {
    if (role === 'FARMER') return `${farmerName} · Farmer`;
    if (role === 'BUYER') return `${buyerName || 'Buyer'} · Buyer`;
    return 'FarmDirect Admin';
  };

  const pendingFarmerOrders = orders.filter(
    (o) => (((o.farmerName || '').toLowerCase().includes('rajesh') || (o.farmerName || '').toLowerCase().includes('you')) && o.status === 'Confirmed')
  ).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            <div 
              onClick={() => setActiveTab(role === 'ADMIN' ? 'overview' : 'home')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0E3B2B] text-white flex items-center justify-center shadow-xs">
                <Sprout className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900 font-serif leading-tight">
                  Farm<span className="text-[#0E3B2B]">Direct</span>
                </span>
                <span className="text-[10px] text-stone-600 sm:hidden">
                  {role === 'FARMER' ? (language === 'hi' ? 'किसान पोर्टल' : 'Farmer App') : role === 'BUYER' ? 'Buyer Portal' : 'Admin'}
                </span>
              </div>
            </div>

            <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
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

            <div className="flex items-center gap-1.5 sm:gap-2">
              <a
                href="/downloads/farmdirect-latest.apk"
                download="farmdirect-latest.apk"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                title="Download Android APK"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>APK</span>
              </a>
              {role === 'FARMER' && (
                <button
                  type="button"
                  onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Toggle Language / भाषा बदलें"
                >
                  <Globe className="w-3.5 h-3.5 text-stone-500" />
                  <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 p-1.5 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer border border-transparent hover:border-stone-200"
                >
                  <span className="hidden sm:inline font-semibold">{getDisplayName()}</span>
                  <span className="sm:hidden text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-stone-100 bg-stone-50/50">
                      <div className="font-semibold text-stone-900 truncate">{getDisplayName()}</div>
                      <div className="text-[11px] text-stone-500 capitalize">{role.toLowerCase()} mode</div>
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
                        className={`w-full text-left px-3 py-2 hover:bg-stone-50 cursor-pointer flex items-center justify-between ${
                          role === 'FARMER' ? 'text-[#0E3B2B] font-bold bg-emerald-50/40' : 'text-stone-700'
                        }`}
                      >
                        <span>Farmer {currentUser?.name ? `(${currentUser.name.split(' ')[0]})` : '(Cultivator)'}</span>
                        {role === 'FARMER' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      </button>
                      <button
                        onClick={() => {
                          setRole('BUYER');
                          setActiveTab('home');
                          setMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-stone-50 cursor-pointer flex items-center justify-between ${
                          role === 'BUYER' ? 'text-[#0E3B2B] font-bold bg-emerald-50/40' : 'text-stone-700'
                        }`}
                      >
                        <span>Buyer {currentUser?.name ? `(${currentUser.name.split(' ')[0]})` : '(Marketplace)'}</span>
                        {role === 'BUYER' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      </button>
                      <button
                        onClick={() => {
                          setRole('ADMIN');
                          setActiveTab('overview');
                          setMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-stone-50 cursor-pointer flex items-center justify-between ${
                          role === 'ADMIN' ? 'text-[#0E3B2B] font-bold bg-emerald-50/40' : 'text-stone-700'
                        }`}
                      >
                        <span>Admin (FarmDirect Ops)</span>
                        {role === 'ADMIN' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      </button>
                    </div>

                    <div className="border-t border-stone-100 pt-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-stone-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
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
        </div>
      </header>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-stone-200 px-2 py-1 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className={role === 'ADMIN' ? "flex items-center justify-between overflow-x-auto gap-1 py-0.5 no-scrollbar" : "grid grid-cols-4 gap-1"}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            const showBadge = t.id === 'orders' && role === 'FARMER' && pendingFarmerOrders > 0;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all relative shrink-0 ${
                  role === 'ADMIN' ? 'min-w-[58px]' : ''
                } ${
                  isActive
                    ? 'text-[#0E3B2B] font-bold bg-emerald-50/60'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-mono flex items-center justify-center font-bold">
                      {pendingFarmerOrders}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] mt-1 leading-none tracking-tight truncate max-w-[62px]">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
