import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
  createdAt: string;
}

export function useAdminUsers() {
  return useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await api.get<any>('/admin/users');
      return data.data || data;
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/admin/users/${userId}`);
      return data;
    },
    // Bug #4: optimistically remove the user from the cache so it doesn't
    // briefly reappear between the success callback and the refetch. Snapshot
    // for rollback if the request fails.
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ['adminUsers'] });
      const previous = queryClient.getQueryData<User[]>(['adminUsers']);
      if (previous) {
        queryClient.setQueryData<User[]>(
          ['adminUsers'],
          previous.filter((u) => u._id !== userId)
        );
      }
      return { previous };
    },
    onError: (_err, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['adminUsers'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data } = await api.put(`/admin/users/${userId}/role`, { role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

export function useToggleUserBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const { data } = await api.put(`/admin/users/${userId}/block`, { isBlocked });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}
