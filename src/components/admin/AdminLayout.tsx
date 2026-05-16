import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    Moon,
    Sun,
    Bell,
    Star,
    Tag,
    ShoppingBag,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import { useAllOrders } from '@/hooks/useOrders';
import { useToast } from '@/components/ui/use-toast';

const ADMIN_LINKS = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'CMS', path: '/admin/cms', icon: FileText },
    { name: 'Discounts', path: '/admin/promotions', icon: Tag },
    { name: 'Abandoned Carts', path: '/admin/abandoned-carts', icon: ShoppingBag },
    { name: 'Subscribers', path: '/admin/subscribers', icon: Mail },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const { logout, adminName, adminRole } = useAdminAuthStore();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    // Sprint 6 / BUG-F-076: subscribe to the real /orders feed (already polled
    // every 30s by `useAllOrders` while admin is signed in) instead of the demo
    // localStorage-backed `useOrderStore`. This makes the toast actually fire
    // for real customer orders.
    const { toast } = useToast();
    const { data: allOrders = [] } = useAllOrders();

    // Track previous count via ref so we don't render-loop. Initialize from the
    // first non-empty fetch so we don't toast the entire historical order list
    // when the admin first lands on the dashboard.
    const prevOrderCountRef = useRef<number | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Bug #50: multi-tab logout — when `userInfo` is removed in another tab,
    // the `storage` event fires here with newValue === null. Clear local admin
    // state so this tab doesn't sit on a stale, unauthenticated session.
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'userInfo' && e.newValue === null) {
                logout();
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [logout]);

    useEffect(() => {
        const count = allOrders.length;
        if (prevOrderCountRef.current === null) {
            prevOrderCountRef.current = count;
            return;
        }
        if (count > prevOrderCountRef.current) {
            const diff = count - prevOrderCountRef.current;
            const newest: any = allOrders[0];
            const customerName = newest?.user
                ? `${newest.user.firstName || ''} ${newest.user.lastName || ''}`.trim() || 'a customer'
                : 'a customer';
            const orderRef = newest?._id ? `#${String(newest._id).slice(-8).toUpperCase()}` : '';
            toast({
                title: '🛍️ New Order Received!',
                description:
                    diff === 1
                        ? `Order ${orderRef} was just placed by ${customerName}. Check the Orders tab!`
                        : `${diff} new orders were placed. Check the Orders tab!`,
                duration: 10000,
            });
        }
        prevOrderCountRef.current = count;
    }, [allOrders, toast]);

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-slate-900 text-slate-50 dark:bg-slate-950 border-r border-slate-800">
            <div className="flex items-center gap-2 p-6 border-b border-slate-800">
                <div className="bg-primary/20 text-primary p-2 rounded-lg">
                    <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
                </div>
            </div>

            <div className="flex-1 overflow-auto py-6">
                <nav className="space-y-1 px-3">
                    {ADMIN_LINKS.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{adminName}</span>
                        <span className="text-xs text-slate-400 capitalize">{adminRole}</span>
                    </div>
                    {mounted && (
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                    )}
                </div>
                <Button
                    variant="destructive"
                    className="w-full justify-start gap-2"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        // Bug #39: add bg-background + transition-colors so the body bg flips
        // alongside Recharts re-render on dark-mode toggle (no white flash).
        <div className="flex min-h-screen bg-background bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* Desktop Sidebar */}
            {/* Bug #38: collapse sidebar below 1280px (xl) — at 1024px (lg) the
                main content was overlapping the sidebar on tablets. */}
            <div className="hidden xl:block w-72 sticky top-0 h-screen">
                <SidebarContent />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile / Tablet Header */}
                <header className="xl:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold">Admin</h2>
                    </div>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" aria-label="Open admin menu">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-none">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};
