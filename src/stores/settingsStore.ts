// Local-only store, kept for reference; backend-wired via useSettings hook
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoreSettings {
    storeName: string;
    contactEmail: string;
    storeDescription: string;
    supportPhone: string;
    defaultCurrency: string;
    streetAddress: string;
    city: string;
    stateProvince: string;
    zipCode: string;
    codEnabled: boolean;
    razorpayEnabled: boolean;
    razorpayKeyId: string;
    razorpayKeySecret: string;
    flatShippingRate: number;
    freeShippingThreshold: number;
    taxPercentage: number;
    taxIncludedInPrice: boolean;
    announcementText: string;
    isAnnouncementActive: boolean;
    isAnnouncementScrolling: boolean;
}

const defaultSettings: StoreSettings = {
    storeName: "URBAN DRAPE",
    contactEmail: "support@urbandrape.com",
    storeDescription: "Premium urban clothing brand delivering high-quality streetwear across the country.",
    supportPhone: "+91 9876543210",
    defaultCurrency: "INR",
    streetAddress: "123 Commerce Avenue, Suite 400",
    city: "Mumbai",
    stateProvince: "Maharashtra",
    zipCode: "400001",
    codEnabled: true,
    razorpayEnabled: false,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    flatShippingRate: 150,
    freeShippingThreshold: 2000,
    taxPercentage: 10,
    taxIncludedInPrice: true,
    announcementText: "Join over 2,340 happy customers this month! Free express shipping on orders over ₹2000.",
    isAnnouncementActive: true,
    isAnnouncementScrolling: true,
};

interface SettingsStore {
    settings: StoreSettings;
    updateSettings: (newSettings: Partial<StoreSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),
        }),
        {
            name: 'urban-drape-settings',
            version: 4,
            migrate: (persistedState: any, version: number) => {
                if (version === 1) {
                    return {
                        ...persistedState,
                        settings: {
                            ...persistedState.settings,
                            announcementText: persistedState.settings?.announcementText || "Join over 2,340 happy customers this month! Free express shipping on orders over ₹2000.",
                            isAnnouncementActive: persistedState.settings?.isAnnouncementActive ?? true,
                            isAnnouncementScrolling: persistedState.settings?.isAnnouncementScrolling ?? true
                        }
                    };
                }
                if (version === 2) {
                    return {
                        ...persistedState,
                        settings: {
                            ...persistedState.settings,
                            isAnnouncementActive: persistedState.settings?.isAnnouncementActive ?? true,
                            isAnnouncementScrolling: persistedState.settings?.isAnnouncementScrolling ?? true
                        }
                    };
                }
                if (version === 3) {
                    return {
                        ...persistedState,
                        settings: {
                            ...persistedState.settings,
                            isAnnouncementScrolling: persistedState.settings?.isAnnouncementScrolling ?? true
                        }
                    };
                }
                return persistedState as SettingsStore;
            }
        }
    )
);
