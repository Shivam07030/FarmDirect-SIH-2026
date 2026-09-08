import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, UserRole, OrderStatus, UserProfile, BuyerTier } from '../types';
import { 
  fetchProducts, 
  createProductListing, 
  fetchOrders, 
  submitOrder, 
  updateOrderStatusApi 
} from '../services/api';

export type AppView = 
  | 'landing'
  | 'farmer'
  | 'marketplace'
  | 'orders'
  | 'price-transparency'
  | 'demand-forecast'
  | 'logistics'
  | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  buyerTier: BuyerTier;
  setBuyerTier: (tier: BuyerTier) => void;
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  products: Product[];
  orders: Order[];
  farmerName: string;
  buyerName: string;
  toast: ToastMessage | null;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  clearToast: () => void;
  addProduct: (productData: Omit<Product, 'id' | 'farmerRating'>) => Product;
  placeOrder: (params: {
    productId: string;
    quantity: number;
    deliveryLocation: string;
    buyerName?: string;
    buyerTier?: BuyerTier;
  }) => { success: boolean; order?: Order; error?: string };
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  resetDemoData: () => void;
  showJudgeGuide: boolean;
  setShowJudgeGuide: (show: boolean) => void;
  // Stats helpers
  farmerStats: {
    totalProduceListedKg: number;
    activeOrdersCount: number;
    totalEarningsInr: number;
    averagePricePerKg: number;
  };
  adminStats: {
    totalFarmers: number;
    totalBuyers: number;
    totalProducts: number;
    totalOrders: number;
    totalTransactionValue: number;
    averageFarmerPrice: number;
    estimatedSupplyChainSavings: number;
  };
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  currentUser: UserProfile | null;
  updateCurrentUserProfile: (updated: Partial<UserProfile>) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loginAs: (role: UserRole, user?: any) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PRODUCTS_KEY = 'farmdirect_products_v1';
