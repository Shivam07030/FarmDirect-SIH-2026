import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    Product,
    Order,
    UserRole,
    OrderStatus,
    UserProfile,
    BuyerTier,
    MarketRules,
    SupportTicket,
    AccountStatus
} from '../types';
import {
    fetchProducts,
    createProductListing,
    fetchOrders,
    submitOrder,
    updateOrderStatusApi,
    fetchMarketRulesApi,
    updateMarketRulesApi,
    fetchTicketsApi,
    createTicketApi,
    updateTicketStatusApi,
    updateUserAccountStatusApi,
    rateOrderApi,
    cancelOrderApi,
    refreshProductPhotoApi
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
    buyerEscrowBalance: number;
    addFundsToEscrow: (amount: number, method?: string) => void;
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
    cancelOrder: (orderId: string, reason?: string, cancelledBy?: 'BUYER' | 'FARMER') => Promise<{ success: boolean; error?: string }>;
    refreshProductPhoto: (productId: string, newImageUrl: string) => Promise<boolean>;
    rateOrder: (
        orderId: string,
        ratingData: {
            rating: number;
            produceRating?: number;
            logisticsRating?: number;
            reviewComment?: string;
        }
    ) => Promise<boolean>;
    marketRules: MarketRules;
    updateMarketRules: (rules: Partial<MarketRules>) => Promise<boolean>;
    tickets: SupportTicket[];
    fetchTickets: () => Promise<void>;
    createTicket: (data: {
        orderId?: string;
        subject: string;
        category: string;
        description: string;
        priority?: string;
    }) => Promise<SupportTicket | null>;
    updateTicketStatus: (ticketId: string, status?: string, resolution?: string, notes?: string) => Promise<boolean>;
    updateUserAccountStatus: (userId: string, accountStatus: AccountStatus, reason?: string) => Promise<boolean>;
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

    const [buyerEscrowBalance, setBuyerEscrowBalance] = useState<number>(() => {
        const saved = localStorage.getItem('farmdirect_escrow_bal_v1');
        return saved ? Number(saved) : 25000;
    });

    const addFundsToEscrow = (amount: number, method: string = 'UPI') => {
        setBuyerEscrowBalance((prev) => {
            const next = prev + amount;
            localStorage.setItem('farmdirect_escrow_bal_v1', String(next));
            return next;
        });
        showToast(
            'success',
            'Escrow Vault Funded',
            `₹${amount.toLocaleString('en-IN')} deposited into Cashfree Nodal Escrow via ${method}. New Balance: ₹${(buyerEscrowBalance + amount).toLocaleString('en-IN')}`
        );
    };

    const [language, setLanguageState] = useState<'hi' | 'en'>(() => {
        const saved = localStorage.getItem(STORAGE_LANG_KEY);
        return (saved as 'hi' | 'en') || 'en';
    });

    const [marketRules, setMarketRules] = useState<MarketRules>(() => {
        return {
            retailMaxQtyKg: 2.0,
            wholesaleMinQtyKg: 25.0,
            retailDeliveryFee: 25.0,
            wholesaleBaseFreight: 150.0,
            wholesalePerKgFreight: 2.2,
            isRationingActive: true,
            rationingReason: 'Essential Commodities Price Stabilization Directive #FD-2026',
            photoWarningHours: 12,
            photoExpiryHours: 24,
            isPhotoSlaEnforced: true,
            allowPreShipmentCancellation: true,
            cancellationRefundPercent: 100,
        };
    });

    useEffect(() => {
        fetchMarketRulesApi()
            .then((rules) => {
                if (rules && rules.retailMaxQtyKg) {
                    setMarketRules(rules);
                }
            })
            .catch(() => { });
    }, []);

    const updateMarketRules = async (rules: Partial<MarketRules>): Promise<boolean> => {
        setMarketRules((prev) => ({ ...prev, ...rules }));
        const res = await updateMarketRulesApi(rules);
        if (res.success && res.rules) {
            setMarketRules(res.rules);
        }
        showToast(
            'success',
            'Market Policy Updated',
            `Retail Cap: ${rules.retailMaxQtyKg ?? marketRules.retailMaxQtyKg} kg · Wholesale MOQ: ${rules.wholesaleMinQtyKg ?? marketRules.wholesaleMinQtyKg} kg`
        );
        return res.success;
    };

    const [tickets, setTickets] = useState<SupportTicket[]>([]);

    const fetchTickets = async () => {
        try {
            const data = await fetchTicketsApi();
            if (Array.isArray(data)) {
                setTickets(data);
            }
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const createTicket = async (ticketData: {
        orderId?: string;
        subject: string;
        category: string;
        description: string;
        priority?: string;
    }): Promise<SupportTicket | null> => {
        const uId = currentUser?.id || (role === 'FARMER' ? 'USER-001' : 'USER-002');
        const uName = currentUser?.name || (role === 'FARMER' ? farmerName : buyerName);
        const uRole = (role === 'FARMER' ? 'FARMER' : 'BUYER') as 'FARMER' | 'BUYER';

        try {
            const res = await createTicketApi({
                userId: uId,
                userName: uName,
                userRole: uRole,
                ...ticketData,
            });
            if (res) {
                setTickets((prev) => [res, ...prev.filter((t) => t.id !== res.id)]);
                showToast('success', 'Grievance Ticket Registered', `Ticket #${res.ticketNumber} logged in database.`);
                return res;
            }
        } catch (err) {
            console.error('Failed to create ticket:', err);
        }

        showToast('error', 'Ticket Registration Failed', 'Could not register grievance with backend database.');
        return null;
    };

    const updateTicketStatus = async (
        ticketId: string,
        status?: string,
        resolution?: string,
        notes?: string
    ): Promise<boolean> => {
        setTickets((prev) =>
            prev.map((t) =>
                t.id === ticketId || t.ticketNumber === ticketId
                    ? {
                        ...t,
                        status: (status as any) || t.status,
                        resolutionSummary: resolution !== undefined ? resolution : t.resolutionSummary,
                        adminNotes: notes !== undefined ? notes : t.adminNotes,
                        updatedAt: new Date().toISOString()
                    }
                    : t
            )
        );

        try {
            await updateTicketStatusApi(ticketId, status, resolution, notes);
        } catch { }

        showToast('success', 'Ticket Status Updated', `Grievance #${ticketId} updated to ${status}.`);
        return true;
    };

    const updateUserAccountStatus = async (
        userId: string,
        accountStatus: AccountStatus,
        reason?: string
    ): Promise<boolean> => {
        const res = await updateUserAccountStatusApi(userId, accountStatus, reason);
        if (res.success) {
            showToast(
                accountStatus === 'ACTIVE' ? 'success' : 'warning',
                `Account Sanction: ${accountStatus}`,
                `User ${userId} set to ${accountStatus}.`
            );
            return true;
        }
        return false;
    };

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
                    clusterLocation: userData.clusterLocation || userData.location || 'Agra Farm Cluster',
                    verifiedCluster: userData.clusterLocation || userData.location || 'Agra Farm Cluster',
                    verifiedAt: userData.pmKisanId ? '2026-03-01' : undefined,
                    isVerified: true,
                    aadhaarNo: userData.aadhaarNo || '',
                    panNo: userData.panNo || '',
                    bankAccountNo: userData.bankAccountNo || '',
                    bankIfsc: userData.bankIfsc || '',
                    bankName: userData.bankName || '',
                    dbtLinked: Boolean(userData.bankAccountNo || userData.aadhaarNo),
                } : undefined,
                buyerKyc: selectedRole === 'BUYER' ? {
                    gstin: userData.gstin || '',
                    legalBusinessName: userData.businessLegalName || userData.name || '',
                    pan: userData.panNo || (userData.gstin ? userData.gstin.slice(2, 12) : ''),
                    state: userData.state || 'Delhi (07)',
                    fssaiLicense: userData.fssaiLicense || '',
                    tradeType: 'RETAILER',
                    aadhaarNo: userData.aadhaarNo || '',
                    bankAccountNo: userData.bankAccountNo || '',
                    bankIfsc: userData.bankIfsc || '',
                    bankName: userData.bankName || '',
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
                    const withSla = dbProds.map((p, idx) => {
                        if (!p.photoUpdatedAt) {
                            // Staggered realistic demo timestamps for hackathon evaluation:
                            // Item 0: 3 hours ago (Fresh)
                            // Item 1: 14 hours ago (Expiring Soon - Warning)
                            // Item 2: 26 hours ago (Expired - Stale / Purchase Paused)
                            const hoursAgo = idx === 0 ? 3 : idx === 1 ? 14 : idx === 2 ? 26 : 4;
                            return {
                                ...p,
                                photoUpdatedAt: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString()
                            };
                        }
                        return p;
                    });
                    setProducts(withSla);
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
        localStorage.setItem(STORAGE_ROLE_KEY, newRole);
        if (currentUser) {
            const updated = { ...currentUser, role: newRole };
            setCurrentUser(updated);
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
        }
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
            photoUpdatedAt: new Date().toISOString(),
        };

        setProducts((prev) => [newProduct, ...prev]);
        createProductListing({ ...productData, photoUpdatedAt: newProduct.photoUpdatedAt } as any).catch(() => { });
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

        // Normal Buyer / Direct Household purchase cap governed dynamically by Admin marketRules
        if (tier === 'RETAIL' && marketRules.isRationingActive && params.quantity > marketRules.retailMaxQtyKg) {
            showToast(
                'error',
                `Retail Limit: Max ${marketRules.retailMaxQtyKg} kg`,
                `Normal household buyers can purchase a maximum of ${marketRules.retailMaxQtyKg} kg per crop to prevent hoarding (${marketRules.rationingReason}).`
            );
            return {
                success: false,
                error: `Maximum retail purchase limit is ${marketRules.retailMaxQtyKg} kg per crop.`
            };
        }

        // Commercial Wholesale MOQ governed dynamically by Admin marketRules
        if (tier === 'WHOLESALE' && params.quantity < marketRules.wholesaleMinQtyKg) {
            showToast(
                'error',
                `Wholesale Minimum: Min ${marketRules.wholesaleMinQtyKg} kg`,
                `Commercial wholesale orders require a minimum batch of ${marketRules.wholesaleMinQtyKg} kg for commercial freight.`
            );
            return {
                success: false,
                error: `Minimum wholesale quantity is ${marketRules.wholesaleMinQtyKg} kg.`
            };
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
        // Dynamic logistics calculation from Admin marketRules
        const logisticsFee = isRetail
            ? marketRules.retailDeliveryFee
            : Math.max(marketRules.wholesaleBaseFreight, Math.round(params.quantity * marketRules.wholesalePerKgFreight));
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
            estimatedDelivery: isRetail ? 'Today · 4:30 PM (Local EV Dispatch)' : 'Tomorrow · 10:00 AM (Cold-Chain Reefer)',
            pickupLocation: `${product.farmerName} Farm, ${product.location || 'Agra Cluster'}`,
            pickupCoords: { lat: 27.1767, lng: 78.0081 },
            destinationCoords: { lat: 28.7041, lng: 77.1025 },
            distanceKm: isRetail ? 28 : 195,
            durationText: isRetail ? '45m' : '3h 50m',
            vehicleNumber: isRetail ? 'DL-8S-9012 (EV City Van)' : 'DL-1L-4482 (Reefer Cold Chain)',
            driverName: isRetail ? 'Amit Verma' : 'Manpreet Singh',
            driverPhone: '+91 98112 34567',
            temperatureCelsius: isRetail ? 8.0 : 4.0,
            deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
            paymentStatus: 'PAID_ESCROW_LOCKED',
            paymentMode: 'CASHFREE_UPI',
            paymentId: `CF_PAY_${Date.now().toString().slice(-6)}`,
            cfOrderId: `CF_ORD_${Math.floor(1000 + Math.random() * 9000)}`,
        };

        // Update product stock
        setProducts((prev) =>
            prev.map((p) =>
                p.id === product.id ? { ...p, quantity: p.quantity - params.quantity } : p
            )
        );

        setBuyerEscrowBalance((prev) => {
            const next = Math.max(0, prev - finalAmount);
            localStorage.setItem('farmdirect_escrow_bal_v1', String(next));
            return next;
        });

        setOrders((prev) => [newOrder, ...prev]);
        submitOrder(params).catch(() => { });

        showToast(
            'success',
            'Order Confirmed & Escrow Locked',
            `Order ${newOrder.id} placed for ${params.quantity} kg of ${product.name}. Funds secured in Cashfree Escrow (₹${finalAmount.toLocaleString('en-IN')}).`
        );

        return { success: true, order: newOrder };
    };

    const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders((prev) =>
            prev.map((ord) => (ord.id === orderId ? { 
                ...ord, 
                status: newStatus,
                paymentStatus: newStatus === 'Delivered' ? 'RELEASED_TO_FARMER' : ord.paymentStatus
            } : ord))
        );
        updateOrderStatusApi(orderId, newStatus).catch(() => { });
        showToast('info', 'Order Status Updated', `Order ${orderId} marked as "${newStatus}".`);
    };

    const cancelOrder = async (
        orderId: string,
        reason?: string,
        cancelledBy: 'BUYER' | 'FARMER' = 'BUYER'
    ): Promise<{ success: boolean; error?: string }> => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) {
            showToast('error', 'Order Not Found', 'Could not locate order details.');
            return { success: false, error: 'Order not found' };
        }

        if (order.status === 'In Transit' || order.status === 'Delivered') {
            showToast(
                'error',
                'Cancellation Restricted',
                'Order has already been dispatched and is in transit. Cancellation is not permitted after shipment.'
            );
            return { success: false, error: 'Cannot cancel shipped or delivered order' };
        }

        if (order.status === 'Cancelled') {
            return { success: true };
        }

        const cancelledAt = new Date().toISOString();
        const cancelReason = reason || 'Pre-shipment cancellation requested by user';

        // 1. Restore product inventory
        setProducts((prev) =>
            prev.map((p) =>
                p.id === order.productId ? { ...p, quantity: p.quantity + order.quantity } : p
            )
        );

        // 2. Update order to Cancelled and refund escrow
        setBuyerEscrowBalance((prev) => {
            const next = prev + order.finalAmount;
            localStorage.setItem('farmdirect_escrow_bal_v1', String(next));
            return next;
        });

        setOrders((prev) =>
            prev.map((o) =>
                o.id === orderId
                    ? {
                        ...o,
                        status: 'Cancelled',
                        paymentStatus: 'REFUNDED_TO_BUYER',
                        cancelledAt,
                        cancellationReason: cancelReason,
                        cancelledBy,
                    }
                    : o
            )
        );

        // 3. Notify backend API
        cancelOrderApi(orderId, cancelReason, cancelledBy).catch(() => {});

        showToast(
            'success',
            'Order Cancelled & Escrow Refunded',
            `Order #${orderId} cancelled before shipment. 100% funds (₹${order.finalAmount.toLocaleString('en-IN')}) refunded to Buyer Escrow. Produce stock restored.`
        );

        return { success: true };
    };

    const refreshProductPhoto = async (productId: string, newImageUrl: string): Promise<boolean> => {
        const now = new Date().toISOString();
        setProducts((prev) =>
            prev.map((p) =>
                p.id === productId
                    ? {
                        ...p,
                        imageUrl: newImageUrl,
                        photoUpdatedAt: now,
                        status: 'Active',
                    }
                    : p
            )
        );

        refreshProductPhotoApi(productId, newImageUrl).catch(() => {});

        showToast(
            'success',
            'Fresh Produce Photo Verified!',
            'Live photo updated successfully. Freshness guarantee active on marketplace.'
        );
        return true;
    };

    const rateOrder = async (
        orderId: string,
        ratingData: {
            rating: number;
            produceRating?: number;
            logisticsRating?: number;
            reviewComment?: string;
        }
    ): Promise<boolean> => {
        const ratedAt = new Date().toISOString();
        setOrders((prev) =>
            prev.map((ord) =>
                ord.id === orderId
                    ? {
                        ...ord,
                        rating: ratingData.rating,
                        produceRating: ratingData.produceRating ?? ratingData.rating,
                        logisticsRating: ratingData.logisticsRating ?? ratingData.rating,
                        reviewComment: ratingData.reviewComment,
                        ratedAt,
                    }
                    : ord
            )
        );
        const res = await rateOrderApi(orderId, ratingData);
        if (res.success) {
            showToast('success', 'Order Rated', `Thank you! Rated ${ratingData.rating}/5 Stars.`);
            // Refresh products so farmer average rating updates across produce cards
            fetchProducts().then((prods) => {
                if (prods && prods.length > 0) setProducts(prods);
            }).catch(() => { });
            return true;
        } else {
            showToast('info', 'Rating Recorded', 'Your rating was recorded in your session.');
            return true;
        }
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
    const farmerProducts = products.filter((p) => (p.farmerName || '').toLowerCase().includes(currentFarmerToken) || (p.farmerName || '').toLowerCase().includes('rajesh'));
    const farmerOrders = orders.filter((o) => (o.farmerName || '').toLowerCase().includes(currentFarmerToken) || (o.farmerName || '').toLowerCase().includes('rajesh'));

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
                buyerEscrowBalance,
                addFundsToEscrow,
                toast,
                showToast,
                clearToast,
                addProduct,
                placeOrder,
                updateOrderStatus,
                cancelOrder,
                refreshProductPhoto,
                rateOrder,
                marketRules,
                updateMarketRules,
                tickets,
                fetchTickets,
                createTicket,
                updateTicketStatus,
                updateUserAccountStatus,
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
