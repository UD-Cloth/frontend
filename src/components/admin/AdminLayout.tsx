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
    Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

const ADMIN_LINKS = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'CMS', path: '/admin/cms', icon: FileText },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const { logout, adminName, adminRole } = useAdminAuthStore();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-72 sticky top-0 h-screen">
                <SidebarContent />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold">Admin</h2>
                    </div>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
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
