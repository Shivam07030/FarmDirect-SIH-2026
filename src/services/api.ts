import { Product, Order, OrderStatus, MarketRules, SupportTicket, AccountStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
        const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });
        return await res.json();
    } catch {
        return { success: true, message: 'Demo mode active. Use OTP: 2026', otp: '2026' };
    }
}

export async function verifyOtp(
    phone: string,
    otp: string,
    role?: string,
    name?: string,
    kycData?: {
        pmKisanId?: string;
        khasraNo?: string;
        landSizeAcres?: number;
        gstin?: string;
        businessLegalName?: string;
        fssaiLicense?: string;
    }
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    try {
        const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp, role, name, ...kycData }),
        });
        return await res.json();
    } catch {
        if (otp === '2026') {
            return {
                success: true,
                token: 'demo-local-jwt-token',
                user: {
                    id: 'USER-001',
                    phone,
                    name: name || (role === 'FARMER' ? 'Farmer' : role === 'BUYER' ? 'Buyer' : 'Admin'),
                    role: role || 'FARMER',
                    location: 'Agra Farm Cluster',
                    verificationStatus: 'VERIFIED',
                    gstin: kycData?.gstin || undefined,
                    businessLegalName: kycData?.businessLegalName || undefined,
                    fssaiLicense: kycData?.fssaiLicense || undefined,
                    pmKisanId: kycData?.pmKisanId || undefined,
                    khasraNo: kycData?.khasraNo || undefined,
                    landSizeAcres: kycData?.landSizeAcres || undefined,
                },
            };
        }
        return { success: false, error: 'Invalid OTP. Please enter 2026.' };
    }
}

export async function fetchProducts(): Promise<Product[]> {
    try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error('API error');
        return await res.json();
    } catch {
        return [];
    }
}

export async function createProductListing(productData: Omit<Product, 'id' | 'farmerRating'>): Promise<Product | null> {
    try {
        const res = await fetch(`${API_BASE}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        if (!res.ok) throw new Error('Failed to create product');
        return await res.json();
    } catch {
        return null;
    }
}

export async function fetchOrders(): Promise<Order[]> {
    try {
        const res = await fetch(`${API_BASE}/api/orders`);
        if (!res.ok) throw new Error('API error');
        return await res.json();
    } catch {
        return [];
    }
}

export async function submitOrder(orderData: {
    productId: string;
    quantity: number;
    deliveryLocation: string;
    buyerName?: string;
    buyerTier?: 'RETAIL' | 'WHOLESALE';
}): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        const res = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        return await res.json();
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function updateOrderStatusApi(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function rateOrderApi(
    orderId: string,
    ratingData: {
        rating: number;
        produceRating?: number;
        logisticsRating?: number;
        reviewComment?: string;
    }
): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
        const res = await fetch(`${API_BASE}/api/orders/${orderId}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ratingData),
        });
        const data = await res.json();
        if (!res.ok) {
            return { success: false, error: data.error || 'Failed to submit rating' };
        }
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message || 'Network error submitting rating' };
    }
}

export async function fetchStats(): Promise<any> {
    try {
        const res = await fetch(`${API_BASE}/api/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        return await res.json();
    } catch {
        return null;
    }
}

export async function fetchMarketRates(): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE}/api/market/rates`);
        if (!res.ok) throw new Error('Failed to fetch market rates');
        return await res.json();
    } catch {
        return [
            { id: 1, crop_name: 'Tomato', mandi_farmer_price: 18, mandi_consumer_price: 32, farmdirect_farmer_price: 24, farmdirect_consumer_price: 27, demand_growth: '+18%' },
            { id: 2, crop_name: 'Potato', mandi_farmer_price: 14, mandi_consumer_price: 22, farmdirect_farmer_price: 18, farmdirect_consumer_price: 19, demand_growth: '+12%' },
            { id: 3, crop_name: 'Onion', mandi_farmer_price: 22, mandi_consumer_price: 35, farmdirect_farmer_price: 27, farmdirect_consumer_price: 31, demand_growth: '+15%' },
            { id: 4, crop_name: 'Wheat (Sharbati)', mandi_farmer_price: 26, mandi_consumer_price: 40, farmdirect_farmer_price: 31, farmdirect_consumer_price: 36, demand_growth: '+8%' },
        ];
    }
}

