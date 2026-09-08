import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Thermometer, 
  Phone, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles, 
  Package, 
  Navigation,
  RotateCcw,
  MessageSquare,
  LifeBuoy,
  Star
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { GrievanceModal } from './GrievanceModal';
import { RatingModal } from './RatingModal';
import { releaseCashfreePayoutApi } from '../services/api';

interface OrderTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  viewerRole: 'FARMER' | 'BUYER';
  onUpdateStatus?: (orderId: string, nextStatus: OrderStatus) => void;
  isHindi?: boolean;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
  viewerRole,
  onUpdateStatus,
  isHindi = false,
}) => {
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [selectedSimStage, setSelectedSimStage] = useState<OrderStatus | null>(null);
  const [isGrievanceOpen, setIsGrievanceOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  if (!isOpen || !order) return null;

  // Fallback defaults for telematics if not directly present
  const isRetail = order.buyerTier === 'RETAIL' || order.quantity <= 2;
  const vehicleNo = order.vehicleNumber || (isRetail ? 'DL-8S-9012 (EV City Van)' : 'DL-1L-4482 (Reefer Cold Chain)');
  const driverName = order.driverName || (isRetail ? 'Amit Verma' : 'Manpreet Singh');
  const driverPhone = order.driverPhone || '+91 98112 34567';
  const temperature = order.temperatureCelsius ?? (isRetail ? 8.5 : 4.2);
  const deliveryOtp = order.deliveryOtp || '4829';
  const originLocation = order.pickupLocation || `${order.farmerName} Farm, Agra Cluster`;
  const destination = order.deliveryLocation || 'Delhi Terminal Hub';

  // Determine stage progression index (0 to 5)
  // Stages:
  // 0: Order Placed & Escrow Secured
  // 1: Driver & Vehicle Assigned
  // 2: Farm-Gate Pickup Done
  // 3: In Transit (Cold-Chain)
  // 4: Out for Delivery
  // 5: Delivered & Payment Released
  let activeStepIndex = 1;
  if (order.status === 'Pending') activeStepIndex = 0;
  else if (order.status === 'Confirmed') activeStepIndex = 1;
  else if (order.status === 'In Transit') activeStepIndex = 3;
  else if (order.status === 'Delivered') activeStepIndex = 5;

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(deliveryOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleAdvanceStatus = (newStatus: OrderStatus) => {
    if (newStatus === 'Delivered') {
      releaseCashfreePayoutApi({
        orderId: order.id,
        amount: order.totalPrice,
        farmerName: order.farmerName
      }).catch(() => {});
    }
    if (onUpdateStatus) {
      onUpdateStatus(order.id, newStatus);
    }
  };

  const steps = [
    {
      title: isHindi ? 'ऑर्डर दर्ज व एस्क्रो सुरक्षित' : 'Order Placed & Escrow Secured',
      subtitle: isHindi
        ? 'खरीदार का भुगतान डिजिटल एस्क्रो में सुरक्षित, किसान को सूचना भेजी गई'
        : 'Smart escrow lock verified. Produce lot reserved at farm gate.',
      time: order.orderDate || 'Today · 10:15 AM',
      isCompleted: activeStepIndex >= 0,
      isCurrent: activeStepIndex === 0,
    },
    {
      title: isHindi ? 'ड्राइवर और कोल्ड-चेन वाहन आवंटित' : 'Driver & Cold-Chain Reefer Assigned',
      subtitle: `${driverName} (${vehicleNo}) · ${isRetail ? 'Local EV Delivery' : '4°C Reefer Chilled'}`,
      time: isHindi ? 'आज · 10:35 AM' : 'Today · 10:35 AM',
      isCompleted: activeStepIndex >= 1,
      isCurrent: activeStepIndex === 1,
    },
    {
      title: isHindi ? 'फार्म-गेट पिकअप संपन्न' : 'Farm-Gate Pickup & Quality Check',
      subtitle: isHindi
        ? `${originLocation} से गुणवत्ता जांच के बाद लोड किया गया`
        : `Inspected & collected from ${originLocation}. 100% Grade A certified.`,
      time: isHindi ? 'आज · 11:30 AM' : 'Today · 11:30 AM',
      isCompleted: activeStepIndex >= 2,
      isCurrent: activeStepIndex === 2,
    },
    {
      title: isHindi ? 'मार्ग पर सक्रिय (कोल्ड-चेन सुरक्षित)' : 'In Transit via Cold-Chain Route',
      subtitle: isHindi
        ? `एक्सप्रेसवे से ट्रांजिट जारी · तापमान सेंसर ${temperature}°C बनाए हुए है`
        : `En route via Expressway · Active telematics maintaining ${temperature}°C`,
      time: isHindi ? 'आज · 1:45 PM' : 'Today · 1:45 PM',
      isCompleted: activeStepIndex >= 3,
      isCurrent: activeStepIndex === 3,
    },
    {
      title: isHindi ? 'डिलीवरी के लिए रवाना' : 'Out for Delivery',
      subtitle: isHindi
        ? `${destination} से 12 किमी दूर · शीघ्र ही पहुंचेगा`
        : `Vehicle is on final leg towards ${destination}. Prepare delivery OTP.`,
      time: isHindi ? 'अनुमानित आज · 3:45 PM' : 'Est. Today · 3:45 PM',
      isCompleted: activeStepIndex >= 4,
      isCurrent: activeStepIndex === 4,
    },
    {
      title: isHindi ? 'सफलतापूर्वक डिलीवर व भुगतान जारी' : 'Delivered & Escrow Released',
      subtitle: isHindi
        ? '4-अंकीय ओटीपी सत्यापित हुआ। किसान के खाते में तुरंत भुगतान भेजा गया।'
        : 'Handover verified via OTP. Instant payment credited directly to farmer account.',
      time: order.estimatedDelivery || (isHindi ? 'आज शाम 4:30 PM' : 'Today · 4:30 PM'),
      isCompleted: activeStepIndex >= 5,
      isCurrent: activeStepIndex === 5,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E3B2B] text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 font-serif">
                  {isHindi ? 'लाइव डिलीवरी ट्रैकिंग' : 'Live Delivery Tracking'}
                </h2>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                  {order.id}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {order.quantity} kg {order.productName} · {isHindi ? 'कुल' : 'Total'} ₹{order.finalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

          {/* Amazon-Style Headline Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${
            order.status === 'Delivered'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : order.status === 'In Transit'
              ? 'bg-amber-50/80 border-amber-300 text-amber-950'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-600'
                      : order.status === 'In Transit'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-blue-600'
                  }`} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {order.status === 'Delivered'
                      ? (isHindi ? 'डिलीवरी संपन्न' : 'Delivered')
                      : order.status === 'In Transit'
                      ? (isHindi ? 'मार्ग पर सक्रिय' : 'On the Way (Live)')
                      : (isHindi ? 'ऑर्डर की पुष्टि हुई' : 'Order Confirmed')}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif mt-1">
                  {order.status === 'Delivered'
                    ? (isHindi ? 'सफलतापूर्वक सुरक्षित डिलीवर किया गया' : 'Package Delivered Safely')
                    : (isHindi ? `अनुमानित आगमन: ${order.estimatedDelivery}` : `Arriving by ${order.estimatedDelivery}`)}
                </h3>
                <p className="text-xs mt-1 opacity-80">
                  {order.status === 'Delivered'
                    ? (isHindi ? 'डिजिटल पावती पर हस्ताक्षर हुआ और किसान को भुगतान जारी हुआ।' : 'Digital POD confirmed and farmer escrow settlement released.')
                    : (isHindi ? `वाहन ${vehicleNo} के माध्यम से सुरक्षित कोल्ड-चेन परिवहन।` : `Chilled transit monitored via IoT sensor (${temperature}°C).`)}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/80 border border-current">
                  {viewerRole === 'FARMER' ? (isHindi ? 'विक्रेता (किसान)' : 'Seller View') : (isHindi ? 'खरीदार (क्रेता)' : 'Buyer View')}
                </span>
              </div>
            </div>
          </div>

          {/* Amazon-Style Delivery Verification OTP Box */}
          <div className="bg-linear-to-r from-stone-900 to-stone-800 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-stone-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                    {isHindi ? 'वितरण सत्यापन ओटीपी' : 'Delivery Security OTP'}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    Amazon-Style Verification
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  {viewerRole === 'BUYER'
                    ? (isHindi 
                        ? 'सामान प्राप्त होने और गुणवत्ता जांच के बाद ही डिलीवरी पार्टनर को यह 4-अंकीय कोड बताएं।' 
                        : 'Share this 4-digit code with the delivery driver at your doorstep to confirm handover.')
                    : (isHindi
                        ? 'डिलीवरी पार्टनर गंतव्य पर माल सौंपने से पहले खरीदार से यह ओटीपी दर्ज करेगा।'
                        : 'Carrier will authenticate this OTP from buyer upon arrival before releasing the cargo.')}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-stone-950/70 px-4 py-2.5 rounded-xl border border-stone-700 self-start sm:self-auto">
                <div className="tracking-[0.35em] text-2xl sm:text-3xl font-mono font-black text-amber-300">
                  {deliveryOtp}
                </div>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Copy OTP"
                >
                  {copiedOtp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Telematics & Driver Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Driver Profile */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                  {isHindi ? 'निर्धारित वाहन व चालक' : 'Assigned Driver & Reefer'}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {isHindi ? 'सत्यापित ट्रांसपोर्टर' : 'Verified Transporter'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-base font-bold text-stone-700 font-serif">
                  {driverName.slice(0, 1)}
                </div>
                <div>
                  <div className="font-semibold text-stone-900 text-sm">{driverName}</div>
                  <div className="text-xs font-mono text-stone-500">{vehicleNo}</div>
                  <div className="text-[11px] text-stone-400">4.9 ★ · 1,420+ {isHindi ? 'सुरक्षित ट्रिप्स' : 'trips'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${driverPhone.replace(/\s+/g, '')}`}
                  className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isHindi ? 'कॉल करें' : 'Call Driver'}</span>
                </a>
                <a
                  href={`sms:${driverPhone.replace(/\s+/g, '')}`}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'मैसेज' : 'SMS'}</span>
                </a>
              </div>
            </div>

            {/* Cold-Chain IoT Chamber Telematics */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isHindi ? 'लाइव कोल्ड-चेन टेलीमैटिक्स' : 'Cold-Chain IoT Telematics'}</span>
                </span>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>Live GPS</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="text-[10px] text-blue-700 uppercase font-bold">
                    {isHindi ? 'चैम्बर तापमान' : 'Reefer Temp'}
                  </div>
                  <div className="text-xl font-mono font-bold text-blue-950 mt-0.5">
                    {temperature}°C
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    {isHindi ? 'मानक (2°-6°C) सुरक्षित' : 'Within Fresh Band'}
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[10px] text-stone-500 uppercase font-bold">
                    {isHindi ? 'आर्द्रता (Humidity)' : 'Chamber RH'}
                  </div>
                  <div className="text-xl font-mono font-bold text-stone-900 mt-0.5">
                    88%
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium mt-0.5">
                    {isHindi ? 'ताजगी संरक्षित' : 'Prevents Moisture Loss'}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 flex items-center justify-between pt-0.5">
                <span>{isHindi ? 'अपडेट अंतराल:' : 'IoT Refresh:'} 15s</span>
                <span className="text-stone-700 font-medium">
                  {isHindi ? 'कोल्ड-चेन सुरक्षा: 100%' : 'Cold-Chain Integrity: 100%'}
                </span>
              </div>
            </div>
          </div>

          {/* Simulated Route Waypoint Diagram */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-800" />
                <span>{isHindi ? 'एक्सप्रेसवे रूट व माइलस्टोन' : 'Expressway Transit Corridor'}</span>
              </span>
              <span className="text-xs font-mono font-medium text-stone-600">
                {order.distanceKm || 195} km · {order.durationText || '3h 50m'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 relative">
              {/* Origin */}
              <div className="space-y-1">
                <div className="w-7 h-7 mx-auto rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center border border-emerald-300 text-xs">
                  1
                </div>
                <div className="font-semibold text-stone-900 line-clamp-1">{originLocation}</div>
                <div className="text-[10px] text-stone-400">{isHindi ? 'फार्म पिकअप' : 'Farm Gate'}</div>
              </div>

              {/* Hub */}
              <div className="space-y-1">
                <div className="w-7 h-7 mx-auto rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center border border-blue-300 text-xs">
                  2
                </div>
                <div className="font-semibold text-stone-900 line-clamp-1">Mathura Logistics Hub</div>
                <div className="text-[10px] text-stone-400">{isHindi ? 'कोल्ड कंसॉलिडेशन' : 'Cross-Dock'}</div>
              </div>

              {/* Destination */}
              <div className="space-y-1">
                <div className="w-7 h-7 mx-auto rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center border border-amber-300 text-xs">
                  3
                </div>
                <div className="font-semibold text-stone-900 line-clamp-1">{destination}</div>
                <div className="text-[10px] text-stone-400">{isHindi ? 'अंतिम डिलीवरी' : 'Buyer Handover'}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full transition-all duration-500 ${
                  order.status === 'Delivered' 
                    ? 'w-full bg-emerald-600' 
                    : order.status === 'In Transit' 
                    ? 'w-2/3 bg-amber-500' 
                    : 'w-1/4 bg-blue-600'
                }`} 
              />
            </div>
          </div>

          {/* Amazon-Style Vertical Milestone Timeline */}
          <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-500">
              {isHindi ? 'विस्तृत डिलीवरी टाइमलाइन (अमेज़न शैली)' : 'Delivery Progress Milestones'}
            </h4>

            <div className="space-y-6 relative pl-3">
              {steps.map((step, idx) => {
                const isLast = idx === steps.length - 1;
                return (
                  <div key={step.title} className="relative flex items-start gap-4">
                    {/* Connecting line */}
                    {!isLast && (
                      <div 
                        className={`absolute left-3 top-6 w-0.5 h-[calc(100%+10px)] -translate-x-1/2 transition-colors ${
                          step.isCompleted ? 'bg-emerald-600' : 'bg-stone-200'
                        }`} 
                      />
                    )}

                    {/* Step Icon Badge */}
                    <div className="relative z-10 shrink-0">
                      {step.isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : step.isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center ring-4 ring-amber-100 shadow-xs">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-stone-100 border-2 border-stone-300 text-stone-400 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-stone-300" />
                        </div>
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                        <div className={`text-sm font-semibold ${
                          step.isCompleted ? 'text-stone-900' : step.isCurrent ? 'text-amber-800 font-bold' : 'text-stone-400'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs font-mono text-stone-400 shrink-0">
                          {step.time}
                        </div>
                      </div>
                      <p className={`text-xs mt-0.5 ${
                        step.isCompleted ? 'text-stone-600' : step.isCurrent ? 'text-stone-700 font-medium' : 'text-stone-400'
                      }`}>
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hackathon Evaluator & Demo Simulation Control */}
          {onUpdateStatus && (
            <div className="p-4 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-800" />
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    {isHindi ? 'हैकथॉन लाइव मूल्यांकनकर्ता नियंत्रण' : 'Hackathon Demo Live Simulator'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Live Stage Advance
                </span>
              </div>
              <p className="text-xs text-stone-600">
                {isHindi
                  ? 'जज और परीक्षक के सामने डिलीवरी की अगली स्थिति का लाइव प्रदर्शन करने के लिए नीचे दिए गए बटनों पर क्लिक करें:'
                  : 'Click below to instantly advance delivery milestones live during presentation to evaluators:'}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {order.status !== 'In Transit' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus('In Transit')}
                    className="px-3.5 py-2 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'मार्ग पर भेजें (In Transit)' : 'Dispatch ➔ In Transit'}</span>
                  </button>
                )}

                {order.status !== 'Delivered' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus('Delivered')}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'डिलीवर करें व भुगतान जारी (Delivered)' : 'Simulate OTP Handover ➔ Delivered'}</span>
                  </button>
                )}

                {order.status === 'Delivered' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus('Confirmed')}
                    className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'पुनः टेस्ट करें (Reset to Confirmed)' : 'Reset to Confirmed (Re-test)'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Direct Settlement Breakdown */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-stone-900 border-b border-stone-200 pb-2">
              <span>{isHindi ? 'एस्क्रो व मूल्य विवरण' : 'Financial & Settlement Breakdown'}</span>
              <span className="font-mono text-emerald-800 font-bold">100% Cashfree Escrow</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span>{isHindi ? 'फसल मूल्य:' : 'Farm Produce Value:'}</span>
              <span className="font-mono font-medium text-stone-900">₹{order.totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span>{isHindi ? 'कोल्ड-चेन लॉजिस्टिक्स शुल्क:' : 'Reefer Freight & Handling:'}</span>
              <span className="font-mono font-medium text-stone-900">₹{order.logisticsFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-stone-900 font-bold pt-1 border-t border-stone-200">
              <span>{isHindi ? 'कुल राशि:' : 'Total Transaction Value:'}</span>
              <span className="font-mono text-sm text-stone-900">₹{order.finalAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* Cashfree Escrow & Meon DBT Status */}
            <div className="mt-2 pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-white rounded-lg border border-stone-200 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400">Escrow Security</span>
                <div className="font-semibold text-stone-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{order.status === 'Delivered' ? 'Funds Released to Farmer' : 'Locked in RBI Nodal Escrow'}</span>
                </div>
                <div className="text-[10px] text-stone-500 font-mono">Ref: {order.paymentId || `CF_PAY_${order.id}`}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-stone-200 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400">Beneficiary DBT Bank</span>
                <div className="font-semibold text-stone-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Meon Pennydrop Verified</span>
                </div>
                <div className="text-[10px] text-stone-500">Auto-Disbursed via IMPS on OTP Handover</div>
              </div>
            </div>
          </div>

          {/* Rating Call-to-Action for Delivered Order */}
          {order.status === 'Delivered' && viewerRole === 'BUYER' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>
                    {order.rating
                      ? `Rated ${order.rating}.0 / 5 Stars`
                      : isHindi
                      ? 'डिलीवरी पूरी हुई! फसल व सेवा को रेट करें'
                      : 'Order Delivered! Rate Freshness & Cold-Chain'}
                  </span>
                </div>
                <p className="text-xs text-amber-900">
                  {order.reviewComment
                    ? `"${order.reviewComment}"`
                    : 'Help fellow buyers and boost verified farmers by rating produce freshness and reefer transit.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRatingOpen(true)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>{order.rating ? 'Update Rating' : isHindi ? 'रेटिंग दर्ज करें' : 'Rate Experience'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsGrievanceOpen(true)}
              className="px-3 py-2 bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 hover:border-rose-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />
              <span>{isHindi ? 'शिकायत / विवाद' : 'Raise Dispute'}</span>
            </button>

            {viewerRole === 'BUYER' && (
              <button
                type="button"
                onClick={() => setIsRatingOpen(true)}
                className="px-3 py-2 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 border border-stone-200 hover:border-amber-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Star className={`w-3.5 h-3.5 ${order.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-400'}`} />
                <span>{order.rating ? `★ ${order.rating}.0` : isHindi ? 'रेटिंग दें' : 'Rate Order'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close Tracker'}
          </button>
        </div>

      </div>

      {/* Embedded Grievance / Dispute Modal */}
      <GrievanceModal
        isOpen={isGrievanceOpen}
        onClose={() => setIsGrievanceOpen(false)}
        defaultOrderId={order.id}
        defaultCategory={temperature > 7.0 ? 'COLD_CHAIN_TEMP_BREACH' : 'DAMAGED_PRODUCE'}
        defaultSubject={
          temperature > 7.0
            ? `Cold-Chain Temperature Warning (+${temperature}°C recorded on ${vehicleNo})`
            : `Order #${order.id} Quality & Delivery Issue`
        }
      />

      {/* Embedded Rating Modal */}
      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        order={order}
        isHindi={isHindi}
      />
    </div>
  );
};
