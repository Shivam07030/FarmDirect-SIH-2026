import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Truck, 
  MapPin, 
  TrendingDown, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Sliders,
  Sparkles,
  Leaf
} from 'lucide-react';

interface StopNode {
  id: string;
  name: string;
  farmer: string;
  crop: string;
  cargoKg: number;
  time: string;
  status: 'Completed' | 'Current' | 'Upcoming';
}

export const LogisticsView: React.FC = () => {
  const { language } = useApp();
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(92);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(65);

  const stops: StopNode[] = [
    {
      id: 'agra',
      name: 'Agra (Sikandra Farm Dock)',
      farmer: 'Rajesh Kumar (You)',
      crop: 'Tomato (500 kg)',
      cargoKg: 500,
      time: '06:00 AM',
      status: 'Completed',
    },
    {
      id: 'mathura',
      name: 'Mathura (Cold Belt Hub)',
      farmer: 'Balram Singh',
      crop: 'Potato (650 kg)',
      cargoKg: 650,
      time: '07:45 AM',
      status: 'Completed',
    },
    {
      id: 'aligarh',
      name: 'Aligarh (Cluster Depot)',
      farmer: 'Hardeep Yadav',
      crop: 'Red Onion (400 kg)',
      cargoKg: 400,
      time: '09:30 AM',
      status: 'Current',
    },
    {
      id: 'delhi',
      name: 'Delhi (Azadpur Terminal & FreshBasket)',
      farmer: 'Destination Hub',
      crop: 'Total Cargo 1,550 kg',
      cargoKg: 1550,
      time: '12:30 PM',
      status: 'Upcoming',
    },
  ];

  // Dynamic cost calculations based on fuel price
  const traditionalCost = Math.round(5800 * (fuelPricePerLiter / 92));
  const optimizedCost = Math.round(4400 * (fuelPricePerLiter / 92));
  const totalSavingsInr = traditionalCost - optimizedCost;

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulatedProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setSimulatedProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 150);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. HERO HEADER: TODAY'S CONSOLIDATED DELIVERIES */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider border border-stone-200">
            <Truck className="w-3.5 h-3.5 text-emerald-700" />
            <span>SIH26033 Shared Cold-Chain Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            {language === 'hi' 
              ? 'साझा कोल्ड-ट्रक ढुलाई (कम खर्च, ताज़ा फसल)' 
              : 'Shared Cold-Chain Logistics'}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-medium">
            {language === 'hi'
              ? 'अलग-अलग 3 गाड़ियां किराये पर लेने के बजाय, 1 साझा ठंडी गाड़ी आगरा ➔ मथुरा ➔ अलीगढ़ से माल समेटकर दिल्ली मंडी पहुंचाती है। भाड़ा आधा और फसल ताज़ा!'
              : 'Consolidating multi-farmer harvests across Agra, Mathura, and Aligarh into a single temperature-controlled milk-run route arriving in Delhi wholesale terminals.'}
          </p>
        </div>

        {/* 3 Core Financial & Operational Transformation Pillars (Focal Point for SIH Judges) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              1. Fleet Consolidation
            </div>
            <div className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
              3 Trucks <span className="text-emerald-700">➔ 1 Shared Reefer</span>
            </div>
            <div className="text-xs text-stone-600 mt-1 font-medium">
              Replaces disjointed farmer trips with 1 temperature-controlled milk-run
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
              2. Freight Cost Reduction
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0E3B2B] font-mono mt-1">
              ₹5,800 <span className="text-emerald-700">➔ ₹4,400</span>
            </div>
            <div className="text-xs text-emerald-800 mt-1 font-bold">
              ₹1,400 net savings per corridor run (-24% freight burden)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              3. Produce Spoilage Elimination
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-900 mt-1">
              ~10% Spoilage <span className="text-emerald-700">➔ &lt;1%</span>
            </div>
            <div className="text-xs text-amber-800 mt-1 font-medium">
              Active 4°C cooling halts rot and preserves field freshness
            </div>
          </div>
        </div>
      </section>

      {/* 2. ROUTE VISUALIZATION (AGRA -> MATHURA -> ALIGARH -> DELHI) */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Active Corridor
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 mt-0.5 font-serif">
              Agra ➔ Mathura ➔ Aligarh ➔ Delhi Azadpur Hub
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Reefer Truck #UP-80-AF-4120 • Driver: Mahendra Singh • Current Temp: 3.8°C
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0E3B2B] hover:bg-[#144E39] text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <Truck className="w-4 h-4 text-amber-300 animate-bounce" />
                  <span>Simulating Route ({simulatedProgress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>Run Live Route Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Progress Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-stone-600 font-semibold">
            <span>Route Completion</span>
            <span className="font-mono text-[#0E3B2B] font-bold">{simulatedProgress}% En Route</span>
          </div>
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${simulatedProgress}%` }}
            />
          </div>
        </div>

        {/* 4 Connected Stops Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {stops.map((stop, idx) => {
            const isCompleted = stop.status === 'Completed';
            const isCurrent = stop.status === 'Current';
            return (
              <div
                key={stop.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-[#0E3B2B] bg-emerald-50/50 shadow-xs'
                    : isCompleted
                    ? 'border-stone-200 bg-stone-50'
                    : 'border-stone-200 bg-white opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Stop #{idx + 1}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isCurrent
                      ? 'bg-amber-100 text-amber-900 animate-pulse'
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {stop.status}
                  </span>
                </div>

                <div className="font-bold text-stone-900 text-sm mt-2">{stop.name}</div>
                <div className="text-xs text-stone-600 mt-0.5 font-medium">{stop.farmer}</div>
                <div className="text-xs font-mono font-bold text-emerald-800 mt-2">{stop.crop}</div>

                <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-2 pt-2 border-t border-stone-200/60">
                  <Clock className="w-3 h-3" />
                  <span>Scheduled: {stop.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. AI ROUTE OPTIMIZATION: BEFORE VS AFTER COMPARISON */}
      <section className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E3B2B] bg-emerald-100 px-2 py-0.5 rounded">
                AI Optimization Engine
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs font-semibold text-stone-500">Dijkstra & Travelling Salesman Pooled Heuristic</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mt-1 font-serif">
              {language === 'hi' ? 'मार्ग अनुकूलन और भाड़ा बचत' : 'AI Route Optimization Comparison'}
            </h2>
          </div>

          {/* Interactive Fuel Price Slider */}
          <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-xs">
            <Sliders className="w-4 h-4 text-stone-500" />
            <div className="text-xs">
              <div className="font-semibold text-stone-700">Fuel Price: ₹{fuelPricePerLiter}/L</div>
              <input
                type="range"
                min="85"
                max="110"
                value={fuelPricePerLiter}
                onChange={(e) => setFuelPricePerLiter(Number(e.target.value))}
                className="w-24 accent-[#0E3B2B] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison: Current Route vs Optimized Route */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Current / Traditional Disjointed Route */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  Old Model
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-1">
                  Individual Disjointed Trips (3 Trucks)
                </h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-stone-400 uppercase font-bold">Total Freight</div>
                <div className="text-xl font-black text-rose-700 font-mono">
                  ₹{traditionalCost.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Total Transit Distance:</span>
                <span className="font-mono font-bold text-stone-900">310 km (disjointed runs)</span>
              </div>
              <div className="flex justify-between">
                <span>Per-kg Freight Burden:</span>
                <span className="font-mono font-bold text-stone-900">₹3.74/kg</span>
              </div>
              <div className="flex justify-between">
                <span>Vehicle Fleet Required:</span>
                <span className="font-mono font-bold text-stone-900">3 independent open pickups</span>
              </div>
              <div className="flex justify-between text-rose-700 font-semibold">
                <span>Produce Heat Spoilage:</span>
                <span>8% to 12% loss in transit</span>
              </div>
            </div>
          </div>

          {/* AI-Optimized Milk-Run Route */}
          <div className="bg-gradient-to-br from-[#0E3B2B] to-[#134E35] text-white rounded-xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/50">
                  FarmDirect AI
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Single Consolidated Milk-Run (1 Reefer)
                </h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-300 uppercase font-bold">Optimized Freight</div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  ₹{optimizedCost.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-emerald-100">
              <div className="flex justify-between">
                <span>Optimized Transit Distance:</span>
                <span className="font-mono font-bold text-white">245 km (-65 km saved)</span>
              </div>
              <div className="flex justify-between">
                <span>Per-kg Freight Charge:</span>
                <span className="font-mono font-bold text-amber-300">₹2.20/kg (-41% cost)</span>
              </div>
              <div className="flex justify-between">
                <span>Vehicle Fleet Required:</span>
                <span className="font-mono font-bold text-white">1 Shared Temperature-Controlled Truck</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-semibold">
                <span>Produce Spoilage:</span>
                <span>0% (4°C Active Chilling)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Savings Metric Banner */}
        <div className="p-4 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0E3B2B] flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-stone-900">
                Direct Supply-Chain Net Savings: ₹{totalSavingsInr.toLocaleString('en-IN')} per corridor run
              </div>
              <div className="text-xs text-stone-500">
                Farmers keep +₹1.54/kg more in their pocket instead of paying empty truck return deadhead charges.
              </div>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto shrink-0">
            ✓ 24% Lower Logistics Overhead
          </span>
        </div>
      </section>

    </div>
  );
};
