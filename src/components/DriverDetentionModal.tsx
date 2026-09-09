import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  PhoneCall,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileText,
  IndianRupee,
  CheckCircle2,
  BellRing,
  Truck
} from 'lucide-react';
import { Order, TicketCategory } from '../types';

interface DriverDetentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  isHindi?: boolean;
  onOpenDispute?: (orderId: string, subject: string, category: TicketCategory) => void;
}

export const DriverDetentionModal: React.FC<DriverDetentionModalProps> = ({
  isOpen,
  onClose,
  order,
  isHindi = false,
  onOpenDispute
}) => {
  const [ivrSent, setIvrSent] = useState(false);
  const [demurrageApplied, setDemurrageApplied] = useState(false);
  const [salvageInitiated, setSalvageInitiated] = useState(false);

  if (!isOpen) return null;

  const driverName = 'Ramesh Singh';
  const vehicleNo = 'HR-38-9901';
  const buyerPhone = '+91 98765 43210';
  const buyerName = order.buyerName || 'Buyer Enterprise';
  const destination = order.deliveryLocation || 'Delhi Terminal';

  const handleSendIvr = () => {
    setIvrSent(true);
  };

  const handleApplyDemurrage = () => {
    setDemurrageApplied(true);
  };

  const handleInitiateSalvage = () => {
    setSalvageInitiated(true);
  };

  const handleRaiseTicket = () => {
    if (onOpenDispute) {
      onOpenDispute(
        order.id,
        `Driver Detention Alert: Buyer unresponsive at drop (${destination})`,
        'BUYER_UNRESPONSIVE'
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{isHindi ? 'ड्राइवर व लॉजिस्टिक्स सुरक्षा प्रोटोकॉल' : 'Driver & Logistics Detention Protocol'}</span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 font-serif">
              {isHindi ? 'डिलीवरी गेट पर खरीदार अनुपलब्ध?' : 'Buyer Unresponsive at Delivery Point'}
            </h2>
            <p className="text-xs text-stone-500">
              {isHindi 
                ? 'पेरिशेबल कोल्ड-चेन सुरक्षा: ड्राइवर को अनलोडिंग के लिए प्रतीक्षा कराने पर डिमरेज व मंडी सुरक्षा नियम'
                : 'Perishable Reefer Protection: Automated demurrage & emergency salvage protocol for delayed unloading.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Geo-Fence Arrival Verification */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-semibold text-emerald-900">
            <span className="flex items-center gap-1.5 font-bold">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{isHindi ? 'जीपीएस आगमन सत्यापित (35 मीटर के भीतर)' : 'GPS Arrival Confirmed (Within 35m of Gate)'}</span>
            </span>
            <span className="font-mono text-[11px] bg-emerald-100/80 px-2 py-0.5 rounded text-emerald-800">
              {isHindi ? 'आज 3:45 PM दर्ज' : 'Logged Today · 3:45 PM'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1 border-t border-emerald-200/60">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">{isHindi ? 'वाहन व ड्राइवर' : 'Vehicle & Driver'}</span>
              <span className="font-medium text-stone-800">{driverName} ({vehicleNo})</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">{isHindi ? 'खरीदार संपर्क' : 'Buyer Contact'}</span>
              <span className="font-mono font-medium text-stone-800">{buyerName} · {buyerPhone}</span>
            </div>
          </div>
        </div>

        {/* 30-Minute Grace Period & Demurrage Timer Card */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-bold text-stone-900">
                {isHindi ? 'अनलोडिंग ग्रेस विंडो स्थिति' : 'Unloading Grace Window Status'}
              </span>
            </div>
            <span className="font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
              24 mins elapsed / 30 mins grace
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: '80%' }} />
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-950">
            <div className="flex items-center gap-1.5 font-bold">
              <IndianRupee className="w-4 h-4 text-amber-700 shrink-0" />
              <span>₹150 / Hour Reefer Detention Surcharge (Demurrage)</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              {isHindi
                ? '30 मिनट की मुफ्त प्रतीक्षा अवधि समाप्त होने के बाद, कोल्ड-चेन डीजल और ड्राइवर के समय का शुल्क खरीदार के लॉक्ड एस्क्रो से सीधे डेबिट होकर किसान व ट्रांसपोर्टर को दिया जाता है।'
                : 'After 30 mins grace, ₹150/hr detention fee is auto-debited from Buyer’s locked escrow to reimburse reefer diesel & driver idle time.'}
            </p>
          </div>
        </div>

        {/* Action Triggers Grid */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {isHindi ? 'त्वरित ड्राइवर व एस्क्रो कार्रवाई' : 'Live Driver & Transporter Escalation Actions'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Action 1: Send IVR Alert */}
            <button
              type="button"
              onClick={handleSendIvr}
              disabled={ivrSent}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                ivrSent 
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-white border-stone-200 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                <BellRing className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-stone-900">
                  {ivrSent ? 'IVR Alert Dispatched ✓' : 'Dispatch Urgent IVR & SMS'}
                </div>
                <div className="text-[11px] text-stone-500">
                  {ivrSent 
                    ? 'High-priority voice call & siren SMS sent to buyer phone.'
                    : 'Triggers automated high-priority voice call to buyer.'}
                </div>
              </div>
            </button>

            {/* Action 2: Apply Demurrage */}
            <button
              type="button"
              onClick={handleApplyDemurrage}
              disabled={demurrageApplied}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                demurrageApplied 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-stone-900">
                  {demurrageApplied ? '₹150 Fee Debited to Escrow ✓' : 'Log ₹150 Demurrage Fee'}
                </div>
                <div className="text-[11px] text-stone-500">
                  {demurrageApplied 
                    ? 'Added to transporter settlement ledger.'
                    : 'Charge 1 hour reefer waiting fee to buyer escrow.'}
                </div>
              </div>
            </button>
          </div>

          {/* Action 3: Emergency Mandi Re-Routing */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            salvageInitiated
              ? 'bg-purple-50 border-purple-200 text-purple-950'
              : 'bg-white border-stone-200'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-stone-900">
                    {salvageInitiated 
                      ? 'Re-Routed to Azadpur Mandi · Produce Protected ✓' 
                      : 'Perishable Emergency Salvage (APMC Re-Route)'}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {salvageInitiated
                      ? 'Truck GPS navigation updated to Azadpur APMC (Wholesale modal ₹24/kg). 100% farmer payment secured from locked escrow.'
                      : 'If buyer defaults completely (>90m), truck dynamically redirects to nearest wholesale Mandi. Zero crop rot.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInitiateSalvage}
                disabled={salvageInitiated}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer disabled:opacity-50"
              >
                {salvageInitiated ? 'En Route to Mandi' : 'Re-Route Truck'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={handleRaiseTicket}
            className="text-rose-700 hover:text-rose-900 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isHindi ? 'अनउत्तरदायी खरीदार टिकट दर्ज करें' : 'Raise Formal Driver Non-Delivery Ticket →'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl cursor-pointer"
          >
            {isHindi ? 'वापस जाएं' : 'Return to Tracker'}
          </button>
        </div>

      </div>
    </div>
  );
};
