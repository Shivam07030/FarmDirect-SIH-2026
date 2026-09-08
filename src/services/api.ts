import { Product, Order, OrderStatus } from '../types';

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
  name?: string
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, role, name }),
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
          name: name || (role === 'FARMER' ? 'Rajesh Kumar' : role === 'BUYER' ? 'FreshBasket' : 'Admin'),
          role: role || 'FARMER',
          location: 'Agra Farm Cluster',
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
