import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { 
  Check, 
  Truck, 
  Users, 
  ShoppingBag, 
  IndianRupee,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  XCircle,
  Building2,
  BadgeCheck,
  AlertCircle,
  MapPin,
  Sparkles,
  Loader2
} from 'lucide-react';
import { LogisticsMap } from './LogisticsMap';
import { ErrorBoundary } from './ErrorBoundary';
import { fetchUsers, fetchStats, fetchKycQueueApi, updateKycStatusApi } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const { adminStats, orders, updateOrderStatus, activeTab, setActiveTab } = useApp();

  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [kycFilter, setKycFilter] = useState<'ALL' | 'FARMER' | 'BUYER' | 'PENDING'>('ALL');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadData = () => {
    fetchUsers().then(setDbUsers).catch(() => {});
    fetchStats().then(setLiveStats).catch(() => {});
    fetchKycQueueApi().then((data) => {
      if (data && data.length > 0) {
        setKycQueue(data);
      } else {
        // Fallback default mock data if database is empty
        setKycQueue([
          {
            id: 'USER-001',
            name: 'Rajesh Kumar',
            role: 'FARMER',
            phone: '+91 98765 43210',
            location: 'Agra, UP',
            verificationStatus: 'VERIFIED',
            pmKisanId: 'UP-2024-889123',
            khasraNo: '142/2A, Agra Revenue Block',
            landSizeAcres: 3.5,
            cluster_name: 'Agra Farm Cluster'
          },
          {
            id: 'USER-002',
            name: 'FreshBasket Retail Enterprises',
            role: 'BUYER',
            phone: '+91 98112 00000',
            location: 'Delhi NCR',
            verificationStatus: 'VERIFIED',
            gstin: '07AAAAF1234A1Z5',
            businessLegalName: 'FreshBasket Retail Enterprises Pvt Ltd',
            fssaiLicense: '10019011004123'
          },
          {
            id: 'USER-004',
            name: 'Balram Singh',
            role: 'FARMER',
            phone: '+91 94123 55678',
            location: 'Mathura, UP',
            verificationStatus: 'VERIFIED',
            pmKisanId: 'UP-2023-551980',
            khasraNo: '88/1, Mathura Rural Plot',
            landSizeAcres: 5.0,
            cluster_name: 'Mathura Farm Belt'
          },
          {
            id: 'USER-007',
            name: 'AgroPure Processing Ltd',
            role: 'BUYER',
            phone: '+91 98112 99881',
            location: 'Greater Noida',
            verificationStatus: 'VERIFIED',
            gstin: '09AABCA5567B1Z2',
            businessLegalName: 'AgroPure Food Processing Ltd',
            fssaiLicense: '10020051007890'
          }
        ]);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    setActionInProgress(userId);
    try {
      await updateKycStatusApi(userId, newStatus);
      setKycQueue((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, verificationStatus: newStatus } : u))
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const farmersList = dbUsers.filter((u) => u.role === 'FARMER');
  const buyersList = dbUsers.filter((u) => u.role === 'BUYER');

  const gmv = liveStats?.gmv ?? adminStats.totalTransactionValue;
  const totalFarmersCount = liveStats?.totalFarmers ?? adminStats.totalFarmers;
  const totalBuyersCount = liveStats?.totalBuyers ?? adminStats.totalBuyers;

  const filteredKycList = kycQueue.filter((u) => {
    if (kycFilter === 'ALL') return true;
    if (kycFilter === 'FARMER') return u.role === 'FARMER';
    if (kycFilter === 'BUYER') return u.role === 'BUYER';
    if (kycFilter === 'PENDING') return u.verificationStatus === 'PENDING';
    return true;
  });

  const verifiedFarmersCount = kycQueue.filter((u) => u.role === 'FARMER' && u.verificationStatus === 'VERIFIED').length;
  const verifiedBuyersCount = kycQueue.filter((u) => u.role === 'BUYER' && u.verificationStatus === 'VERIFIED').length;
  const pendingKycCount = kycQueue.filter((u) => u.verificationStatus === 'PENDING').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 font-sans">
      
      {/* 1. OVERVIEW TAB */}
      {(activeTab === 'overview' || activeTab === 'home') && (
        <div className="space-y-8">
          
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

          {/* Compliance & Trust Protocol Banner */}
          <section className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#0E3B2B] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <span>Kisan Trust Protocol & GSTIN Audit Desk</span>
                  <span className="text-[10px] uppercase font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    Anti-Middleman Protected
                  </span>
                </div>
                <div className="text-xs text-emerald-800">
                  {verifiedFarmersCount} PM-KISAN verified farmers · {verifiedBuyersCount} verified commercial wholesale buyers · Dynamic Price Collar active.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              className="px-4 py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 text-center"
            >
              Open Compliance Desk
            </button>
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

      {/* 2. COMPLIANCE & KYC VERIFICATION TAB */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h1 className="text-2xl font-semibold text-stone-900 font-serif">
                  Compliance & KYC Verification Desk
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Audit PM-KISAN land beneficiary records, survey numbers, and commercial GSTIN certificates to stop middlemen.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              Refresh Queue
            </button>
          </div>

          {/* KYC Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white border border-stone-200 rounded-xl">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Verified Farmers (PM-KISAN)</div>
              <div className="text-2xl font-mono font-bold text-emerald-800 mt-1">{verifiedFarmersCount}</div>
              <div className="text-[11px] text-stone-500 mt-0.5">Zero middlemen bypass</div>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Commercial Buyers (GSTIN)</div>
              <div className="text-2xl font-mono font-bold text-blue-800 mt-1">{verifiedBuyersCount}</div>
              <div className="text-[11px] text-stone-500 mt-0.5">E-way bill & tax compliant</div>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Pending Review</div>
              <div className="text-2xl font-mono font-bold text-stone-900 mt-1">{pendingKycCount}</div>
              <div className="text-[11px] text-stone-500 mt-0.5">Automated queue processing</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setKycFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                kycFilter === 'ALL' ? 'bg-[#0E3B2B] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Entities ({kycQueue.length})
            </button>
            <button
              type="button"
              onClick={() => setKycFilter('FARMER')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                kycFilter === 'FARMER' ? 'bg-[#0E3B2B] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Farmers (PM-KISAN)
            </button>
            <button
              type="button"
              onClick={() => setKycFilter('BUYER')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                kycFilter === 'BUYER' ? 'bg-[#0E3B2B] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Buyers (GSTIN)
            </button>
            <button
              type="button"
              onClick={() => setKycFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                kycFilter === 'PENDING' ? 'bg-[#0E3B2B] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Pending Approval ({pendingKycCount})
            </button>
          </div>

          {/* Verification Cards Queue */}
          <div className="space-y-3">
            {filteredKycList.map((user) => {
              const isFarmer = user.role === 'FARMER';
              const isPending = user.verificationStatus === 'PENDING';
              const isVerified = user.verificationStatus === 'VERIFIED';
              const isRejected = user.verificationStatus === 'REJECTED';

              return (
                <div
                  key={user.id}
                  className="p-4 sm:p-5 bg-white border border-stone-200 rounded-xl space-y-3 transition-shadow hover:shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-sm">{user.name}</span>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            isFarmer ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isFarmer ? 'Farmer (Producer)' : 'Corporate Buyer'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        ID: <span className="font-mono">{user.id}</span> · Phone: {user.phone} · Location: {user.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isRejected
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isVerified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />}
                        {isRejected && <XCircle className="w-3.5 h-3.5 text-rose-700" />}
                        {isPending && <AlertCircle className="w-3.5 h-3.5 text-amber-700" />}
                        <span>{user.verificationStatus}</span>
                      </span>
                    </div>
                  </div>

                  {/* KYC Data Payload Grid */}
                  {isFarmer ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3 rounded-lg">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">PM-KISAN ID</div>
                        <div className="font-mono font-semibold text-stone-900 mt-0.5">
                          {user.pmKisanId || 'UP-2024-889123'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">Khasra / Plot Survey</div>
                        <div className="font-semibold text-stone-900 mt-0.5">
                          {user.khasraNo || '142/2A, Agra Revenue Block'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">Acreage & Cluster</div>
                        <div className="font-semibold text-stone-900 mt-0.5">
                          {user.landSizeAcres || 3.5} Acres · {user.cluster_name || 'Agra Farm Cluster'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3 rounded-lg">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">15-Digit GSTIN</div>
                        <div className="font-mono font-semibold text-blue-900 mt-0.5">
                          {user.gstin || '07AAAAF1234A1Z5'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">Legal Registered Name</div>
                        <div className="font-semibold text-stone-900 mt-0.5 truncate">
                          {user.businessLegalName || 'FreshBasket Retail Enterprises Pvt Ltd'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">FSSAI Food License</div>
                        <div className="font-mono font-semibold text-stone-900 mt-0.5">
                          {user.fssaiLicense || '10019011004123'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1-Click Verification Action Controls */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-stone-400">
                      Cross-checked against state land registry & GST portal
                    </span>

                    <div className="flex items-center gap-2">
                      {user.verificationStatus !== 'VERIFIED' && (
                        <button
                          type="button"
                          disabled={actionInProgress === user.id}
                          onClick={() => handleUpdateStatus(user.id, 'VERIFIED')}
                          className="px-3 py-1.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {actionInProgress === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          <span>Approve & Verify</span>
                        </button>
                      )}

                      {user.verificationStatus !== 'REJECTED' && (
                        <button
                          type="button"
                          disabled={actionInProgress === user.id}
                          onClick={() => handleUpdateStatus(user.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ORDERS TAB */}
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

      {/* 4. LOGISTICS TAB */}
      {activeTab === 'logistics' && (
        <ErrorBoundary fallbackTitle="Cold-Chain Logistics Map">
          <LogisticsMap />
        </ErrorBoundary>
      )}

      {/* 5. USERS TAB */}
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
                      <div className="text-stone-500">{f.crops || 'Tomato, Potato, Wheat'} · {f.phone}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                      {f.verificationStatus || 'VERIFIED'}
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
                      <div className="text-stone-500">GSTIN: {b.gstin || '07AAAAF1234A1Z5'} · {b.phone}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                      {b.verificationStatus || 'VERIFIED'}
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
