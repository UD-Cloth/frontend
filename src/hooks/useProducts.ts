import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Product } from '../data/products';

export interface ApiCategory {
  _id: string;
  name: string;
  image?: string;
}

export const useCategories = () => {
  // Sprint 7 / BUG-F-077: categories rarely change. 10-min stale + 1-hour gc
  // saves a request on every focus/visibility-change.
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<ApiCategory[]>('/categories');
      return data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryData: Partial<ApiCategory>) => {
      const { data } = await api.post<ApiCategory>('/categories', categoryData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ApiCategory> }) => {
      const { data: responseData } = await api.put<ApiCategory>(`/categories/${id}`, data);
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/categories/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
  // Sprint 5 / BUG-F-067: stable cache key from primitive params, not the
  // object identity (the caller's object literal changes every render).
  // Sprint 5 / BUG-F-073: skip the request entirely when `q` is the only param
  // and it's empty — pages like SearchResults previously fired GET /products?q=
  // for every visit with no query string.
  const category = params?.category;
  const isTrending = params?.isTrending;
  const isNew = params?.isNew;
  const isSale = params?.isSale;
  const q = params?.q?.trim() ?? '';
  const onlyQ = !!params && Object.keys(params).length === 1 && 'q' in params;
  const enabled = !(onlyQ && q.length === 0);

  return useQuery({
    queryKey: ['products', { category, isTrending, isNew, isSale, q }],
    queryFn: async () => {
      const { data } = await api.get<any>('/products', {
        params: { category, isTrending, isNew, isSale, ...(q ? { q } : {}) },
      });
      return Array.isArray(data) ? data : data.data || [];
    },
    enabled,
  });
};

export const useTrendingProducts = () => {
  return useQuery({
    queryKey: ['products', { isTrending: true }],
    queryFn: async () => {
      const { data } = await api.get<any>('/products', { params: { isTrending: true } });
      return Array.isArray(data) ? data : data.data || [];
    },
  });
};

export const useNewArrivals = () => {
  return useQuery({
    queryKey: ['products', { isNew: true }],
    queryFn: async () => {
      const { data } = await api.get<any>('/products', { params: { isNew: true } });
      return Array.isArray(data) ? data : data.data || [];
    },
  });
};

export const useSaleProducts = () => {
  return useQuery({
    queryKey: ['products', { isSale: true }],
    queryFn: async () => {
      const { data } = await api.get<any>('/products', { params: { isSale: true } });
      return Array.isArray(data) ? data : data.data || [];
    },
  });
};

export const useProductsByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['products', { category }],
    queryFn: async () => {
      const { data } = await api.get<any>('/products', { params: { category } });
      return Array.isArray(data) ? data : data.data || [];
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
    // Bug #190: Use dedicated /products/search endpoint for fast, relevant suggestions
    queryKey: ['products-search', trimmed],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products/search', { params: { q: trimmed, limit: 5 } });
      return data;
    },
    enabled: trimmed.length >= 2,
    staleTime: 30 * 1000,
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

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const { data } = await api.post<Product>('/products', productData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const { data: responseData } = await api.put<Product>(`/products/${id}`, data);
      return responseData;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/products/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Bug #71: Hook to submit a product review
export const useAddReview = (productId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: { rating: number; comment: string }) => {
      const { data } = await api.post(`/products/${productId}/reviews`, review);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
};
