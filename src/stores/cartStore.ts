import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

export interface CartItem {
  lineId: string;
  product: any; // Using generic product type for backend
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: async (item) => {
        const { items } = get();
        const existingItem = items.find(i => i.variantId === item.variantId);
        const userInfo = localStorage.getItem('userInfo');

        set({ isLoading: true });
        try {
          if (userInfo) {
            const res: any = await api.post('/cart', {
              productId: item.product._id || item.product.id,
              variantId: item.variantId,
              variantTitle: item.variantTitle,
              price: item.price,
              quantity: item.quantity,
              selectedOptions: item.selectedOptions
            });
            // Map backend cart to frontend items
            const backendItems = res.data.items.map((i: any) => ({
              lineId: `db-${i.variantId}`,
              product: i.productId,
              variantId: i.variantId,
              variantTitle: i.variantTitle,
              price: i.price,
              quantity: i.quantity,
              selectedOptions: i.selectedOptions
            }));
            set({ items: backendItems });
          } else {
            if (existingItem) {
              const newQuantity = existingItem.quantity + item.quantity;
              set({ items: items.map(i => i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i) });
            } else {
              set({ items: [...items, { ...item, lineId: `local-${Date.now()}` }] });
            }
          }
        } catch (error) {
          console.error('Failed to add item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }

        const { items } = get();
        const userInfo = localStorage.getItem('userInfo');

        set({ isLoading: true });
        try {
          if (userInfo) {
            const res: any = await api.put(`/cart/${variantId}`, { quantity });
            const backendItems = res.data.items.map((i: any) => ({
              lineId: `db-${i.variantId}`,
              product: i.productId,
              variantId: i.variantId,
              variantTitle: i.variantTitle,
              price: i.price,
              quantity: i.quantity,
              selectedOptions: i.selectedOptions
            }));
            set({ items: backendItems });
          } else {
            set({ items: items.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
          }
        } catch (error) {
          console.error('Failed to update quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items } = get();
        const userInfo = localStorage.getItem('userInfo');

        set({ isLoading: true });
        try {
          if (userInfo) {
            const res: any = await api.delete(`/cart/${variantId}`);
            const backendItems = res.data.items.map((i: any) => ({
              lineId: `db-${i.variantId}`,
              product: i.productId,
              variantId: i.variantId,
              variantTitle: i.variantTitle,
              price: i.price,
              quantity: i.quantity,
              selectedOptions: i.selectedOptions
            }));
            set({ items: backendItems });
          } else {
            const newItems = items.filter(i => i.variantId !== variantId);
            set({ items: newItems });
          }
        } catch (error) {
          console.error('Failed to remove item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          try {
            await api.delete('/cart');
          } catch (error) {
            console.error('Failed to clear cart:', error);
          }
        }
        set({ items: [] });
      },

      fetchCart: async () => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return;

        set({ isLoading: true });
        try {
          const res: any = await api.get('/cart');
          const backendItems = res.data.items.map((i: any) => ({
            lineId: `db-${i.variantId}`,
            product: i.productId,
            variantId: i.variantId,
            variantTitle: i.variantTitle,
            price: i.price,
            quantity: i.quantity,
            selectedOptions: i.selectedOptions
          }));
          set({ items: backendItems });
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      setItems: (items) => set({ items }),
    }),
    {
      name: 'ud-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

