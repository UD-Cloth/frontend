import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AdminReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { _id: string; firstName?: string; lastName?: string; email?: string };
  product?: { _id: string; name?: string };
}

export const useAllReviews = () => {
  return useQuery<AdminReview[]>({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data } = await api.get<AdminReview[]>('/reviews');
      return data;
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/reviews/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
