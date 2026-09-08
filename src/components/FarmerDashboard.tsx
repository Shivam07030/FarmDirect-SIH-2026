import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory } from '../types';
import { 
  Plus, 
  X, 
  Phone, 
  MapPin, 
  Navigation, 
  TrendingUp, 
  Camera as CameraIcon, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  SlidersHorizontal,
  FileText,
  Check,
  Loader2,
  Truck,
  LifeBuoy,
  Star,
  Search,
  Landmark,
  CreditCard,
  BadgeCheck
} from 'lucide-react';
import { getCurrentCoordinates } from '../services/locationService';
import { captureProducePhoto } from '../services/cameraService';
import { fetchMarketRates, updateFarmerProfileApi, verifyMeonPennyDropApi, verifyMeonPanApi, verifyMeonAadhaarApi } from '../services/api';
import { OrderTrackingModal } from './OrderTrackingModal';
import { GrievanceModal } from './GrievanceModal';
import { Order } from '../types';

export const FarmerDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    addProduct, 
    updateOrderStatus,
    farmerName,
    currentUser,
    updateCurrentUserProfile,
    activeTab,
    farmerStats,
    language
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState(false);
  const [grievanceOrderId, setGrievanceOrderId] = useState('');

  // Farmer KYC & Land Record Management State
  const [kycFormPmKisan, setKycFormPmKisan] = useState(currentUser?.farmerKyc?.pmKisanId || '');
  const [kycFormKhasra, setKycFormKhasra] = useState(currentUser?.farmerKyc?.khasraNo || '');
  const [kycFormLandSize, setKycFormLandSize] = useState(currentUser?.farmerKyc?.landSizeAcres ? String(currentUser.farmerKyc.landSizeAcres) : '');
  const [kycFormCluster, setKycFormCluster] = useState(currentUser?.farmerKyc?.verifiedCluster || 'Agra Farm Cluster');
  const [kycFormAadhaar, setKycFormAadhaar] = useState(currentUser?.farmerKyc?.aadhaarNo || '');
  const [kycFormPan, setKycFormPan] = useState(currentUser?.farmerKyc?.panNo || '');
  const [kycFormBankAccount, setKycFormBankAccount] = useState(currentUser?.farmerKyc?.bankAccountNo || '');
  const [kycFormBankIfsc, setKycFormBankIfsc] = useState(currentUser?.farmerKyc?.bankIfsc || '');
  const [kycFormBankName, setKycFormBankName] = useState(currentUser?.farmerKyc?.bankName || 'State Bank of India');
  const [kycVerifyingField, setKycVerifyingField] = useState<string | null>(null);
  const [kycSaving, setKycSaving] = useState(false);
  const [kycSuccessMsg, setKycSuccessMsg] = useState('');

  const [cropName, setCropName] = useState('Tomato');
  const [quantity, setQuantity] = useState(450);
  const [pricePerKg, setPricePerKg] = useState(24);
  const [category, setCategory] = useState<ProductCategory>('Vegetables');
  const [farmLocation, setFarmLocation] = useState('Agra Farm Cluster');
  const [isLocating, setIsLocating] = useState(false);

  const isHindi = language === 'hi';

  const [produceImage, setProduceImage] = useState<string>('');
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [marketRates, setMarketRates] = useState<any[]>([]);

  useEffect(() => {
    fetchMarketRates().then((rates) => {
      if (rates && rates.length > 0) {
        setMarketRates(rates);
      }
    });
  }, []);

  const farmerFirstName = farmerName.split(' ')[0].toLowerCase();
  const myProduce = products.filter(
    (p) => p.farmerName.toLowerCase().includes(farmerFirstName) || p.farmerName.toLowerCase().includes('rajesh') || p.farmerName.toLowerCase().includes('you')
  );
  const myOrders = orders.filter(
    (o) => o.farmerName.toLowerCase().includes(farmerFirstName) || o.farmerName.toLowerCase().includes('rajesh') || o.farmerName.toLowerCase().includes('you')
  );

  const [farmerOrderQuery, setFarmerOrderQuery] = useState('');
  const [farmerOrderStatus, setFarmerOrderStatus] = useState<'ALL' | 'Confirmed' | 'In Transit' | 'Delivered' | 'RATED'>('ALL');
  const [farmerProduceQuery, setFarmerProduceQuery] = useState('');

  const filteredFarmerOrders = myOrders.filter((o) => {
    const q = farmerOrderQuery.toLowerCase().trim();
    const matchQ = !q || o.id.toLowerCase().includes(q) || o.productName.toLowerCase().includes(q) || o.buyerName.toLowerCase().includes(q);
    let matchStatus = true;
    if (farmerOrderStatus === 'RATED') {
      matchStatus = Boolean(o.rating);
    } else if (farmerOrderStatus !== 'ALL') {
      matchStatus = o.status === farmerOrderStatus;
    }
    return matchQ && matchStatus;
  });

  const filteredMyProduce = myProduce.filter((p) => {
    const q = farmerProduceQuery.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || (p.variety && p.variety.toLowerCase().includes(q)) || p.category.toLowerCase().includes(q);
  });

  const handleVerifyKycAadhaar = async () => {
    const clean = kycFormAadhaar.replace(/\D/g, '');
    if (clean.length !== 12) return;
    setKycVerifyingField('aadhaar');
    try {
      const res = await verifyMeonAadhaarApi(clean, farmerName, currentUser?.phone);
      if (res.success) {
        setKycSuccessMsg('Aadhaar Verified via Meon UIDAI / DigiLocker!');
      }
    } catch {
    } finally {
      setKycVerifyingField(null);
    }
  };

  const handleVerifyKycPan = async () => {
    const clean = kycFormPan.trim().toUpperCase();
    if (clean.length !== 10) return;
    setKycVerifyingField('pan');
    try {
      const res = await verifyMeonPanApi(clean, farmerName);
      if (res.success) {
        setKycSuccessMsg('NSDL Taxpayer Active via Meon PAN API!');
      }
    } catch {
    } finally {
      setKycVerifyingField(null);
    }
  };

  const handleVerifyKycBank = async () => {
    const cleanAcct = kycFormBankAccount.replace(/\D/g, '');
    const cleanIfsc = kycFormBankIfsc.trim().toUpperCase();
    if (cleanAcct.length < 9 || cleanIfsc.length !== 11) return;
    setKycVerifyingField('bank');
    try {
      const res = await verifyMeonPennyDropApi(cleanAcct, cleanIfsc, farmerName, currentUser?.phone);
      if (res.success) {
        if (res.bankName) setKycFormBankName(res.bankName);
        setKycSuccessMsg('Bank Validated via Meon Pennydrop (DBT Linked)!');
      }
    } catch {
    } finally {
      setKycVerifyingField(null);
    }
  };

  const handleSaveFarmerKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycSaving(true);
    setKycSuccessMsg('');
    const numericLandSize = parseFloat(kycFormLandSize) || 0;
    try {
      if (currentUser?.id) {
        await updateFarmerProfileApi(currentUser.id, {
          pmKisanId: kycFormPmKisan,
          khasraNo: kycFormKhasra,
          landSizeAcres: numericLandSize,
          verifiedCluster: kycFormCluster,
          aadhaarNo: kycFormAadhaar,
          panNo: kycFormPan,
          bankAccountNo: kycFormBankAccount,
          bankIfsc: kycFormBankIfsc,
          bankName: kycFormBankName
        });
      }
      updateCurrentUserProfile({
        farmerKyc: {
          pmKisanId: kycFormPmKisan,
          khasraNo: kycFormKhasra,
          landSizeAcres: numericLandSize,
          verifiedCluster: kycFormCluster,
          aadhaarNo: kycFormAadhaar,
          panNo: kycFormPan,
          bankAccountNo: kycFormBankAccount,
          bankIfsc: kycFormBankIfsc,
          bankName: kycFormBankName,
          dbtLinked: Boolean(kycFormBankAccount || kycFormAadhaar),
          isVerified: true
        }
      });
      setKycSuccessMsg(isHindi ? 'पीएम-किसान, आधार व बैंक रिकॉर्ड सफलतापूर्वक अपडेट हुआ!' : 'Land, PM-KISAN, Aadhaar & Bank records updated successfully!');
      setTimeout(() => {
        setIsKycModalOpen(false);
        setKycSuccessMsg('');
      }, 1000);
    } catch {
      updateCurrentUserProfile({
        farmerKyc: {
          pmKisanId: kycFormPmKisan,
          khasraNo: kycFormKhasra,
          landSizeAcres: numericLandSize,
          verifiedCluster: kycFormCluster,
          aadhaarNo: kycFormAadhaar,
          panNo: kycFormPan,
          bankAccountNo: kycFormBankAccount,
          bankIfsc: kycFormBankIfsc,
          bankName: kycFormBankName,
          dbtLinked: Boolean(kycFormBankAccount || kycFormAadhaar),
          isVerified: true
        }
      });
      setKycSuccessMsg(isHindi ? 'सत्र में सफलतापूर्वक अपडेट हुआ!' : 'Updated in active session!');
      setTimeout(() => {
        setIsKycModalOpen(false);
        setKycSuccessMsg('');
      }, 1000);
    } finally {
      setKycSaving(false);
    }
  };

  const upcomingPickup = myOrders.find((o) => o.status === 'Confirmed' || o.status === 'In Transit') || myOrders[0];
  const calculatedEarnings = myOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  const displayEarnings = farmerStats.totalEarningsInr > 0 ? farmerStats.totalEarningsInr : calculatedEarnings;

  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await getCurrentCoordinates();
      setFarmLocation(`${loc.locationName} (GPS: ${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)})`);
    } finally {
      setIsLocating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setIsCapturingPhoto(false);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setProduceImage(reader.result as string);
      }
      setIsCapturingPhoto(false);
    };
    reader.onerror = () => {
      setIsCapturingPhoto(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCapturePhoto = async () => {
    setIsCapturingPhoto(true);

    try {
      const photo = await captureProducePhoto();
      if (photo?.imageUrl) {
        setProduceImage(photo.imageUrl);
      }
    } catch (err: any) {
      console.warn('Direct camera capture fallback:', err);
      // Fallback to file input picker if direct capture timed out or had issues
      if (fileInputRef.current && !err?.message?.includes('cancelled')) {
        fileInputRef.current.click();
      }
    } finally {
      setIsCapturingPhoto(false);
    }
  };

  const activeRate = marketRates.find((r) => 
    cropName.toLowerCase().includes(r.crop_name?.toLowerCase() || '') || 
    (r.crop_name && r.crop_name.toLowerCase().includes(cropName.toLowerCase()))
  );
  const floorPrice = activeRate?.priceFloor 
    ? Number(activeRate.priceFloor) 
    : (cropName.toLowerCase().includes('potato') ? 12 : cropName.toLowerCase().includes('onion') ? 18 : cropName.toLowerCase().includes('wheat') ? 24 : cropName.toLowerCase().includes('mustard') ? 42 : 16);
  const ceilingPrice = activeRate?.priceCeiling 
    ? Number(activeRate.priceCeiling) 
    : (cropName.toLowerCase().includes('potato') ? 22 : cropName.toLowerCase().includes('onion') ? 35 : cropName.toLowerCase().includes('wheat') ? 38 : cropName.toLowerCase().includes('mustard') ? 60 : 32);
  const recommendedPrice = activeRate?.farmdirect_farmer_price 
    ? Number(activeRate.farmdirect_farmer_price) 
    : (cropName.toLowerCase().includes('potato') ? 18 : cropName.toLowerCase().includes('onion') ? 27 : cropName.toLowerCase().includes('wheat') ? 31 : cropName.toLowerCase().includes('mustard') ? 52 : 24);

  const isBelowFloor = pricePerKg < floorPrice;
  const isAboveCeil = pricePerKg > ceilingPrice;
  const isCollarCompliant = !isBelowFloor && !isAboveCeil;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isBelowFloor) {
      alert(isHindi 
        ? `मूल्य न्यूनतम मूल्य सीमा (₹${floorPrice}/kg) से कम है। संकट बिक्री प्रतिबंधित है।` 
        : `Price is below Fair Floor Price (₹${floorPrice}/kg). Distressed selling is restricted to protect farmer livelihoods.`);
      return;
    }
    if (isAboveCeil) {
      alert(isHindi 
        ? `मूल्य अधिकतम सीमा (₹${ceilingPrice}/kg) से अधिक है। मूल्य वृद्धि प्रतिबंधित है।` 
        : `Price exceeds Fair Price Ceiling (₹${ceilingPrice}/kg). Speculative price gouging is restricted.`);
      return;
    }

    addProduct({
      name: cropName,
      category,
      quantity: Number(quantity),
      initialQuantity: Number(quantity),
      pricePerKg: Number(pricePerKg),
      location: farmLocation || 'Agra',
      harvestDate: new Date().toISOString().split('T')[0],
      quality: 'Grade A (Premium)',
      farmerName: `${farmerName} (You)`,
      farmerPhone: '+91 98765 43210',
      imageUrl: produceImage || undefined,
    });
    setProduceImage('');
    setIsAddModalOpen(false);
  };

  const handleTriggerSellTomato = () => {
    setCropName('Tomato');
    setPricePerKg(27);
    setQuantity(300);
    setIsAddModalOpen(true);
  };

  const cropPresets = [
    { 
      name: 'Tomato', 
      label: isHindi ? 'टमाटर' : 'Tomato', 
      price: 27, 
      cat: 'Vegetables' as ProductCategory,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
    },
    { 
      name: 'Potato', 
      label: isHindi ? 'आलू' : 'Potato', 
      price: 18, 
      cat: 'Vegetables' as ProductCategory,
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'
    },
    { 
      name: 'Onion', 
      label: isHindi ? 'प्याज' : 'Onion', 
      price: 28, 
      cat: 'Vegetables' as ProductCategory,
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80'
    },
    { 
      name: 'Wheat', 
      label: isHindi ? 'गेहूं' : 'Wheat', 
      price: 31, 
      cat: 'Grains' as ProductCategory,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80'
    },
    { 
      name: 'Mustard', 
      label: isHindi ? 'सरसों' : 'Mustard', 
      price: 52, 
      cat: 'Grains' as ProductCategory,
      image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 font-sans">
      
      {activeTab === 'home' && (
        <div className="space-y-6">
          <section className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isHindi ? 'पीएम-किसान सत्यापित किसान' : 'PM-KISAN Verified Farmer'}</span>
                  </span>
                  <span className="text-[11px] text-stone-600 font-mono bg-stone-100 px-2.5 py-0.5 rounded-md border border-stone-200 flex items-center gap-1.5">
                    <span>PM-KISAN: {currentUser?.farmerKyc?.pmKisanId ? currentUser.farmerKyc.pmKisanId : 'UP-2024-889123'}</span>
                    <span>·</span>
                    <span>{currentUser?.farmerKyc?.landSizeAcres ? `${currentUser.farmerKyc.landSizeAcres} Acres` : '3.5 Acres'}</span>
                  </span>
                  <span className="text-[11px] text-blue-800 font-mono bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-blue-600" />
                    <span>Aadhaar: {currentUser?.farmerKyc?.aadhaarNo ? `•••• ${currentUser.farmerKyc.aadhaarNo.slice(-4)}` : 'UIDAI Verified'}</span>
                  </span>
                  <span className="text-[11px] text-emerald-800 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <Landmark className="w-3 h-3 text-emerald-600" />
                    <span>Bank: {currentUser?.farmerKyc?.bankName || 'State Bank of India'} (DBT Jan-Dhan)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setKycFormPmKisan(currentUser?.farmerKyc?.pmKisanId || 'UP-2024-889123');
                      setKycFormKhasra(currentUser?.farmerKyc?.khasraNo || '142/2A');
                      setKycFormLandSize(currentUser?.farmerKyc?.landSizeAcres ? String(currentUser.farmerKyc.landSizeAcres) : '3.5');
                      setKycFormCluster(currentUser?.farmerKyc?.verifiedCluster || 'Agra Farm Cluster');
                      setKycFormAadhaar(currentUser?.farmerKyc?.aadhaarNo || '');
                      setKycFormPan(currentUser?.farmerKyc?.panNo || '');
                      setKycFormBankAccount(currentUser?.farmerKyc?.bankAccountNo || '');
                      setKycFormBankIfsc(currentUser?.farmerKyc?.bankIfsc || '');
                      setKycFormBankName(currentUser?.farmerKyc?.bankName || 'State Bank of India');
                      setIsKycModalOpen(true);
                    }}
                    className="text-[11px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>{isHindi ? 'केवाईसी व बैंक बदलें' : 'Manage KYC & Bank'}</span>
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 font-serif tracking-tight mt-1.5">
                  {isHindi ? `सुप्रभात, ${farmerName.split(' ')[0]}` : `Good morning, ${farmerName.split(' ')[0]}`}
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  {currentUser?.farmerKyc?.khasraNo ? `Khasra #${currentUser.farmerKyc.khasraNo} · ` : ''}
                  {currentUser?.farmerKyc?.verifiedCluster || (isHindi ? 'फार्म क्लस्टर' : 'Farm Cluster')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{isHindi ? 'फसल बेचें' : 'Sell Crop'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100">
              <div className="p-3 bg-stone-50 rounded-xl">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  {isHindi ? 'कुल कमाई' : 'Total Earnings'}
                </div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-stone-900 mt-0.5">
                  ₹{displayEarnings.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  {isHindi ? 'सक्रिय लॉट' : 'Active Lots'}
                </div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-stone-900 mt-0.5">
                  {myProduce.length} <span className="text-xs font-sans font-normal text-stone-500">{isHindi ? 'फसलें' : 'crops'}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider font-semibold text-emerald-800 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'एआई मांग पूर्वानुमान' : 'AI Demand Insight'}</span>
                </div>
                <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                  <span>{isHindi ? 'टमाटर की मांग' : 'Tomato Demand'}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-xs">↑ 18%</span>
                </div>
                <div className="text-xs text-stone-600">
                  {isHindi ? 'अनुमानित दर:' : 'Expected price:'} <span className="font-semibold text-stone-900">₹26–28/kg</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTriggerSellTomato}
                className="px-3 py-2 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                {isHindi ? 'टमाटर लिस्ट करें' : 'List Tomato'}
              </button>
            </div>
          </section>

          <section className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                {isHindi ? 'आज का पिकअप' : "Today's Pickup"}
              </div>
              <div className="text-sm font-semibold text-stone-900">
                {upcomingPickup ? (isHindi ? 'आज · निर्धारित' : 'Today · Scheduled') : (isHindi ? 'कोई पिकअप नहीं' : 'No Pickups Scheduled')}
              </div>
              <div className="text-xs text-stone-500">
                {upcomingPickup
                  ? `${upcomingPickup.quantityKg} kg ${upcomingPickup.productName} → ${upcomingPickup.buyerName} (Reefer #${upcomingPickup.vehicleId || 'DL-1L-4482'})`
                  : (isHindi ? 'वर्तमान में कोई आगामी पिकअप निर्धारित नहीं है' : 'No upcoming batch scheduled for dispatch')}
              </div>
            </div>

            {upcomingPickup && (
              <div className="flex items-center gap-2">
                <a
                  href="tel:+919811234567"
                  className="flex-1 sm:flex-none text-center px-3 py-2 border border-stone-200 hover:border-stone-400 text-stone-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isHindi ? 'ड्राइवर को कॉल' : 'Call Driver'}</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const matchedOrder = myOrders.find((o) => o.status !== 'Delivered') || myOrders[0] || orders[0] || null;
                    setSelectedTrackingOrder(matchedOrder);
                    setIsTrackModalOpen(true);
                  }}
                  className="flex-1 sm:flex-none text-center px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHindi ? 'लाइव ट्रैक' : 'Track Delivery'}</span>
                </button>
              </div>
            )}
          </section>

          <section className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                {isHindi ? 'आपकी सक्रिय फसलें' : 'Your active produce'}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs font-semibold text-[#0E3B2B] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isHindi ? 'नई फसल' : 'Add produce'}</span>
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {myProduce.length > 0 ? (
                myProduce.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-stone-900">{item.name}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{item.quantity} kg · {item.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-semibold text-stone-900">
                        ₹{item.pricePerKg}/kg
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>{isHindi ? 'मंडी में लाइव' : 'Live on Market'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-stone-400">
                  {isHindi ? 'कोई फसल उपलब्ध नहीं है।' : 'No produce listed yet.'}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'produce' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 font-serif">
                {isHindi ? 'फसल सूची और प्रबंधन' : 'Produce Listings'}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHindi ? 'सीधे थोक खरीदारों को उपलब्ध अपनी फसलें देखें' : 'Manage your crops available for direct buyer orders'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-2 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHindi ? 'जोड़ें' : 'Add'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
            {myProduce.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-900 text-sm sm:text-base">{p.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {p.quantity} kg · {p.quality}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {p.location} · {p.harvestDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-stone-900 text-base">₹{p.pricePerKg}/kg</div>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">
                    {isHindi ? 'सक्रिय' : 'Active'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 font-serif">
                {isHindi ? 'आने वाले और सक्रिय ऑर्डर' : 'Incoming & Active Orders'}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHindi ? 'सीधे बैंक खाते में सुरक्षित भुगतान और खरीदार समीक्षाएं' : 'Dispatches, buyer reviews, and direct escrow settlements'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>4.9 Farmer Rating</span>
              </span>
            </div>
          </div>

          {/* Search & Filter bar for Farmer Orders */}
          <div className="space-y-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={farmerOrderQuery}
                onChange={(e) => setFarmerOrderQuery(e.target.value)}
                placeholder="Search orders by crop, buyer name, or Order ID..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 text-xs focus:outline-none focus:border-emerald-600 transition-colors"
              />
              {farmerOrderQuery && (
                <button
                  type="button"
                  onClick={() => setFarmerOrderQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'ALL', label: isHindi ? 'सभी' : 'All Orders' },
                { id: 'Confirmed', label: isHindi ? 'स्वीकृत' : 'Confirmed' },
                { id: 'In Transit', label: isHindi ? 'मार्ग पर' : 'In Transit' },
                { id: 'Delivered', label: isHindi ? 'डिलीवर हुए' : 'Delivered' },
                { id: 'RATED', label: isHindi ? 'समीक्षाएं व रेटिंग' : 'Buyer Reviews ★' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFarmerOrderStatus(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                    farmerOrderStatus === tab.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
            {filteredFarmerOrders.length > 0 ? (
              filteredFarmerOrders.map((o) => (
                <div key={o.id} className="p-4 flex flex-col justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs text-stone-400 font-mono flex items-center gap-2">
                        <span>{o.id}</span>
                        <span>·</span>
                        <span>{o.orderDate}</span>
                        {o.rating && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>{o.rating}.0 Rated</span>
                          </span>
                        )}
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-stone-900 mt-0.5">
                        {o.quantity} kg {o.productName}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {isHindi ? 'खरीदार:' : 'Buyer:'} <span className="text-stone-800 font-medium">{o.buyerName}</span> · {o.deliveryLocation}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-50">
                      <div className="text-left sm:text-right mr-1">
                        <div className="text-base font-mono font-bold text-stone-900">
                          ₹{o.totalPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                          {o.status}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTrackingOrder(o);
                          setIsTrackModalOpen(true);
                        }}
                        className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHindi ? 'ट्रैक करें' : 'Track'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGrievanceOrderId(o.id);
                          setIsGrievanceModalOpen(true);
                        }}
                        className="px-2.5 py-2 bg-stone-50 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-stone-200 hover:border-rose-200 text-xs font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        title={isHindi ? 'विवाद / समस्या दर्ज करें' : 'Report Issue / Grievance'}
                      >
                        <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isHindi ? 'शिकायत' : 'Dispute'}</span>
                      </button>

                      {o.status === 'Confirmed' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(o.id, 'In Transit')}
                          className="px-3.5 py-2 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                        >
                          {isHindi ? 'डिस्पैच करें' : 'Dispatch'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Buyer Review & Rating Feedback Box */}
                  {o.rating && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 mt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Buyer Rating: {o.rating}.0 / 5</span>
                        </span>
                        {o.produceRating && (
                          <span className="text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 font-medium">
                            Freshness: {o.produceRating}.0 ★
                          </span>
                        )}
                        {o.logisticsRating && (
                          <span className="text-[10px] text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200 font-medium">
                            Logistics: {o.logisticsRating}.0 ★
                          </span>
                        )}
                      </div>
                      {o.reviewComment && (
                        <p className="text-xs text-stone-700 italic pt-0.5">
                          "{o.reviewComment}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-stone-400 space-y-1">
                <p>{isHindi ? 'कोई ऑर्डर नहीं मिला।' : 'No orders found matching your search or status filter.'}</p>
                {(farmerOrderQuery || farmerOrderStatus !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFarmerOrderQuery('');
                      setFarmerOrderStatus('ALL');
                    }}
                    className="text-emerald-700 underline font-medium cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 font-serif">
              {isHindi ? 'मंडी भाव और तुलना' : 'Market Prices & Transparency'}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {isHindi ? 'बिचौलियों के बिना सीधे दाम की तुलना' : 'Direct realization comparison versus traditional APMC Mandi channels'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {marketRates.length > 0 ? (
              marketRates.map((rate, idx) => {
                const farmerGain = Number(rate.farmdirect_farmer_price) - Number(rate.mandi_farmer_price);
                const buyerSave = Number(rate.mandi_consumer_price) - Number(rate.farmdirect_consumer_price);

                return (
                  <div key={rate.id || idx} className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="font-semibold text-stone-900">{rate.crop_name}</span>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        {isHindi
                          ? `किसान +₹${farmerGain}/kg · खरीदार -₹${buyerSave}/kg`
                          : `Farmer +₹${farmerGain}/kg · Buyer -₹${buyerSave}/kg`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-stone-400 uppercase font-semibold text-[10px]">
                          {isHindi ? 'पारंपरिक मंडी' : 'Traditional Mandi'}
                        </div>
                        <div className="text-stone-700 mt-1">{isHindi ? 'किसान:' : 'Farmer:'} ₹{rate.mandi_farmer_price}/kg</div>
                        <div className="text-stone-700">{isHindi ? 'उपभोक्ता:' : 'Consumer:'} ₹{rate.mandi_consumer_price}/kg</div>
                      </div>
                      <div>
                        <div className="text-emerald-800 uppercase font-semibold text-[10px]">FarmDirect</div>
                        <div className="text-stone-900 font-semibold mt-1">{isHindi ? 'किसान:' : 'Farmer:'} ₹{rate.farmdirect_farmer_price}/kg</div>
                        <div className="text-stone-900 font-semibold">{isHindi ? 'उपभोक्ता:' : 'Consumer:'} ₹{rate.farmdirect_consumer_price}/kg</div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 p-8 text-center text-xs text-stone-400">
                {isHindi ? 'मंडी दरें लोड हो रही हैं...' : 'Loading live APMC and FarmDirect rates...'}
              </div>
            )}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 font-serif">
                  {isHindi ? 'फसल लिस्ट करें' : 'List Your Harvest'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isHindi ? 'सीधे खरीदारों को उपलब्ध कराएं' : 'Direct wholesale buyer visibility'}
                </p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                {isHindi ? 'त्वरित फसल चयन (1-टैप):' : 'Quick Crop Presets (1-tap):'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {cropPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setCropName(preset.name);
                      setPricePerKg(preset.price);
                      setCategory(preset.cat);
                      if (!produceImage) {
                        setProduceImage(preset.image);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      cropName === preset.name
                        ? 'bg-[#0E3B2B] text-white border-[#0E3B2B]'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {preset.label} (₹{preset.price})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isHindi ? 'फसल का नाम' : 'Crop Name'}
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#0E3B2B]"
                />
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    {isHindi ? 'फसल की तस्वीर (कैमरा / गैलरी)' : 'Crop Photo (Camera / Photos)'}
                  </label>
                  {!produceImage && (
                    <button
                      type="button"
                      onClick={() => {
                        const matched = cropPresets.find(p => p.name.toLowerCase() === cropName.toLowerCase());
                        setProduceImage(matched ? matched.image : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80');
                      }}
                      className="text-[11px] text-emerald-700 hover:underline font-medium cursor-pointer"
                    >
                      {isHindi ? '+ नमूना फोटो लगाएं' : '+ Use Sample Photo'}
                    </button>
                  )}
                </div>

                {produceImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200">
                    <img src={produceImage} alt="Crop capture" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={() => setProduceImage('')}
                      className="absolute top-2 right-2 bg-stone-900/70 hover:bg-stone-900 text-white p-1 rounded-full text-xs transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-emerald-950/80 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                      {isHindi ? 'तस्वीर संलग्न है' : 'Photo Attached'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      disabled={isCapturingPhoto}
                      className="w-full py-2.5 px-3 border border-dashed border-stone-300 hover:border-emerald-600 rounded-xl text-xs font-medium text-stone-600 hover:text-emerald-800 flex items-center justify-center gap-2 bg-stone-50 transition-colors cursor-pointer"
                    >
                      <CameraIcon className="w-4 h-4 text-emerald-700" />
                      <span>
                        {isCapturingPhoto
                          ? (isHindi ? 'कैमरा / फ़ाइल चयनकर्ता खुल रहा है...' : 'Opening Camera / Photo Picker...')
                          : (isHindi ? 'कैमरा से फोटो खींचें / अपलोड करें' : 'Take Crop Photo with Camera / Upload')}
                      </span>
                    </button>

                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <span>{isHindi ? 'या नमूना चुनें:' : 'Or tap sample:'}</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                        {cropPresets.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setCropName(p.name);
                              setPricePerKg(p.price);
                              setProduceImage(p.image);
                            }}
                            className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700">
                    {isHindi ? 'फार्म स्थान (GPS ट्रैकिंग)' : 'Farm Location (GPS)'}
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{isLocating ? (isHindi ? 'खोज रहा है...' : 'Detecting...') : (isHindi ? 'GPS से पहचानें' : 'Detect GPS')}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{farmLocation}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'मात्रा (kg)' : 'Quantity (kg)'}
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(20, q - 50))}
                      className="px-2.5 py-2 border border-r-0 border-stone-200 bg-stone-50 rounded-l-xl text-stone-700 font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      required
                      min={10}
                      className="w-full text-center py-2 border-y border-stone-200 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 50)}
                      className="px-2.5 py-2 border border-l-0 border-stone-200 bg-stone-50 rounded-r-xl text-stone-700 font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHindi ? 'दर (₹/kg)' : 'Price (₹/kg)'}
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setPricePerKg((p) => Math.max(1, p - 2))}
                      className="px-2.5 py-2 border border-r-0 border-stone-200 bg-stone-50 rounded-l-xl text-stone-700 font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(Number(e.target.value))}
                      required
                      min={1}
                      className="w-full text-center py-2 border-y border-stone-200 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPricePerKg((p) => p + 2)}
                      className="px-2.5 py-2 border border-l-0 border-stone-200 bg-stone-50 rounded-r-xl text-stone-700 font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Algorithmic Fair Price Collar Visualizer */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-stone-800">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isHindi ? 'फेयर प्राइस कॉलर बैंड (Fair Price Collar)' : 'Fair Price Collar Engine'}</span>
                  </span>
                  <span className="font-mono text-stone-500 text-[11px]">
                    {isHindi ? 'अनुशंसित दर:' : 'Recommended:'} ₹{recommendedPrice}/kg
                  </span>
                </div>

                {/* Collar distribution bar */}
                <div className="space-y-1">
                  <div className="relative h-2.5 bg-stone-200 rounded-full overflow-hidden flex">
                    <div className="w-1/4 bg-amber-300 h-full border-r border-white/60" title="Distress Floor" />
                    <div className="w-2/4 bg-emerald-500 h-full" title="Fair Price Optimal Band" />
                    <div className="w-1/4 bg-rose-300 h-full border-l border-white/60" title="Speculative Ceiling" />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>Floor: ₹{floorPrice}/kg (MSP)</span>
                    <span className="text-emerald-800 font-bold">Fair Band</span>
                    <span>Ceiling: ₹{ceilingPrice}/kg (Cap)</span>
                  </div>
                </div>

                {/* Real-time status feedback */}
                {isBelowFloor && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Below Fair Price Floor (₹{floorPrice}/kg):</span>{' '}
                      {isHindi 
                        ? 'संकट में कम कीमत पर बिक्री प्रतिबंधित है। सरकार द्वारा तय लागत व एमएसपी के आधार पर उचित मूल्य प्राप्त करें।' 
                        : 'Distressed selling below production cost & MSP is restricted. Set price ≥ ₹' + floorPrice + '/kg.'}
                    </div>
                  </div>
                )}

                {isAboveCeil && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Exceeds Fair Price Ceiling (₹{ceilingPrice}/kg):</span>{' '}
                      {isHindi 
                        ? 'मंडी अधिकतम मूल्य सीमा से अधिक है। खुदरा खरीदार सुरक्षा के लिए कीमत ₹' + ceilingPrice + '/kg से कम रखें।' 
                        : 'Speculative price gouging collar active. Mandi retail benchmark cap is ₹' + ceilingPrice + '/kg.'}
                    </div>
                  </div>
                )}

                {isCollarCompliant && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      {isHindi 
                        ? `उचित मूल्य सीमा में: ₹${pricePerKg}/kg (न्यूनतम ₹${floorPrice} - अधिकतम ₹${ceilingPrice})` 
                        : `Fair Price Compliant: ₹${pricePerKg}/kg is within protected floor (₹${floorPrice}) & ceiling (₹${ceilingPrice})`}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {isHindi ? 'पुष्टि करें और मंडी में लिस्ट करें' : 'Confirm & List on Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OrderTrackingModal
        order={selectedTrackingOrder || myOrders.find((o) => o.status !== 'Delivered') || myOrders[0] || orders[0] || null}
        isOpen={isTrackModalOpen}
        onClose={() => {
          setIsTrackModalOpen(false);
          setSelectedTrackingOrder(null);
        }}
        viewerRole="FARMER"
        onUpdateStatus={updateOrderStatus}
        isHindi={isHindi}
      />

      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-stone-900 font-serif">
                  {isHindi ? 'पीएम-किसान और भूमि रिकॉर्ड प्रबंधित करें' : 'Manage Farm Land & PM-KISAN'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isHindi ? 'अपने भूलेख और सरकारी किसान पहचान को अपडेट करें' : 'Update your land parcel and verified identity'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsKycModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFarmerKyc} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">PM-KISAN ID / Farmer Registration Number</label>
                <input
                  type="text"
                  value={kycFormPmKisan}
                  onChange={(e) => setKycFormPmKisan(e.target.value.toUpperCase())}
                  placeholder="e.g. UP-2024-889123 or MH-2025-441209"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Khasra / Survey No.</label>
                  <input
                    type="text"
                    value={kycFormKhasra}
                    onChange={(e) => setKycFormKhasra(e.target.value)}
                    placeholder="e.g. 142/2A"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Land Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={kycFormLandSize}
                    onChange={(e) => setKycFormLandSize(e.target.value)}
                    placeholder="e.g. 3.5"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Agro-Climatic Cluster / Location</label>
                <input
                  type="text"
                  value={kycFormCluster}
                  onChange={(e) => setKycFormCluster(e.target.value)}
                  placeholder="e.g. Agra Farm Cluster · Uttar Pradesh"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B]"
                  required
                />
              </div>

              {/* Farmer Aadhaar Verification via Meon UIDAI / DigiLocker */}
              <div className="space-y-1 pt-2 border-t border-stone-100">
                <label className="font-semibold text-stone-700 flex items-center justify-between">
                  <span>12-Digit Aadhaar Number (UIDAI)</span>
                  <span className="text-[10px] text-blue-700 font-mono">Meon DigiLocker</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={12}
                    value={kycFormAadhaar}
                    onChange={(e) => setKycFormAadhaar(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 548912348891"
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyKycAadhaar}
                    disabled={kycVerifyingField === 'aadhaar' || kycFormAadhaar.length !== 12}
                    className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-medium text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {kycVerifyingField === 'aadhaar' ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                    <span>Verify</span>
                  </button>
                </div>
              </div>

              {/* Farmer PAN Verification via Meon NSDL */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 flex items-center justify-between">
                  <span>Permanent Account Number (PAN)</span>
                  <span className="text-[10px] text-stone-500 font-mono">NSDL Active</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={10}
                    value={kycFormPan}
                    onChange={(e) => setKycFormPan(e.target.value.toUpperCase())}
                    placeholder="e.g. ABCDE1234F"
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyKycPan}
                    disabled={kycVerifyingField === 'pan' || kycFormPan.length !== 10}
                    className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 font-medium text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {kycVerifyingField === 'pan' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                    <span>Verify</span>
                  </button>
                </div>
              </div>

              {/* Farmer Bank Account & IFSC via Meon Pennydrop */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-700 flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Direct Benefit Transfer (DBT) Bank Account</span>
                  </label>
                  <span className="text-[10px] text-emerald-700 font-mono">Meon Pennydrop</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    maxLength={18}
                    value={kycFormBankAccount}
                    onChange={(e) => setKycFormBankAccount(e.target.value.replace(/\D/g, ''))}
                    placeholder="Account Number"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono"
                  />
                  <input
                    type="text"
                    maxLength={11}
                    value={kycFormBankIfsc}
                    onChange={(e) => setKycFormBankIfsc(e.target.value.toUpperCase())}
                    placeholder="IFSC Code"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0E3B2B] font-mono uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyKycBank}
                  disabled={kycVerifyingField === 'bank' || !kycFormBankAccount || !kycFormBankIfsc}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {kycVerifyingField === 'bank' ? <Loader2 className="w-3 h-3 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>Verify Bank Account via Meon Penny-Drop</span>
                </button>
              </div>

              {kycSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{kycSuccessMsg}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKycModalOpen(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={kycSaving}
                  className="flex-1 py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {kycSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  <span>{isHindi ? 'सेव करें' : 'Save Records'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grievance & Dispute Redressal Modal */}
      <GrievanceModal
        isOpen={isGrievanceModalOpen}
        onClose={() => {
          setIsGrievanceModalOpen(false);
          setGrievanceOrderId('');
        }}
        defaultOrderId={grievanceOrderId}
        defaultCategory="ESCROW_PAYMENT_DELAY"
        defaultSubject={grievanceOrderId ? `Order #${grievanceOrderId} Payment / Logistics Dispute` : 'Produce Grievance'}
      />

    </div>
  );
};
