import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { useCartSync } from "@/hooks/useCartSync";
import { setCartSyncErrorCallback } from "@/stores/cartStore";
import { toast as sonnerToast } from "sonner";
import { useEffect, lazy, Suspense } from "react";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import Wishlist from "./pages/Wishlist";
import Sale from "./pages/Sale";
import NewArrivals from "./pages/NewArrivals";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Trending from "./pages/Trending";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import SizeGuide from "./pages/SizeGuide";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Account from "./pages/Account";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Checkout from "./pages/Checkout";
// Bug #140: Global Error Boundary
import { ErrorBoundary } from "@/components/ErrorBoundary";
// Bug #20: Import OrderDetail page which was missing from routes
import OrderDetail from "./pages/OrderDetail";

// Customer-side auth guard.
import { RequireAuth } from "@/components/RequireAuth";

// Admin components — only the route guard + login are eager (small, frequently hit).
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import AdminLogin from "@/pages/admin/Login";

// Sprint 2: code-split everything inside the admin shell. The admin bundle is
// large (charts, tables, big form components) and shouldn't ship to public visitors.
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/Products"));
const AdminProductForm = lazy(() => import("@/pages/admin/AdminProductForm"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminCMS = lazy(() => import("@/pages/admin/CMS"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminCategories = lazy(() => import("@/pages/admin/Categories"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));
const AdminAbandonedCarts = lazy(() => import("@/pages/admin/AbandonedCarts"));
const AdminPromotions = lazy(() => import("@/pages/admin/Promotions"));
const AdminReviews = lazy(() => import("@/pages/admin/Reviews"));
const AdminSubscribers = lazy(() => import("@/pages/admin/Subscribers"));

import EmailVerificationPending from "@/pages/EmailVerificationPending";
import ResetPassword from "@/pages/ResetPassword";
import Profile from "@/pages/Profile";

// Bug #171 + Sprint 7 / BUG-F-092: scroll to top on route change.
// Pass a literal `0` instead of an options object — `behavior: 'instant'` was
// runtime-OK in modern Chromium but flagged by TS lib.dom and not honored
// uniformly across browsers. The 2-arg form is universally instant.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Bug #133: Configure React Query with sensible staleTime to reduce excessive refetching
// Bug #191: disable refetch-on-focus and tune reconnect refetching so a flaky
// connection doesn't fan out a request storm across every active query. The
// 60s staleTime already coalesces most reconnect refetches; we keep
// refetchOnReconnect: 'always' so genuinely stale data still revalidates after
// a real network outage.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
  },
});

// Sprint 6 / BUG-F-091: register a global cart-sync error reporter so silent
// `console.error`s become a user-visible toast. Lives at module load (before
// AppContent renders) so even early sync errors surface.
setCartSyncErrorCallback((message: string) => {
  sonnerToast.error("Cart sync issue", {
    description: message || "We couldn't reach our servers. Your cart may be out of date.",
  });
});

const AppContent = () => {
  useCartSync();
  // Bug #147: Removed dead code empty useEffect

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/verify-email-pending" element={<EmailVerificationPending />} />
        {/* Sprint 4 / BUG-F-006 + BUG-F-007: gate personal routes. */}
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
        {/* Bug #20: OrderDetail page was not registered in routes */}
        <Route path="/account/orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/size-guide" element={<SizeGuide />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* Bug #21: /admin was a blank page — redirect to dashboard */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading admin…</div>}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/edit/:id" element={<AdminProductForm />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="cms" element={<AdminCMS />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="abandoned-carts" element={<AdminAbandonedCarts />} />
                  <Route path="promotions" element={<AdminPromotions />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="subscribers" element={<AdminSubscribers />} />
                  <Route path="settings" element={<AdminSettings />} />
                  {/* Sprint 2: inner admin 404 instead of falling through to a blank shell. */}
                  <Route path="*" element={
                    <div className="p-12 text-center">
                      <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        The admin page you're looking for doesn't exist.
                      </p>
                      <a href="/admin/dashboard" className="text-sm underline">Back to dashboard</a>
                    </div>
                  } />
                </Routes>
              </AdminLayout>
            </Suspense>
          </ProtectedRoute>
        } />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

// WishlistProvider must live INSIDE <BrowserRouter> because it calls
// useLocation() to gate the wishlist fetch on /admin/* routes.
const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
