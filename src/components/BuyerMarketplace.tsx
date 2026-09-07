import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order } from '../types';
import { Search, X, Check, ArrowRight } from 'lucide-react';

export const BuyerMarketplace: React.FC = () => {
  const { products, placeOrder, buyerName, orders, activeTab, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Purchase modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(100);
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
    setPurchaseQuantity(Math.min(100, product.quantity > 0 ? product.quantity : 20));
    setOrderSuccess(null);
  };

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const result = placeOrder({
      productId: selectedProduct.id,
      quantity: Number(purchaseQuantity),
      deliveryLocation: deliveryAddress,
      buyerName,
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
                    <div className="text-base font-semibold text-stone-900 mt-0.5">
                      {ord.quantity} kg {ord.productName}
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
        <div className="space-y-8">
          
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
                    <div className="text-xs text-stone-500">
                      {p.farmerName} · {p.location}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-end justify-between">
                    <div>
                      <div className="text-lg font-mono font-bold text-stone-900">
                        ₹{p.pricePerKg}<span className="text-xs font-normal text-stone-500">/kg</span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {p.quantity} kg available
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        {getFreshnessLabel(p.harvestDate)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBuy(p)}
                      className="px-4 py-2 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Buy
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
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-lg border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 font-serif">Purchase Produce</h2>
                <p className="text-xs text-stone-500">Direct from {selectedProduct.farmerName} · {selectedProduct.location}</p>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPurchase} className="space-y-4">
              <div>
                <div className="text-xs text-stone-500">Selected Crop</div>
                <div className="text-base font-semibold text-stone-900">{selectedProduct.name}</div>
                <div className="text-xs text-stone-500 mt-0.5 font-mono">Rate: ₹{selectedProduct.pricePerKg}/kg</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Order Quantity (kg)</label>
                <input
                  type="number"
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                  required
                  min={10}
                  max={selectedProduct.quantity}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#0E3B2B]"
                />
                <div className="text-[11px] text-stone-400 mt-1">
                  Max available: {selectedProduct.quantity} kg
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Destination</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#0E3B2B]"
                />
              </div>

              {/* Minimal Price Breakdown */}
              <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Farm produce ({purchaseQuantity} kg)</span>
                  <span className="font-mono font-semibold">₹{(purchaseQuantity * selectedProduct.pricePerKg).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shared 4°C reefer logistics</span>
                  <span className="font-mono font-semibold">₹{Math.max(150, Math.round(purchaseQuantity * 2.2))}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold pt-1.5 border-t border-stone-200">
                  <span>Total Payable</span>
                  <span className="font-mono text-sm">
                    ₹{((purchaseQuantity * selectedProduct.pricePerKg) + Math.max(150, Math.round(purchaseQuantity * 2.2))).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Confirm Purchase
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
