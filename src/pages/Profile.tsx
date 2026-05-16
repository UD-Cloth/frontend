import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useAuth';
import { useMyOrders, type Order as ApiOrder } from '@/hooks/useOrders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, User, LogOut, Calendar, ShieldCheck, Clock, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import SEO from "@/components/SEO";
import { formatPrice } from "@/lib/utils";

// Sprint 6 / BUG-F-002 + BUG-F-003:
// Profile page now reads from the real API (`useProfile` + `useMyOrders`)
// instead of the demo `useOrderStore` and Firebase shim. Email-verified badge
// reflects the backend `emailVerified` field instead of being hardcoded true.

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuthContext();

    // Sprint 6: read full profile (with verified flag and createdAt) from
    // /auth/dashboard which the existing useProfile hook already calls.
    const { data: profileData, isLoading: profileLoading } = useProfile();
    const { data: orders = [], isLoading: ordersLoading } = useMyOrders();

    const handleSignOut = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        // RequireAuth wraps this route in App.tsx, but defend against race.
        navigate('/auth?returnUrl=/profile', { replace: true });
        return null;
    }

    const profile = profileData?.profile as any | undefined;
    // Bug #63: Don't hardcode "U D" (Urban Drape) as the fallback initial. Show
    // a single neutral initial derived from the email if no name is set, or "?".
    const rawFirst = profile?.firstName || user.firstName || '';
    const rawLast = profile?.lastName || user.lastName || '';
    const emailInitial = (profile?.email || user.email || '').charAt(0).toUpperCase();
    const firstName = rawFirst || (rawLast ? '' : emailInitial || '?');
    const lastName = rawLast;
    const emailVerified = Boolean(profile?.emailVerified);
    const createdAtStr = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Recently';

    const isLoading = profileLoading || ordersLoading;

    const orderItemImage = (item: any): string => item?.image || '';
    const orderItemName = (item: any): string => item?.name || 'Item';
    const orderItemQty = (item: any): number => item?.qty ?? item?.quantity ?? 1;

    return (
        <>
        <SEO title="Profile" description="Your Urban Drape profile." noindex />
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back to Home
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Account</h1>
                <p className="text-muted-foreground mt-2">Manage your profile, orders, and account settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <Card className="md:col-span-1 shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-slate-900 shadow-sm">
                            <span className="text-3xl font-bold">{firstName.charAt(0)}{lastName.charAt(0)}</span>
                        </div>
                        <CardTitle className="text-xl">{firstName} {lastName}</CardTitle>
                        <CardDescription className="text-sm">{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <Separator />
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                            <span>Joined {createdAtStr}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <ShieldCheck
                                className={`w-4 h-4 mr-3 ${emailVerified ? 'text-emerald-500' : 'text-amber-500'}`}
                            />
                            <span className={emailVerified ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                                {emailVerified ? 'Email Verified' : 'Email Not Verified'}
                            </span>
                        </div>
                        <Separator />
                        <Button
                            variant="destructive"
                            className="w-full mt-2 group"
                            onClick={handleSignOut}
                        >
                            <LogOut className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>

                {/* Dashboard Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Orders Summary */}
                    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <CardTitle className="text-lg font-semibold flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-primary" />
                                    Order History
                                </CardTitle>
                                <CardDescription>View and track your recent purchases</CardDescription>
                            </div>
                            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-lg">
                                {orders.length}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12 space-y-3">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No orders yet</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                        When you place your first order at URBAN DRAPE, it will securely appear here.
                                    </p>
                                    <Button className="mt-4" onClick={() => navigate('/')}>
                                        Start Shopping
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order: ApiOrder) => {
                                        const status = order.status || (order.isDelivered ? 'Delivered' : 'Pending');
                                        return (
                                            <Link
                                                key={order._id}
                                                to={`/account/orders/${order._id}`}
                                                className="block border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary/50 transition-colors"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="font-bold text-sm font-mono">#{String(order._id).slice(-8).toUpperCase()}</span>
                                                            <Badge variant={
                                                                status === 'Delivered' ? 'default' :
                                                                status === 'Cancelled' ? 'destructive' :
                                                                'secondary'
                                                            }>{status}</Badge>
                                                            {order.isPaid && <Badge variant="outline" className="text-emerald-600 border-emerald-200">Paid</Badge>}
                                                        </div>
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short', day: 'numeric', year: 'numeric',
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-lg">
                                                            {formatPrice(order.totalPrice)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{order.orderItems.length} item{order.orderItems.length === 1 ? '' : 's'}</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                    {order.orderItems.slice(0, 3).map((item: any, idx: number) => (
                                                        <div key={idx} className="flex-1 min-w-[120px] flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-md">
                                                            {orderItemImage(item) && (
                                                                <img src={orderItemImage(item)} alt="" aria-hidden="true" className="w-8 h-10 object-cover rounded shadow-sm" />
                                                            )}
                                                            <div className="overflow-hidden">
                                                                <p className="text-xs font-medium truncate">{orderItemName(item)}</p>
                                                                <p className="text-[10px] text-muted-foreground">Qty: {orderItemQty(item)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {order.orderItems.length > 3 && (
                                                        <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-3 rounded-md text-xs font-medium text-muted-foreground">
                                                            +{order.orderItems.length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Settings link */}
                    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center">
                                <User className="w-5 h-5 mr-2 text-primary" />
                                Account Settings
                            </CardTitle>
                            <CardDescription>Update your personal information, addresses, and password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" onClick={() => navigate('/account')}>
                                Manage Account
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        </>
    );
}
