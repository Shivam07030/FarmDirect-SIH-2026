import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Play, 
  RefreshCw,
  TrendingUp,
  Truck,
  Layers,
  ExternalLink
} from 'lucide-react';

export const JudgeDemoModal: React.FC = () => {
  const { 
    showJudgeGuide, 
    setShowJudgeGuide, 
    setRole, 
    setCurrentView, 
    addProduct, 
    placeOrder, 
    resetDemoData, 
    products, 
    orders 
  } = useApp();

  const [activeStep, setActiveStep] = useState(1);

  if (!showJudgeGuide) return null;

  const steps = [
    {
      num: 1,
      title: 'Continue as Farmer',
      desc: 'Set role to Farmer and open the Farmer Dashboard to monitor produce, recent orders, and earnings.',
      actionLabel: 'Switch to Farmer View',
      action: () => {
        setRole('FARMER');
        setCurrentView('farmer');
      },
      check: true,
    },
    {
      num: 2,
      title: 'Farmer Adds Produce',
      desc: 'Farmer lists 500 kg Tomato at ₹24/kg located in Agra. Grade A (Premium).',
      actionLabel: 'Auto-Add Demo Produce (500kg Tomato @ ₹24/kg)',
      action: () => {
        setRole('FARMER');
        setCurrentView('farmer');
        addProduct({
          name: 'Fresh Farm Tomato (Sikandra Hybrid)',
          category: 'Vegetables',
          quantity: 500,
          initialQuantity: 500,
          pricePerKg: 24,
          location: 'Agra',
          harvestDate: '2026-09-06',
          quality: 'Grade A (Premium)',
          farmerName: 'Rajesh Kumar (You)',
          farmerPhone: '+91 98765 43210',
          description: 'Direct harvest from Sikandra, Agra farm. Plump, deep-red, firm skin.',
        });
      },
      check: products.some(p => p.name.includes('Tomato') && p.location === 'Agra'),
    },
    {
      num: 3,
      title: 'Switch to Buyer',
      desc: 'Switch role to Buyer to browse live regional farm produce without mandi intermediaries.',
      actionLabel: 'Switch to Buyer View',
      action: () => {
        setRole('BUYER');
        setCurrentView('marketplace');
      },
      check: true,
    },
    {
      num: 4,
      title: 'View Tomatoes in Marketplace',
      desc: 'Buyer finds the freshly listed Agra Tomato batch with full price, farmer identity & quality transparency.',
      actionLabel: 'Browse Marketplace',
      action: () => {
        setRole('BUYER');
        setCurrentView('marketplace');
      },
      check: true,
    },
    {
      num: 5,
      title: 'Buyer Purchases 100 kg',
      desc: 'Buyer executes a direct purchase of 100 kg of Tomato from Rajesh Kumar (Agra) for delivery to Delhi.',
      actionLabel: '1-Click Place 100kg Order',
      action: () => {
        const tomatoProd = products.find(p => p.name.toLowerCase().includes('tomato')) || products[0];
        if (tomatoProd) {
          placeOrder({
            productId: tomatoProd.id,
            quantity: 100,
            deliveryLocation: 'Delhi (Azadpur Mandi Hub)',
            buyerName: 'FreshBasket Supermarket (Delhi)',
          });
          setRole('BUYER');
          setCurrentView('orders');
        }
      },
      check: orders.length > 3,
    },
    {
      num: 6,
      title: 'Show Order Confirmation',
      desc: 'Transparent order receipt generated with direct produce price (₹2,400) + pooled logistics fee (₹220).',
      actionLabel: 'View Buyer Orders',
      action: () => {
        setRole('BUYER');
        setCurrentView('orders');
      },
      check: true,
    },
    {
      num: 7,
      title: 'Switch to Farmer & Verify Stats',
      desc: 'Switch back to Farmer dashboard to see active order received and real-time updated earnings in INR.',
      actionLabel: 'Return to Farmer Dashboard',
      action: () => {
        setRole('FARMER');
        setCurrentView('farmer');
      },
      check: true,
    },
    {
      num: 8,
      title: 'AI Demand Forecast',
      desc: 'Open the AI Demand Forecast engine showing tomato demand rising +18.75% and regional planting recommendations.',
      actionLabel: 'Inspect AI Demand Forecast',
      action: () => {
        setCurrentView('demand-forecast');
      },
      check: true,
    },
    {
      num: 9,
      title: 'Logistics Route Optimization',
      desc: 'Open Logistics Dashboard to compare disjointed 310 km (₹5,800) vs pooled milk-run 245 km (₹4,400) saving ₹1,400.',
      actionLabel: 'Inspect Route Optimization',
      action: () => {
        setCurrentView('logistics');
      },
      check: true,
    },
    {
      num: 10,
      title: 'Final Economic Impact',
      desc: 'Examine Price Transparency & Admin metrics: Farmer +₹6/kg (+33%), Consumer saves ₹5/kg (-15%), 0 middlemen.',
      actionLabel: 'View Price Transparency & Impact',
      action: () => {
        setCurrentView('price-transparency');
      },
      check: true,
    },
  ];

  const currentStepObj = steps[activeStep - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">SIH Judge Demo Walkthrough</h3>
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/20">
                  ID: 26033
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Step-by-step test script to demonstrate the full end-to-end MVP flow
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowJudgeGuide(false)}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>Step {activeStep} of {steps.length}</span>
            <span className="text-emerald-700 font-bold">{Math.round((activeStep / steps.length) * 100)}% Complete</span>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {steps.map((s) => (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`h-2 rounded-full transition-all ${
                  s.num === activeStep
                    ? 'bg-emerald-600 ring-2 ring-emerald-300'
                    : s.num < activeStep
                    ? 'bg-emerald-400'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Step ${s.num}: ${s.title}`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 text-lg border border-emerald-200">
              {currentStepObj.num}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {currentStepObj.title}
                {currentStepObj.check && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                )}
              </h4>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {currentStepObj.desc}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recommended Action for this Step:
            </div>
            <button
              onClick={() => {
                currentStepObj.action();
                if (activeStep < steps.length) {
                  setActiveStep(prev => prev + 1);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all hover:shadow"
            >
              <Play className="w-4 h-4 fill-current" />
              {currentStepObj.actionLabel}
            </button>
          </div>

          {/* Quick Step Matrix */}
          <div className="space-y-1.5 pt-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Full Hackathon Script Overview:
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {steps.map((s) => (
                <div
                  key={s.num}
                  onClick={() => setActiveStep(s.num)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    s.num === activeStep 
                      ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      s.num === activeStep ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {s.num}
                    </span>
                    <span>{s.title}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={resetDemoData}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-300 hover:bg-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>

          <div className="flex items-center gap-2">
            <button
              disabled={activeStep === 1}
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              disabled={activeStep === steps.length}
              onClick={() => setActiveStep(prev => Math.min(steps.length, prev + 1))}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next Step
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
