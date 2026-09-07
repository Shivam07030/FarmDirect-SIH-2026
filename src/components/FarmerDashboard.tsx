import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductCategory } from '../types';
import { ArrowUpRight, Plus, Check, Truck, X, ArrowRight, TrendingUp } from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    addProduct, 
    updateOrderStatus,
    farmerName,
    activeTab,
    setActiveTab,
    farmerStats
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedCropToSell, setSelectedCropToSell] = useState<string | null>(null);

  // New Produce Form State
  const [cropName, setCropName] = useState('Tomato');
  const [quantity, setQuantity] = useState(450);
  const [pricePerKg, setPricePerKg] = useState(24);
  const [category, setCategory] = useState<ProductCategory>('Vegetables');

  // Filter farmer produce & orders
  const myProduce = products.filter(
    (p) => p.farmerName.toLowerCase().includes('rajesh') || p.farmerName.toLowerCase().includes('you')
  );
  const myOrders = orders.filter(
    (o) => o.farmerName.toLowerCase().includes('rajesh') || o.farmerName.toLowerCase().includes('you')
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name: cropName,
      category,
      quantity: Number(quantity),
      initialQuantity: Number(quantity),
      pricePerKg: Number(pricePerKg),
      location: 'Agra',
      harvestDate: new Date().toISOString().split('T')[0],
      quality: 'Grade A (Premium)',
      farmerName: `${farmerName} (You)`,
      farmerPhone: '+91 98765 43210',
    });
    setIsAddModalOpen(false);
  };

  const handleTriggerSellTomato = () => {
    setCropName('Tomato');
    setPricePerKg(27);
    setQuantity(300);
    setIsAddModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12 font-sans">
      
      {/* 1. HOME TAB */}
      {activeTab === 'home' && (
        <div className="space-y-12">
          {/* Header & Earnings */}
          <section className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-semibold text-stone-900 font-serif tracking-tight">
              Good morning, Rajesh
            </h1>

            <div className="pt-2">
              <div className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                Total earnings
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-stone-900 mt-1">
                ₹{farmerStats.totalEarningsInr > 0 ? farmerStats.totalEarningsInr.toLocaleString('en-IN') : '3,000'}
              </div>
            </div>
          </section>

          {/* Your Produce Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h2 className="text-sm uppercase tracking-wider font-semibold text-stone-500">
                Your produce
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs font-semibold text-[#0E3B2B] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add produce</span>
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {myProduce.length > 0 ? (
                myProduce.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold text-stone-900">{item.name}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{item.quantity} kg</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-mono font-semibold text-stone-900">
                        ₹{item.pricePerKg}/kg
                      </div>
                      <div className="text-xs text-emerald-700 font-medium mt-0.5 flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold text-stone-900">Tomato</div>
                      <div className="text-xs text-stone-500 mt-0.5">450 kg</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-mono font-semibold text-stone-900">₹24/kg</div>
                      <div className="text-xs text-emerald-700 font-medium mt-0.5 flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold text-stone-900">Potato</div>
                      <div className="text-xs text-stone-500 mt-0.5">480 kg</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-mono font-semibold text-stone-900">₹18/kg</div>
                      <div className="text-xs text-emerald-700 font-medium mt-0.5 flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ONE Small AI Recommendation */}
          <section className="p-5 rounded-xl border border-stone-200 bg-white space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                  <span>Tomato demand</span>
                  <span className="text-emerald-700 font-bold">↑ 18%</span>
                </div>
                <div className="text-xs text-stone-600">
                  Expected price <span className="font-semibold text-stone-900">₹26–28/kg</span>
                </div>
                <div className="text-xs text-stone-500">
                  Sell in 1–2 days
                </div>
              </div>

              <button
                type="button"
                onClick={handleTriggerSellTomato}
                className="px-3.5 py-2 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Sell Tomato
              </button>
            </div>
          </section>

          {/* Next Pickup Section */}
          <section className="p-5 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                Next pickup
              </div>
              <div className="text-sm font-semibold text-stone-900">
                Today · 11:30 AM
              </div>
              <div className="text-xs text-stone-500">
                50 kg Tomato → Delhi
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTrackModalOpen(true)}
              className="px-3.5 py-2 border border-stone-200 hover:border-stone-400 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Track
            </button>
          </section>
        </div>
      )}

      {/* 2. PRODUCE TAB */}
      {activeTab === 'produce' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h1 className="text-2xl font-semibold text-stone-900 font-serif">Produce Listings</h1>
              <p className="text-xs text-stone-500 mt-0.5">Manage your crops available for direct buyer orders</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Produce</span>
            </button>
          </div>

          <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
            {myProduce.map((p) => (
              <div key={p.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-900 text-base">{p.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {p.quantity} kg available · Harvested {p.harvestDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-stone-900 text-base">₹{p.pricePerKg}/kg</div>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">Active on marketplace</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-8">
          <div className="border-b border-stone-200 pb-4">
            <h1 className="text-2xl font-semibold text-stone-900 font-serif">Incoming & Active Orders</h1>
            <p className="text-xs text-stone-500 mt-0.5">Dispatches and buyer settlements directly to your bank account</p>
          </div>

          <div className="divide-y divide-stone-200">
            {myOrders.length > 0 ? (
              myOrders.map((o) => (
                <div key={o.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-stone-400 font-mono">{o.id} · {o.orderDate}</div>
                    <div className="text-base font-semibold text-stone-900 mt-0.5">
                      {o.quantity} kg {o.productName}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Buyer: <span className="text-stone-800 font-medium">{o.buyerName}</span> · To: {o.deliveryLocation}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-base font-mono font-bold text-stone-900">
                        ₹{o.totalPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                        {o.status}
                      </div>
                    </div>

                    {o.status === 'Confirmed' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(o.id, 'In Transit')}
                        className="px-3 py-1.5 bg-[#0E3B2B] text-white text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Dispatch
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-stone-400">
                No orders pending. Your listings are active on the buyer marketplace.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MARKET TAB (Price Transparency & Demand) */}
      {activeTab === 'market' && (
        <div className="space-y-8">
          <div className="border-b border-stone-200 pb-4">
            <h1 className="text-2xl font-semibold text-stone-900 font-serif">Market Prices & Transparency</h1>
            <p className="text-xs text-stone-500 mt-0.5">Direct realization comparison versus traditional APMC Mandi channels</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tomato */}
            <div className="p-5 rounded-xl border border-stone-200 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="font-semibold text-stone-900">Tomato</span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Farmer +₹6/kg · Buyer -₹5/kg
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    Traditional Mandi
                  </div>
                  <div className="text-stone-700 mt-1">Farmer: ₹18/kg</div>
                  <div className="text-stone-700">Consumer: ₹32/kg</div>
                </div>

                <div>
                  <div className="text-emerald-800 uppercase tracking-wider font-semibold text-[10px]">
                    FarmDirect
                  </div>
                  <div className="text-stone-900 font-semibold mt-1">Farmer: ₹24/kg</div>
                  <div className="text-stone-900 font-semibold">Consumer: ₹27/kg</div>
                </div>
              </div>
            </div>

            {/* Potato */}
            <div className="p-5 rounded-xl border border-stone-200 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="font-semibold text-stone-900">Potato</span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Farmer +₹4/kg · Buyer -₹3/kg
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    Traditional Mandi
                  </div>
                  <div className="text-stone-700 mt-1">Farmer: ₹14/kg</div>
                  <div className="text-stone-700">Consumer: ₹22/kg</div>
                </div>

                <div>
                  <div className="text-emerald-800 uppercase tracking-wider font-semibold text-[10px]">
                    FarmDirect
                  </div>
                  <div className="text-stone-900 font-semibold mt-1">Farmer: ₹18/kg</div>
                  <div className="text-stone-900 font-semibold">Consumer: ₹19/kg</div>
                </div>
              </div>
            </div>

            {/* Onion */}
            <div className="p-5 rounded-xl border border-stone-200 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="font-semibold text-stone-900">Onion</span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Farmer +₹5/kg · Buyer -₹4/kg
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    Traditional Mandi
                  </div>
                  <div className="text-stone-700 mt-1">Farmer: ₹22/kg</div>
                  <div className="text-stone-700">Consumer: ₹35/kg</div>
                </div>

                <div>
                  <div className="text-emerald-800 uppercase tracking-wider font-semibold text-[10px]">
                    FarmDirect
                  </div>
                  <div className="text-stone-900 font-semibold mt-1">Farmer: ₹27/kg</div>
                  <div className="text-stone-900 font-semibold">Consumer: ₹31/kg</div>
                </div>
              </div>
            </div>

            {/* Wheat */}
            <div className="p-5 rounded-xl border border-stone-200 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="font-semibold text-stone-900">Wheat (Sharbati)</span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Farmer +₹5/kg · Buyer -₹4/kg
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    Traditional Mandi
                  </div>
                  <div className="text-stone-700 mt-1">Farmer: ₹26/kg</div>
                  <div className="text-stone-700">Consumer: ₹40/kg</div>
                </div>

                <div>
                  <div className="text-emerald-800 uppercase tracking-wider font-semibold text-[10px]">
                    FarmDirect
                  </div>
                  <div className="text-stone-900 font-semibold mt-1">Farmer: ₹31/kg</div>
                  <div className="text-stone-900 font-semibold">Consumer: ₹36/kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Produce Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-lg border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-lg font-semibold text-stone-900 font-serif">Add Produce Listing</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Crop Name</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#0E3B2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Available Qty (kg)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                    min={10}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#0E3B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Price (₹/kg)</label>
                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#0E3B2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#0E3B2B]"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Pulses">Pulses</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Confirm & List on Marketplace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pickup Tracking Modal */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-lg border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 font-serif">Pickup Status</h2>
                <p className="text-xs text-stone-500">Shared Cold-Reefer Truck #DL-1L-4482</p>
              </div>
              <button 
                onClick={() => setIsTrackModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg space-y-1">
                <div className="font-semibold text-stone-900">Driver: Manpreet Singh</div>
                <div className="text-stone-500">Contact: +91 98112 34567</div>
                <div className="text-emerald-700 font-medium">Internal Temp: 4°C · On Time</div>
              </div>

              <div className="space-y-3 pl-2 border-l-2 border-emerald-700">
                <div className="relative pl-3">
                  <div className="text-xs font-semibold text-stone-900">Agra Cluster Pickup</div>
                  <div className="text-[11px] text-stone-500">Scheduled: Today · 11:30 AM</div>
                </div>
                <div className="relative pl-3">
                  <div className="text-xs font-semibold text-stone-700">Mathura Consolidation Hub</div>
                  <div className="text-[11px] text-stone-400">Estimated: 1:15 PM</div>
                </div>
                <div className="relative pl-3">
                  <div className="text-xs font-semibold text-stone-700">Delhi Terminal Dispatch</div>
                  <div className="text-[11px] text-stone-400">Estimated: 4:30 PM</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTrackModalOpen(false)}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
