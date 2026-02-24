import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Truck } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface OrderUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
}

interface Order {
  _id: string;
  user: OrderUser;
  orderItems: { name: string; qty: number; price: number }[];
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  paymentMethod?: string;
}

export default function Orders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await api.get<Order[]>("/orders");
      return data;
    },
  });

  const deliverMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.put(`/orders/${orderId}/deliver`, {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order marked as delivered" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const customerName = (order: Order) => {
    const u = order.user;
    if (!u) return "—";
    return [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
  };

  const statusBadge = (order: Order) => {
    if (order.isDelivered) return <Badge variant="default">Delivered</Badge>;
    if (order.isPaid) return <Badge variant="secondary">Paid / Shipped</Badge>;
    return <Badge variant="outline">Processing</Badge>;
  };

  return (
    <div className="space-y-6 flex flex-col h-full gap-4">
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium font-mono text-xs">
                    {order._id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell>{customerName(order)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>₹{order.totalPrice?.toLocaleString("en-IN") ?? "—"}</TableCell>
                  <TableCell>{statusBadge(order)}</TableCell>
                  <TableCell className="text-right">
                    {!order.isDelivered && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => deliverMutation.mutate(order._id)}
                        disabled={deliverMutation.isPending}
                      >
                        {deliverMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Truck className="h-4 w-4 mr-1" />
                            Mark delivered
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && orders.length === 0 && (
          <div className="py-12 text-center text-zinc-500">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
