import { apiClient } from './api';
import type { Order, OrderFormData, ApiResponse, PaginatedResponse, Customer } from '../types';
import type { CartItem } from '../types';

export interface CreateOrderPayload {
  customer: {
    name: string;
    phone: string;
  };
  pickupTime: string;
  notes?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    size?: 'half' | 'full';
    notes?: string;
  }>;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  latitude?: number;
  longitude?: number;
}

export interface GeoCoords {
  lat: number;
  lng: number;
}

export const orderService = {
  createOrder: async (formData: OrderFormData, cartItems: CartItem[], geo?: GeoCoords): Promise<Order> => {
    const payload: CreateOrderPayload = {
      customer: {
        name: formData.name,
        phone: formData.phone,
      },
      pickupTime: formData.pickupTime,
      notes: formData.notes,
      items: cartItems.map((item) => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        size: item.size,
        notes: item.notes,
      })),
      acceptTerms: formData.acceptTerms,
      acceptPrivacy: formData.acceptPrivacy,
      ...(geo && { latitude: geo.lat, longitude: geo.lng }),
    };
    const response = await apiClient.post<ApiResponse<Order>>('/orders', payload);
    return response.data.data;
  },

  lookupPhone: async (phone: string): Promise<{ name: string } | null> => {
    try {
      const response = await apiClient.get<ApiResponse<{ name: string }>>(`/customers/lookup?phone=${phone}`);
      return response.data.data;
    } catch {
      return null;
    }
  },

  getOrders: async (page = 1, limit = 20): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  updateStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  getCustomers: async (page = 1, limit = 50): Promise<PaginatedResponse<Customer>> => {
    const response = await apiClient.get<PaginatedResponse<Customer>>(`/customers?page=${page}&limit=${limit}`);
    return response.data;
  },
};
