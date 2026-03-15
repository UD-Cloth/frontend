import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string; // product ID
  size?: string;
  color?: string;
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address: string;
  city: string;
  postalCode: string;
  state: string;
}

interface CreateOrderData {
  orderItems: OrderItem[];
  // Bug #43: Customer contact info fields
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  user?: { _id: string; firstName: string; lastName: string };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  taxPrice?: number;
  shippingPrice?: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StatsResponse {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  ordersOverTime: Array<{ date: string; count: number; revenue: number }>;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const { data } = await api.post('/orders', orderData);
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

export function useMyOrders() {
  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/myorders');
      return data;
    },
  });
}

export function useOrderById(orderId?: string) {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
  });
}

export function useAdminStats() {
  return useQuery<StatsResponse>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      // Bug #22/#152: Stats API is at /api/admin/stats (not /api/stats)
      const { data } = await api.get<StatsResponse>('/admin/stats');
      return data;
    },
    // Bug #154: Add auto-refresh polling for dashboard
    refetchInterval: 30000,
  });
}

export function useAllOrders() {
  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      const { data } = await api.get<Order[]>('/orders');
      return data;
    },
    // Bug #154: Add auto-refresh polling for orders
    refetchInterval: 30000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}

export function useMarkOrderPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.put(`/orders/${orderId}/pay`, {});
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.put(`/orders/${orderId}/cancel`, {});
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}
