import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, User, LogOut, MapPin, ChevronRight, Lock, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useAuthContext } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useProfile, useUpdateProfile } from "@/hooks/useAuth";
import api from "@/lib/api";

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: authUser, logout } = useAuthContext();
  const { data: dashboardData, isLoading: loading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [activeTab, setActiveTab] = useState("orders");
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: ""
  });

  // Bug #65: Change Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!authUser) {
      navigate("/auth?returnUrl=/account", { state: { message: "Please sign in to view your account." } });
      return;
    }

    if (dashboardData?.profile) {
      const pData = dashboardData.profile as any;
      setProfile({
        fullName: `${pData.firstName || ""} ${pData.lastName || ""}`.trim(),
        phone: pData.phone || "",
        address: pData.address || "",
        city: pData.city || "",
        state: pData.state || "",
        postalCode: pData.postalCode || ""
      });
    }
  }, [authUser, navigate, dashboardData]);

  const orders = (dashboardData?.orders as any[]) || [];

  const handleSignOut = () => {
    logout();
    navigate("/");
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [fName, ...lName] = profile.fullName.trim().split(' ');

      await updateProfileMutation.mutateAsync({
        firstName: fName || authUser?.firstName,
        lastName: lName.join(' ') || authUser?.lastName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        postalCode: profile.postalCode
      });

      toast({
        title: "Profile Updated",
        description: "Your details have been saved successfully.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: e.response?.data?.message || "Failed to save profile changes.",
      });
    }
  };

  // Bug #65: Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 8) {
      toast({ variant: "destructive", title: "Password Too Short", description: "New password must be at least 8 characters." });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({ variant: "destructive", title: "Passwords Don't Match", description: "New password and confirmation don't match." });
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put('/auth/profile', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
      setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: e.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Bug #63: Cancel order handler — use /cancel endpoint (user-accessible), not /status (admin-only)
  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast({ title: "Order Cancelled", description: "Your order has been cancelled." });
      // Refresh data
      window.location.reload();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: e.response?.data?.message || "Could not cancel the order.",
      });
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Account-specific sub-header with sign out */}
      <div className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">My Account — <span className="font-medium text-foreground">URBAN DRAPE</span></span>
          <Button variant={"ghost" as any} size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {authUser?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium truncate">{profile.fullName || `${authUser?.firstName} ${authUser?.lastName}`}</p>
                <p className="text-xs text-muted-foreground truncate">{authUser?.email}</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <Button
                type="button"
                variant={(activeTab === "orders" ? "secondary" : "ghost") as any}
                className="justify-start"
                onClick={() => setActiveTab("orders")}
              >
                <Package className="h-4 w-4 mr-2" />
                My Orders
              </Button>
              <Button
                type="button"
                variant={(activeTab === "profile" ? "secondary" : "ghost") as any}
                className="justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <User className="h-4 w-4 mr-2" />
                Profile Details
              </Button>
              <Button
                type="button"
                variant={(activeTab === "addresses" ? "secondary" : "ghost") as any}
                className="justify-start"
                onClick={() => setActiveTab("addresses")}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Saved Addresses
              </Button>
              {/* Bug #65: Change Password tab */}
              <Button
                type="button"
                variant={(activeTab === "password" ? "secondary" : "ghost") as any}
                className="justify-start"
                onClick={() => setActiveTab("password")}
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
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
                  <Button variant={"outline" as any} size="sm" asChild>
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
                            {/* Bug #62: Show actual order.status field, not just isDelivered boolean */}
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              order.status === 'Delivered' ? "bg-green-100 text-green-800 border-green-200"
                              : order.status === 'Cancelled' ? "bg-red-100 text-red-800 border-red-200"
                              : order.status === 'Shipped' ? "bg-purple-100 text-purple-800 border-purple-200"
                              : order.status === 'Processing' ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}>
                              {order.status || (order.isDelivered ? "Delivered" : "Pending")}
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
                      <CardFooter className="pt-4 flex justify-between items-center">
                        {/* Bug #63: Cancel order button for Pending/Processing orders */}
                        {(order.status === 'Pending' || order.status === 'Processing') && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Cancel Order
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel order #{order._id.substring(order._id.length - 8)}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleCancelOrder(order._id)}
                                >
                                  Yes, Cancel
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 ml-auto" asChild>
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
                          autoComplete="name"
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={authUser?.email || ""} disabled className="bg-muted" />
                        <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          autoComplete="tel"
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                        <Input
                          value={profile.address}
                          autoComplete="street-address"
                          onChange={e => setProfile({ ...profile, address: e.target.value })}
                          placeholder="123 Main St"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            value={profile.city}
                            autoComplete="address-level2"
                            onChange={e => setProfile({ ...profile, city: e.target.value })}
                            placeholder="Mumbai"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input
                            value={profile.state}
                            autoComplete="address-level1"
                            onChange={e => setProfile({ ...profile, state: e.target.value })}
                            placeholder="Maharashtra"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input
                          value={profile.postalCode}
                          autoComplete="postal-code"
                          onChange={e => setProfile({ ...profile, postalCode: e.target.value })}
                          placeholder="400001"
                          // Bug #99: Only allow digits for postal code
                          onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Address
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              {/* Bug #65: Change Password Tab */}
              <TabsContent value="password" className="mt-0">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Change Password</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Update Password</CardTitle>
                    <CardDescription>Enter your current password and choose a new one.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleChangePassword}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          autoComplete="current-password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          autoComplete="new-password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Min. 8 characters"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          autoComplete="new-password"
                          value={passwordData.confirmNewPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                          placeholder="Re-enter new password"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