const STORAGE_ORDERS_KEY = 'farmdirect_orders_v1';
const STORAGE_ROLE_KEY = 'farmdirect_role_v1';
const STORAGE_LANG_KEY = 'farmdirect_lang_v1';
const STORAGE_AUTH_KEY = 'farmdirect_auth_v1';
const STORAGE_USER_KEY = 'farmdirect_user_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_ROLE_KEY);
    return (saved as UserRole) || 'FARMER';
  });

  const [buyerTier, setBuyerTierState] = useState<BuyerTier>(() => {
    const saved = localStorage.getItem('farmdirect_buyer_tier_v1');
    return (saved as BuyerTier) || 'RETAIL';
  });

  const setBuyerTier = (tier: BuyerTier) => {
    setBuyerTierState(tier);
    localStorage.setItem('farmdirect_buyer_tier_v1', tier);
  };

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_AUTH_KEY) === 'true';
  });

  const [activeTab, setActiveTab] = useState<string>('home');

  const [language, setLanguageState] = useState<'hi' | 'en'>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    return (saved as 'hi' | 'en') || 'en';
  });

  const setIsAuthenticated = (auth: boolean) => {
    setIsAuthenticatedState(auth);
    localStorage.setItem(STORAGE_AUTH_KEY, String(auth));
  };

  const updateCurrentUserProfile = (updatedProfile: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        ...updatedProfile,
        farmerKyc: updatedProfile.farmerKyc ? { ...(prev.farmerKyc || {} as any), ...updatedProfile.farmerKyc } : prev.farmerKyc,
        buyerKyc: updatedProfile.buyerKyc ? { ...(prev.buyerKyc || {} as any), ...updatedProfile.buyerKyc } : prev.buyerKyc,
      };
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const loginAs = (selectedRole: UserRole, userData?: any) => {
    setRoleState(selectedRole);
    localStorage.setItem(STORAGE_ROLE_KEY, selectedRole);
    setIsAuthenticated(true);

    let profile: UserProfile;
    if (userData && userData.id) {
      profile = {
        id: userData.id,
        phone: userData.phone || '',
        name: userData.name || (selectedRole === 'FARMER' ? 'Farmer' : selectedRole === 'BUYER' ? 'Buyer' : 'Admin'),
        role: selectedRole,
        location: userData.location || (selectedRole === 'FARMER' ? 'Farm Cluster' : 'Delhi NCR'),
        verificationStatus: userData.verificationStatus || 'VERIFIED',
        farmerKyc: selectedRole === 'FARMER' ? {
          pmKisanId: userData.pmKisanId || '',
          khasraNo: userData.khasraNo || '',
          landSizeAcres: userData.landSizeAcres ? Number(userData.landSizeAcres) : undefined,
          clusterLocation: userData.clusterLocation || userData.location || 'Farm Cluster',
          verifiedAt: userData.pmKisanId ? '2026-03-01' : undefined,
        } : undefined,
        buyerKyc: selectedRole === 'BUYER' ? {
          gstin: userData.gstin || '',
          legalBusinessName: userData.businessLegalName || userData.name || '',
          pan: userData.gstin ? userData.gstin.slice(2, 12) : '',
          state: userData.state || 'Delhi (07)',
          fssaiLicense: userData.fssaiLicense || '',
          tradeType: 'RETAILER',
        } : undefined,
      };
    } else {
      if (selectedRole === 'FARMER') {
        profile = {
          id: 'USER-001',
          phone: '',
          name: 'Farmer',
          role: 'FARMER',
          location: 'Farm Cluster',
          verificationStatus: 'PENDING',
          farmerKyc: {
            pmKisanId: '',
            khasraNo: '',
            landSizeAcres: undefined,
            clusterLocation: 'Farm Cluster',
          },
        };
      } else if (selectedRole === 'BUYER') {
        profile = {
          id: 'USER-002',
          phone: '',
          name: 'Wholesale Buyer',
          role: 'BUYER',
          location: 'Delhi Hub',
          verificationStatus: 'PENDING',
          buyerKyc: {
            gstin: '',
            legalBusinessName: '',
            pan: '',
            state: '',
            tradeType: 'RETAILER',
          },
        };
      } else {
        profile = {
          id: 'USER-003',
          phone: '',
          name: 'FarmDirect Admin',
          role: 'ADMIN',
          location: 'HQ Central',
          verificationStatus: 'VERIFIED',
        };
      }
    }

    setCurrentUser(profile);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));

    if (selectedRole === 'FARMER') {
      setCurrentView('farmer');
      setActiveTab('home');
    } else if (selectedRole === 'BUYER') {
      setCurrentView('marketplace');
      setActiveTab('home');
    } else {
      setCurrentView('admin');
      setActiveTab('overview');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    setActiveTab('home');
  };

  const setLanguage = (lang: 'hi' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  };

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [showJudgeGuide, setShowJudgeGuide] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const farmerName = (currentUser?.role === 'FARMER' && currentUser?.name) ? currentUser.name : 'Rajesh Kumar';
  const buyerName = (currentUser?.role === 'BUYER' && currentUser?.name) ? currentUser.name : 'FreshBasket Supermarket (Delhi)';

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ROLE_KEY, role);
  }, [role]);

  useEffect(() => {
    async function loadBackendData() {
      try {
        const [dbProds, dbOrds] = await Promise.all([fetchProducts(), fetchOrders()]);
        if (dbProds && dbProds.length > 0) {
          setProducts(dbProds);
        }
        if (dbOrds && dbOrds.length > 0) {
          setOrders(dbOrds);
        }
      } catch {
        // keep local state
      }
    }
    loadBackendData();
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'FARMER') setCurrentView('farmer');
    else if (newRole === 'BUYER') setCurrentView('marketplace');
    else if (newRole === 'ADMIN') setCurrentView('admin');
  };

  const showToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = Date.now().toString();
    setToast({ id, type, title, message });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  const clearToast = () => {
    setToast(null);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'farmerRating'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `PROD-${Date.now().toString().slice(-4)}`,
      farmerRating: 4.9,
      isDemoAdded: true,
    };

    setProducts((prev) => [newProduct, ...prev]);
    createProductListing(productData).catch(() => {});
    showToast(
      'success',
      'Product Listed on Marketplace!',
      `${newProduct.quantity} kg of ${newProduct.name} is now live at ₹${newProduct.pricePerKg}/kg from ${newProduct.location}.`
    );
    return newProduct;
  };

  const placeOrder = (params: {
    productId: string;
    quantity: number;
    deliveryLocation: string;
    buyerName?: string;
  }) => {
    const product = products.find((p) => p.id === params.productId);
    if (!product) {
      showToast('error', 'Product Not Found', 'The requested product could not be located.');
      return { success: false, error: 'Product not found' };
    }

    if (params.quantity <= 0) {
      showToast('error', 'Invalid Quantity', 'Please specify a quantity greater than 0.');
      return { success: false, error: 'Invalid quantity' };
    }

    const tier = params.buyerTier || buyerTier;

    // Normal Buyer / Direct Household purchase cap: 2 kg
    if (tier === 'RETAIL' && params.quantity > 2) {
      showToast(
        'error',
        'Retail Limit: Max 2 kg',
        'Normal household buyers can purchase a maximum of 2 kg per crop to prevent hoarding and ensure fair rationing.'
      );
      return { success: false, error: 'Maximum retail purchase limit is 2 kg per crop.' };
    }

    // Commercial Wholesale MOQ: 25 kg
    if (tier === 'WHOLESALE' && params.quantity < 25) {
      showToast(
        'error',
        'Wholesale Minimum: Min 25 kg',
        'Commercial wholesale orders require a minimum batch of 25 kg.'
      );
      return { success: false, error: 'Minimum wholesale quantity is 25 kg.' };
    }

    if (params.quantity > product.quantity) {
      showToast(
        'error',
        'Insufficient Stock',
        `Only ${product.quantity} kg available for ${product.name}.`
      );
      return { success: false, error: 'Insufficient stock' };
    }

    // Calculate transparent pricing
    const producePrice = Math.round(params.quantity * product.pricePerKg * 100) / 100;
    const isRetail = tier === 'RETAIL';
    // Local household delivery ₹25 vs industrial refrigerated reefer logistics
    const logisticsFee = isRetail ? 25 : Math.max(150, Math.round(params.quantity * 2.2));
    const finalAmount = producePrice + logisticsFee;

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      farmerName: product.farmerName,
      buyerName: params.buyerName || buyerName,
      buyerTier: tier,
      quantity: params.quantity,
      pricePerKg: product.pricePerKg,
      totalPrice: producePrice,
      logisticsFee: logisticsFee,
      finalAmount: finalAmount,
      deliveryLocation: params.deliveryLocation,
      orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Confirmed',
      estimatedDelivery: isRetail ? 'Today · Local Consumer Hub' : 'Within 24 Hours (Refrigerated Freight)',
    };

    // Update product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, quantity: p.quantity - params.quantity } : p
      )
    );

    setOrders((prev) => [newOrder, ...prev]);
    submitOrder(params).catch(() => {});

    showToast(
      'success',
      'Order Confirmed!',
      `Order ${newOrder.id} placed for ${params.quantity} kg of ${product.name} (Total: ₹${finalAmount.toLocaleString('en-IN')}).`
    );

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    updateOrderStatusApi(orderId, newStatus).catch(() => {});
    showToast('info', 'Order Status Updated', `Order ${orderId} marked as "${newStatus}".`);
  };

  const resetDemoData = async () => {
    localStorage.removeItem(STORAGE_PRODUCTS_KEY);
    localStorage.removeItem(STORAGE_ORDERS_KEY);
    try {
      const [prodRes, orderRes] = await Promise.all([fetchProducts(), fetchOrders()]);
      setProducts(prodRes);
      setOrders(orderRes);
      showToast('info', 'Data Refreshed', 'Refreshed latest produce and orders from database.');
    } catch {
      showToast('info', 'Cache Cleared', 'Local storage cleared.');
    }
  };

  // Farmer metrics (calculated for dynamic farmer or demo)
  const currentFarmerToken = (farmerName || 'rajesh').toLowerCase().split(' ')[0];
  const farmerProducts = products.filter((p) => p.farmerName.toLowerCase().includes(currentFarmerToken) || p.farmerName.toLowerCase().includes('rajesh'));
  const farmerOrders = orders.filter((o) => o.farmerName.toLowerCase().includes(currentFarmerToken) || o.farmerName.toLowerCase().includes('rajesh'));
  
  const totalProduceListedKg = farmerProducts.reduce((acc, p) => acc + p.quantity, 0);
  const activeOrdersCount = farmerOrders.filter((o) => o.status !== 'Delivered').length;
  const totalEarningsInr = farmerOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const averagePricePerKg = farmerProducts.length > 0 
    ? Math.round(farmerProducts.reduce((acc, p) => acc + p.pricePerKg, 0) / farmerProducts.length)
    : 24;

  // Admin metrics
  const totalTransactionValue = orders.reduce((acc, o) => acc + o.finalAmount, 0);
  const totalKgSold = orders.reduce((acc, o) => acc + o.quantity, 0);
  // Benchmark supply-chain savings: Traditional middleman cut is ~₹8 to ₹14 per kg
  const estimatedSupplyChainSavings = Math.round(totalKgSold * 10.5) + 42500;

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        buyerTier,
        setBuyerTier,
        language,
        setLanguage,
        currentView,
        setCurrentView,
        products,
        orders,
        farmerName,
        buyerName,
        toast,
        showToast,
        clearToast,
        addProduct,
        placeOrder,
        updateOrderStatus,
        resetDemoData,
        showJudgeGuide,
        setShowJudgeGuide,
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        updateCurrentUserProfile,
        activeTab,
        setActiveTab,
        loginAs,
        logout,
        farmerStats: {
          totalProduceListedKg,
          activeOrdersCount,
          totalEarningsInr,
          averagePricePerKg,
        },
        adminStats: {
          totalFarmers: 142,
          totalBuyers: 388,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalTransactionValue,
          averageFarmerPrice: 28,
          estimatedSupplyChainSavings,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
