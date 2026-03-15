import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Package, Truck } from "lucide-react";
import api from "@/lib/api";

interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: { address: string; city: string; state: string; postalCode: string };
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("userInfo")) {
      navigate("/auth");
      return;
    }
    setAllowed(true);
  }, [navigate]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await api.get<Order>(`/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId && allowed,
  });

  if (!allowed) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container px-4 py-16 text-center">
          <h1 className="text-xl font-bold mb-4">Order not found</h1>
          <Button asChild>
            <Link to="/account">Back to Account</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const steps = [
    { key: "placed", label: "Order placed", done: true, at: order.createdAt },
    { key: "paid", label: "Payment", done: order.isPaid, at: order.paidAt },
    { key: "delivered", label: "Delivered", done: order.isDelivered, at: order.deliveredAt },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 py-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/account" className="text-sm text-primary hover:underline">
            ← Back to Account
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Order #{order._id.slice(-8).toUpperCase()}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Placed on {formatDate(order.createdAt)}
        </p>

        {/* Status timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Order status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {steps.map((step, i) => (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      step.done ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {step.done ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <p className="text-xs font-medium mt-2 text-center">{step.label}</p>
                  {step.at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(step.at)}
                    </p>
                  )}
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 w-0.5 min-h-[24px] mt-2 ${
                        step.done ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.orderItems.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 py-3 border-b last:border-0"
              >
                <div className="h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.qty}
                    {item.size && ` • ${item.size}`}
                    {item.color && ` • ${item.color}`}
                  </p>
                </div>
                <p className="font-medium">
                  ₹{(item.price * item.qty).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Shipping & total */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Shipping address
              </p>
              <p className="text-sm">
                {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Payment
              </p>
              <p className="text-sm capitalize">{order.paymentMethod}</p>
            </div>
            <div className="flex justify-between text-lg font-bold pt-4 border-t">
              <span>Total</span>
              <span>₹{order.totalPrice?.toLocaleString("en-IN")}</span>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
