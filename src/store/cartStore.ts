import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity?: number, size?: 'half' | 'full', notes?: string) => void;
  removeItem: (menuItemId: string, size?: 'half' | 'full') => void;
  updateQuantity: (menuItemId: string, quantity: number, size?: 'half' | 'full') => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menuItem, quantity = 1, size, notes) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.menuItem.id === menuItem.id && item.size === size
          );
          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { items: updated };
          }
          return { items: [...state.items, { menuItem, quantity, size, notes }] };
        });
      },

      removeItem: (menuItemId, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.menuItem.id === menuItemId && item.size === size)
          ),
        }));
      },

      updateQuantity: (menuItemId, quantity, size) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId, size);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.menuItem.id === menuItemId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => {
          const price = item.size === 'half'
            ? (item.menuItem.priceHalf ?? 0)
            : item.size === 'full'
            ? (item.menuItem.priceFull ?? 0)
            : (item.menuItem.price ?? 0);
          return sum + price * item.quantity;
        }, 0),
    }),
    {
      name: 'delantonio-cart',
    }
  )
);
