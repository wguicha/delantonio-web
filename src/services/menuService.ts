import { apiClient } from './api';
import type { Category, ApiResponse } from '../types';

export const menuService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/menu/categories');
    return response.data.data;
  },

  getCategoryItems: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/menu/categories/${slug}`);
    return response.data.data;
  },
};
