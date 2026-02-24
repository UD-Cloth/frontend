import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Product } from '../data/products';

export interface ApiCategory {
  _id: string;
  name: string;
  image?: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<ApiCategory[]>('/categories');
      return data;
    },
  });
};

export const useProducts = (params?: {
  category?: string;
  isTrending?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  q?: string;
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products', { params });
      return data;
    },
  });
};

export const useTrendingProducts = () => {
  return useQuery({
    queryKey: ['products', { isTrending: true }],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products', { params: { isTrending: true } });
      return data;
    },
  });
};

export const useNewArrivals = () => {
  return useQuery({
    queryKey: ['products', { isNew: true }],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products', { params: { isNew: true } });
      return data;
    },
  });
};

export const useSaleProducts = () => {
  return useQuery({
    queryKey: ['products', { isSale: true }],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products', { params: { isSale: true } });
      return data;
    },
  });
};

export const useProductsByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['products', { category }],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products', { params: { category } });
      return data;
    },
    enabled: !!category,
  });
};

export const useProductById = (id?: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useSearchProducts = (q: string) => {
  const trimmed = q.trim();
  return useQuery({
    queryKey: ['products', { q: trimmed }],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products', { params: { q: trimmed } });
      return data;
    },
    enabled: trimmed.length > 0,
  });
};

export interface ReviewItem {
  _id: string;
  user: { _id: string; firstName?: string; lastName?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export const useProductReviews = (productId?: string) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data } = await api.get<ReviewItem[]>(`/products/${productId}/reviews`);
      return data;
    },
    enabled: !!productId,
  });
};
