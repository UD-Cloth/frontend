import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "@/context/WishlistContext";
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
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import OrderDetail from "./pages/OrderDetail";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import { BackToTop } from "@/components/layout/BackToTop";


const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/sale" element={<Sale />} />
      <Route path="/new-arrivals" element={<NewArrivals />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/auth" element={<Auth />} />
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
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/account" element={<Account />} />
      <Route path="/account/orders/:orderId" element={<OrderDetail />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WishlistProvider>
        <Toaster />
        <Sonner />
        <BackToTop />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </BrowserRouter>
      </WishlistProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
