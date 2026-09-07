import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CROP_FORECAST_DATA } from '../data/initialData';
import { CropForecastData } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  IndianRupee,
  Layers
} from 'lucide-react';

export const DemandForecastView: React.FC = () => {
  const { language, setCurrentView } = useApp();
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [modelType, setModelType] = useState<'trend-weighted' | 'moving-average' | 'linear-regression'>('trend-weighted');

  const cropData: CropForecastData = CROP_FORECAST_DATA[selectedCrop] || CROP_FORECAST_DATA['Tomato'];

  const cropMeta: Record<string, { emoji: string; hi: string; peakWindow: string; expectedGain: string }> = {
    Tomato: { emoji: '🍅', hi: 'टमाटर', peakWindow: 'Next 24–48 Hours', expectedGain: '+₹900 on 500kg lot' },
    Wheat: { emoji: '🌾', hi: 'गेहूँ', peakWindow: 'Immediate 3 Days', expectedGain: '+₹4,000 on 2,000kg lot' },
    Potato: { emoji: '🥔', hi: 'आलू', peakWindow: 'Continuous 10 Days', expectedGain: '+₹3,500 on 1,000kg lot' },
    Onion: { emoji: '🧅', hi: 'प्याज', peakWindow: 'Hold 3-4 Days', expectedGain: '+₹1,600 on 400kg lot' },
    Cauliflower: { emoji: '🥦', hi: 'फूलगोभी', peakWindow: 'Next 36 Hours', expectedGain: '+₹650 on 300kg lot' },
  };

  // Combine historical and forecast data for the chart
  const combinedChartData = [
    ...cropData.historicalData.map((d) => ({
      name: d.day,
      date: d.date,
      historicalDemand: d.demandKg,
      predictedDemand: null,
      lowerBound: null,
      upperBound: null,
    })),
    // Transition point
    {
      name: cropData.historicalData[cropData.historicalData.length - 1].day,
      date: cropData.historicalData[cropData.historicalData.length - 1].date,
      historicalDemand: cropData.historicalData[cropData.historicalData.length - 1].demandKg,
      predictedDemand: cropData.historicalData[cropData.historicalData.length - 1].demandKg,
      lowerBound: cropData.historicalData[cropData.historicalData.length - 1].demandKg,
      upperBound: cropData.historicalData[cropData.historicalData.length - 1].demandKg,
    },
    ...cropData.forecastData.map((d) => ({
      name: d.day,
      date: d.date,
      historicalDemand: null,
      predictedDemand: d.predictedDemandKg,
      lowerBound: d.lowerBound,
      upperBound: d.upperBound,
    })),
  ];

  const crops = Object.keys(CROP_FORECAST_DATA);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. HERO SECTION */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider border border-stone-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>SIH26033 AI Demand Forecasting Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            {language === 'hi' 
              ? 'मंडी मांग और भाव का पूर्वानुमान (AI सलाह)' 
              : 'AI Demand Forecasting & Mandi Trends'}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-medium">
            {language === 'hi'
              ? 'मंडी में किस फसल की मांग बढ़ रही है और किसकी घट रही है — जानिए कब बेचना आपके लिए सबसे ज्यादा मुनाफेदार होगा।'
              : 'Algorithmic demand prediction modeling historical arrivals, retail absorption velocities, and regional wholesale terminal seasonality.'}
          </p>
        </div>

        {/* Crop Selection Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1 hidden sm:inline">
              {language === 'hi' ? 'फसल:' : 'Crop:'}
            </span>
            {crops.map((crop) => {
              const meta = cropMeta[crop] || { emoji: '🥬', hi: crop };
              const isSelected = selectedCrop === crop;
              return (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#0E3B2B] text-white shadow-xs'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span className="text-base">{meta.emoji}</span>
                  <span>{language === 'hi' ? meta.hi : crop}</span>
                </button>
              );
            })}
          </div>

          {/* Model Selection Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-bold uppercase tracking-wider">
              {language === 'hi' ? 'एल्गोरिदम:' : 'AI Model:'}
            </span>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 font-semibold text-stone-800 outline-hidden cursor-pointer"
            >
              <option value="trend-weighted">7-Day Trend Weighted Regression</option>
              <option value="moving-average">Moving Average (3-Day / 7-Day)</option>
              <option value="linear-regression">Linear Mandi Arrival Extrapolation</option>
            </select>
          </div>
        </div>
      </section>

      {/* 2. PROMINENT ACTIONABLE RECOMMENDATION HERO CARD (PRIMARY BUSINESS OUTCOME FOCUS) */}
      <section className="bg-gradient-to-br from-[#0E3B2B] to-[#144E39] text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{cropMeta[selectedCrop]?.emoji || '🌱'}</span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                AI Prescriptive Decision Card
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white mt-0.5">
                {selectedCrop} ({cropMeta[selectedCrop]?.hi}): {cropData.recommendationText}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('farmer')}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>List {selectedCrop} on FarmDirect</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* 4 Core Business Outcome Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-emerald-950/70 p-4 rounded-xl border border-emerald-700/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              1. Demand Trend (%)
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 flex items-center gap-1.5">
              <TrendingUp className="w-6 h-6 text-amber-300" />
              <span>+{cropData.expectedGrowthPercent}%</span>
            </div>
            <div className="text-xs text-emerald-200 mt-1">
              Surging in Delhi NCR
            </div>
          </div>

          <div className="bg-emerald-950/70 p-4 rounded-xl border border-emerald-700/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              2. Selling Window
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-serif mt-1">
              {cropMeta[selectedCrop]?.peakWindow || 'Next 24–48 Hours'}
            </div>
            <div className="text-xs text-emerald-200 mt-1">
              Before wholesale arrival surge
            </div>
          </div>

          <div className="bg-emerald-950/70 p-4 rounded-xl border border-emerald-700/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              3. Current vs Expected Price
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-1">
              ₹24 <span className="text-white text-base font-normal">➔</span> ₹28<span className="text-xs text-white font-normal">/kg</span>
            </div>
            <div className="text-xs text-emerald-200 mt-1">
              +₹4/kg premium in window
            </div>
          </div>

          <div className="bg-emerald-950/70 p-4 rounded-xl border border-emerald-700/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              4. Potential Farmer Profit
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-1">
              {cropMeta[selectedCrop]?.expectedGain || '+₹900'}
            </div>
            <div className="text-xs text-emerald-200 mt-1">
              On standard harvest batch
            </div>
          </div>

        </div>
      </section>

      {/* 3. RECHARTS INTERACTIVE DEMAND FORECAST AREA CHART */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-stone-900 font-serif">
              {cropMeta[selectedCrop]?.emoji} {selectedCrop}: 7-Day Historical vs 7-Day Predicted Demand
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Solid emerald: Recorded absorption in wholesale terminals • Shaded teal: Confidence band upper/lower envelope
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span>Historical Mandi Demand</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-500" />
              <span>AI Predicted Corridor</span>
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0E3B2B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0E3B2B" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderRadius: '8px', 
                  border: 'none', 
                  color: '#fff',
                  fontSize: '12px' 
                }}
              />
              <Area 
                type="monotone" 
                dataKey="historicalDemand" 
                stroke="#0E3B2B" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorHist)" 
                name="Historical Demand (kg)"
              />
              <Area 
                type="monotone" 
                dataKey="predictedDemand" 
                stroke="#0d9488" 
                strokeWidth={2.5}
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorPred)" 
                name="Predicted Demand (kg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-stone-600">
            <strong>Actionable Synthesis:</strong> Selling {selectedCrop} through FarmDirect today connects directly to verified institutional buyers with guaranteed lock-in pricing.
          </div>
          <button
            onClick={() => setCurrentView('farmer')}
            className="px-4 py-2 bg-[#0E3B2B] text-white font-bold rounded-lg hover:bg-[#134E35] transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            {language === 'hi' ? 'फसल लिस्ट करें' : 'Sell This Crop on FarmDirect'}
          </button>
        </div>
      </section>

    </div>
  );
};
