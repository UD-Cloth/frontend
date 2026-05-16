// Local-only store, kept for reference; backend-wired via usePromotions hook
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Promotion {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number; // e.g., 10 for 10% off, or 500 for flat 500 off
    minPurchaseAmount?: number; // Minimum order amount to qualify
    isActive: boolean;
    usageLimit?: number; // Maximum times this code can be used total
    usageCount: number; // Increment when order succeeds
    expiryDate?: string; // ISO String
}

interface PromotionStore {
    promotions: Promotion[];
    addPromotion: (promo: Omit<Promotion, 'id' | 'usageCount'>) => void;
    updatePromotion: (id: string, updates: Partial<Promotion>) => void;
    deletePromotion: (id: string) => void;
    incrementUsage: (code: string) => void;
    validatePromoCode: (code: string, cartTotal: number) => { 
        valid: boolean; 
        discountAmount: number; 
        message: string;
        promotion?: Promotion;
    };
}

export const usePromotionStore = create<PromotionStore>()(
    persist(
        (set, get) => ({
            promotions: [
                {
                    id: 'default-welcome',
                    code: 'WELCOME10',
                    type: 'percentage',
                    value: 10,
                    isActive: true,
                    usageCount: 0,
                }
            ],

            addPromotion: (promo) => set((state) => ({
                promotions: [...state.promotions, { ...promo, id: Math.random().toString(36).substring(7), usageCount: 0 }]
            })),

            updatePromotion: (id, updates) => set((state) => ({
                promotions: state.promotions.map(p => p.id === id ? { ...p, ...updates } : p)
            })),

            deletePromotion: (id) => set((state) => ({
                promotions: state.promotions.filter(p => p.id !== id)
            })),

            incrementUsage: (code) => set((state) => ({
                promotions: state.promotions.map(p => p.code.toUpperCase() === code.toUpperCase() ? { ...p, usageCount: p.usageCount + 1 } : p)
            })),

            validatePromoCode: (code, cartTotal) => {
                const promo = get().promotions.find(p => p.code.toUpperCase() === code.toUpperCase());
                
                if (!promo) return { valid: false, discountAmount: 0, message: "Invalid coupon code." };
                if (!promo.isActive) return { valid: false, discountAmount: 0, message: "This coupon is no longer active." };
                if (promo.usageLimit && promo.usageCount >= promo.usageLimit) return { valid: false, discountAmount: 0, message: "Usage limit reached for this coupon." };
                if (promo.expiryDate && new Date() > new Date(promo.expiryDate)) return { valid: false, discountAmount: 0, message: "This coupon has expired." };
                if (promo.minPurchaseAmount && cartTotal < promo.minPurchaseAmount) return { valid: false, discountAmount: 0, message: `Minimum purchase of ₹${promo.minPurchaseAmount} required.` };

                let discountAmount = 0;
                if (promo.type === 'percentage') {
                    discountAmount = cartTotal * (promo.value / 100);
                } else {
                    discountAmount = promo.value;
                }

                // Never discount more than the cart total
                discountAmount = Math.min(discountAmount, cartTotal);

                return { valid: true, discountAmount, message: "Coupon applied successfully!", promotion: promo };
            }
        }),
        {
            name: 'urban-drape-promotions',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
