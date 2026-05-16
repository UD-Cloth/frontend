import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ---------- Dashboard Stats ----------
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  ordersOverTime: { date: string; count: number; revenue: number }[];
}

export function useAdminStats() {
  return useQuery<DashboardStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>('/admin/stats');
      return data;
    },
  });
}

// ---------- Orders (Admin) ----------
interface AdminOrder {
  _id: string;
  user: { _id: string; firstName: string; lastName: string } | null;
  orderItems: any[];
  shippingAddress: any;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

export function useAllOrders() {
  return useQuery<AdminOrder[]>({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const { data } = await api.get<AdminOrder[] | { data: AdminOrder[] }>('/orders');
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
  });
}

export function useUpdateOrderToDelivered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.put(`/orders/${orderId}/deliver`);
      return data;
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      // Sprint 6 / BUG-F-096 + BUG-F-097: also invalidate customer-facing queries.
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}

// ---------- Users (Admin) ----------
interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: string;
}

export function useAllUsers() {
  return useQuery<AdminUser[]>({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}
