import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Sprout, ArrowRight, ArrowLeft, Check, Shield } from 'lucide-react';

export const AuthFlow: React.FC = () => {
  const { loginAs } = useApp();
  const [step, setStep] = useState<'select-role' | 'login'>('select-role');
  const [selectedRole, setSelectedRole] = useState<UserRole>('FARMER');
  
  // Login input states
  const [identifier, setIdentifier] = useState('');
  const [passwordOrPin, setPasswordOrPin] = useState('');

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'FARMER') {
      setIdentifier('+91 98765 43210');
      setPasswordOrPin('4321');
    } else if (role === 'BUYER') {
      setIdentifier('orders@freshbasket.in');
      setPasswordOrPin('2026');
    } else {
      setIdentifier('admin@farmdirect.ag');
      setPasswordOrPin('9988');
    }
    setStep('login');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between p-6 sm:p-10 font-sans">
      {/* Minimal Header */}
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0E3B2B] text-white flex items-center justify-center">
            <Sprout className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900 font-serif">
            Farm<span className="text-[#0E3B2B]">Direct</span>
          </span>
        </div>
      </header>

      {/* Main Card / Container */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        {step === 'select-role' ? (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-stone-900 tracking-tight font-serif">
                Welcome to FarmDirect
              </h1>
              <p className="text-sm text-stone-500">
                Direct agricultural trade with transparent pricing and shared logistics.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                Select your account type
              </p>

              {/* Farmer Selection Card */}
              <button
                type="button"
                onClick={() => handleSelectRole('FARMER')}
                className="w-full text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-[#0E3B2B] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="text-base font-semibold text-stone-900 flex items-center gap-2">
                    <span>Farmer</span>
                  </div>
                  <div className="text-xs text-stone-500">
                    List produce, track daily pickups, and receive direct bank payouts.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#0E3B2B] group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
              </button>

              {/* Buyer Selection Card */}
              <button
                type="button"
                onClick={() => handleSelectRole('BUYER')}
                className="w-full text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-[#0E3B2B] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="text-base font-semibold text-stone-900 flex items-center gap-2">
                    <span>Buyer</span>
                  </div>
                  <div className="text-xs text-stone-500">
                    Source fresh farm harvests directly at wholesale rates with cold-chain delivery.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#0E3B2B] group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
              </button>

              {/* Admin Selection Card */}
              <button
                type="button"
                onClick={() => handleSelectRole('ADMIN')}
                className="w-full text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-[#0E3B2B] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="text-base font-semibold text-stone-900 flex items-center gap-2">
                    <span>Admin</span>
                  </div>
                  <div className="text-xs text-stone-500">
                    Operational metrics, logistics milk-runs, and network oversight.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#0E3B2B] group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
              </button>

              <div className="pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => loginAs('FARMER')}
                  className="w-full py-3 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Quick Demo: Enter as Farmer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setStep('select-role')}
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to role selection</span>
            </button>

            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                {selectedRole === 'FARMER' ? 'Farmer Sign In' : selectedRole === 'BUYER' ? 'Buyer Sign In' : 'Admin Sign In'}
              </span>
              <h1 className="text-2xl font-semibold text-stone-900 font-serif">
                {selectedRole === 'FARMER'
                  ? 'Welcome back, Rajesh'
                  : selectedRole === 'BUYER'
                  ? 'Welcome back, FreshBasket'
                  : 'FarmDirect Console'}
              </h1>
              <p className="text-xs text-stone-500">
                {selectedRole === 'FARMER'
                  ? 'Access your harvest listings, active orders, and live market rates.'
                  : selectedRole === 'BUYER'
                  ? 'Access regional farmer lots and cold-chain order tracking.'
                  : 'Manage operational logistics and platform settlement.'}
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  {selectedRole === 'FARMER' ? 'Registered Mobile Number' : 'Email Address'}
                </label>
                <input
                  type={selectedRole === 'FARMER' ? 'tel' : 'email'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:border-[#0E3B2B] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Security PIN / Passcode
                </label>
                <input
                  type="password"
                  value={passwordOrPin}
                  onChange={(e) => setPasswordOrPin(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:border-[#0E3B2B] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0E3B2B] hover:bg-[#144E39] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer mt-2"
              >
                Sign in as {selectedRole === 'FARMER' ? 'Rajesh Kumar' : selectedRole === 'BUYER' ? 'FreshBasket' : 'Admin'}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-stone-400">
                  Demo credentials pre-filled for direct review
                </span>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-400">
        <span>FarmDirect Technologies</span>
        <span>Secure direct settlement</span>
      </footer>
    </div>
  );
};
