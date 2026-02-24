import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, User, LogOut, MapPin, CreditCard, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { MOCK_USER_PROFILE } from "@/data/mockProfile";
import api from "@/lib/api";

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [isUpdating, setIsUpdating] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: ""
  });

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfileAndOrders = async () => {
      const userInfoStr = localStorage.getItem("userInfo");
      if (!userInfoStr) {
        navigate("/auth");
        return;
      }
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUser(userInfo);

        const [profileRes, ordersRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/orders/myorders")
        ]);

        const pData = (profileRes as any).data;
        setProfile({
          fullName: `${pData.firstName} ${pData.lastName}`,
          phone: pData.phone || "",
          address: pData.address || "",
          city: pData.city || "",
          state: pData.state || "",
          postalCode: pData.postalCode || ""
        });

        setOrders((ordersRes as any).data);
      } catch (e) {
        console.error("Failed to fetch profile/orders", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, [navigate]);

  const handleSignOut = async () => {
    localStorage.removeItem("userInfo");
    navigate("/");
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const [fName, ...lName] = profile.fullName.trim().split(' ');
      const res = await api.put("/auth/profile", {
        firstName: fName || user?.firstName,
        lastName: lName.join(' ') || user?.lastName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        postalCode: profile.postalCode
      });

      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...(res as any).data }));

      toast({
        title: "Profile Updated",
        description: "Your details have been saved successfully.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: e.message || "Failed to save profile changes.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">MENSWEAR</Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium truncate">{profile.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <Button
                variant={activeTab === "orders" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("orders")}
              >
                <Package className="h-4 w-4 mr-2" />
                My Orders
              </Button>
              <Button
                variant={activeTab === "profile" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <User className="h-4 w-4 mr-2" />
                Profile Details
              </Button>
              <Button
                variant={activeTab === "addresses" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("addresses")}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Saved Addresses
              </Button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              {/* My Orders Tab */}
              <TabsContent value="orders" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/">Start Shopping</Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg mb-4">You have no orders yet.</p>
                      <Button asChild>
                        <Link to="/">Start Shopping</Link>
                      </Button>
                    </div>
                  ) : orders.map((order) => (
                    <Card key={order._id}>
                      <CardHeader className="bg-muted/10 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <CardTitle className="text-base">Order #{order._id.substring(order._id.length - 8)}</CardTitle>
                            <CardDescription>Placed on {new Date(order.createdAt).toLocaleDateString()}</CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.isDelivered
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                              }`}>
                              {order.isDelivered ? "Delivered" : "Processing"}
                            </span>
                            <span className="font-bold">₹{order.totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {order.orderItems.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.qty}x <span className="text-foreground">{item.name}</span>
                              </span>
                              <span>₹{item.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <Separator />
                      <CardFooter className="pt-4 flex justify-end">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90" asChild>
                          <Link to={`/account/orders/${order._id}`}>
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Profile Details Tab */}
              <TabsContent value="profile" className="mt-0">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Profile Details</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleUpdateProfile}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                        <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              {/* Saved Addresses Tab */}
              <TabsContent value="addresses" className="mt-0">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Saved Addresses</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Default Address</CardTitle>
                    <CardDescription>Update your primary shipping address.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleUpdateProfile}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Street Address</Label>
                        <Input value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="123 Main St" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} placeholder="Mumbai" />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input value={profile.state} onChange={e => setProfile({ ...profile, state: e.target.value })} placeholder="Maharashtra" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input value={profile.postalCode} onChange={e => setProfile({ ...profile, postalCode: e.target.value })} placeholder="400001" />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Address
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
