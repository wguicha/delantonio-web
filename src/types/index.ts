export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  description?: string;
  price?: number | null;
  priceHalf?: number | null;
  priceFull?: number | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  size?: 'half' | 'full';
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  firstOrderDate: string;
  lastOrderDate: string;
  orders?: Order[];
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  size?: 'half' | 'full' | null;
  notes?: string | null;
}

export interface Order {
  id: string;
  customerId: string;
  customer: Customer;
  status: OrderStatus;
  pickupTime: string;
  totalAmount: number;
  items: OrderItem[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFormData {
  name: string;
  phone: string;
  pickupTime: string;
  notes?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
