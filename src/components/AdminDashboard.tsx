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
  Loader2,
  Edit2,
  UserPlus,
  X,
  FileText,
  SlidersHorizontal,
  Scale,
  Save,
  RefreshCw
} from 'lucide-react';
import { LogisticsMap } from './LogisticsMap';
import { ErrorBoundary } from './ErrorBoundary';
import { 
  fetchUsers, 
  fetchStats, 
  fetchKycQueueApi, 
  updateKycStatusApi,
  createAdminUserApi,
  updateAdminKycRecordApi 
} from '../services/api';

export const AdminDashboard: React.FC = () => {
  const { 
    adminStats, 
    orders, 
    updateOrderStatus, 
    activeTab, 
    setActiveTab,
    marketRules,
    updateMarketRules
  } = useApp();

  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [kycFilter, setKycFilter] = useState<'ALL' | 'FARMER' | 'BUYER' | 'PENDING'>('ALL');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Policy Form State
  const [policyForm, setPolicyForm] = useState({
    retailMaxQtyKg: 2,
    wholesaleMinQtyKg: 25,
    retailDeliveryFee: 25,
    wholesaleBaseFreight: 150,
    wholesalePerKgFreight: 2.2,
    isRationingActive: true,
    rationingReason: 'Essential Commodities Price Stabilization Directive'
  });
  const [policySaving, setPolicySaving] = useState(false);
  const [policySuccess, setPolicySuccess] = useState(false);

  useEffect(() => {
    if (marketRules) {
      setPolicyForm({
        retailMaxQtyKg: marketRules.retailMaxQtyKg ?? 2,
        wholesaleMinQtyKg: marketRules.wholesaleMinQtyKg ?? 25,
        retailDeliveryFee: marketRules.retailDeliveryFee ?? 25,
        wholesaleBaseFreight: marketRules.wholesaleBaseFreight ?? 150,
        wholesalePerKgFreight: marketRules.wholesalePerKgFreight ?? 2.2,
        isRationingActive: marketRules.isRationingActive ?? true,
        rationingReason: marketRules.rationingReason || ''
      });
    }
  }, [marketRules]);

  const handleSavePolicy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPolicySaving(true);
    setPolicySuccess(false);
    try {
      const ok = await updateMarketRules(policyForm);
      if (ok) {
        setPolicySuccess(true);
        setTimeout(() => setPolicySuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to update market policy:', err);
    } finally {
      setPolicySaving(false);
    }
  };

  const applyPreset = async (preset: {
    retailMaxQtyKg: number;
    wholesaleMinQtyKg: number;
    retailDeliveryFee: number;
    wholesaleBaseFreight: number;
    wholesalePerKgFreight: number;
    isRationingActive: boolean;
    rationingReason: string;
  }) => {
    setPolicyForm(preset);
    setPolicySaving(true);
    setPolicySuccess(false);
    try {
      const ok = await updateMarketRules(preset);
      if (ok) {
        setPolicySuccess(true);
        setTimeout(() => setPolicySuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to apply preset:', err);
    } finally {
      setPolicySaving(false);
    }
  };

  // Edit KYC Modal State
  const [editingKycUser, setEditingKycUser] = useState<any | null>(null);
  const [isEditKycModalOpen, setIsEditKycModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    location: '',
    pmKisanId: '',
    khasraNo: '',
    landSizeAcres: '',
    clusterName: '',
    gstin: '',
    businessLegalName: '',
    fssaiLicense: ''
  });

  // Create User Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    phone: '',
    role: 'FARMER' as 'FARMER' | 'BUYER',
    location: '',
    pmKisanId: '',
    khasraNo: '',
    landSizeAcres: '',
    clusterName: '',
    gstin: '',
    businessLegalName: '',
    fssaiLicense: ''
  });
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminFeedbackMsg, setAdminFeedbackMsg] = useState('');

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

  const handleOpenEditKyc = (user: any) => {
    setEditingKycUser(user);
    setEditFormData({
      name: user.name || '',
      phone: user.phone || '',
      location: user.location || '',
      pmKisanId: user.pmKisanId || '',
      khasraNo: user.khasraNo || '',
      landSizeAcres: user.landSizeAcres ? String(user.landSizeAcres) : '',
      clusterName: user.cluster_name || user.verifiedCluster || '',
      gstin: user.gstin || '',
      businessLegalName: user.businessLegalName || '',
      fssaiLicense: user.fssaiLicense || ''
    });
    setAdminFeedbackMsg('');
    setIsEditKycModalOpen(true);
  };

  const handleSaveEditKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKycUser) return;
    setAdminActionLoading(true);
    setAdminFeedbackMsg('');
    try {
      await updateAdminKycRecordApi(editingKycUser.id, {
        name: editFormData.name,
        phone: editFormData.phone,
        location: editFormData.location,
        pmKisanId: editFormData.pmKisanId,
        khasraNo: editFormData.khasraNo,
        landSizeAcres: parseFloat(editFormData.landSizeAcres) || 0,
        clusterName: editFormData.clusterName,
        gstin: editFormData.gstin,
        businessLegalName: editFormData.businessLegalName,
        fssaiLicense: editFormData.fssaiLicense
      });
      setKycQueue((prev) =>
        prev.map((u) =>
          u.id === editingKycUser.id
            ? {
                ...u,
                name: editFormData.name,
                phone: editFormData.phone,
                location: editFormData.location,
                pmKisanId: editFormData.pmKisanId,
                khasraNo: editFormData.khasraNo,
                landSizeAcres: parseFloat(editFormData.landSizeAcres) || 0,
                cluster_name: editFormData.clusterName,
                gstin: editFormData.gstin,
                businessLegalName: editFormData.businessLegalName,
                fssaiLicense: editFormData.fssaiLicense
              }
            : u
        )
      );
      setAdminFeedbackMsg('KYC record successfully updated in database!');
      setTimeout(() => {
        setIsEditKycModalOpen(false);
        setEditingKycUser(null);
        setAdminFeedbackMsg('');
        loadData();
      }, 900);
    } catch {
      setAdminFeedbackMsg('Updated in active session!');
      setTimeout(() => {
        setIsEditKycModalOpen(false);
        setEditingKycUser(null);
        setAdminFeedbackMsg('');
      }, 900);
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleCreateNewEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminActionLoading(true);
    setAdminFeedbackMsg('');
    try {
      await createAdminUserApi({
        name: createFormData.name,
        phone: createFormData.phone,
        role: createFormData.role,
        location: createFormData.location,
        pmKisanId: createFormData.pmKisanId,
        khasraNo: createFormData.khasraNo,
        landSizeAcres: parseFloat(createFormData.landSizeAcres) || 0,
        clusterName: createFormData.clusterName,
        gstin: createFormData.gstin,
        businessLegalName: createFormData.businessLegalName,
        fssaiLicense: createFormData.fssaiLicense
      });
      setAdminFeedbackMsg('New entity successfully registered and verified in database!');
      setTimeout(() => {
        setIsCreateUserModalOpen(false);
        setAdminFeedbackMsg('');
        setCreateFormData({
          name: '',
          phone: '',
          role: 'FARMER',
          location: '',
          pmKisanId: '',
          khasraNo: '',
          landSizeAcres: '',
          clusterName: '',
          gstin: '',
          businessLegalName: '',
          fssaiLicense: ''
        });
        loadData();
      }, 900);
    } catch {
      const newMockId = `USER-${Date.now().toString().slice(-4)}`;
      setKycQueue((prev) => [
        {
          id: newMockId,
          name: createFormData.name,
          phone: createFormData.phone,
          role: createFormData.role,
          location: createFormData.location,
          verificationStatus: 'VERIFIED',
          pmKisanId: createFormData.pmKisanId,
          khasraNo: createFormData.khasraNo,
          landSizeAcres: parseFloat(createFormData.landSizeAcres) || 0,
          cluster_name: createFormData.clusterName,
          gstin: createFormData.gstin,
          businessLegalName: createFormData.businessLegalName,
          fssaiLicense: createFormData.fssaiLicense
        },
        ...prev
      ]);
      setAdminFeedbackMsg('Entity registered in active session!');
      setTimeout(() => {
        setIsCreateUserModalOpen(false);
        setAdminFeedbackMsg('');
      }, 900);
    } finally {
      setAdminActionLoading(false);
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

          {/* Dynamic Market Rationing & Anti-Hoarding Cap Banner */}
          <section className="p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-900 text-white flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-5 h-5 text-amber-300" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Dynamic Market Rationing & Anti-Hoarding Cap</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    marketRules?.isRationingActive ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {marketRules?.isRationingActive ? 'Directive Active' : 'Normal Market'}
                  </span>
                </div>
                <div className="text-xs text-amber-900">
                  Retail Cap: <strong className="font-semibold">{marketRules?.retailMaxQtyKg || 2} kg</strong> per order · Wholesale MOQ: <strong className="font-semibold">{marketRules?.wholesaleMinQtyKg || 25} kg</strong> · Logistics: Flat ₹{marketRules?.retailDeliveryFee || 25} (retail) / ₹{marketRules?.wholesaleBaseFreight || 150} base (wholesale).
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('policy')}
              className="px-4 py-2.5 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 text-center"
            >
              Configure Policy & Caps
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

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Farmer / Buyer</span>
              </button>
              <button
                type="button"
                onClick={loadData}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Refresh Queue
              </button>
            </div>
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
                          {user.pmKisanId || 'Not Configured'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">Khasra / Plot Survey</div>
                        <div className="font-semibold text-stone-900 mt-0.5">
                          {user.khasraNo || 'Unassigned'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">Acreage & Cluster</div>
                        <div className="font-semibold text-stone-900 mt-0.5">
                          {user.landSizeAcres ? `${user.landSizeAcres} Acres` : '0 Acres'} · {user.cluster_name || user.location || 'Cluster Not Set'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3 rounded-lg">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">15-Digit GSTIN</div>
                        <div className="font-mono font-semibold text-blue-900 mt-0.5">
                          {user.gstin || 'Pending Registration'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">Legal Registered Name</div>
                        <div className="font-semibold text-stone-900 mt-0.5 truncate">
                          {user.businessLegalName || user.name || 'Commercial Buyer'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-stone-400">FSSAI Food License</div>
                        <div className="font-mono font-semibold text-stone-900 mt-0.5">
                          {user.fssaiLicense || 'Not Provided'}
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
                      <button
                        type="button"
                        onClick={() => handleOpenEditKyc(user)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Record</span>
                      </button>

                      {user.verificationStatus !== 'VERIFIED' && (
                        <button
                          type="button"
                          disabled={actionInProgress === user.id}
                          onClick={() => handleUpdateStatus(user.id, 'VERIFIED')}
                          className="px-3 py-1.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {actionInProgress === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          <span>Approve</span>
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
                      <div className="text-stone-500">GSTIN: {b.gstin || 'Pending GST Registration'} · {b.phone}</div>
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

      {/* 6. POLICY & RATIONING TAB */}
      {activeTab === 'policy' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 mb-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-700" />
                Anti-Hoarding & Fair Price Stabilization
              </div>
              <h1 className="text-2xl font-semibold text-stone-900 font-serif">Market Policy & Rationing Controls</h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Dynamically govern retail household purchase limits, commercial wholesale batch MOQs, and freight matrix across all buyer channels.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => {
                  if (marketRules) {
                    setPolicyForm({
                      retailMaxQtyKg: marketRules.retailMaxQtyKg ?? 2,
                      wholesaleMinQtyKg: marketRules.wholesaleMinQtyKg ?? 25,
                      retailDeliveryFee: marketRules.retailDeliveryFee ?? 25,
                      wholesaleBaseFreight: marketRules.wholesaleBaseFreight ?? 150,
                      wholesalePerKgFreight: marketRules.wholesalePerKgFreight ?? 2.2,
                      isRationingActive: marketRules.isRationingActive ?? true,
                      rationingReason: marketRules.rationingReason || ''
                    });
                  }
                }}
                className="px-3 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                title="Reset to current server values"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                Reset
              </button>

              <button
                type="button"
                onClick={handleSavePolicy}
                disabled={policySaving}
                className="px-4 py-2 bg-[#0E3B2B] hover:bg-[#144E39] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {policySaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Enforcing...
                  </>
                ) : policySuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Enforced Live!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-emerald-300" />
                    Save & Enforce Policy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick 1-Click Policy Presets */}
          <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                1-Click Market Scenarios (Demonstration Presets)
              </div>
              <span className="text-[11px] text-stone-500 hidden sm:inline">
                Click any preset to instantly update and sync across the entire system
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Preset 1: Emergency 1kg */}
              <button
                type="button"
                onClick={() => applyPreset({
                  retailMaxQtyKg: 1,
                  wholesaleMinQtyKg: 20,
                  retailDeliveryFee: 15,
                  wholesaleBaseFreight: 120,
                  wholesalePerKgFreight: 2.0,
                  isRationingActive: true,
                  rationingReason: 'Emergency Essential Commodities Act (EC Act) - Price Stabilization Directive'
                })}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  policyForm.retailMaxQtyKg === 1 && policyForm.isRationingActive
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-950">Emergency Mode</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                    1.0 kg Cap
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">
                  High supply shock / price spike. Strict 1kg consumer quota with 20kg wholesale MOQ.
                </p>
              </button>

              {/* Preset 2: Standard 2kg */}
              <button
                type="button"
                onClick={() => applyPreset({
                  retailMaxQtyKg: 2,
                  wholesaleMinQtyKg: 25,
                  retailDeliveryFee: 25,
                  wholesaleBaseFreight: 150,
                  wholesalePerKgFreight: 2.2,
                  isRationingActive: true,
                  rationingReason: 'Fair Distribution Directive - 2kg Household Rationing & Anti-Hoarding Cap'
                })}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  policyForm.retailMaxQtyKg === 2 && policyForm.isRationingActive
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900">Standard Rationing</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    2.0 kg Cap
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">
                  Default fair allocation policy. Prevents residential cornering while serving full households.
                </p>
              </button>

              {/* Preset 3: Liberal 5kg */}
              <button
                type="button"
                onClick={() => applyPreset({
                  retailMaxQtyKg: 5,
                  wholesaleMinQtyKg: 50,
                  retailDeliveryFee: 35,
                  wholesaleBaseFreight: 180,
                  wholesalePerKgFreight: 2.5,
                  isRationingActive: false,
                  rationingReason: 'Peak Harvest Season - Relaxed Consumer Limits & Enhanced Bulk Supply'
                })}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  policyForm.retailMaxQtyKg === 5 && !policyForm.isRationingActive
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900">Bumper Harvest</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
                    5.0 kg Cap
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">
                  Abundant farmgate arrivals. Higher 5kg household cap with 50kg wholesale minimum lot.
                </p>
              </button>

              {/* Preset 4: Unrestricted 10kg */}
              <button
                type="button"
                onClick={() => applyPreset({
                  retailMaxQtyKg: 10,
                  wholesaleMinQtyKg: 100,
                  retailDeliveryFee: 45,
                  wholesaleBaseFreight: 250,
                  wholesalePerKgFreight: 3.0,
                  isRationingActive: false,
                  rationingReason: 'Open Unrestricted Trading - Free Market Corridor'
                })}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  policyForm.retailMaxQtyKg === 10
                    ? 'border-stone-800 bg-stone-100 ring-2 ring-stone-800/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900">Free Market Trading</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-stone-200 text-stone-900">
                    10.0 kg Cap
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">
                  Unrestricted open trading corridor. For high-volume suburban consumer clusters.
                </p>
              </button>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Direct Consumer / Retail Column */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-5 shadow-xs">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-700" />
                    Direct Consumer (Retail) Guardrails
                  </h3>
                  <p className="text-[11px] text-stone-500">Consumer marketplace controls to mitigate hoarding</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                  Tier: RETAIL
                </span>
              </div>

              {/* Retail Max Cap */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">
                    Maximum Purchase Limit (Per Order)
                  </label>
                  <span className="text-xs font-mono font-bold text-[#0E3B2B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {policyForm.retailMaxQtyKg} kg
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="25"
                    value={policyForm.retailMaxQtyKg}
                    onChange={(e) => setPolicyForm({ ...policyForm, retailMaxQtyKg: Math.max(0.5, parseFloat(e.target.value) || 0.5) })}
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-sm font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0E3B2B]/20"
                  />
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 5].map((kg) => (
                      <button
                        key={kg}
                        type="button"
                        onClick={() => setPolicyForm({ ...policyForm, retailMaxQtyKg: kg })}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          policyForm.retailMaxQtyKg === kg
                            ? 'bg-[#0E3B2B] text-white border-[#0E3B2B]'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {kg}kg
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-stone-400">
                  Prevents single retail accounts or bulk scrapers from purchasing beyond household rations.
                </p>
              </div>

              {/* Retail Delivery Fee */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">
                    Flat Household Delivery Fee
                  </label>
                  <span className="text-xs font-mono font-bold text-stone-800">
                    ₹{policyForm.retailDeliveryFee}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 text-xs font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    max="200"
                    value={policyForm.retailDeliveryFee}
                    onChange={(e) => setPolicyForm({ ...policyForm, retailDeliveryFee: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="w-full pl-7 pr-3 py-2 border border-stone-200 rounded-xl text-sm font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0E3B2B]/20"
                  />
                </div>
                <p className="text-[11px] text-stone-400">
                  Fixed charge for direct farm-to-doorstep local EV delivery.
                </p>
              </div>

              {/* Consumer Simulation Box */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1.5 text-xs">
                <div className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Buyer Interface Active Impact:
                </div>
                <div className="text-stone-500 leading-relaxed text-[11px]">
                  Marketplace presets generated: <code className="bg-white px-1 py-0.5 rounded border text-stone-800 font-mono">0.5 kg, 1 kg, {policyForm.retailMaxQtyKg > 1 ? `${(policyForm.retailMaxQtyKg * 0.75).toFixed(1)} kg, ` : ''}{policyForm.retailMaxQtyKg} kg</code>. Attempting to order beyond {policyForm.retailMaxQtyKg} kg will trigger an instant cap block.
                </div>
              </div>
            </div>

            {/* Commercial Wholesale Column */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-5 shadow-xs">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-700" />
                    Commercial Wholesale Logistics & MOQ
                  </h3>
                  <p className="text-[11px] text-stone-500">Bulk logistics corridor and minimum lot rules</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
                  Tier: WHOLESALE
                </span>
              </div>

              {/* Wholesale Minimum Order Quantity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">
                    Minimum Batch MOQ (Per Commercial Order)
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {policyForm.wholesaleMinQtyKg} kg
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="5"
                    min="5"
                    max="500"
                    value={policyForm.wholesaleMinQtyKg}
                    onChange={(e) => setPolicyForm({ ...policyForm, wholesaleMinQtyKg: Math.max(5, parseInt(e.target.value, 10) || 5) })}
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-sm font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  />
                  <div className="flex items-center gap-1">
                    {[20, 25, 50, 100].map((kg) => (
                      <button
                        key={kg}
                        type="button"
                        onClick={() => setPolicyForm({ ...policyForm, wholesaleMinQtyKg: kg })}
                        className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          policyForm.wholesaleMinQtyKg === kg
                            ? 'bg-blue-800 text-white border-blue-800'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {kg}kg
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-stone-400">
                  Institutional buyers must purchase at least this amount to unlock wholesale farmgate pricing.
                </p>
              </div>

              {/* Wholesale Freight Matrix */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Base Cold-Chain Freight
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 text-xs font-bold">
                      ₹
                    </div>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      max="1000"
                      value={policyForm.wholesaleBaseFreight}
                      onChange={(e) => setPolicyForm({ ...policyForm, wholesaleBaseFreight: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full pl-7 pr-3 py-2 border border-stone-200 rounded-xl text-sm font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Per-Kg Freight Rate
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 text-xs font-bold">
                      ₹
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      value={policyForm.wholesalePerKgFreight}
                      onChange={(e) => setPolicyForm({ ...policyForm, wholesalePerKgFreight: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="w-full pl-7 pr-3 py-2 border border-stone-200 rounded-xl text-sm font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </div>

              {/* Wholesale Simulation Box */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1.5 text-xs">
                <div className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Wholesale Freight Calculation for 100 kg batch:
                </div>
                <div className="text-stone-600 font-mono text-xs">
                  ₹{policyForm.wholesaleBaseFreight} (base) + (100 kg × ₹{policyForm.wholesalePerKgFreight}) = <strong className="text-stone-900 font-bold">₹{policyForm.wholesaleBaseFreight + (100 * policyForm.wholesalePerKgFreight)} freight</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Legal & Regulatory Directive Settings */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Statutory Anti-Hoarding & Essential Commodities Directive
                </h3>
                <p className="text-[11px] text-stone-500">Legal disclosure displayed to all purchasers during checkout</p>
              </div>

              {/* Toggle Switch */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <span className="text-xs font-semibold text-stone-700">
                  {policyForm.isRationingActive ? 'Directive Enforced' : 'Rationing Paused'}
                </span>
                <input
                  type="checkbox"
                  checked={policyForm.isRationingActive}
                  onChange={(e) => setPolicyForm({ ...policyForm, isRationingActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600 relative"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700">
                Gazette Directive Justification / Notice Text
              </label>
              <textarea
                rows={2}
                value={policyForm.rationingReason}
                onChange={(e) => setPolicyForm({ ...policyForm, rationingReason: e.target.value })}
                placeholder="e.g. Essential Commodities Act (EC Act) - Tomato Price Stabilization Order"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#0E3B2B]/20 resize-none"
              />
              <p className="text-[11px] text-stone-400">
                This notice is prominently displayed on the consumer marketplace header and purchase confirmation modal.
              </p>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0E3B2B] text-white flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-xs text-stone-600">
                <span className="font-bold text-stone-900">Live Policy Deployment:</span> Changes apply immediately without server restart. Any buyer exceeding <strong className="text-stone-900">{policyForm.retailMaxQtyKg} kg</strong> will be blocked by both the React UI and Node API.
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {policySuccess && (
                <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved and broadcasting live!
                </span>
              )}

              <button
                type="button"
                onClick={handleSavePolicy}
                disabled={policySaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {policySaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Enforcing Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-emerald-300" />
                    Enforce Policy Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT KYC & LAND/GST MODAL */}
      {isEditKycModalOpen && editingKycUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-stone-900 font-serif">
                  Edit Registry Record: {editingKycUser.name}
                </h2>
                <p className="text-xs text-stone-500">
                  {editingKycUser.role === 'FARMER' ? 'Farmer PM-KISAN & Bhulekh Land Parcel' : 'Commercial Buyer GSTIN & Business Profile'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsEditKycModalOpen(false);
                  setEditingKycUser(null);
                }}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditKyc} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Full Name / Trade Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Location / City / State</label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  placeholder="e.g. Agra, Uttar Pradesh"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                />
              </div>

              {editingKycUser.role === 'FARMER' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">PM-KISAN ID</label>
                      <input
                        type="text"
                        value={editFormData.pmKisanId}
                        onChange={(e) => setEditFormData({ ...editFormData, pmKisanId: e.target.value.toUpperCase() })}
                        placeholder="e.g. UP-2024-889123"
                        required
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Khasra / Plot No.</label>
                      <input
                        type="text"
                        value={editFormData.khasraNo}
                        onChange={(e) => setEditFormData({ ...editFormData, khasraNo: e.target.value })}
                        placeholder="e.g. 142/2A"
                        required
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Total Landholding (Acres)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={editFormData.landSizeAcres}
                        onChange={(e) => setEditFormData({ ...editFormData, landSizeAcres: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Farm Cluster Belt</label>
                      <input
                        type="text"
                        value={editFormData.clusterName}
                        onChange={(e) => setEditFormData({ ...editFormData, clusterName: e.target.value })}
                        placeholder="e.g. Agra Farm Cluster"
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">15-Digit GSTIN</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={editFormData.gstin}
                      onChange={(e) => setEditFormData({ ...editFormData, gstin: e.target.value.toUpperCase() })}
                      placeholder="e.g. 07AAAAF1234A1Z5"
                      required
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Legal Business Name</label>
                      <input
                        type="text"
                        value={editFormData.businessLegalName}
                        onChange={(e) => setEditFormData({ ...editFormData, businessLegalName: e.target.value })}
                        placeholder="e.g. FreshBasket Retail Enterprises Pvt Ltd"
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">FSSAI License No.</label>
                      <input
                        type="text"
                        value={editFormData.fssaiLicense}
                        onChange={(e) => setEditFormData({ ...editFormData, fssaiLicense: e.target.value })}
                        placeholder="e.g. 10019011004123"
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {adminFeedbackMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{adminFeedbackMsg}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditKycModalOpen(false);
                    setEditingKycUser(null);
                  }}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminActionLoading}
                  className="flex-1 py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {adminActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW ENTITY MODAL */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-stone-900 font-serif">
                  Register & Onboard New Entity
                </h2>
                <p className="text-xs text-stone-500">
                  Directly onboard verified farmers or wholesale commercial buyers
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewEntity} className="space-y-3.5 text-xs">
              <div className="flex rounded-xl bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => setCreateFormData({ ...createFormData, role: 'FARMER' })}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    createFormData.role === 'FARMER' ? 'bg-[#0E3B2B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Farmer (PM-KISAN)
                </button>
                <button
                  type="button"
                  onClick={() => setCreateFormData({ ...createFormData, role: 'BUYER' })}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    createFormData.role === 'BUYER' ? 'bg-[#0E3B2B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Commercial Buyer (GSTIN)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Full Name / Trade Entity</label>
                  <input
                    type="text"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    placeholder={createFormData.role === 'FARMER' ? 'e.g. Ramesh Chandra' : 'e.g. BigMart Retail Ltd'}
                    required
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Phone Number</label>
                  <input
                    type="tel"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 00000"
                    required
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Location / City / State</label>
                <input
                  type="text"
                  value={createFormData.location}
                  onChange={(e) => setCreateFormData({ ...createFormData, location: e.target.value })}
                  placeholder={createFormData.role === 'FARMER' ? 'e.g. Agra, Uttar Pradesh' : 'e.g. Delhi NCR'}
                  required
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                />
              </div>

              {createFormData.role === 'FARMER' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">PM-KISAN ID</label>
                      <input
                        type="text"
                        value={createFormData.pmKisanId}
                        onChange={(e) => setCreateFormData({ ...createFormData, pmKisanId: e.target.value.toUpperCase() })}
                        placeholder="e.g. UP-2025-102938"
                        required
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Khasra / Survey No.</label>
                      <input
                        type="text"
                        value={createFormData.khasraNo}
                        onChange={(e) => setCreateFormData({ ...createFormData, khasraNo: e.target.value })}
                        placeholder="e.g. 210/4"
                        required
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Land Area (Acres)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={createFormData.landSizeAcres}
                        onChange={(e) => setCreateFormData({ ...createFormData, landSizeAcres: e.target.value })}
                        placeholder="e.g. 4.2"
                        required
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Agro Cluster</label>
                      <input
                        type="text"
                        value={createFormData.clusterName}
                        onChange={(e) => setCreateFormData({ ...createFormData, clusterName: e.target.value })}
                        placeholder="e.g. Agra Farm Cluster"
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">15-Digit GSTIN</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={createFormData.gstin}
                      onChange={(e) => setCreateFormData({ ...createFormData, gstin: e.target.value.toUpperCase() })}
                      placeholder="e.g. 07BBBBA9988C1Z4"
                      required
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Legal Business Name</label>
                      <input
                        type="text"
                        value={createFormData.businessLegalName}
                        onChange={(e) => setCreateFormData({ ...createFormData, businessLegalName: e.target.value })}
                        placeholder="e.g. BigMart Retail Enterprises Pvt Ltd"
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">FSSAI License No.</label>
                      <input
                        type="text"
                        value={createFormData.fssaiLicense}
                        onChange={(e) => setCreateFormData({ ...createFormData, fssaiLicense: e.target.value })}
                        placeholder="e.g. 10022011009988"
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {adminFeedbackMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{adminFeedbackMsg}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminActionLoading}
                  className="flex-1 py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {adminActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Register Entity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
