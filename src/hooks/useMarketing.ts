import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ============= Newsletter =============

export interface Subscriber {
  _id: string;
  email: string;
  status: 'Subscribed' | 'Unsubscribed';
  createdAt: string;
  updatedAt?: string;
}

export const useSubscribers = () => {
  return useQuery<Subscriber[]>({
    queryKey: ['subscribers'],
    queryFn: async () => {
      const { data } = await api.get<Subscriber[]>('/newsletter');
      return data;
    },
  });
};

export const useSubscribeNewsletter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/newsletter/subscribe', { email });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
};

// Sprint 7 / BUG-F-057: now uses the typed api.patch from lib/api so URL/auth
// header construction is centralised and the 401 handler runs uniformly.
export const useToggleSubscriber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<Subscriber>(`/newsletter/${id}/toggle`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
};

export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/newsletter/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
};

// ============= Promotions =============

export interface Promotion {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchaseAmount?: number;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const usePromotions = () => {
  return useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data } = await api.get<Promotion[]>('/promotions');
      return data;
    },
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promo: Partial<Promotion>) => {
      const { data } = await api.post<Promotion>('/promotions', promo);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
};

export const useUpdatePromotion = (_id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Promotion> }) => {
      const { data: responseData } = await api.put<Promotion>(`/promotions/${id}`, data);
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/promotions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
};

export interface ValidatePromoResponse {
  valid: boolean;
  discountAmount: number;
  message: string;
  promotion?: Promotion;
}

export const useValidatePromoCode = () => {
  return useMutation({
    mutationFn: async ({ code, cartTotal }: { code: string; cartTotal: number }) => {
      const { data } = await api.post<ValidatePromoResponse>('/promotions/validate', {
        code,
        cartTotal,
      });
      return data;
    },
  });
};

// ============= Abandoned Carts =============

export interface AbandonedCartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface AbandonedCart {
  _id: string;
  sessionId: string;
  email?: string;
  items: AbandonedCartItem[];
  totalValue: number;
  checkoutStarted: boolean;
  pageAbandoned: string;
  createdAt: string;
  updatedAt?: string;
}

export const useAbandonedCarts = () => {
  return useQuery<AbandonedCart[]>({
    queryKey: ['abandoned-carts'],
    queryFn: async () => {
      // Bug #3: backend returns { data, pagination } — unwrap to keep the
      // hook's contract a flat array. Tolerate the legacy shape too.
      const { data } = await api.get<AbandonedCart[] | { data: AbandonedCart[] }>(
        '/abandoned-carts'
      );
      if (Array.isArray(data)) return data;
      return Array.isArray((data as any)?.data) ? (data as any).data : [];
    },
  });
};

export const useDeleteAbandonedCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/abandoned-carts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
    },
  });
};

export const useLogAbandonedCart = () => {
  return useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      items: AbandonedCartItem[];
      totalValue: number;
      email?: string;
      checkoutStarted?: boolean;
      pageAbandoned?: string;
    }) => {
      const { data } = await api.post('/abandoned-carts', payload);
      return data;
    },
  });
};
