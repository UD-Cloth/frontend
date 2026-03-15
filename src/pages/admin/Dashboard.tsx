import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ShoppingCart, Activity, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { useAdminStats, useAllOrders } from '@/hooks/useOrders';

const usersData = [
    { name: 'Mon', new: 120, returning: 300 },
    { name: 'Tue', new: 150, returning: 320 },
    { name: 'Wed', new: 180, returning: 350 },
    { name: 'Thu', new: 140, returning: 310 },
    { name: 'Fri', new: 250, returning: 400 },
    { name: 'Sat', new: 350, returning: 450 },
    { name: 'Sun', new: 300, returning: 420 },
];

export default function AdminDashboard() {
    // Bug #79: Add date/time range filters for admin stats
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { data: stats, isLoading: statsLoading } = useAdminStats();
    const { data: allOrders, isLoading: ordersLoading } = useAllOrders();

    // Filter orders based on date range
    const filteredOrders = allOrders?.filter(order => {
        if (!startDate && !endDate) return true;
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && orderDate < start) return false;
        if (end && orderDate > end) return false;
        return true;
    }) ?? [];

    // Get first 5 recent orders
    const recentOrders = filteredOrders
        .slice(0, 5)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Prepare bar chart data from stats (filtered by date range if provided)
    let barChartData = stats?.ordersOverTime ?? [];
    if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        barChartData = barChartData.filter(item => {
            const itemDate = new Date(item.date);
            if (start && itemDate < start) return false;
            if (end && itemDate > end) return false;
            return true;
        });
    }

    const isLoading = statsLoading || ordersLoading;

    const getCustomerName = (order: any) => {
        if (order.user?.firstName && order.user?.lastName) {
            return `${order.user.firstName} ${order.user.lastName}`;
        }
        if (order.shippingAddress?.firstName && order.shippingAddress?.lastName) {
            return `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
        }
        return 'Unknown Customer';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's what's happening with your store today.
                    </p>
                </div>
            </div>

            {/* Bug #79: Date range filters */}
            <Card className="bg-muted/50">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium block mb-2">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium block mb-2">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStartDate("");
                                    setEndDate("");
                                }}
                                className="w-full md:w-auto"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{(stats?.totalRevenue ?? 0).toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1 text-emerald-500">
                                    All time
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalCustomers ?? 0}</div>
                                <p className="text-xs text-muted-foreground mt-1 text-emerald-500">
                                    Registered accounts
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalOrders ?? 0}</div>
                                <p className="text-xs text-muted-foreground mt-1 text-emerald-500">
                                    Total orders placed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Products</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalProducts ?? 0}</div>
                                <p className="text-xs text-muted-foreground mt-1 text-emerald-500">
                                    Total products
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4">
                            <CardHeader>
                                <CardTitle>Revenue Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={barChartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.2} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `₹${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`₹${value}`, "Revenue"]}
                                        />
                                        <Bar dataKey="revenue" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>User Traffic</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={usersData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.2} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="new" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                                        <Line type="monotone" dataKey="returning" stroke="#888888" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {recentOrders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No recent sales to display.</p>
                                ) : (
                                    recentOrders.map((order) => (
                                        <div key={order._id} className="flex items-center">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                                                {getCustomerName(order).substring(0, 2)}
                                            </div>
                                            <div className="ml-4 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium leading-none">{getCustomerName(order)}</p>
                                                    <span className="text-xs text-muted-foreground">({order._id})</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(order.createdAt), 'MMM d, h:mm a')} • {order.orderItems.length} item(s)
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium text-emerald-600">+₹{order.totalPrice.toLocaleString()}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
