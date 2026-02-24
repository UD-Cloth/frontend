import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, CreditCard, Truck, CheckCircle2, MapPin, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { MOCK_USER_PROFILE } from "@/data/mockProfile";
import api from "@/lib/api";

interface ProfileAddress {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
}

const phoneRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;

const shippingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(10, "Address is too short (min 10 chars)"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().regex(pincodeRegex, "Invalid Indian Pincode (6 digits)"),
  phone: z.string().regex(phoneRegex, "Invalid Indian Phone Number (10 digits)"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [user, setUser] = useState<any>(null);
  const [savedProfile, setSavedProfile] = useState<ProfileAddress | null>(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
    },
  });

  useEffect(() => {
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUser(userInfo);
        if (userInfo.email) {
          form.setValue("email", userInfo.email);
        }
        api.get<ProfileAddress>("/auth/profile").then((res) => {
          const p = (res as { data?: ProfileAddress }).data;
          if (p) setSavedProfile(p);
        }).catch(() => { });
      } catch (e) { }
    }
  }, [form]);

  const handleUseSavedAddress = (checked: boolean) => {
    setUseSavedAddress(checked);
    if (checked) {
      const source = savedProfile?.address ? savedProfile : MOCK_USER_PROFILE;
      form.setValue("firstName", source.firstName ?? "");
      form.setValue("lastName", source.lastName ?? "");
      form.setValue("email", source.email ?? user?.email ?? "");
      form.setValue("address", source.address ?? "");
      form.setValue("city", source.city ?? "");
      form.setValue("state", source.state ?? "");
      form.setValue("postalCode", source.postalCode ?? "");
      form.setValue("phone", source.phone ?? "");
    }
  };

  const cartTotal = items.reduce(
    (total, item) => total + parseFloat(item.price.amount) * item.quantity,
    0
  );

  const onSubmit = async (data: ShippingFormValues) => {
    setIsProcessing(true);

    try {
      const orderItems = items.map(item => ({
        name: item.product?.name || 'Product',
        qty: item.quantity,
        image: item.product?.image || '',
        price: parseFloat(item.price.amount),
        product: item.product?._id || item.product?.id,
        size: item.selectedOptions.find(o => o.name === 'Size')?.value,
        color: item.selectedOptions.find(o => o.name === 'Color')?.value,
      }));

      const payload = {
        orderItems,
        shippingAddress: {
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          state: data.state
        },
        paymentMethod,
        itemsPrice: cartTotal,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: cartTotal
      };

      const { data: createdOrder } = await api.post('/orders', payload);

      toast({
        title: "Order Placed Successfully!",
        description: `Thank you for your order, ${data.firstName}. We'll send a confirmation email to ${data.email}.`,
      });

      clearCart();
      if (user) {
        navigate("/account");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Add some items before checking out.</p>
          <Button asChild>
            <Link to="/">Return to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
          <Link to="/" className="text-xl font-bold">URBAN DRAPE</Link>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">

          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-8">

            {/* Authenticated User Options */}
            {user && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div className="space-y-2 flex-1">
                    <h3 className="font-medium text-foreground">Saved Address</h3>
                    {savedProfile?.address ? (
                      <p className="text-sm text-muted-foreground">
                        {savedProfile.firstName} {savedProfile.lastName}<br />
                        {savedProfile.address}, {savedProfile.city}, {savedProfile.state} - {savedProfile.postalCode}<br />
                        {savedProfile.phone}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No saved address in your profile. Update your account to save one, or enter below.
                      </p>
                    )}
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="useSaved"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={useSavedAddress}
                        onChange={(e) => handleUseSavedAddress(e.target.checked)}
                      />
                      <label htmlFor="useSaved" className="text-sm font-medium cursor-pointer">
                        Use this address for shipping
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Contact & Shipping */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>How can we reach you about your order?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="9999999999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Shipping Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                    <CardDescription>Where should we deliver your order?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="House/Flat No, Street Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Mumbai" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Maharashtra" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="400001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>Select how you'd like to pay.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup defaultValue="cod" onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-4">
                      <div>
                        <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                        <label
                          htmlFor="cod"
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span className="font-semibold">Cash on Delivery</span>
                          </div>
                        </label>
                      </div>

                      {/* You can add more mock payment methods here */}
                      <div>
                        <RadioGroupItem value="online" id="online" className="peer sr-only" disabled />
                        <label
                          htmlFor="online"
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 opacity-50 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="font-semibold">Online Payment (Coming Soon)</span>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    `Place Order - ₹${cartTotal.toLocaleString()}`
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4">
                      <div className="h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.product?.image || ""}
                          alt={item.product?.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium line-clamp-2">{item.product?.name}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          Size: {item.selectedOptions.find(o => o.name === "Size")?.value}
                        </p>
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">
                        ₹{(parseFloat(item.price.amount) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg flex gap-3 text-sm text-primary">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <p>
                    All transactions are secure and encrypted.
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Checkout;
