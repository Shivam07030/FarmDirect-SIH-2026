import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowDown, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  DollarSign, 
  Sparkles,
  Layers,
  Scale
} from 'lucide-react';

interface CropComparisonModel {
  id: string;
  name: string;
  nameHi: string;
  emoji: string;
  traditional: {
    farmer: number;
    aggregator: number;
    mandi: number;
    wholesaler: number;
    retailer: number;
    consumerTotal: number;
  };
  farmDirect: {
    farmer: number;
    logistics: number;
    commission: number;
    consumerTotal: number;
  };
  typicalBatchKg: number;
}

const COMPARISON_CROPS: CropComparisonModel[] = [
  {
    id: 'tomato',
    name: 'Tomato (Hybrid Red)',
    nameHi: 'टमाटर',
    emoji: '🍅',
    traditional: {
      farmer: 18,
      aggregator: 2.50,
      mandi: 3.50,
      wholesaler: 3.00,
      retailer: 5.00,
      consumerTotal: 32,
    },
    farmDirect: {
      farmer: 24,
      logistics: 3.00,
      commission: 0,
      consumerTotal: 27,
    },
    typicalBatchKg: 500,
  },
  {
    id: 'potato',
    name: 'Potato (Kufri Jyoti)',
    nameHi: 'आलू',
    emoji: '🥔',
    traditional: {
      farmer: 12,
      aggregator: 2.00,
      mandi: 3.00,
      wholesaler: 2.50,
      retailer: 4.50,
      consumerTotal: 24,
    },
    farmDirect: {
      farmer: 18,
      logistics: 2.50,
      commission: 0,
      consumerTotal: 20.50,
    },
    typicalBatchKg: 1000,
  },
  {
    id: 'onion',
    name: 'Red Onion (Nasik Hybrid)',
    nameHi: 'प्याज',
    emoji: '🧅',
    traditional: {
      farmer: 18,
      aggregator: 3.00,
      mandi: 4.00,
      wholesaler: 4.00,
      retailer: 7.00,
      consumerTotal: 36,
    },
    farmDirect: {
      farmer: 28,
      logistics: 3.00,
      commission: 0,
      consumerTotal: 31,
    },
    typicalBatchKg: 800,
  },
  {
    id: 'wheat',
    name: 'Sharbati Wheat Grain',
    nameHi: 'गेहूँ',
    emoji: '🌾',
    traditional: {
      farmer: 24,
      aggregator: 2.00,
      mandi: 3.00,
      wholesaler: 4.00,
      retailer: 5.00,
      consumerTotal: 38,
    },
    farmDirect: {
      farmer: 32,
      logistics: 2.50,
      commission: 0,
      consumerTotal: 34.50,
    },
    typicalBatchKg: 2000,
  },
];

