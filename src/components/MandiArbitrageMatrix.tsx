import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Info, 
  Languages, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  Percent, 
  Truck,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { 
  CROP_MANDI_BENCHMARKS, 
  CropArbitrageSummary, 
  getCropArbitrage 
} from '../services/mandiService';

interface MandiArbitrageMatrixProps {
  onListCropAtPrice?: (crop: string, pricePerKg: number) => void;
  isHindi?: boolean;
}

export const MandiArbitrageMatrix: React.FC<MandiArbitrageMatrixProps> = ({
  onListCropAtPrice,
  isHindi: initialHindi = false,
}) => {
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en'>(initialHindi ? 'hi' : 'en');
  const isHindi = selectedLang === 'hi';

  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const arbitrageData = getCropArbitrage(selectedCrop);

  const cropKeys = Object.keys(CROP_MANDI_BENCHMARKS);

  // Prepare chart data comparing FarmDirect with regional APMC mandis
  const chartData = [
    {
      name: 'FarmDirect (Direct)',
      nameHindi: 'फार्मडायरेक्ट (सीधा)',
      netInHand: arbitrageData.farmDirectWholesaleRatePerQtl,
      grossRate: arbitrageData.farmDirectWholesaleRatePerQtl,
      deductions: 0,
      isDirect: true,
    },
    ...arbitrageData.mandis.map((m) => ({
      name: m.mandiName.replace(' APMC', '').replace(' Mandi', ''),
      nameHindi: m.mandiHindi,
      netInHand: m.netFarmerRealizationPerQtl,
      grossRate: m.grossPricePerQtl,
      deductions: m.grossPricePerQtl - m.netFarmerRealizationPerQtl,
      isDirect: false,
    })),
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-[#0E3B2B] to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold">
                {isHindi ? 'Agmarknet व e-NAM लाइव मंडी आर्बिट्राज मैट्रिक्स' : 'Agmarknet & e-NAM Live Mandi Arbitrage Matrix'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                LIVE APMC SPREAD
              </span>
            </div>
            <p className="text-xs text-stone-300">
              {isHindi 
                ? 'स्थानीय मंडियों की आढ़त, सेस व मालभाड़ा घटाकर किसान की वास्तविक शुद्ध इन-हैंड कमाई का तुलनात्मक विश्लेषण' 
                : 'Comparative net take-home realization after deducting APMC cess, middleman cuts & transit decay'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedLang(selectedLang === 'hi' ? 'en' : 'hi')}
          className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{selectedLang === 'hi' ? 'English' : 'हिन्दी'}</span>
        </button>
      </div>

      {/* Crop Selector Chips */}
      <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
          {isHindi ? 'फसल चुनें:' : 'Select Crop:'}
        </span>
        {cropKeys.map((crop) => {
          const isSelected = selectedCrop === crop;
          const data = CROP_MANDI_BENCHMARKS[crop];
          return (
            <button
              key={crop}
              type="button"
              onClick={() => setSelectedCrop(crop)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#0E3B2B] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300'
              }`}
            >
              <span>{isHindi ? data.cropHindi : data.cropName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-100 text-stone-600'
              }`}>
                ₹{data.farmDirectPricePerKg}/kg
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-6">
        
        {/* Highlight Recommendation Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-stone-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-emerald-800 tracking-wider">
                {isHindi ? 'सर्वोत्तम मुनाफा अवसर' : 'Optimal Arbitrage Opportunity'}
              </div>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">
                {isHindi ? arbitrageData.recommendationHindi : arbitrageData.recommendationEn}
              </p>
              <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                <span>{isHindi ? 'सर्वोच्च स्प्रेड:' : 'Highest Spread:'}</span>
                <span className="font-semibold text-stone-800">{arbitrageData.highestSpreadMandi}</span>
                <span>·</span>
                <span className="font-mono font-bold text-emerald-700">
                  +₹{arbitrageData.maxArbitrageGainPerQtl}/क्विंटल (+₹{(arbitrageData.maxArbitrageGainPerQtl / 100).toFixed(1)}/kg)
                </span>
              </div>
            </div>
          </div>

          {onListCropAtPrice && (
            <button
              type="button"
              onClick={() => onListCropAtPrice(arbitrageData.cropName, arbitrageData.farmDirectPricePerKg)}
              className="px-4 py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>
                {isHindi 
                  ? `₹${arbitrageData.farmDirectPricePerKg}/kg पर बेचें` 
                  : `List at ₹${arbitrageData.farmDirectPricePerKg}/kg`}
              </span>
            </button>
          )}
        </div>

        {/* Comparison Bar Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              {isHindi ? 'वास्तविक इन-हैंड भुगतान तुलना (₹ प्रति क्विंटल)' : 'Net In-Hand Realization Comparison (₹ / Quintal)'}
            </h4>
            <span className="text-[11px] text-stone-500">
              {isHindi ? '1 क्विंटल = 100 किलोग्राम' : '1 Quintal = 100 Kilograms'}
            </span>
          </div>

          <div className="h-64 w-full bg-stone-50/50 rounded-2xl p-2 border border-stone-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis 
                  dataKey={isHindi ? 'nameHindi' : 'name'} 
                  tick={{ fontSize: 11, fill: '#44403c', fontWeight: 600 }} 
                />
                <YAxis 
                  domain={[0, Math.ceil(arbitrageData.farmDirectWholesaleRatePerQtl * 1.25)]} 
                  tick={{ fontSize: 11, fill: '#78716c' }} 
                  unit="₹" 
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1c1917', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    border: 'none', 
                    fontSize: '12px' 
                  }}
                  formatter={(value: any, name: any) => [
                    `₹${value}/qtl (₹${(value / 100).toFixed(1)}/kg)`,
                    name === 'netInHand' ? 'Net Farmer In-Hand' : 'Deductions'
                  ]}
                />
                <Bar dataKey="netInHand" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isDirect ? '#0E3B2B' : '#78716c'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {arbitrageData.mandis.map((mandi) => (
            <div 
              key={mandi.mandiName} 
              className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-2 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900 text-sm">
                    {isHindi ? mandi.mandiHindi : mandi.mandiName}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {mandi.distanceKm} km {isHindi ? 'दूरी' : 'distance from cluster'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block">
                    +₹{mandi.directSpreadPerQtl}/qtl {isHindi ? 'फार्मडायरेक्ट बचत' : 'Spread'}
                  </div>
                  <div className="text-xs font-mono font-bold text-stone-900 mt-0.5">
                    ₹{mandi.netPricePerKg}/kg {isHindi ? 'शुद्ध भाव' : 'Net Take-Home'}
                  </div>
                </div>
              </div>

              {/* Deductions line items */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-stone-200 text-[10px] text-stone-600">
                <div className="bg-white p-1.5 rounded-lg border border-stone-100">
                  <span className="text-stone-400 block">{isHindi ? 'आढ़ती दलाली' : 'Commission'}</span>
                  <span className="font-mono font-bold text-stone-800">{(mandi.arhatiyaCommissionRate * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-stone-100">
                  <span className="text-stone-400 block">{isHindi ? 'मंडी टैक्स' : 'APMC Cess'}</span>
                  <span className="font-mono font-bold text-stone-800">{(mandi.apmcCessRate * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-stone-100">
                  <span className="text-stone-400 block">{isHindi ? 'भाड़ा व पल्लेदारी' : 'Freight & Palledari'}</span>
                  <span className="font-mono font-bold text-stone-800">₹{mandi.freightCostPerQtl + mandi.palledariChargesPerQtl}/qtl</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
