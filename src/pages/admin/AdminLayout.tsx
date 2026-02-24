import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const userInfoStr = localStorage.getItem("userInfo");
    if (!userInfoStr) {
      navigate("/auth", { replace: true });
      return;
    }
    try {
      const userInfo = JSON.parse(userInfoStr);
      if (!userInfo.token) {
        navigate("/auth", { replace: true });
        return;
      }
      if (!userInfo.isAdmin) {
        navigate("/", { replace: true });
        return;
      }
      setAllowed(true);
    } catch {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  if (allowed === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/auth");
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-zinc-800">
          <Link to="/" className="text-xl font-bold font-heading">
            UD. ADMIN
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 dark:text-zinc-400"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
          <h1 className="text-xl font-semibold capitalize">
            {location.pathname.split("/").pop()}
          </h1>
          <div className="flex items-center gap-4">
            {/* Additional header items like profile can go here */}
            <span className="text-sm font-medium">Hello, Admin</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-zinc-50 dark:bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
