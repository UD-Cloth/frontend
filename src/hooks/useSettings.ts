import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface StoreSettings {
  _id?: string;
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

export const useSettings = () => {
  return useQuery<StoreSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get<StoreSettings>('/settings');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<StoreSettings>) => {
      const { data } = await api.put<StoreSettings>('/settings', settings);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
