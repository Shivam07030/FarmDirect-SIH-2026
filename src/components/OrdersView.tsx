import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, role, language } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'buyer' | 'farmer'>(
    role === 'FARMER' ? 'farmer' : role === 'BUYER' ? 'buyer' : 'all'
  );
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'buyer') {
      const isMyBuyerOrder = order.buyerName.toLowerCase().includes('freshbasket') || order.buyerName.toLowerCase().includes('buyer');
      if (!isMyBuyerOrder && role === 'BUYER') return false;
    } else if (activeTab === 'farmer') {
      const isMyFarmerOrder = order.farmerName.toLowerCase().includes('rajesh') || order.farmerName.toLowerCase().includes('you');
      if (!isMyFarmerOrder && role === 'FARMER') return false;
    }

    if (statusFilter !== 'All' && order.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'hi' ? 'पहुँच गया • भुगतान पूरा' : 'Delivered & Settled'}</span>
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <Truck className="w-3.5 h-3.5 text-sky-700" />
            <span>{language === 'hi' ? 'कोल्ड-ट्रक में रवाना' : 'In Transit (Reefer)'}</span>
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'hi' ? 'आर्डर स्वीकृत' : 'Confirmed & Scheduled'}</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <Clock className="w-3.5 h-3.5 text-stone-600" />
            <span>{language === 'hi' ? 'पिकअप लंबित' : 'Pending Dock Pickup'}</span>
          </span>
        );
    }
  };

  const getCropEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('tomato') || lower.includes('टमाटर')) return '🍅';
    if (lower.includes('potato') || lower.includes('आलू')) return '🥔';
    if (lower.includes('onion') || lower.includes('प्याज')) return '🧅';
    if (lower.includes('wheat') || lower.includes('गेहूँ')) return '🌾';
    return '🥬';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 uppercase tracking-wider border border-stone-200">
              {language === 'hi' ? 'आर्डर बहीखाता' : 'Orders & Settlement Ledger'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1.5 tracking-tight font-serif">
              {language === 'hi' ? 'आर्डर व भुगतान स्थिति' : 'Farm-to-Buyer Order Ledger'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {language === 'hi'
                ? 'खेत से माल उठाने, साझा गाड़ी के रास्ते, और बैंक खाते में भुगतान की पारदर्शी जानकारी।'
                : 'End-to-end audit trail from farm dock dispatch to buyer receipt and escrow settlement.'}
            </p>
          </div>

          {/* View Perspective Selector */}
          <div className="flex items-center p-1 bg-stone-100 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {language === 'hi' ? 'सभी आर्डर' : 'All Orders'}
            </button>
            <button
              onClick={() => setActiveTab('farmer')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'farmer' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {language === 'hi' ? 'किसान खाता' : 'Farmer Ledger'}
            </button>
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'buyer' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {language === 'hi' ? 'खरीदार खाता' : 'Buyer Ledger'}
            </button>
          </div>
        </div>

        {/* 4 Transaction Health Counters for SIH Jury */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Total Volume
            </div>
            <div className="text-2xl font-black text-stone-900 font-mono mt-0.5">
              1,800 <span className="text-xs text-stone-500 font-normal">kg</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Transacted directly</div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Direct Farmer Payout
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
              ₹48,200
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">100% direct bank transfer</div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Shared Logistics
            </div>
            <div className="text-2xl font-black text-stone-900 font-mono mt-0.5">
              ₹4,400
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Consolidated reefer run</div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Intermediary Commission
            </div>
            <div className="text-2xl font-black text-[#0E3B2B] font-mono mt-0.5">
              ₹0.00
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Zero middlemen siphon</div>
          </div>
        </div>
      </section>

      {/* Filter Status Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-stone-400 font-bold uppercase text-xs shrink-0">
          {language === 'hi' ? 'स्थिति:' : 'Status:'}
        </span>
        {['All', 'Pending', 'Confirmed', 'In Transit', 'Delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === status
                ? 'bg-[#0E3B2B] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {status === 'All' 
              ? (language === 'hi' ? 'सभी' : 'All') 
              : status === 'Pending' ? (language === 'hi' ? 'लंबित' : 'Pending')
              : status === 'Confirmed' ? (language === 'hi' ? 'स्वीकृत' : 'Confirmed')
              : status === 'In Transit' ? (language === 'hi' ? 'रास्ते में' : 'In Transit')
              : (language === 'hi' ? 'पहुँच गया' : 'Delivered')}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-2">
          <ShoppingBag className="w-10 h-10 mx-auto text-stone-300" />
          <h3 className="text-base font-bold text-stone-800">
            {language === 'hi' ? 'कोई आर्डर नहीं मिला' : 'No matching orders in ledger'}
          </h3>
          <p className="text-xs text-stone-500">
            {language === 'hi' ? 'बाज़ार में जाकर नया आर्डर करें।' : 'Orders placed in the marketplace will automatically record here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
            const emoji = getCropEmoji(order.productName);

            return (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between space-y-5"
              >
                <div>
                  {/* Top Bar: Order ID, Emoji and Status Badge */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{emoji}</span>
                      <div>
                        <div className="font-extrabold text-stone-900 text-sm font-serif">
                          {order.productName}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          Order #{order.id} • {order.orderDate}
                        </div>
                      </div>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Financial & Quantities Breakdown */}
                  <div className="grid grid-cols-2 gap-3 py-4 border-b border-stone-100">
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                      <div className="text-[10px] uppercase font-bold text-emerald-900">Farm Net Earnings</div>
                      <div className="text-xl font-black text-[#0E3B2B] font-mono mt-0.5">
                        ₹{order.totalPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                        {order.quantity} kg @ ₹{order.pricePerKg}/kg
                      </div>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-right">
                      <div className="text-[10px] uppercase font-bold text-stone-500">Buyer Total Settlement</div>
                      <div className="text-xl font-black text-stone-900 font-mono mt-0.5">
                        ₹{order.finalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-stone-600 mt-0.5">
                        Includes ₹{order.logisticsFee} shared freight
                      </div>
                    </div>
                  </div>

                  {/* Routing & Counterparty Details */}
                  <div className="space-y-2 text-xs pt-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50/70 border border-stone-200/60">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🚜</span>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">Producer (Seller)</span>
                          <span className="font-bold text-stone-800">{order.farmerName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Dispatch Location</span>
                        <span className="font-semibold text-stone-700">{order.deliveryLocation.split('➔')[0] || 'Agra Farm'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50/70 border border-stone-200/60">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏢</span>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">Buyer (Customer)</span>
                          <span className="font-bold text-stone-800">{order.buyerName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Receiving Terminal</span>
                        <span className="font-semibold text-stone-700">{order.deliveryLocation.split('➔')[1] || order.deliveryLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jury/User Status Action Shortcuts */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">
                    SIH Demo Control:
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded cursor-pointer"
                      >
                        Accept Order
                      </button>
                    )}

                    {order.status === 'Confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'In Transit')}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded cursor-pointer"
                      >
                        Dispatch Truck
                      </button>
                    )}

                    {order.status === 'In Transit' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Delivered')}
                        className="px-2.5 py-1 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-bold rounded cursor-pointer"
                      >
                        Confirm Delivery
                      </button>
                    )}

                    {order.status === 'Delivered' && (
                      <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Settled via Escrow
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
