import { apiClient } from './api';
import type { Category, MenuItem, ApiResponse } from '../types';

export const menuService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/menu/categories');
    return response.data.data;
  },

  getCategoryItems: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/menu/categories/${slug}`);
    return response.data.data;
  },

  toggleItem: async (id: string): Promise<MenuItem> => {
    const response = await apiClient.patch<ApiResponse<MenuItem>>(`/menu/items/${id}/toggle`);
    return response.data.data;
  },

  updateItem: async (
    id: string,
    data: Partial<Pick<MenuItem, 'name' | 'description' | 'price' | 'priceHalf' | 'priceFull'>>
  ): Promise<MenuItem> => {
    const response = await apiClient.put<ApiResponse<MenuItem>>(`/menu/items/${id}`, data);
    return response.data.data;
  },

  getAdminCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/menu/admin/categories');
    return response.data.data;
  },

  updateItemSortOrder: async (id: string, sortOrder: number): Promise<MenuItem> => {
    const response = await apiClient.put<ApiResponse<MenuItem>>(`/menu/items/${id}`, { sortOrder });
    return response.data.data;
  },

  createCategory: async (data: { name: string; description?: string }): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/menu/categories', data);
    return response.data.data;
  },

  createItem: async (data: {
    categoryId: string;
    name: string;
    description?: string;
    price?: number | null;
    priceHalf?: number | null;
    priceFull?: number | null;
  }): Promise<MenuItem> => {
    const response = await apiClient.post<ApiResponse<MenuItem>>('/menu/items', data);
    return response.data.data;
  },
};
