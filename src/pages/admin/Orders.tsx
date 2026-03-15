import { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, MoreHorizontal, Search, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAllOrders, useUpdateOrderStatus, useMarkOrderPaid, Order } from '@/hooks/useOrders';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
    const { data: orders = [], isLoading } = useAllOrders();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus();
    const { mutate: markPaid, isPending: isMarkingPaid } = useMarkOrderPaid();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const { toast } = useToast();

    const handleStatusUpdate = (order: Order, status: string) => {
        updateStatus(
            { orderId: order._id, status },
            {
                onSuccess: () => {
                    toast({
                        title: "Status Updated",
                        description: `Order status changed to ${status}.`,
                    });
                },
                onError: (error: any) => {
                    toast({
                        title: "Error",
                        description: error.message || "Failed to update order status.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const handleMarkPaid = (order: Order) => {
        markPaid(order._id, {
            onSuccess: () => {
                toast({
                    title: "Payment Marked",
                    description: "Order marked as paid.",
                });
            },
            onError: (error: any) => {
                toast({
                    title: "Error",
                    description: error.message || "Failed to mark order as paid.",
                    variant: "destructive",
                });
            },
        });
    };

    const getCustomerName = (order: Order) => {
        if (order.user?.firstName && order.user?.lastName) {
            return `${order.user.firstName} ${order.user.lastName}`;
        }
        if (order.shippingAddress?.firstName && order.shippingAddress?.lastName) {
            return `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
        }
        return 'Unknown Customer';
    };

    const filteredOrders = orders.filter((order) =>
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCustomerName(order).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Delivered': return 'default';
            case 'Shipped': return 'secondary';
            case 'Processing': return 'outline';
            case 'Cancelled': return 'destructive';
            case 'Pending': return 'outline';
            case 'Out for Delivery': return 'secondary';
            default: return 'outline';
        }
    };

    const getPaymentBadge = (isPaid: boolean) => {
        if (isPaid) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
        }
        return <Badge variant="outline">Pending</Badge>;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground">
                        View orders, update statuses, and check customer details.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search orders..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No orders found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell className="font-medium">{order._id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{getCustomerName(order)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>₹{order.totalPrice.toLocaleString()}</TableCell>
                                    <TableCell>{getPaymentBadge(order.isPaid)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status || 'Pending')}>
                                            {order.status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdatingStatus || isMarkingPaid}>
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DialogTrigger asChild>
                                                        <DropdownMenuItem onClick={() => setSelectedOrder(order._id)}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                    </DialogTrigger>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel className="text-xs">Update Status</DropdownMenuLabel>
                                                    {ORDER_STATUSES.map(status => (
                                                        <DropdownMenuItem
                                                            key={status}
                                                            onClick={() => handleStatusUpdate(order, status)}
                                                            className={order.status === status ? "bg-accent" : ""}
                                                            disabled={isUpdatingStatus}
                                                        >
                                                            {status}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    {!order.isPaid && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleMarkPaid(order)}
                                                                disabled={isMarkingPaid}
                                                            >
                                                                Mark as Paid
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            {/* Dialog Content to View Order Details */}
                                            {selectedOrder === order._id && (
                                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Order Details - {order._id}</DialogTitle>
                                                        <DialogDescription>
                                                            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy h:mm a')}
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="grid grid-cols-2 gap-6 mt-4">
                                                        <div>
                                                            <h3 className="font-semibold mb-2">Customer & Shipping</h3>
                                                            <div className="text-sm bg-slate-50 p-4 rounded-md border">
                                                                <p className="font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                                                                <p className="mt-2">{order.shippingAddress?.address}</p>
                                                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold mb-2">Payment Info</h3>
                                                            <div className="text-sm bg-slate-50 p-4 rounded-md border">
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-muted-foreground">Method:</span>
                                                                    <span className="font-medium">{order.paymentMethod}</span>
                                                                </div>
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-muted-foreground">Status:</span>
                                                                    <span>{getPaymentBadge(order.isPaid)}</span>
                                                                </div>
                                                                <div className="flex justify-between mt-4 font-semibold text-lg border-t pt-2">
                                                                    <span>Total:</span>
                                                                    <span>₹{order.totalPrice.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6">
                                                        <h3 className="font-semibold mb-3">Order Items</h3>
                                                        <div className="border rounded-md divide-y">
                                                            {order.orderItems.map((item, idx) => (
                                                                <div key={idx} className="flex p-3 gap-4 items-center">
                                                                    {item.image && (
                                                                        <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded" />
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-sm">{item.name}</p>
                                                                        <p className="text-xs text-muted-foreground">Size: {item.size ?? 'N/A'} • Color: {item.color ?? 'N/A'}</p>
                                                                    </div>
                                                                    <div className="text-right text-sm">
                                                                        <p>₹{item.price.toLocaleString()} x {item.qty}</p>
                                                                        <p className="font-semibold mt-1">₹{(item.price * item.qty).toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            )}
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
