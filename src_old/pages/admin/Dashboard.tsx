import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Users, DollarSign, Loader2 } from "lucide-react";
import api from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatsResponse {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  ordersOverTime: { date: string; count: number; revenue: number }[];
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get<StatsResponse>("/admin/stats");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const totalProducts = stats?.totalProducts ?? 0;
  const totalCustomers = stats?.totalCustomers ?? 0;
  const ordersOverTime = stats?.ordersOverTime ?? [];

  const statCards = [
    {
      name: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: DollarSign,
      link: "/admin/orders",
    },
    { name: "Total Orders", value: String(totalOrders), icon: ShoppingBag, link: "/admin/orders" },
    { name: "Total Products", value: String(totalProducts), icon: Package, link: "/admin/products" },
    { name: "Total Customers", value: String(totalCustomers), icon: Users, link: "/admin/users" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.name} to={stat.link} className="group">
            <Card className="transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 h-96">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-4">
          Orders & revenue (last 30 days)
        </h3>
        {ordersOverTime.length > 0 ? (
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={ordersOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="orders" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="revenue" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === "revenue" ? `₹${Number(value).toLocaleString("en-IN")}` : value
                }
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="count"
                name="Orders"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.2)"
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="Revenue (₹)"
                stroke="#0ea5e9"
                fill="rgba(14, 165, 233, 0.2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-zinc-500">No order data yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
