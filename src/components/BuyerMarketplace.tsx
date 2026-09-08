import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, BuyerTier } from '../types';
import { 
  Search, 
  X, 
  Check, 
  ArrowRight, 
  Building2, 
  BadgeCheck, 
  ShieldCheck, 
  ShoppingBag, 
  AlertCircle, 
  Info, 
  Sparkles, 
  Truck, 
  UserCheck 
} from 'lucide-react';

export const BuyerMarketplace: React.FC = () => {
  const { 
    products, 
    placeOrder, 
    buyerName, 
    currentUser, 
    orders, 
    activeTab, 
    setActiveTab,
    buyerTier,
    setBuyerTier 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Purchase modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(buyerTier === 'RETAIL' ? 2 : 50);
  const [deliveryAddress, setDeliveryAddress] = useState('Delhi (Azadpur Terminal Hub)');
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses'];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchQuery = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleOpenBuy = (product: Product) => {
    setSelectedProduct(product);
    if (buyerTier === 'RETAIL') {
      // Normal Buyer limit: Default to 1 kg, max 2 kg
      setPurchaseQuantity(Math.min(2, Math.max(0.5, product.quantity > 0 ? 1 : 0.5)));
    } else {
      // Wholesaler: Default to 50 kg (min 25 kg)
      setPurchaseQuantity(Math.min(product.quantity, 50));
    }
    setOrderSuccess(null);
  };

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // Normal buyer guardrail: Cannot exceed 2 kg
    if (buyerTier === 'RETAIL' && purchaseQuantity > 2) {
      return;
    }

    // Wholesaler guardrail: Minimum 25 kg
    if (buyerTier === 'WHOLESALE' && purchaseQuantity < 25) {
      return;
    }

    const result = placeOrder({
      productId: selectedProduct.id,
      quantity: Number(purchaseQuantity),
      deliveryLocation: deliveryAddress,
      buyerName: buyerTier === 'RETAIL' ? (currentUser?.name || 'Direct Consumer') : buyerName,
      buyerTier: buyerTier,
    });

    if (result.success && result.order) {
      setOrderSuccess(result.order);
      setSelectedProduct(null);
    }
  };

  // Calculate freshness label from harvest date
  const getFreshnessLabel = (harvestDate: string) => {
    try {
      const harvest = new Date(harvestDate).getTime();
      const now = new Date('2026-09-06').getTime();
      const diffDays = Math.max(1, Math.round((now - harvest) / (1000 * 60 * 60 * 24)));
      if (diffDays <= 1) return 'Harvested today';
      if (diffDays === 2) return 'Harvested yesterday';
      return `Harvested ${diffDays} days ago`;
    } catch {
      return 'Fresh harvest';
    }
  };

  // Buyer's placed orders
  const myOrders = orders.filter(
    (o) => o.buyerName.toLowerCase().includes('freshbasket') || o.buyerName.toLowerCase().includes('buyer')
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 font-sans">
      
      {/* 1. ORDERS VIEW FOR BUYER */}
      {activeTab === 'orders' ? (
        <div className="space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h1 className="text-2xl font-semibold text-stone-900 font-serif">Your Orders</h1>
            <p className="text-xs text-stone-500 mt-0.5">Track dispatches and cold-chain arrivals from regional farms</p>
          </div>

          <div className="divide-y divide-stone-200">
            {myOrders.length > 0 ? (
              myOrders.map((ord) => (
                <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-stone-400 font-mono">{ord.id} · {ord.orderDate}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-base font-semibold text-stone-900">
                        {ord.quantity} kg {ord.productName}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        ord.buyerTier === 'RETAIL' || ord.quantity <= 2
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}>
                        {ord.buyerTier === 'RETAIL' || ord.quantity <= 2 ? 'Household Retail (Max 2 kg)' : 'Wholesale B2B Batch'}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Farmer: <span className="font-medium text-stone-800">{ord.farmerName}</span> · Destination: {ord.deliveryLocation}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-mono font-bold text-stone-900">
                      ₹{ord.finalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                      {ord.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-stone-400">
                No orders placed yet. Select produce from the marketplace to order directly.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2. MARKETPLACE VIEW FOR BUYER */
        <div className="space-y-6">
          
          {/* 2-Section Dual-Tier Marketplace Switcher */}
          <div className="bg-stone-50 p-2 rounded-2xl border border-stone-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBuyerTier('RETAIL')}
              className={`p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between border ${
                buyerTier === 'RETAIL'
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/60 border-stone-200 hover:bg-white text-stone-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  buyerTier === 'RETAIL' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-stone-200 text-stone-600'
                }`}>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-stone-900">Normal Buyer (Household)</span>
                    <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                      Max 2 kg Cap
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Subsidized household distribution · Anti-hoarding ration limit
                  </div>
                </div>
              </div>
              {buyerTier === 'RETAIL' && (
                <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0 ml-2" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setBuyerTier('WHOLESALE')}
              className={`p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between border ${
                buyerTier === 'WHOLESALE'
                  ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white/60 border-stone-200 hover:bg-white text-stone-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  buyerTier === 'WHOLESALE' ? 'bg-blue-700 text-white shadow-xs' : 'bg-stone-200 text-stone-600'
                }`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-stone-900">Wholesaler (B2B Commercial)</span>
                    <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-900 border border-blue-300 px-1.5 py-0.2 rounded">
                      Bulk (50 kg+)
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    For retail chains & mandi traders · GSTIN & FSSAI verified
                  </div>
                </div>
              </div>
              {buyerTier === 'WHOLESALE' && (
                <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0 ml-2" />
              )}
            </button>
          </div>

          {/* Active Section Context Banner */}
          {buyerTier === 'RETAIL' ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-950">
                      Normal Household Direct Purchasing Mode
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Anti-Hoarding Active
                    </span>
                  </div>
                  <div className="text-xs text-emerald-800 mt-0.5">
                    Purchase limit strictly capped at <strong>max 2 kg per crop</strong>. Fair farmgate rates with flat ₹25 doorstep delivery.
                  </div>
                </div>
              </div>

              <div className="text-xs text-emerald-800 font-semibold bg-white px-3 py-1.5 rounded-lg border border-emerald-300 self-start sm:self-auto flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Ration Cap: 2.0 kg Max / Order</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-950">
                      {currentUser?.buyerKyc?.legalBusinessName || buyerName}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3 text-blue-700" />
                      <span>GST Verified</span>
                    </span>
                  </div>
                  <div className="text-xs text-blue-800 mt-0.5">
                    GSTIN: <span className="font-mono font-medium">{currentUser?.buyerKyc?.gstin || '07AAAAF1234A1Z5'}</span> · Minimum batch: 25 kg · 4°C Reefer Logistics
                  </div>
                </div>
              </div>

              <div className="text-xs text-blue-800 font-semibold bg-white px-3 py-1.5 rounded-lg border border-blue-300 self-start sm:self-auto flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-700" />
                <span>Wholesale B2B Terminal · Bulk Freight</span>
              </div>
            </div>
          )}

          {/* Search & Category Filter */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search produce..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:border-[#0E3B2B] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#0E3B2B] text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Success Banner if order just placed */}
          {orderSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="text-xs text-emerald-900">
                <span className="font-semibold">Order confirmed!</span> {orderSuccess.quantity} kg of {orderSuccess.productName} scheduled for cold-chain dispatch.
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-emerald-900 underline cursor-pointer ml-4 shrink-0"
              >
                View Orders
              </button>
            </div>
          )}

          {/* Product Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 transition-all flex flex-col"
              >
                {/* Product Image */}
                <div className="h-44 w-full bg-stone-100 overflow-hidden relative">
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-stone-900">{p.name.split('(')[0].trim()}</h3>
                    <div className="text-xs text-stone-500 flex items-center gap-1.5">
                      <span>{p.farmerName}</span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                        <span>PM-KISAN</span>
                      </span>
                      <span>· {p.location}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-end justify-between">
                    <div>
                      <div className="text-lg font-mono font-bold text-stone-900">
                        ₹{p.pricePerKg}<span className="text-xs font-normal text-stone-500">/kg</span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {buyerTier === 'RETAIL' ? 'Household Pack · Max 2 kg' : `${p.quantity} kg bulk batch`}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        {getFreshnessLabel(p.harvestDate)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBuy(p)}
                      className={`px-3.5 py-2 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        buyerTier === 'RETAIL'
                          ? 'bg-emerald-700 hover:bg-emerald-800'
                          : 'bg-blue-700 hover:bg-blue-800'
                      }`}
                    >
                      {buyerTier === 'RETAIL' ? (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy (Max 2 kg)</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Buy Wholesale</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Buy Drawer / Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg font-semibold text-stone-900 font-serif">
                    {buyerTier === 'RETAIL' ? 'Direct Household Purchase' : 'Wholesale Commercial Batch'}
                  </h2>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                    buyerTier === 'RETAIL'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-blue-100 text-blue-900 border-blue-300'
                  }`}>
                    {buyerTier === 'RETAIL' ? 'Max 2 kg Cap' : 'Bulk Batch'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Direct from {selectedProduct.farmerName} · {selectedProduct.location}
                </p>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Policy Explainer */}
            {buyerTier === 'RETAIL' ? (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Normal Household Ration Cap: 2 kg Maximum</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    To ensure all families get access to farm produce at subsidized farmgate rates and eliminate hoarding, individual purchases are capped at 2 kg per crop.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">B2B Commercial Wholesale Batch (Min 25 kg)</span>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Orders dispatch via temperature-monitored refrigerated trucks with automated GST E-way bills.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleConfirmPurchase} className="space-y-4">
              <div>
                <div className="text-xs text-stone-500">Selected Crop</div>
                <div className="text-base font-semibold text-stone-900">{selectedProduct.name}</div>
                <div className="text-xs text-stone-500 mt-0.5 font-mono">Rate: ₹{selectedProduct.pricePerKg}/kg</div>
              </div>

              {/* Quantity Selection Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                  <label>Order Quantity (kg)</label>
                  <span className="font-mono text-stone-500 text-[11px]">
                    {buyerTier === 'RETAIL' ? 'Limit: 0.5 kg to 2.0 kg' : `Available: ${selectedProduct.quantity} kg`}
                  </span>
                </div>

                {/* Quick Presets */}
                {buyerTier === 'RETAIL' ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0.5, 1.0, 1.5, 2.0].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setPurchaseQuantity(qty)}
                        className={`py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer border ${
                          purchaseQuantity === qty
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {qty} kg
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {[50, 100, 250, 500].filter((q) => q <= selectedProduct.quantity).map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setPurchaseQuantity(qty)}
                        className={`py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer border ${
                          purchaseQuantity === qty
                            ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {qty} kg
                      </button>
                    ))}
                  </div>
                )}

                {/* Stepper Controls */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (buyerTier === 'RETAIL') {
                        setPurchaseQuantity((q) => Math.max(0.5, Math.round((q - 0.5) * 10) / 10));
                      } else {
                        setPurchaseQuantity((q) => Math.max(25, q - 25));
                      }
                    }}
                    className="px-3.5 py-2.5 border border-r-0 border-stone-200 bg-stone-50 rounded-l-xl text-stone-700 font-bold text-sm cursor-pointer hover:bg-stone-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                    required
                    min={buyerTier === 'RETAIL' ? 0.5 : 25}
                    max={buyerTier === 'RETAIL' ? 2 : selectedProduct.quantity}
                    step={buyerTier === 'RETAIL' ? 0.5 : 1}
                    className="w-full text-center py-2.5 border-y border-stone-200 text-sm font-mono font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (buyerTier === 'RETAIL') {
                        setPurchaseQuantity((q) => Math.min(2, Math.round((q + 0.5) * 10) / 10));
                      } else {
                        setPurchaseQuantity((q) => Math.min(selectedProduct.quantity, q + 25));
                      }
                    }}
                    className="px-3.5 py-2.5 border border-l-0 border-stone-200 bg-stone-50 rounded-r-xl text-stone-700 font-bold text-sm cursor-pointer hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>

                {/* Quantity Guardrail Feedback */}
                {buyerTier === 'RETAIL' && purchaseQuantity > 2 && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Rationing Limit Exceeded! Normal household buyers can purchase at most 2 kg per crop. For bulk, use Wholesaler section.</span>
                  </div>
                )}

                {buyerTier === 'WHOLESALE' && purchaseQuantity < 25 && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Wholesale minimum order is 25 kg. For smaller household quantities, please switch to Normal Buyer.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Destination</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  placeholder={buyerTier === 'RETAIL' ? 'e.g. Flat 402, Sector 14, Noida' : 'e.g. Delhi (Azadpur Terminal Hub)'}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#0E3B2B]"
                />
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 bg-stone-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Farm produce ({purchaseQuantity} kg)</span>
                  <span className="font-mono font-semibold">
                    ₹{(Math.round(purchaseQuantity * selectedProduct.pricePerKg * 100) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{buyerTier === 'RETAIL' ? 'Local household eco-delivery' : 'Shared 4°C reefer truck freight'}</span>
                  <span className="font-mono font-semibold">
                    ₹{buyerTier === 'RETAIL' ? 25 : Math.max(150, Math.round(purchaseQuantity * 2.2))}
                  </span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold pt-1.5 border-t border-stone-200">
                  <span>Total Payable</span>
                  <span className="font-mono text-sm">
                    ₹{(
                      (Math.round(purchaseQuantity * selectedProduct.pricePerKg * 100) / 100) + 
                      (buyerTier === 'RETAIL' ? 25 : Math.max(150, Math.round(purchaseQuantity * 2.2)))
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  (buyerTier === 'RETAIL' && purchaseQuantity > 2) ||
                  (buyerTier === 'WHOLESALE' && purchaseQuantity < 25) ||
                  purchaseQuantity <= 0
                }
                className={`w-full py-3 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  buyerTier === 'RETAIL'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                {buyerTier === 'RETAIL' ? 'Confirm Household Purchase (Max 2 kg)' : 'Confirm Wholesale Order (B2B)'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
