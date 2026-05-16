import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Trash2, ShoppingBag, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
    AbandonedCart,
    useAbandonedCarts,
    useDeleteAbandonedCart,
} from '@/hooks/useMarketing';
import { useSettings } from '@/hooks/useSettings';

export default function AbandonedCarts() {
    const { data: carts = [], isLoading, refetch, isFetching } = useAbandonedCarts();
    const deleteMut = useDeleteAbandonedCart();
    const { data: settings } = useSettings();
    const { toast } = useToast();
    const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);

    const currencySymbol = settings?.defaultCurrency === 'INR' ? '₹' : '$';
    const totalLostRevenue = carts.reduce((sum, c) => sum + c.totalValue, 0);

    const handleDelete = async (id: string) => {
        try {
            await deleteMut.mutateAsync(id);
            toast({ title: 'Removed', description: 'Abandoned cart record deleted.' });
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Failed',
                description: err?.response?.data?.message || 'Could not delete record.',
            });
        }
    };

    const handleManualRefresh = async () => {
        await refetch();
        toast({ title: 'Refreshed', description: 'Abandoned cart data is up to date.', duration: 2000 });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Abandoned Carts</h1>
                    <p className="text-muted-foreground mt-1.5 text-sm">
                        Customers who reached checkout but didn't complete their purchase.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleManualRefresh}
                        className="gap-2 text-slate-600"
                        disabled={isFetching}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border p-5 shadow-sm transition-all">
                    <p className="text-sm text-muted-foreground">Total Abandoned</p>
                    <p className="text-3xl font-bold mt-1">{carts.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">cart sessions</p>
                </div>
                <div className="bg-white rounded-xl border p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">Potential Lost Revenue</p>
                    <p className="text-3xl font-bold mt-1 text-red-500">
                        {currencySymbol}{totalLostRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">from abandoned sessions</p>
                </div>
                <div className="bg-white rounded-xl border p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">Avg Cart Value</p>
                    <p className="text-3xl font-bold mt-1">
                        {carts.length > 0
                            ? `${currencySymbol}${Math.round(totalLostRevenue / carts.length).toLocaleString()}`
                            : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">per abandoned session</p>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-semibold">Session</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Items</TableHead>
                            <TableHead className="font-semibold">Cart Value</TableHead>
                            <TableHead className="font-semibold">Left Page</TableHead>
                            <TableHead className="font-semibold">Time</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : carts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                                            <ShoppingBag className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-500">No abandoned carts yet</p>
                                            <p className="text-sm mt-1">
                                                When customers leave checkout without ordering, they'll appear here.
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            carts.map((cart) => (
                                <TableRow key={cart._id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs text-slate-500">
                                        {cart.sessionId}
                                    </TableCell>
                                    <TableCell>
                                        {cart.email ? (
                                            <span className="text-blue-600 text-sm font-medium">{cart.email}</span>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Unknown</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{cart.items.length} item(s)</Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold text-red-500">
                                        {currencySymbol}{cart.totalValue.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            {cart.pageAbandoned || '/'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        <div className="flex flex-col">
                                            <span>{format(new Date(cart.createdAt), 'MMM d, h:mm a')}</span>
                                            <span className="text-xs text-slate-400">
                                                {formatDistanceToNow(new Date(cart.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => setSelectedCart(cart)}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                {selectedCart?._id === cart._id && (
                                                    <DialogContent className="max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle className="flex items-center gap-2">
                                                                <TrendingDown className="w-5 h-5 text-red-500" />
                                                                Abandoned Cart Details
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                                <div className="bg-slate-50 p-3 rounded-lg">
                                                                    <p className="text-xs text-muted-foreground mb-1">Session ID</p>
                                                                    <p className="font-mono text-xs break-all">{cart.sessionId}</p>
                                                                </div>
                                                                <div className="bg-slate-50 p-3 rounded-lg">
                                                                    <p className="text-xs text-muted-foreground mb-1">Abandoned At</p>
                                                                    <p className="font-medium">{format(new Date(cart.createdAt), 'PPp')}</p>
                                                                </div>
                                                                <div className="bg-slate-50 p-3 rounded-lg">
                                                                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                                                                    <p className="font-medium">{cart.email || 'Not captured'}</p>
                                                                </div>
                                                                <div className="bg-red-50 p-3 rounded-lg">
                                                                    <p className="text-xs text-muted-foreground mb-1">Cart Value</p>
                                                                    <p className="font-bold text-red-600 text-lg">
                                                                        {currencySymbol}{cart.totalValue.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold mb-2">Items in Cart</p>
                                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                                    {cart.items.map((item, idx) => (
                                                                        <div key={`${item.productId}-${idx}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                                            {item.image && (
                                                                                <img
                                                                                    src={item.image}
                                                                                    alt={item.name}
                                                                                    className="w-10 h-12 object-cover rounded"
                                                                                />
                                                                            )}
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    {[item.size, item.color].filter(Boolean).join(' · ')} · Qty: {item.quantity}
                                                                                </p>
                                                                            </div>
                                                                            <p className="text-sm font-semibold shrink-0">
                                                                                {currencySymbol}{(item.price * item.quantity).toLocaleString()}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                )}
                                            </Dialog>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(cart._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
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
