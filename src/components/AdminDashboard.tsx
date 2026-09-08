import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { Check, Truck, Users, ShoppingBag, IndianRupee } from 'lucide-react';
import { LogisticsMap } from './LogisticsMap';
import { ErrorBoundary } from './ErrorBoundary';
import { fetchUsers, fetchStats } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const { adminStats, orders, updateOrderStatus, activeTab } = useApp();

  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    fetchUsers().then(setDbUsers).catch(() => {});
    fetchStats().then(setLiveStats).catch(() => {});
  }, []);

  const farmersList = dbUsers.filter((u) => u.role === 'FARMER');
  const buyersList = dbUsers.filter((u) => u.role === 'BUYER');

  const gmv = liveStats?.gmv ?? adminStats.totalTransactionValue;
  const totalFarmersCount = liveStats?.totalFarmers ?? adminStats.totalFarmers;
  const totalBuyersCount = liveStats?.totalBuyers ?? adminStats.totalBuyers;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 font-sans">
      
      {/* 1. OVERVIEW TAB */}
      {(activeTab === 'overview' || activeTab === 'home') && (
        <div className="space-y-10">
          
          {/* Metrics Grid */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">GMV</div>
              <div className="text-xl font-mono font-bold text-stone-900">
                ₹{gmv.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Orders</div>
              <div className="text-xl font-mono font-bold text-stone-900">{orders.length}</div>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Farmers</div>
              <div className="text-xl font-mono font-bold text-stone-900">{totalFarmersCount}</div>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Buyers</div>
              <div className="text-xl font-mono font-bold text-stone-900">{totalBuyersCount}</div>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Active trucks</div>
              <div className="text-xl font-mono font-bold text-stone-900">6</div>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Active routes</div>
              <div className="text-xl font-mono font-bold text-stone-900">4</div>
            </div>
          </section>

          {/* Logistics Status */}
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-400">
              Logistics Status
            </h2>

            <div className="p-5 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <span>Optimized route</span>
                  <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ₹1,400 saved
                  </span>
                </div>
                <div className="text-xs text-stone-500">
                  Agra ➔ Mathura ➔ Delhi Azadpur Terminal · Reefer #DL-1L-4482
                </div>
                <div className="text-xs text-emerald-700 font-medium">
                  Active temp: 4°C · On time
                </div>
              </div>

              <div className="text-right text-xs text-stone-500">
                Next stop: Mathura Hub (1:15 PM)
              </div>
            </div>
          </section>

          {/* Recent Orders */}
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-400">
              Recent Orders
            </h2>

            <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono text-stone-400">{o.id}</span>
                    <div className="font-semibold text-stone-900 text-sm mt-0.5">
                      {o.quantity} kg {o.productName}
                    </div>
                    <div className="text-stone-500 mt-0.5">
                      {o.farmerName} ➔ {o.buyerName}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="font-mono font-bold text-stone-900 text-sm">
                        ₹{o.finalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-emerald-700 font-semibold">{o.status}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 2. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h1 className="text-2xl font-semibold text-stone-900 font-serif">Platform Orders</h1>
            <p className="text-xs text-stone-500 mt-0.5">Audit orders and dispatch milestones</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
            {orders.map((o) => (
              <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-mono text-stone-400">{o.id} · {o.orderDate}</div>
                  <div className="font-semibold text-stone-900 text-sm mt-0.5">
                    {o.quantity} kg {o.productName}
                  </div>
                  <div className="text-stone-500 mt-0.5">
                    Farmer: {o.farmerName} · Buyer: {o.buyerName}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="font-mono font-bold text-stone-900 text-sm">
                      ₹{o.finalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-emerald-700 font-semibold">{o.status}</div>
                  </div>

                  <select
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                    className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LOGISTICS TAB */}
      {activeTab === 'logistics' && (
        <ErrorBoundary fallbackTitle="Cold-Chain Logistics Map">
          <LogisticsMap />
        </ErrorBoundary>
      )}

      {/* 4. USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-8">
          <div className="border-b border-stone-200 pb-4">
            <h1 className="text-2xl font-semibold text-stone-900 font-serif">Network Directory</h1>
            <p className="text-xs text-stone-500 mt-0.5">Verified producers and bulk purchasing terminals</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-400">Farmers & FPOs</h2>
              <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
                {farmersList.map((f) => (
                  <div key={f.name} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-900">{f.name} · {f.location}</div>
                      <div className="text-stone-500">{f.crops} · {f.phone}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-400">Commercial Buyers</h2>
              <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
                {buyersList.map((b) => (
                  <div key={b.name} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-900">{b.name} · {b.location}</div>
                      <div className="text-stone-500">Contact: {b.contact} · {b.volume}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
