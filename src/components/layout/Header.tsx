import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, Loader2, Star, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWishlist } from "@/context/WishlistContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCartStore } from "@/stores/cartStore";
import { categories } from "@/data/products";
import { useSearchProducts } from "@/hooks/useProducts";
import { useAuthStore } from "@/stores/authStore";
import { useAuthContext } from "@/context/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { formatPrice } from "@/lib/utils";

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const cartItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { totalItems: wishlistItems } = useWishlist();
  // Sprint 5 / BUG-F-031: search suggestions hit the real /products/search
  // endpoint (debounced via the hook's `enabled: trimmed.length >= 2` and
  // staleTime of 30s). Demo store is no longer consulted.
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { isAuthenticated } = useAuthStore();
  // Sprint 4 / BUG-F-001: route logout through AuthContext so all stores
  // (AuthContext, useAuthStore, useAdminAuthStore) are cleared in one shot.
  // Calling useAuthStore.logout() alone leaves AuthContext.user populated.
  const { logout } = useAuthContext();
  const { data: settings } = useSettings();

  useEffect(() => {
    // Sprint 4 / BUG-F-043: only clear the `openCart` flag, not the entire
    // history state — other routes may have set their own state we don't own.
    if (location.state?.openCart) {
      setIsCartOpen(true);
      const { openCart, ...rest } = (location.state as any) || {};
      navigate(location.pathname + location.search, { replace: true, state: Object.keys(rest).length ? rest : undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Sprint 5 / BUG-F-032: debounce the query before firing the search hook.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: searchSuggestions = [] } = useSearchProducts(debouncedQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const filteredSearchResults = searchSuggestions.slice(0, 5);

  return (
    <>
      {/* Social Proof Announcement Bar */}
      {settings?.isAnnouncementActive && settings?.announcementText && (
        <div className={`bg-primary text-primary-foreground py-2 px-4 text-xs md:text-sm font-medium tracking-wide relative z-50 flex items-center h-10 w-full transition-colors ${settings.isAnnouncementScrolling ? 'overflow-hidden hover:bg-slate-900' : 'justify-center border-b border-primary/20'}`}>
          {/* Bug #69: hint compositor with will-change + translate3d for smoother Firefox marquee */}
          <div style={{ willChange: settings.isAnnouncementScrolling ? 'transform' : undefined, transform: settings.isAnnouncementScrolling ? 'translate3d(0,0,0)' : undefined }} className={`${settings.isAnnouncementScrolling ? 'animate-marquee inline-flex items-center gap-2 whitespace-nowrap' : 'flex items-center gap-2 text-center'}`}>
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span>{settings.announcementText}</span>
            {settings.isAnnouncementScrolling && (
              <>
                <span className="mx-8 text-white/20">•</span>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>{settings.announcementText}</span>
              </>
            )}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between px-4 lg:px-8">
          {/* Left Side - Unified Slide-Out Menu */}
          <div className="flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 group transition-all duration-200 hover:bg-accent hover:text-accent-foreground px-2">
                  <Menu className="h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  <span className="text-sm font-bold tracking-[0.2em] hidden md:block mt-[2px]">MENU</span>
                </Button>
              </SheetTrigger>
              {/* Bug #152: ensure mobile menu scrolls when content overflows viewport */}
              <SheetContent side="left" className="w-[380px] max-w-full p-0 flex flex-col border-r-0 shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between p-8 border-b border-border">
                  <span className="text-lg font-bold tracking-[0.2em]">NAVIGATION</span>
                </div>
                
                <nav className="flex-1 overflow-y-auto pt-10 px-8 flex flex-col gap-6">
                  <Link
                    to="/new-arrivals"
                    className="group flex flex-col gap-1 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-[22px] font-normal group-hover:font-bold text-foreground transition-all duration-300">New Arrivals</span>
                  </Link>

                  <Link
                    to="/trending"
                    className="group flex flex-col gap-1 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-[22px] font-normal group-hover:font-bold text-foreground transition-all duration-300">Trending Now</span>
                  </Link>
                  
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.id}`}
                      className="group flex flex-col gap-1 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-[22px] font-normal group-hover:font-bold text-foreground transition-all duration-300">{category.name}</span>
                    </Link>
                  ))}
                  
                  <Link
                    to="/sale"
                    className="group flex flex-col gap-1 transition-all duration-300 mt-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-[22px] font-bold text-red-600 hover:text-red-700 transition-all duration-300">Sale</span>
                  </Link>
                </nav>

                {/* Bug #84: removed `mt-auto` so My Account/Profile is visible without scrolling on smaller mobile screens */}
                <div className="px-8 py-10 bg-muted/30 border-t border-border flex flex-col gap-5">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center text-sm font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5 mr-3" />
                        My Account
                      </Link>
                      {/* Bug #90: logout closes the mobile sheet via onOpenChange(false) */}
                      <button
                        type="button"
                        className="flex items-center text-sm font-bold text-destructive hover:text-destructive/80 transition-colors uppercase tracking-wider text-left"
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                          navigate('/');
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Login / Register
                    </Link>
                  )}
                  {/* Bug #177: bumped contrast from text-muted-foreground to text-foreground for AA compliance */}
                  <Link
                    to="/contact"
                    className="flex items-center text-sm font-bold text-foreground hover:text-primary transition-colors uppercase tracking-wider"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    Customer Support
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center justify-center">
            <img src="/Tag logo-01.png" alt="Urban Drape — home" className="h-24 w-auto" />
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in relative z-50">
                  <div className="relative">
                    <Input
                      placeholder="Search..."
                      className="w-48 lg:w-64 h-9"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery.trim() !== "" && (
                      <div className="absolute top-full mt-2 w-[300px] right-0 bg-background border border-border rounded-md shadow-lg flex flex-col overflow-hidden animate-in fade-in-0 slide-in-from-top-2">
                        {filteredSearchResults.length > 0 ? (
                          filteredSearchResults.map(product => (
                            <Link 
                              key={product._id || product.id} 
                              to={`/product/${product._id || product.id}`}
                              className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                              }}
                            >
                              <img src={product.images?.[0] || product.image || ''} alt={product.name} className="w-10 h-10 object-cover rounded" />
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-center text-muted-foreground">No products found</div>
                        )}
                        {/* Bug #99: themed shadcn Button instead of unstyled native button */}
                        <Button type="submit" variant="ghost" className="rounded-none w-full text-xs font-semibold">
                          View All Results
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Mobile Search */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <form onSubmit={handleSearch} className="flex flex-col gap-2 mt-4 relative">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search products..."
                      className="flex-1"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {searchQuery.trim() !== "" && (
                    <div className="w-full bg-background border border-border rounded-md shadow-sm flex flex-col overflow-hidden max-h-[60vh] overflow-y-auto mt-2">
                      {filteredSearchResults.length > 0 ? (
                        filteredSearchResults.map(product => (
                          <Link 
                            key={product._id || product.id} 
                            to={`/product/${product._id || product.id}`}
                            className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                          >
                            <img src={product.images?.[0] || product.image || ''} alt={product.name} className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-center text-muted-foreground">No products found</div>
                      )}
                      {/* Bug #99: themed shadcn Button instead of unstyled native button */}
                      <Button type="submit" variant="ghost" className="rounded-none w-full text-sm font-semibold">
                        View All Results
                      </Button>
                    </div>
                  )}
                </form>
              </SheetContent>
            </Sheet>


            {/* Wishlist */}
            <Link to="/wishlist" title="Wishlist" aria-label="Wishlist">
              {/* Bug #83: title for native tooltip on hover */}
              <Button variant="ghost" size="icon" className="relative" title="Wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            {/* Bug #83: title for native tooltip on hover */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              title="Cart"
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </Button>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* Bug #83: title for native tooltip on hover */}
                <Button variant="ghost" size="icon" title="Account" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              {/* Bug #79: bump z-index above search results dropdown (z-50) */}
              <DropdownMenuContent align="end" className="z-[60] w-48 bg-background border shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent">
                      <Link to="/profile" className="w-full cursor-pointer font-medium text-primary">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="transition-colors duration-150 hover:bg-destructive/10 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent">
                      <Link to="/auth" className="w-full cursor-pointer">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent">
                      <Link to="/auth" className="w-full cursor-pointer">Register</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
};
