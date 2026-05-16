// Local-only store, kept for reference; backend-wired via useAbandonedCarts hook
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from './cartStore';

export interface AbandonedCart {
    id: string;
    sessionId: string;
    email?: string; // If captured during checkout
    items: CartItem[];
    totalValue: number;
    abandonedAt: string; // ISO string
    checkoutStarted: boolean; // Did they reach checkout?
    pageAbandoned: string; // e.g. '/checkout' or '/'
}

interface AbandonedCartStore {
    carts: AbandonedCart[];
    logAbandonedCart: (items: CartItem[], meta: { email?: string; checkoutStarted?: boolean; pageAbandoned?: string }) => void;
    deleteCart: (id: string) => void;
    removeSessionCart: () => void;
    clearAll: () => void;
}

// Generate a stable session ID per browser session
function getSessionId(): string {
    let sid = sessionStorage.getItem('ud-session-id');
    if (!sid) {
        sid = `SID-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        sessionStorage.setItem('ud-session-id', sid);
    }
    return sid;
}

export const useAbandonedCartStore = create<AbandonedCartStore>()(
    persist(
        (set, get) => ({
            carts: [],

            logAbandonedCart: (items, { email, checkoutStarted = false, pageAbandoned = '/' }) => {
                if (items.length === 0) return;

                const sessionId = getSessionId();
                const existing = get().carts.find(c => c.sessionId === sessionId);
                const totalValue = items.reduce(
                    // CartItem.price is a number; legacy code treated it as { amount: string }.
                    (sum, item) => sum + Number(item.price ?? 0) * (item.quantity ?? 0),
                    0
                );

                const entry: AbandonedCart = {
                    id: `AC-${Date.now()}`,
                    sessionId,
                    email,
                    items,
                    totalValue,
                    abandonedAt: new Date().toISOString(),
                    checkoutStarted,
                    pageAbandoned,
                };

                // Update existing cart record for same session, or append new
                if (existing) {
                    set(state => ({
                        carts: state.carts.map(c => c.sessionId === sessionId ? entry : c)
                    }));
                } else {
                    set(state => ({
                        carts: [entry, ...state.carts].slice(0, 100) // Keep latest 100
                    }));
                }
            },

            deleteCart: (id) => set(state => ({
                carts: state.carts.filter(c => c.id !== id)
            })),

            removeSessionCart: () => {
                const sessionId = getSessionId();
                set(state => ({
                    carts: state.carts.filter(c => c.sessionId !== sessionId)
                }));
            },

            clearAll: () => set({ carts: [] }),
        }),
        {
            name: 'urban-drape-abandoned-carts',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
