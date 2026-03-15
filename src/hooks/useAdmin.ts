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
      const { data } = await api.get('/admin/stats');
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
      const { data } = await api.get('/orders');
      return data;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
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
      const { data } = await api.get('/admin/users');
      return data;
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
