import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

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
  couponCode?: string;
  discountAmount?: number;
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
      const { data } = await api.get<Order[]>('/orders/myorders');
      return data;
    },
  });
}

export function useOrderById(orderId?: string) {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get<Order>(`/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
  });
}

export function useAdminStats() {
  // Sprint 5 / BUG-F-068: only fire (and only poll) when an admin is signed in.
  // Without this guard, a customer-tab left open after admin logout kept hitting
  // /admin/stats every 30s and 401-storming.
  const isAdmin = useAdminAuthStore((s) => s.isAuthenticated && s.isAdmin);
  return useQuery<StatsResponse>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api.get<StatsResponse>('/admin/stats');
      return data;
    },
    enabled: isAdmin,
    refetchInterval: isAdmin ? 30000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useAllOrders() {
  const isAdmin = useAdminAuthStore((s) => s.isAuthenticated && s.isAdmin);
  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      const { data } = await api.get<any>('/orders');
      return data.data || data;
    },
    enabled: isAdmin,
    refetchInterval: isAdmin ? 30000 : false,
    refetchIntervalInBackground: false,
  });
}

// Sprint 6 / BUG-F-096 + BUG-F-097: order-mutating hooks now also invalidate
// `myOrders` and the per-order detail query, so customer-facing screens stay
// fresh after admin actions.
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      return data as Order;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
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
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
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
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}
