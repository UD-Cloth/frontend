import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  syncError: string | null;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
  syncCartToBackend: () => Promise<void>;
  loadCartFromBackend: () => Promise<void>;
  onSyncError?: (error: string) => void;
}

/** Generate a unique key for a cart item (product + size + color combo) */
function itemKey(item: { productId: string; size: string; color: string }) {
  return `${item.productId}__${item.size}__${item.color}`;
}

function getAuthToken(): string | null {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.token || null;
    }
  } catch { /* ignore */ }
  return null;
}

let syncErrorCallback: ((error: string) => void) | undefined;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      syncError: null,

      addItem: (item) => {
        const { items } = get();
        const key = itemKey(item);
        const existingIndex = items.findIndex(i => itemKey(i) === key);

        let newItems: CartItem[];
        if (existingIndex > -1) {
          newItems = items.map((i, idx) =>
            idx === existingIndex ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        } else {
          newItems = [...items, item];
        }

        set({ items: newItems });

        // Fire-and-forget backend sync for logged-in users
        const token = getAuthToken();
        if (token) {
          const variantId = `${item.productId}-${item.size}-${item.color}`;
          api.post('/cart', {
            productId: item.productId,
            variantId,
            variantTitle: `${item.size}${item.color ? ` / ${item.color}` : ''}`,
            price: { amount: item.price.toString(), currencyCode: 'INR' },
            quantity: item.quantity,
            selectedOptions: [
              { name: 'Size', value: item.size },
              ...(item.color ? [{ name: 'Color', value: item.color }] : []),
            ],
          }).catch(err => console.error('Cart sync failed:', err));
        }
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }

        const { items } = get();
        const key = itemKey({ productId, size, color });
        set({ items: items.map(i => itemKey(i) === key ? { ...i, quantity } : i) });

        const token = getAuthToken();
        if (token) {
          const variantId = `${productId}-${size}-${color}`;
          api.put(`/cart/${encodeURIComponent(variantId)}`, { quantity })
            .catch(err => console.error('Cart update sync failed:', err));
        }
      },

      removeItem: (productId, size, color) => {
        const { items } = get();
        const key = itemKey({ productId, size, color });
        set({ items: items.filter(i => itemKey(i) !== key) });

        const token = getAuthToken();
        if (token) {
          const variantId = `${productId}-${size}-${color}`;
          api.delete(`/cart/${encodeURIComponent(variantId)}`)
            .catch(err => console.error('Cart remove sync failed:', err));
        }
      },

      clearCart: () => {
        set({ items: [] });

        const token = getAuthToken();
        if (token) {
          api.delete('/cart').catch(err => console.error('Cart clear sync failed:', err));
        }
      },

      /** Load server cart on login */
      loadCartFromBackend: async () => {
        const token = getAuthToken();
        if (!token) return;

        set({ isLoading: true });
        try {
          const { data } = await api.get('/cart');
          if (data && data.items && Array.isArray(data.items)) {
            const serverItems: CartItem[] = data.items.map((item: any) => {
              const product = item.productId; // populated
              return {
                productId: typeof product === 'string' ? product : (product?._id || product?.id || ''),
                name: typeof product === 'object' ? product.name : '',
                image: typeof product === 'object' ? (product.image || (product.images?.[0] ?? '')) : '',
                price: Number.parseFloat(item.price?.amount ?? '0'),
                quantity: item.quantity,
                size: item.selectedOptions?.find((o: any) => o.name === 'Size')?.value || '',
                color: item.selectedOptions?.find((o: any) => o.name === 'Color')?.value || '',
              };
            });

            // Bug #55: Handle quantity conflicts - merge local and server items, prefer larger quantity
            const localItems = get().items;
            const mergedItems: CartItem[] = [];
            const processedKeys = new Set<string>();

            // Process all server items first
            for (const serverItem of serverItems) {
              const key = itemKey(serverItem);
              const localItem = localItems.find(i => itemKey(i) === key);

              // Use the larger quantity between local and server
              const quantity = localItem ? Math.max(localItem.quantity, serverItem.quantity) : serverItem.quantity;
              mergedItems.push({ ...serverItem, quantity });
              processedKeys.add(key);
            }

            // Add any local-only items
            for (const localItem of localItems) {
              const key = itemKey(localItem);
              if (!processedKeys.has(key)) {
                mergedItems.push(localItem);
              }
            }

            set({ items: mergedItems, syncError: null });
          }
        } catch (err) {
          // Bug #56: Show error when cart sync fails
          const errorMsg = 'Failed to sync cart from server';
          console.error(errorMsg, err);
          set({ syncError: errorMsg });
          if (syncErrorCallback) {
            syncErrorCallback(errorMsg);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      /** Push entire local cart to the backend */
      syncCartToBackend: async () => {
        const token = getAuthToken();
        if (!token) return;

        const { items } = get();
        let hasFailed = false;
        for (const item of items) {
          const variantId = `${item.productId}-${item.size}-${item.color}`;
          try {
            await api.post('/cart', {
              productId: item.productId,
              variantId,
              variantTitle: `${item.size}${item.color ? ` / ${item.color}` : ''}`,
              price: { amount: item.price.toString(), currencyCode: 'INR' },
              quantity: item.quantity,
              selectedOptions: [
                { name: 'Size', value: item.size },
                ...(item.color ? [{ name: 'Color', value: item.color }] : []),
              ],
            });
          } catch (err) {
            // Bug #56: Track sync failures
            console.error('Failed to sync cart item:', err);
            hasFailed = true;
          }
        }

        if (hasFailed) {
          const errorMsg = 'Failed to sync some items to cart';
          set({ syncError: errorMsg });
          if (syncErrorCallback) {
            syncErrorCallback(errorMsg);
          }
        }
      },
    }),
    {
      name: 'urban-drape-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Helper to set error callback from components
export function setCartSyncErrorCallback(callback: (error: string) => void) {
  syncErrorCallback = callback;
}
