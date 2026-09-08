import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Truck, 
  Sprout, 
  ShieldCheck, 
  Sparkles,
  Trophy,
  Scale,
  ShoppingBag,
  ArrowDown
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setRole, setCurrentView, setShowJudgeGuide, language } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-br from-[#0B2E21] via-[#0E3B2B] to-[#144E39] text-white rounded-3xl p-8 sm:p-14 shadow-lg border border-emerald-900/50 relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-900/80 border border-emerald-700/60 text-emerald-200 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart India Hackathon 2026 • Problem ID: SIH26033</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-serif">
            {language === 'hi' ? (
              <>सीधा किसान से खरीदार तक, <span className="text-amber-300 underline decoration-amber-400/40 underline-offset-8">बिना किसी दलाल के।</span></>
            ) : (
              <>Direct Farm-to-Buyer. <span className="text-amber-300 underline decoration-amber-400/40 underline-offset-8">Zero Middlemen.</span></>
            )}
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 font-medium leading-relaxed">
            {language === 'hi'
              ? 'किसानों को मिले अपनी मेहनत का पूरा हक, और उपभोक्ताओं को मिले ताज़ा, किफायती राशन। 5 बिचौलियों की दलाली हमेशा के लिए खत्म।'
              : 'Connecting regional farmers and FPOs directly with bulk buyers and households through AI-powered price intelligence and pooled cold-chain logistics.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 space-y-3">
            <div className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
              {language === 'hi' ? 'शुरुआत करें (भूमिका चुनें):' : 'Choose your perspective:'}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setRole('FARMER');
                  setCurrentView('farmer');
                }}
                className="flex items-center gap-2.5 px-5 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm sm:text-base rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span className="text-xl">👨‍🌾</span>
                <span>{language === 'hi' ? 'मैं किसान हूँ (Sell Harvest)' : 'Enter as Farmer'}</span>
              </button>

              <button
                onClick={() => {
                  setRole('BUYER');
                  setCurrentView('marketplace');
                }}
                className="flex items-center gap-2.5 px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-900 font-bold text-sm sm:text-base rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span className="text-xl">🛒</span>
                <span>{language === 'hi' ? 'मैं खरीदार हूँ (Buy Produce)' : 'Enter as Buyer'}</span>
              </button>

              <button
                onClick={() => setCurrentView('price-transparency')}
                className="flex items-center gap-2 px-4 py-3.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 font-semibold text-xs sm:text-sm rounded-xl border border-emerald-700/60 transition-all cursor-pointer"
              >
                <Scale className="w-4 h-4 text-amber-300" />
                <span>{language === 'hi' ? 'दलाली बचत मॉडल' : 'Price Intelligence'}</span>
              </button>
            </div>
          </div>

          {/* Jury Demo Guide Banner */}
          <div className="pt-2 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>SIH Jury Demo Mode Ready</span>
            </div>
            <button
              onClick={() => setShowJudgeGuide(true)}
              className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-white cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'जज मूल्यांकन गाइड खोलें ➔' : 'Open SIH Judge Presentation Guide ➔'}</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. THE THREE CORE PILLARS OF FARMDIRECT */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0E3B2B] bg-emerald-100 px-2.5 py-0.5 rounded">
            SIH 26033 Mandate
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
            {language === 'hi' ? 'कृषि आपूर्ति श्रृंखला में 3 क्रांतिकारी बदलाव' : 'How FarmDirect Solves the Problem'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            {language === 'hi'
              ? 'पारंपरिक दलालों की जगह पारदर्शी डिजिटल तकनीक, साझा ढुलाई और AI भविष्यवाणी।'
              : 'Replacing extractive intermediaries with verified technology, milk-run cold chains, and price models.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1 */}
          <div 
            onClick={() => {
              setRole('BUYER');
              setCurrentView('marketplace');
            }}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0E3B2B] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-3 font-serif">
                1. Direct Farm Marketplace
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mt-1">
                FPOs and farmers list verified harvests directly. Bulk buyers purchase at transparent rates with zero hidden commission deductions.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 text-xs font-bold text-[#0E3B2B] flex items-center gap-1">
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div 
            onClick={() => setCurrentView('logistics')}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0E3B2B] flex items-center justify-center">
                <Truck className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-3 font-serif">
                2. Shared Cold-Chain Logistics
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mt-1">
                Multi-farmer milk-run routes aggregate smaller loads across regional clusters into refrigerated trucks, cutting freight cost to ₹2.20/kg.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 text-xs font-bold text-[#0E3B2B] flex items-center gap-1">
              <span>View Logistics Network</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div 
            onClick={() => setCurrentView('demand-forecast')}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0E3B2B] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-3 font-serif">
                3. AI Demand Forecasting
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mt-1">
                Predictive algorithms guide farmers on whether to harvest now or hold stock, capturing peak market windows and avoiding distress sales.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 text-xs font-bold text-[#0E3B2B] flex items-center gap-1">
              <span>Launch AI Forecaster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. SUPPLY CHAIN STORYTELLING: TRADITIONAL LEAKAGE VS FARMDIRECT PROMISE */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              The SIH Economic Case
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5 font-serif">
              Where Does the Middleman Margin Go?
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('price-transparency')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E3B2B] text-white rounded-lg text-xs font-bold hover:bg-[#134E35] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Open Interactive Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column High Contrast Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Traditional Way */}
          <div className="p-6 rounded-xl bg-rose-50/50 border border-rose-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                Traditional Mandi Chain
              </span>
              <span className="text-xs font-bold text-rose-700 font-mono">5 Intermediaries</span>
            </div>

            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex justify-between py-1 border-b border-rose-100">
                <span>Farmer receives:</span>
                <span className="font-mono font-bold text-stone-900">₹18/kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rose-100">
                <span>Middlemen markups (Village trader + Mandi + Wholesaler + Retailer):</span>
                <span className="font-mono font-bold text-rose-700">+₹14/kg (44% leakage)</span>
              </div>
              <div className="flex justify-between py-1 pt-2 font-bold text-stone-900">
                <span>Consumer pays:</span>
                <span className="font-mono text-base text-rose-800">₹32/kg</span>
              </div>
            </div>
          </div>

          {/* FarmDirect Way */}
          <div className="p-6 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                FarmDirect Solution
              </span>
              <span className="text-xs font-bold text-emerald-700 font-mono">Direct Connection</span>
            </div>

            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span>Farmer receives directly:</span>
                <span className="font-mono font-bold text-[#0E3B2B]">₹24/kg (+33.3% higher!)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span>Shared Cold-Chain Logistics:</span>
                <span className="font-mono font-bold text-stone-800">+₹3/kg (₹0 commission)</span>
              </div>
              <div className="flex justify-between py-1 pt-2 font-bold text-stone-900">
                <span>Consumer pays:</span>
                <span className="font-mono text-base text-[#0E3B2B]">₹27/kg (15.6% cheaper!)</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