export async function fetchUsers(): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE}/api/users`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return await res.json();
    } catch {
        return [];
    }
}

export async function verifyGstApi(gstin: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const res = await fetch(`${API_BASE}/api/auth/verify-gst`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gstin }),
        });
        return await res.json();
    } catch {
        const cleanGst = gstin.trim().toUpperCase();
        if (cleanGst.length === 15) {
            return {
                success: true,
                data: {
                    gstin: cleanGst,
                    legalBusinessName: 'Verified Agro Enterprise Pvt Ltd',
                    state: 'Delhi (07)',
                    pan: cleanGst.slice(2, 12),
                    status: 'Active',
                    taxpayerType: 'Regular Commercial Wholesaler'
                }
            };
        }
        return { success: false, error: 'Invalid GSTIN format. Must be 15 alphanumeric characters.' };
    }
}

export async function verifyFarmerLandApi(pmKisanId: string, khasraNo: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const res = await fetch(`${API_BASE}/api/auth/verify-farmer-land`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pmKisanId, khasraNo }),
        });
        return await res.json();
    } catch {
        return {
            success: true,
            data: {
                pmKisanId,
                khasraNo,
                landHolder: 'Rajesh Kumar',
                landSizeAcres: 3.5,
                villageCluster: 'Agra Rural Revenue District',
                status: 'VERIFIED_ACTIVE',
                directBenefitTransferStatus: 'Active - Aadhaar Linked'
            }
        };
    }
}

export async function fetchPriceCollarApi(cropName: string): Promise<{ cropName: string; floorPrice: number; ceilingPrice: number; msp: number; recommendedPrice: number; reason: string }> {
    try {
        const res = await fetch(`${API_BASE}/api/market/collar/${encodeURIComponent(cropName)}`);
        if (!res.ok) throw new Error('Failed to fetch price collar');
        return await res.json();
    } catch {
        return {
            cropName,
            floorPrice: 16,
            ceilingPrice: 35,
            msp: 14,
            recommendedPrice: 24,
            reason: 'Fair Price Collar Active: Floor = MSP/Cost x 1.5, Ceiling = Mandi Retail cap'
        };
    }
}

export async function fetchKycQueueApi(): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE}/api/admin/kyc-queue`);
        if (!res.ok) throw new Error('Failed to fetch KYC queue');
        return await res.json();
    } catch {
        return [];
    }
}

export async function updateKycStatusApi(userId: string, status: 'VERIFIED' | 'REJECTED' | 'PENDING'): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/admin/kyc/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function updateFarmerProfileApi(userId: string, profileData: {
    pmKisanId?: string;
    khasraNo?: string;
    landSizeAcres?: number;
    clusterName?: string;
    name?: string;
    location?: string;
}): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/users/${userId}/farmer-profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function updateBuyerProfileApi(userId: string, profileData: {
    name?: string;
    businessLegalName?: string;
    gstin?: string;
    fssaiLicense?: string;
    location?: string;
}): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/users/${userId}/buyer-profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function createAdminUserApi(userData: {
    role: string;
    name: string;
    phone: string;
    location?: string;
    pmKisanId?: string;
    khasraNo?: string;
    landSizeAcres?: number;
    gstin?: string;
    businessLegalName?: string;
    fssaiLicense?: string;
    verificationStatus?: string;
}): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function updateAdminKycRecordApi(userId: string, data: {
    name?: string;
    location?: string;
    pmKisanId?: string;
    khasraNo?: string;
    landSizeAcres?: number;
    gstin?: string;
    businessLegalName?: string;
    fssaiLicense?: string;
    verificationStatus?: string;
}): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/admin/kyc/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function fetchMarketRulesApi(): Promise<MarketRules> {
    try {
        const res = await fetch(`${API_BASE}/api/admin/market-rules`);
        if (!res.ok) throw new Error('Failed to fetch market rules');
        return await res.json();
    } catch {
        return {
            retailMaxQtyKg: 2.0,
            wholesaleMinQtyKg: 25.0,
            retailDeliveryFee: 25.0,
            wholesaleBaseFreight: 150.0,
            wholesalePerKgFreight: 2.2,
            isRationingActive: true,
            rationingReason: 'Essential Commodities Price Stabilization Directive #FD-2026',
        };
    }
}

export async function updateMarketRulesApi(rules: Partial<MarketRules>): Promise<{ success: boolean; rules?: MarketRules }> {
    try {
        const res = await fetch(`${API_BASE}/api/admin/market-rules`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rules),
        });
        if (!res.ok) throw new Error('Failed to update market rules');
        return await res.json();
    } catch {
        return { success: false };
    }
}

export async function updateUserAccountStatusApi(
    userId: string,
    accountStatus: AccountStatus,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const res = await fetch(`${API_BASE}/api/admin/users/${userId}/account-status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountStatus, reason }),
        });
        return await res.json();
    } catch {
        return { success: false, error: 'Failed to communicate with compliance API' };
    }
}

export async function fetchTicketsApi(params?: {
    userId?: string;
    status?: string;
    role?: string;
}): Promise<SupportTicket[]> {
    try {
        const search = new URLSearchParams();
        if (params?.userId) search.set('userId', params.userId);
        if (params?.status) search.set('status', params.status);
        if (params?.role) search.set('role', params.role);
        const url = `${API_BASE}/api/tickets${search.toString() ? `?${search.toString()}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch tickets');
        return await res.json();
    } catch {
        return [];
    }
}

export async function createTicketApi(ticketData: {
    userId: string;
    userName?: string;
    userRole?: 'FARMER' | 'BUYER';
    orderId?: string;
    subject: string;
    category: string;
    description: string;
    priority?: string;
}): Promise<SupportTicket | null> {
    try {
        const res = await fetch(`${API_BASE}/api/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData),
        });
        if (!res.ok) throw new Error('Failed to create ticket');
        return await res.json();
    } catch {
        return null;
    }
}

export async function updateTicketStatusApi(
    ticketId: string,
    status?: string,
    resolutionSummary?: string,
    adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/resolve`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, resolutionSummary, adminNotes }),
        });
        return await res.json();
    } catch {
        return { success: false, error: 'Failed to update ticket' };
    }
}


