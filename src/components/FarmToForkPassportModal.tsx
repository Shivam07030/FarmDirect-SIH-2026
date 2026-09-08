import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  ShieldCheck, 
  Thermometer, 
  MapPin, 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  ArrowRight, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Truck, 
  Languages, 
  Building2, 
  Award,
  Layers,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from 'recharts';
import { generateQrDataUrl } from '../services/qrService';
import { Order, Product } from '../types';

interface FarmToForkPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  product?: Product | null;
  isHindi?: boolean;
}

export const FarmToForkPassportModal: React.FC<FarmToForkPassportModalProps> = ({
  isOpen,
  onClose,
  order,
  product,
  isHindi: initialHindi = false,
}) => {
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en'>(initialHindi ? 'hi' : 'en');
  const isHindi = selectedLang === 'hi';

  const [activeTab, setActiveTab] = useState<'PASSPORT' | 'CRATE_TAG'>('PASSPORT');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  // Unified produce details
  const itemName = order?.productName || product?.name || 'Fresh Vine Tomato';
  const itemCategory = order?.category || product?.category || 'Vegetables';
  const farmer = order?.farmerName || product?.farmerName || 'Ajay Kumar Aman';
  const lotId = order?.id || (product ? `LOT-${product.id}` : 'FD-LOT-2026-8891');
  const harvestDate = product?.harvestDate || order?.orderDate || 'Today · 06:30 AM';
  const origin = order?.pickupLocation || product?.location || 'Agra Farm Cluster, Uttar Pradesh';
  const destination = order?.deliveryLocation || 'Delhi Azadpur Terminal Hub';
  const quantityKg = order?.quantity || product?.quantity || 450;
  const grade = product?.quality || 'Grade A+ (Export Quality)';

  // Verification URL pointing to our live production server
  const verificationUrl = `http://169.58.5.209:3000/?verify=${lotId}`;
  const qrDataUrl = generateQrDataUrl(verificationUrl, 260);

  // Cold Chain Telematics Log Data
  const telematicsData = [
    { time: '06:30 AM', location: 'Agra Farm Gate', temp: 4.1, status: 'Pre-cooled & Loaded' },
    { time: '08:15 AM', location: 'Yamuna Expressway Mile 42', temp: 3.9, status: 'Reefer Running' },
    { time: '10:00 AM', location: 'Mathura Transit Hub', temp: 4.2, status: 'Temp Logged' },
    { time: '11:45 AM', location: 'Palwal In-Transit Hub', temp: 4.0, status: 'Zero Breach' },
    { time: '01:15 PM', location: 'Faridabad Bypass', temp: 3.8, status: 'Reefer Running' },
    { time: '02:30 PM', location: 'Delhi Terminal Hub', temp: 4.3, status: 'Verified at Gate' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handlePrintTag = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-[#0E3B2B] via-[#144E39] to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {isHindi ? 'फार्म-टू-फोर्क डिजिटल ट्रस्ट पासपोर्ट' : 'Farm-to-Fork Public Trust Passport'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  PM-KISAN LINKED
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {isHindi 
                  ? 'खेत से उपभोक्ता तक 100% पारदर्शिता, कोल्ड-चेन ग्राफ व सत्यापन' 
                  : 'Soil-to-shelf traceability, IoT cold-chain audit & direct farmer credentials'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedLang(selectedLang === 'hi' ? 'en' : 'hi')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{selectedLang === 'hi' ? 'English' : 'हिन्दी'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('PASSPORT')}
            className={`pb-3 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'PASSPORT'
                ? 'border-[#0E3B2B] text-[#0E3B2B]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isHindi ? 'डिजिटल ट्रस्ट पासपोर्ट' : 'Digital Trust Passport'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CRATE_TAG')}
            className={`pb-3 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'CRATE_TAG'
                ? 'border-[#0E3B2B] text-[#0E3B2B]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{isHindi ? 'प्रिंट करने योग्य क्रेट टैग' : 'Printable Crate Tag'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          
          {activeTab === 'PASSPORT' && (
            <div className="space-y-6">
              
              {/* QR Code & Direct Credentials Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-stone-50 via-white to-emerald-50/50 border border-stone-200 flex flex-col sm:flex-row items-center gap-5 shadow-xs">
                
                {/* QR Code Image */}
                <div className="p-3 bg-white rounded-2xl border-2 border-emerald-700/30 shadow-md shrink-0 flex flex-col items-center">
                  <img
                    src={qrDataUrl}
                    alt="FarmDirect Verification QR"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                  <span className="text-[10px] font-mono font-bold text-stone-600 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{lotId}</span>
                  </span>
                </div>

                {/* Farmer & Land Records Column */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-stone-900">{itemName}</h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {grade}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {isHindi ? 'सीधे सत्यापित किसान से थोक आपूर्ति' : 'Directly sourced from verified farmer'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                      <div className="text-[10px] uppercase font-bold text-stone-400">
                        {isHindi ? 'किसान का नाम' : 'Farmer Name'}
                      </div>
                      <div className="font-semibold text-stone-900 mt-0.5">{farmer}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">PM-KISAN Beneficiary</div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                      <div className="text-[10px] uppercase font-bold text-stone-400">
                        {isHindi ? 'खसरा / भू-अभिलेख' : 'Land Survey (Khasra)'}
                      </div>
                      <div className="font-semibold text-stone-900 mt-0.5">#142/2A (3.5 Acres)</div>
                      <div className="text-[10px] text-emerald-700 font-medium">Meon Digilocker Verified</div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                      <div className="text-[10px] uppercase font-bold text-stone-400">
                        {isHindi ? 'उत्पत्ति क्लस्टर' : 'Farm Location'}
                      </div>
                      <div className="font-semibold text-stone-900 mt-0.5">{origin}</div>
                      <div className="text-[10px] text-stone-500">27.1767° N, 78.0081° E</div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                      <div className="text-[10px] uppercase font-bold text-stone-400">
                        {isHindi ? 'तुड़ाई का समय' : 'Harvest Timestamp'}
                      </div>
                      <div className="font-semibold text-stone-900 mt-0.5">{harvestDate}</div>
                      <div className="text-[10px] text-stone-500">Direct Cold Handover</div>
                    </div>
                  </div>

                  {/* Copy Link Button */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-stone-300"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? (isHindi ? 'लिंक कॉपी हो गया!' : 'Link Copied!') : (isHindi ? 'सत्यापन लिंक कॉपी करें' : 'Copy Verification URL')}</span>
                    </button>
                    <span className="text-[11px] text-stone-400 font-mono truncate max-w-[200px]">
                      {verificationUrl}
                    </span>
                  </div>

                </div>

              </div>

              {/* IoT Cold Chain Telematics Time-Series Graph */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">
                        {isHindi ? 'कोल्ड-चेन टेलीमैटिक्स तापमान लॉग' : 'IoT Cold-Chain Telematics Log'}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {isHindi 
                          ? 'खेत से डिलीवरी तक निरंतर 2°C - 6°C सुरक्षित सीमा में' 
                          : 'Continuous IoT temperature sensors monitoring throughout transit'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{isHindi ? '100% थर्मल अखंडता सुरक्षित' : 'Zero Thermal Breach (100%)'}</span>
                    </span>
                  </div>
                </div>

                {/* Graph Viewport */}
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telematicsData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0E3B2B" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0E3B2B" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#78716c' }} />
                      <YAxis domain={[0, 8]} tick={{ fontSize: 11, fill: '#78716c' }} unit="°C" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#1c1917', 
                          borderRadius: '12px', 
                          color: '#fff', 
                          border: 'none', 
                          fontSize: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)' 
                        }}
                        formatter={(val: any) => [`${val}°C`, 'Temperature']}
                        labelFormatter={(lbl, payload) => {
                          const item = payload?.[0]?.payload;
                          return `${lbl} - ${item?.location || ''}`;
                        }}
                      />
                      <ReferenceLine y={6.0} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Max 6°C', position: 'insideTopRight', fill: '#dc2626', fontSize: 10 }} />
                      <ReferenceLine y={2.0} stroke="#2563eb" strokeDasharray="4 4" label={{ value: 'Min 2°C', position: 'insideBottomRight', fill: '#2563eb', fontSize: 10 }} />
                      <Area 
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#0E3B2B" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#tempGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">
                      {isHindi ? 'औसत तापमान' : 'Average Temp'}
                    </div>
                    <div className="text-sm font-mono font-bold text-stone-900 mt-0.5">4.05°C</div>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">
                      {isHindi ? 'तापमान विचलन' : 'Temp Variance'}
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-700 mt-0.5">±0.25°C (Stable)</div>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">
                      {isHindi ? 'रीफर लॉगर ID' : 'Sensor Logger ID'}
                    </div>
                    <div className="text-sm font-mono font-bold text-stone-900 mt-0.5">IOT-RF-9912</div>
                  </div>
                </div>
              </div>

              {/* Middlemen Disintermediation & Value Delivered */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 to-stone-900 text-white space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-emerald-300">
                    {isHindi ? 'मध्यस्थ उन्मूलन व उचित मूल्य प्रभाव' : 'Direct Middlemen Elimination Impact'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      <span>{isHindi ? 'किसान को अतिरिक्त लाभ' : 'Farmer Realization'}</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-white mt-1">+38%</div>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      {isHindi ? 'आढ़ती व दलाली कमीशन शून्य' : 'Zero APMC arhatiya deduction'}
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-blue-300 font-semibold">
                      <Clock className="w-4 h-4" />
                      <span>{isHindi ? 'पारगमन समय बचत' : 'Transit Time'}</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-white mt-1">7.5 Hours</div>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      {isHindi ? 'सामान्य 38 घंटे के बजाय 7.5 घंटे' : 'Down from 38h multi-mandi transit'}
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                      <TrendingDown className="w-4 h-4" />
                      <span>{isHindi ? 'फसल बर्बादी रोकथाम' : 'Food Waste Reduced'}</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-white mt-1">1.8%</div>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      {isHindi ? 'पारंपरिक 22% खराबी से बहुत कम' : 'Down from 22% traditional decay'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'CRATE_TAG' && (
            <div className="space-y-4">
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>
                  {isHindi 
                    ? 'यह लेबल सीधे फसल की क्रेट या बोरी पर चिपकाने के लिए प्रिंट करें।' 
                    : 'Print this high-resolution packing tag to affix directly onto produce crates.'}
                </span>
                <button
                  type="button"
                  onClick={handlePrintTag}
                  className="px-3 py-1 bg-amber-800 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-900"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'प्रिंट करें' : 'Print Sticker'}</span>
                </button>
              </div>

              {/* Printable Crate Tag Layout */}
              <div className="p-6 bg-white border-2 border-dashed border-stone-800 rounded-2xl space-y-4 shadow-sm font-sans max-w-lg mx-auto">
                <div className="border-b-2 border-stone-900 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-stone-900 font-serif">FARMCARTS DIRECT</h3>
                    <p className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                      Official Produce Crate Passport · SIH 2026
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold bg-stone-900 text-white px-2.5 py-1 rounded">
                      {grade.split(' ')[0]}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="p-2 border border-stone-900 rounded-xl">
                    <img src={qrDataUrl} alt="Crate QR" className="w-32 h-32 object-contain" />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">PRODUCE LOT</div>
                      <div className="font-bold text-stone-900 text-sm">{itemName}</div>
                      <div className="text-[11px] text-stone-600 font-mono">{lotId}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">FARMER & LAND</div>
                      <div className="font-bold text-stone-900">{farmer}</div>
                      <div className="text-[11px] text-stone-600">PM-KISAN: UP-2024-889123</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">NET WEIGHT / HARVEST</div>
                      <div className="font-bold text-stone-900">{quantityKg} KG · {harvestDate}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-stone-900 pt-2.5 flex items-center justify-between text-[10px] text-stone-600 font-mono">
                  <span>DISPATCH: {origin}</span>
                  <span>DESTINATION: {destination}</span>
                </div>

                <div className="text-center text-[10px] font-bold text-stone-500 bg-stone-100 py-1 rounded">
                  SCAN QR FOR IOT COLD-CHAIN TELEMATICS & TRUST PASSPORT
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{isHindi ? 'सत्यापित डिजिटल उत्पाद पासपोर्ट' : 'Verified Digital Product Passport'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close Passport'}
          </button>
        </div>

      </div>
    </div>
  );
};