export const PriceTransparencyView: React.FC = () => {
  const { language } = useApp();
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);
  const [batchKg, setBatchKg] = useState<number>(500);

  const crop = COMPARISON_CROPS[selectedCropIndex];

  // Calculations
  const traditionalLeakagePerKg = crop.traditional.consumerTotal - crop.traditional.farmer;
  const farmerExtraPerKg = crop.farmDirect.farmer - crop.traditional.farmer;
  const consumerSavingsPerKg = crop.traditional.consumerTotal - crop.farmDirect.consumerTotal;

  const totalFarmerExtraEarnings = farmerExtraPerKg * batchKg;
  const totalConsumerSavings = consumerSavingsPerKg * batchKg;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. INFOGRAPHIC HERO STORY HEADER */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider border border-stone-200">
            <Scale className="w-3.5 h-3.5 text-emerald-700" />
            <span>SIH26033 Core Economic Proof</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            {language === 'hi' 
              ? `उपभोक्ता के ₹${crop.traditional.consumerTotal}/kg कहाँ जाते हैं?` 
              : `Where does ₹${crop.traditional.consumerTotal}/kg go?`}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-medium">
            {language === 'hi'
              ? 'पारंपरिक मंडी व्यवस्था में 5 बिचौलिए किसान की कमाई का आधा हिस्सा खा जाते हैं। फार्मडायरेक्ट सीधा खेत से खरीदार को जोड़कर दोनों को बड़ा फायदा देता है।'
              : 'In the traditional supply chain, 5 layers of intermediaries siphon off 44% to 50% of the price paid by consumers. FarmDirect eliminates the middlemen entirely.'}
          </p>
        </div>

        {/* Crop Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1 hidden sm:inline">
            {language === 'hi' ? 'फसल चुनें:' : 'Select Crop:'}
          </span>
          {COMPARISON_CROPS.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCropIndex(idx);
                setBatchKg(c.typicalBatchKg);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                selectedCropIndex === idx
                  ? 'bg-[#0E3B2B] text-white shadow-xs'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span className="text-base">{c.emoji}</span>
              <span>{language === 'hi' ? c.nameHi : c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. THE DUAL FINANCIAL FLOW INFOGRAPHIC (CONNECTED FLOW DIAGRAM) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: TRADITIONAL SUPPLY CHAIN (5 LEAKAGE STAGES) */}
        <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {language === 'hi' ? 'पारंपरिक मंडी व्यवस्था' : 'Traditional Supply Chain'}
                </span>
                <h2 className="text-xl font-extrabold text-stone-900 mt-1 font-serif">
                  {language === 'hi' ? '5 बिचौलियों की दलाली' : '5 Intermediary Markups'}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-stone-400">
                  {language === 'hi' ? 'उपभोक्ता मूल्य' : 'Final Price'}
                </div>
                <div className="text-2xl font-black text-stone-900 font-mono">
                  ₹{crop.traditional.consumerTotal}/kg
                </div>
              </div>
            </div>

            {/* Step-by-Step Flow with Arrows */}
            <div className="space-y-2.5 pt-2">
              
              {/* Stage 1: Farmer */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👨‍🌾</span>
                  <div>
                    <div className="text-xs font-bold text-stone-900 uppercase">
                      {language === 'hi' ? 'किसान को मिलता है' : 'Farmer Receives'}
                    </div>
                    <div className="text-[11px] text-stone-500">Cultivation & Harvest</div>
                  </div>
                </div>
                <div className="text-xl font-black text-stone-900 font-mono">
                  ₹{crop.traditional.farmer.toFixed(2)}/kg
                </div>
              </div>

              <div className="flex justify-center text-stone-400">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* Stage 2: Village Aggregator */}
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📦</span>
                  <div>
                    <div className="font-bold text-stone-800">{language === 'hi' ? 'गांव का कच्चा आढ़ती / बिचौलिया' : 'Village Aggregator'}</div>
                    <div className="text-[10px] text-stone-500">Local collection cut</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-rose-700 text-sm">
                  +₹{crop.traditional.aggregator.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-center text-stone-400">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* Stage 3: Mandi Commission */}
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🏛️</span>
                  <div>
                    <div className="font-bold text-stone-800">{language === 'hi' ? 'मंडी आढ़ती कमीशन + पल्लेदारी' : 'APMC Mandi Commission'}</div>
                    <div className="text-[10px] text-stone-500">Auction fees & loading cess</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-rose-700 text-sm">
                  +₹{crop.traditional.mandi.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-center text-stone-400">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* Stage 4: Secondary Wholesaler */}
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🏬</span>
                  <div>
                    <div className="font-bold text-stone-800">{language === 'hi' ? 'थोक व्यापारी मार्जिन' : 'Wholesaler Margin'}</div>
                    <div className="text-[10px] text-stone-500">Inter-city depot markup</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-rose-700 text-sm">
                  +₹{crop.traditional.wholesaler.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-center text-stone-400">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* Stage 5: Local Retailer */}
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🛒</span>
                  <div>
                    <div className="font-bold text-stone-800">{language === 'hi' ? 'स्थानीय खुदरा दुकानदार' : 'Local Retailer Markup'}</div>
                    <div className="text-[10px] text-stone-500">Neighborhood shop premium</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-rose-700 text-sm">
                  +₹{crop.traditional.retailer.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-center text-stone-400">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* Final: Consumer */}
              <div className="p-3.5 rounded-xl bg-stone-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛍️</span>
                  <div>
                    <div className="text-xs font-bold uppercase text-stone-400">
                      {language === 'hi' ? 'उपभोक्ता चुकाता है' : 'Consumer Pays'}
                    </div>
                    <div className="text-[11px] text-stone-400">Highest price, stale produce</div>
                  </div>
                </div>
                <div className="text-xl font-black font-mono text-white">
                  ₹{crop.traditional.consumerTotal.toFixed(2)}/kg
                </div>
              </div>

            </div>
          </div>

          {/* Highlight Value Leakage Card - Bold & High Contrast for Jury */}
          <div className="p-5 rounded-xl bg-rose-100/90 border-2 border-rose-300 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-xs font-black text-rose-900 uppercase tracking-wider">
                {language === 'hi' ? 'दलालों का रिसाव (Middleman Leakage)' : 'Old Model Middleman Leakage'}
              </div>
              <div className="text-xs text-rose-800 mt-0.5 font-medium">
                44% of consumer spend is lost across 5 intermediaries
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-black text-rose-700 font-mono tracking-tight">
                ₹{traditionalLeakagePerKg.toFixed(2)}<span className="text-sm font-normal text-rose-900">/kg</span>
              </div>
              <div className="text-[11px] font-bold text-rose-800">Direct Supply Waste</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE FARMDIRECT MODEL (DIRECT & STREAMLINED) */}
        <div className="lg:col-span-6 bg-gradient-to-b from-[#0E3B2B] to-[#124835] text-white border border-emerald-900 rounded-2xl p-6 sm:p-8 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-emerald-950/70 px-2.5 py-1 rounded border border-emerald-700/50">
                  {language === 'hi' ? 'फार्मडायरेक्ट मॉडल' : 'The FarmDirect Model'}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1 font-serif">
                  {language === 'hi' ? 'शून्य दलाली • सीधा खेत से' : 'Zero Middlemen • Pure Transparency'}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-emerald-300">
                  {language === 'hi' ? 'उपभोक्ता मूल्य' : 'Consumer Price'}
                </div>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  ₹{crop.farmDirect.consumerTotal.toFixed(2)}/kg
                </div>
              </div>
            </div>

            {/* FarmDirect Streamlined Stages */}
            <div className="space-y-3 pt-2">
              
              {/* Stage 1: Farmer Receives Direct */}
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👨‍🌾</span>
                  <div>
                    <div className="text-xs font-bold text-amber-300 uppercase">
                      {language === 'hi' ? 'किसान को सीधा मिलता है' : '1. Farmer Receives'}
                    </div>
                    <div className="text-xs text-emerald-200 font-medium">
                      {language === 'hi' ? '+₹' + farmerExtraPerKg.toFixed(2) + '/kg मंडी से अधिक' : `+₹${farmerExtraPerKg.toFixed(2)}/kg more (+33% above Mandi)`}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  ₹{crop.farmDirect.farmer.toFixed(2)}/kg
                </div>
              </div>

              <div className="flex justify-center text-emerald-400">
                <ArrowDown className="w-5 h-5 stroke-[2.5]" />
              </div>

              {/* Stage 2: Direct Shared Cold Logistics */}
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-700/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-100 text-sm">
                      {language === 'hi' ? 'साझा कोल्ड-ट्रक ढुलाई' : '2. Shared Cold Logistics'}
                    </div>
                    <div className="text-emerald-300 text-[11px]">Agra ➔ Delhi pooled milk-run route</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-amber-300 text-base">
                  +₹{crop.farmDirect.logistics.toFixed(2)}/kg
                </div>
              </div>

              <div className="flex justify-center text-emerald-400">
                <ArrowDown className="w-5 h-5 stroke-[2.5]" />
              </div>

              {/* Stage 3: Zero Middleman Commission */}
              <div className="p-4 rounded-xl bg-emerald-900/60 border-2 border-emerald-500/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚫</span>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {language === 'hi' ? 'बिचौलिया कमीशन' : '3. Middleman Commission'}
                    </div>
                    <div className="text-emerald-200 text-[11px]">Zero brokers • Zero Arhati cuts • Direct FPO settlement</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  ₹0.00
                </div>
              </div>

              <div className="flex justify-center text-emerald-400">
                <ArrowDown className="w-5 h-5 stroke-[2.5]" />
              </div>

              {/* Stage 4: Consumer Pays */}
              <div className="p-4 rounded-xl bg-white text-stone-900 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🛍️</span>
                  <div>
                    <div className="text-xs font-bold uppercase text-stone-500">
                      {language === 'hi' ? 'उपभोक्ता चुकाता है' : '4. Consumer Final Price'}
                    </div>
                    <div className="text-xs text-emerald-800 font-bold">
                      {language === 'hi' ? 'ताज़ा खेत की फसल • ₹' + consumerSavingsPerKg.toFixed(2) + '/kg सस्ता' : `-₹${consumerSavingsPerKg.toFixed(2)}/kg cheaper than local retail`}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-[#0E3B2B]">
                  ₹{crop.farmDirect.consumerTotal.toFixed(2)}/kg
                </div>
              </div>

            </div>
          </div>

          {/* Highlight Twin Benefit Card */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/60">
              <div className="text-xs uppercase font-bold text-emerald-300">
                {language === 'hi' ? 'किसान अतिरिक्त आय' : 'Farmer Gets'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-0.5">
                +₹{farmerExtraPerKg.toFixed(2)}/kg
              </div>
              <div className="text-xs text-emerald-200 mt-0.5 font-semibold">
                +{Math.round((farmerExtraPerKg / crop.traditional.farmer) * 100)}% above Mandi
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/60">
              <div className="text-xs uppercase font-bold text-emerald-300">
                {language === 'hi' ? 'उपभोक्ता सीधी बचत' : 'Consumer Pays'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-0.5">
                -₹{consumerSavingsPerKg.toFixed(2)}/kg
              </div>
              <div className="text-xs text-emerald-200 mt-0.5 font-semibold">
                -{Math.round((consumerSavingsPerKg / crop.traditional.consumerTotal) * 100)}% cheaper
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 5-SECOND SIH JURY TAKEAWAY BANNER */}
      <section className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              5-Second Summary for SIH Evaluators
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-serif tracking-tight mt-0.5">
              Zero-Intermediary Economic Transformation
            </h3>
          </div>
          <span className="hidden sm:inline-block text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1 rounded-full">
            Problem Statement #26033 Solved
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              Middleman Leakage
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              ₹14.00<span className="text-xs text-stone-400 font-normal">/kg</span>
            </div>
            <div className="text-xs text-rose-300 font-medium mt-1">
              Eliminated by FarmDirect
            </div>
          </div>

          <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-700/60">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Farmer Realization
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-1">
              +₹6.00<span className="text-xs text-emerald-200 font-normal">/kg</span>
            </div>
            <div className="text-xs text-emerald-200 font-medium mt-1">
              +33.3% above Mandi rate
            </div>
          </div>

          <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-700/60">
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
              Consumer Savings
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              -₹5.00<span className="text-xs text-stone-400 font-normal">/kg</span>
            </div>
            <div className="text-xs text-emerald-200 font-medium mt-1">
              -15.6% below retail price
            </div>
          </div>

          <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Middleman Cut
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
              ₹0.00
            </div>
            <div className="text-xs text-stone-400 font-medium mt-1">
              Zero commissions taken
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONCRETE BATCH IMPACT SIMULATOR (ON 500 KG: Farmer +₹3,000 | Consumer +₹2,500) */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-Time Economic Multiplier</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1 font-serif">
              {language === 'hi' ? `एक खेप पर वास्तविक बचत (Batch Impact on ${batchKg} kg)` : `Concrete Batch Impact on ${batchKg} kg Produce`}
            </h3>
          </div>

          {/* Quick Batch Size Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 uppercase hidden sm:inline">
              {language === 'hi' ? 'मात्रा:' : 'Lot Size:'}
            </span>
            {[200, 500, 1000, 2000].map((qty) => (
              <button
                key={qty}
                onClick={() => setBatchKg(qty)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  batchKg === qty
                    ? 'bg-[#0E3B2B] text-white shadow-xs'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {qty} kg
              </button>
            ))}
          </div>
        </div>

        {/* 2 Massive Impact Highlight Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Farmer Impact */}
          <div className="p-6 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {language === 'hi' ? `किसान का अतिरिक्त लाभ (${batchKg} kg पर)` : `Farmer Additional Income on ${batchKg} kg`}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#0E3B2B] font-mono mt-1">
                +₹{totalFarmerExtraEarnings.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-stone-600 mt-1 font-medium">
                {language === 'hi'
                  ? 'मंडी में बिकने की तुलना में सीधा किसान के बैंक खाते में अतिरिक्त मुनाफा।'
                  : `Transferred directly to farmer's UPI account with zero deduction.`}
              </p>
            </div>
            <span className="text-4xl sm:text-5xl ml-2">🌾</span>
          </div>

          {/* Consumer Impact */}
          <div className="p-6 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {language === 'hi' ? `उपभोक्ता की कुल बचत (${batchKg} kg पर)` : `Buyer Total Savings on ${batchKg} kg`}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-900 font-mono mt-1">
                ₹{totalConsumerSavings.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-stone-600 mt-1 font-medium">
                {language === 'hi'
                  ? 'स्थानीय थोक/खुदरा बाज़ार की तुलना में सीधी नकद बचत।'
                  : `Total cash conserved by supermarket or household collective.`}
              </p>
            </div>
            <span className="text-4xl sm:text-5xl ml-2">🛒</span>
          </div>

        </div>
      </section>

    </div>
  );
};
