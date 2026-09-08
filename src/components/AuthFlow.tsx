import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Sprout, ArrowRight, ArrowLeft, KeyRound, Phone, CheckCircle2 } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/api';

export const AuthFlow: React.FC = () => {
  const { loginAs } = useApp();
  const [step, setStep] = useState<'select-role' | 'enter-phone' | 'enter-otp'>('select-role');
  const [selectedRole, setSelectedRole] = useState<UserRole>('FARMER');
  
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('2026');
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'FARMER') {
      setPhone('+91 98765 43210');
    } else if (role === 'BUYER') {
      setPhone('+91 98112 00000');
    } else {
      setPhone('+91 99999 00000');
    }
    setStep('enter-phone');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setOtpSentMessage(res.message || 'OTP sent. Demo code: 2026');
        setOtp('2026');
        setStep('enter-otp');
      } else {
        setErrorMessage('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await verifyOtp(phone, otp, selectedRole);
      if (res.success) {
        loginAs(selectedRole);
      } else {
        setErrorMessage(res.error || 'Invalid OTP. Please enter 2026.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between p-4 sm:p-10 font-sans">
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

      <main className="max-w-md w-full mx-auto my-auto py-6 sm:py-8">
        {step === 'select-role' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight font-serif">
                Welcome to FarmDirect
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Direct agricultural trade with transparent pricing, shared cold chain, and mobile access.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                Select your account type
              </p>

              <button
                type="button"
                onClick={() => handleSelectRole('FARMER')}
                className="w-full text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-[#0E3B2B] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="text-base font-semibold text-stone-900">Farmer</div>
                  <div className="text-xs text-stone-500">
                    List produce, track daily pickups, and receive direct bank payouts.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#0E3B2B] group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('BUYER')}
                className="w-full text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-[#0E3B2B] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="text-base font-semibold text-stone-900">Buyer</div>
                  <div className="text-xs text-stone-500">
                    Source fresh farm harvests directly at wholesale rates with cold-chain delivery.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#0E3B2B] group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('ADMIN')}
                className="w-full text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-[#0E3B2B] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="text-base font-semibold text-stone-900">Admin</div>
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
        )}

        {step === 'enter-phone' && (
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
                {selectedRole} Authentication
              </span>
              <h1 className="text-2xl font-semibold text-stone-900 font-serif">
                Enter Mobile Number
              </h1>
              <p className="text-xs text-stone-500">
                We will verify your account using a one-time passcode (OTP).
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:border-[#0E3B2B]"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0E3B2B] hover:bg-[#144E39] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>

              <div className="text-center">
                <span className="text-[11px] text-stone-400">
                  Demo static OTP: <strong className="text-stone-700">2026</strong>
                </span>
              </div>
            </form>
          </div>
        )}

        {step === 'enter-otp' && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setStep('enter-phone')}
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change phone number</span>
            </button>

            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OTP Sent</span>
              </span>
              <h1 className="text-2xl font-semibold text-stone-900 font-serif">
                Enter Verification Code
              </h1>
              <p className="text-xs text-stone-500">
                {otpSentMessage || 'Sent to ' + phone}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  4-Digit OTP Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-base font-mono tracking-widest text-center focus:outline-none focus:border-[#0E3B2B]"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0E3B2B] hover:bg-[#144E39] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying...' : `Verify & Sign In as ${selectedRole}`}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setOtp('2026')}
                  className="text-xs text-emerald-800 hover:underline font-medium cursor-pointer"
                >
                  Auto-fill Demo Code (2026)
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto w-full pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-400">
        <span>FarmDirect Technologies</span>
        <span>SIH 2026 · Secure Settlement</span>
      </footer>
    </div>
  );
};
