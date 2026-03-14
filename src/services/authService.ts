import { apiClient } from './api';
import type { LoginFormData, ApiResponse } from '../types';

export const authService = {
  login: async (credentials: LoginFormData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/login', credentials);
    return response.data.data.token;
  },
};
