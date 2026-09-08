import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, UserRole, OrderStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/initialData';

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
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PRODUCTS_KEY = 'farmdirect_products_v1';
const STORAGE_ORDERS_KEY = 'farmdirect_orders_v1';
const STORAGE_ROLE_KEY = 'farmdirect_role_v1';
const STORAGE_LANG_KEY = 'farmdirect_lang_v1';
const STORAGE_AUTH_KEY = 'farmdirect_auth_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_ROLE_KEY);
    return (saved as UserRole) || 'FARMER';
  });

  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>('home');

  const [language, setLanguageState] = useState<'hi' | 'en'>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    return (saved as 'hi' | 'en') || 'en';
  });

  const setIsAuthenticated = (auth: boolean) => {
    setIsAuthenticatedState(auth);
  };

  const loginAs = (selectedRole: UserRole) => {
    setRoleState(selectedRole);
    localStorage.setItem(STORAGE_ROLE_KEY, selectedRole);
    setIsAuthenticated(true);
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
    setActiveTab('home');
  };

  const setLanguage = (lang: 'hi' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  };

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [showJudgeGuide, setShowJudgeGuide] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const farmerName = 'Rajesh Kumar';
  const buyerName = 'FreshBasket Supermarket (Delhi)';

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  });

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

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    // Route to appropriate view on role change if currently on role dashboard
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

    if (params.quantity > product.quantity) {
      showToast(
        'error',
        'Insufficient Stock',
        `Only ${product.quantity} kg available for ${product.name}.`
      );
      return { success: false, error: 'Insufficient stock' };
    }

    // Calculate transparent pricing
    const producePrice = params.quantity * product.pricePerKg;
    // Transparent FarmDirect logistics fee: nominal ₹2-₹3/kg flat or min ₹150
    const logisticsFee = Math.max(150, Math.round(params.quantity * 2.2));
    const finalAmount = producePrice + logisticsFee;

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      farmerName: product.farmerName,
      buyerName: params.buyerName || buyerName,
      quantity: params.quantity,
      pricePerKg: product.pricePerKg,
      totalPrice: producePrice,
      logisticsFee: logisticsFee,
      finalAmount: finalAmount,
      deliveryLocation: params.deliveryLocation,
      orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Confirmed',
      estimatedDelivery: 'Within 24 Hours (Direct Farm Dispatch)',
    };

    // Update product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, quantity: p.quantity - params.quantity } : p
      )
    );

    // Add order to orders list
    setOrders((prev) => [newOrder, ...prev]);

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
    showToast('info', 'Order Status Updated', `Order ${orderId} marked as "${newStatus}".`);
  };

  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    localStorage.removeItem(STORAGE_PRODUCTS_KEY);
    localStorage.removeItem(STORAGE_ORDERS_KEY);
    showToast('info', 'Demo Reset', 'Products and orders have been restored to initial sample state.');
  };

  // Farmer metrics (calculated for farmerName)
  const farmerProducts = products.filter((p) => p.farmerName.toLowerCase().includes('rajesh'));
  const farmerOrders = orders.filter((o) => o.farmerName.toLowerCase().includes('rajesh'));
  
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
