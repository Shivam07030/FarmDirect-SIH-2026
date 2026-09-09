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
  Truck,
  ShoppingBag,
  Store
} from 'lucide-react';
import { Order, TicketCategory } from '../types';
import { useApp } from '../context/AppContext';

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
  const { marketRules, applyDemurrageFee, showToast } = useApp();
  const [ivrSent, setIvrSent] = useState(false);
  const [demurrageApplied, setDemurrageApplied] = useState(false);
  const [salvageInitiated, setSalvageInitiated] = useState(false);

  if (!isOpen) return null;

  // Determine buyer tier dynamically (Retail household 2kg vs Wholesale commercial batch)
  const isRetail = order.buyerTier === 'RETAIL' || (order.quantity <= (marketRules?.retailMaxQtyKg || 5));
  
  // Dynamic parameters governed by Admin MarketRules
  const demurrageRate = isRetail
    ? (marketRules?.retailDemurragePerHour ?? 25)
    : (marketRules?.wholesaleDemurragePerHour ?? 150);
  const graceMinutes = marketRules?.demurrageGraceMinutes ?? 30;
  const salvageTimeoutMinutes = marketRules?.salvageRerouteTimeoutMinutes ?? 90;

  // Telematics & Driver Profiles based on delivery mode
  const driverName = isRetail ? 'Amit Kumar' : 'Ramesh Singh';
  const driverRole = isRetail ? 'Local EV Delivery Partner' : 'Cold-Chain Reefer Transporter';
  const vehicleNo = isRetail ? 'DL-04-EV-2026' : 'HR-38-9901';
  const vehicleType = isRetail ? 'Electric Cargo 2-Wheeler' : '4-Ton Refrigerated Reefer Truck';
  const buyerPhone = '+91 98765 43210';
  const buyerName = order.buyerName || (isRetail ? 'Household Resident' : 'Commercial Buyer Enterprise');
  const destination = order.deliveryLocation || (isRetail ? 'Flat / Residence Doorstep' : 'Delhi Terminal Warehouse');

  // Elapsed demonstration progress
  const elapsedMinutes = Math.min(graceMinutes, Math.round(graceMinutes * 0.8));
  const progressPercent = Math.min(100, Math.round((elapsedMinutes / graceMinutes) * 100));

  const handleSendIvr = () => {
    setIvrSent(true);
    showToast(
      'info',
      'Urgent Call & SMS Sent',
      `Automated high-priority call and delivery siren SMS dispatched to ${buyerPhone}.`
    );
  };

  const handleApplyDemurrage = () => {
    setDemurrageApplied(true);
    applyDemurrageFee(order.id, demurrageRate, isRetail);
  };

  const handleInitiateSalvage = () => {
    setSalvageInitiated(true);
    showToast(
      'warning',
      isRetail ? 'Salvage: Returning to Hub' : 'Salvage: APMC Re-Route Triggered',
      isRetail
        ? `Order safely returning to local cold-storage micro-hub. 100% farmer payment guaranteed from locked escrow.`
        : `Truck GPS routed to Azadpur Mandi (Modal rate ₹24/kg). 100% farmer payout secured.`
    );
  };

  const handleRaiseTicket = () => {
    if (onOpenDispute) {
      onOpenDispute(
        order.id,
        isRetail
          ? `Delivery Partner Delay Alert: Household buyer unresponsive at doorstep (${destination})`
          : `Driver Detention Alert: Commercial buyer unresponsive at unloading bay (${destination})`,
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
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isRetail 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              {isRetail ? <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" /> : <Clock className="w-3.5 h-3.5 text-amber-700" />}
              <span>
                {isHindi 
                  ? (isRetail ? 'घरेलू डिलीवरी प्रतीक्षा प्रोटोकॉल (2 kg लॉट)' : 'ड्राइवर व लॉजिस्टिक्स सुरक्षा प्रोटोकॉल')
                  : (isRetail ? 'Doorstep Waiting Protocol · Normal Household Buyer' : 'Driver & Logistics Reefer Detention Protocol')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 font-serif">
              {isHindi 
                ? (isRetail ? 'ग्राहक पते/गेट पर अनुपलब्ध?' : 'डिलीवरी गेट पर खरीदार अनुपलब्ध?') 
                : (isRetail ? 'Household Buyer Unresponsive at Doorstep' : 'Buyer Unresponsive at Delivery Point')}
            </h2>
            <p className="text-xs text-stone-500">
              {isHindi 
                ? (isRetail 
                    ? `घरेलू डिलीवरी सुरक्षा: ₹${demurrageRate}/घंटा की उचित प्रतीक्षा दर एवं डार्कस्टोर सुरक्षा नियम` 
                    : `पेरिशेबल कोल्ड-चेन सुरक्षा: ₹${demurrageRate}/घंटा रीफर डिमरेज व मंडी सुरक्षा नियम`)
                : (isRetail 
                    ? `Household EV/Bike Delivery Protection: Fair micro-waiting charge of ₹${demurrageRate}/hr (never overcharged).` 
                    : `Perishable Reefer Protection: Automated ₹${demurrageRate}/hr demurrage & APMC emergency salvage protocol.`)}
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
        <div className={`p-3.5 rounded-xl space-y-1.5 text-xs border ${
          isRetail 
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-blue-50/60 border-blue-200'
        }`}>
          <div className="flex items-center justify-between font-semibold">
            <span className={`flex items-center gap-1.5 font-bold ${isRetail ? 'text-emerald-900' : 'text-blue-900'}`}>
              <MapPin className={`w-4 h-4 shrink-0 ${isRetail ? 'text-emerald-700' : 'text-blue-700'}`} />
              <span>{isHindi ? 'जीपीएस आगमन सत्यापित (35 मीटर के भीतर)' : 'GPS Arrival Confirmed (Within 35m of Gate)'}</span>
            </span>
            <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${
              isRetail ? 'bg-emerald-100/80 text-emerald-800' : 'bg-blue-100/80 text-blue-800'
            }`}>
              {isHindi ? 'आज 3:45 PM दर्ज' : 'Logged Today · 3:45 PM'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1 border-t border-stone-200/50">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">
                {isHindi ? 'वाहन व डिलीवरी पार्टनर' : 'Vehicle & Delivery Partner'}
              </span>
              <span className="font-medium text-stone-800">{driverName} ({vehicleNo})</span>
              <span className="text-[10px] text-stone-500 block">{vehicleType}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">
                {isHindi ? 'खरीदार संपर्क व मात्रा' : 'Buyer Contact & Lot'}
              </span>
              <span className="font-mono font-medium text-stone-800">{buyerName}</span>
              <span className="text-[10px] text-stone-500 block font-mono">{buyerPhone} · {order.quantity} kg</span>
            </div>
          </div>
        </div>

        {/* Dynamic Grace Period & Demurrage Timer Card */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isRetail ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="font-bold text-stone-900">
                {isHindi ? 'मुफ्त ग्रेस विंडो स्थिति' : 'Unloading Grace Window Status'}
              </span>
            </div>
            <span className={`font-mono font-bold px-2 py-0.5 rounded ${
              isRetail ? 'text-emerald-800 bg-emerald-100/70' : 'text-amber-800 bg-amber-100/70'
            }`}>
              {elapsedMinutes} mins elapsed / {graceMinutes} mins grace
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all ${isRetail ? 'bg-emerald-600' : 'bg-amber-500'}`} 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>

          <div className={`p-3 rounded-lg text-xs space-y-1 border ${
            isRetail 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 shrink-0" />
                <span>
                  ₹{demurrageRate} / Hour {isRetail ? 'Household Waiting Fee' : 'Reefer Detention Surcharge (Demurrage)'}
                </span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 border border-stone-200 text-stone-700">
                Admin Governed
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {isHindi
                ? (isRetail
                    ? `${graceMinutes} मिनट की मुफ्त प्रतीक्षा अवधि समाप्त होने के बाद, डिलीवरी बॉय के समय का उचित ₹${demurrageRate}/घंटा शुल्क खरीदार के लॉक्ड एस्क्रो से सीधे डेबिट होता है। (2 kg छोटे ऑर्डर पर कोई अनुचित भारी शुल्क नहीं)`
                    : `${graceMinutes} मिनट की मुफ्त प्रतीक्षा अवधि समाप्त होने के बाद, कोल्ड-चेन डीजल और ड्राइवर के समय का ₹${demurrageRate}/घंटा शुल्क खरीदार के लॉक्ड एस्क्रो से सीधे डेबिट होकर किसान व ट्रांसपोर्टर को दिया जाता है।`)
                : (isRetail
                    ? `After ${graceMinutes} mins grace, fair ₹${demurrageRate}/hr micro-fee is auto-debited from Buyer’s locked escrow to compensate the delivery partner's idle time without unfairly penalizing small 2 kg orders.`
                    : `After ${graceMinutes} mins grace, ₹${demurrageRate}/hr detention fee is auto-debited from Buyer’s locked escrow to reimburse reefer diesel & driver idle time.`)}
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
                  {demurrageApplied 
                    ? `₹${demurrageRate} Fee Debited to Escrow ✓` 
                    : `Log ₹${demurrageRate} ${isRetail ? 'Waiting' : 'Demurrage'} Fee`}
                </div>
                <div className="text-[11px] text-stone-500">
                  {demurrageApplied 
                    ? 'Added to transporter/delivery settlement ledger.'
                    : `Charge 1 hour ${isRetail ? 'doorstep waiting' : 'reefer waiting'} fee to buyer escrow.`}
                </div>
              </div>
            </button>
          </div>

          {/* Action 3: Emergency Mandi Re-Routing / Darkstore Salvage */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            salvageInitiated
              ? 'bg-purple-50 border-purple-200 text-purple-950'
              : 'bg-white border-stone-200'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  {isRetail ? <Store className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-stone-900">
                    {salvageInitiated 
                      ? (isRetail ? 'Returned to Micro-Hub · Produce Protected ✓' : 'Re-Routed to Azadpur Mandi · Produce Protected ✓') 
                      : (isRetail ? 'Perishable Darkstore Return (Micro-Hub Salvage)' : 'Perishable Emergency Salvage (APMC Re-Route)')}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {salvageInitiated
                      ? (isRetail
                          ? 'Package safely redirected to nearest local cold-storage micro-hub. 100% farmer payment secured from locked escrow.'
                          : 'Truck GPS navigation updated to Azadpur APMC (Wholesale modal ₹24/kg). 100% farmer payment secured from locked escrow.')
                      : (isRetail
                          ? `If household buyer defaults (>${salvageTimeoutMinutes}m), package safely returns to local darkstore hub. Zero crop rot.`
                          : `If commercial buyer defaults completely (>${salvageTimeoutMinutes}m), truck dynamically redirects to nearest wholesale Mandi. Zero crop rot.`)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInitiateSalvage}
                disabled={salvageInitiated}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer disabled:opacity-50"
              >
                {salvageInitiated ? (isRetail ? 'Returned to Hub' : 'En Route to Mandi') : (isRetail ? 'Return to Hub' : 'Re-Route Truck')}
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
