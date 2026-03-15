import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWishlist } from "@/context/WishlistContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
// Bug #36: Use cartStore (single source of truth) for cart badge count
import { useCartStore } from "@/stores/cartStore";
import { useCategories, useSearchProducts } from "@/hooks/useProducts";
import { useAuthContext } from "@/context/AuthContext";

interface SearchSuggestion {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Bug #36: cartStore is the canonical source for cart count
  const { items: cartStoreItems } = useCartStore();
  const cartItems = cartStoreItems.reduce((sum, item) => sum + item.quantity, 0);
  const { totalItems: wishlistItems } = useWishlist();
  const { data: categories = [] } = useCategories();
  const { user, logout } = useAuthContext();

  // Bug #190: Use dedicated search API for suggestions instead of filtering all products client-side
  const { data: searchResults = [], isLoading: isLoadingProducts } = useSearchProducts(
    searchQuery.length >= 2 ? searchQuery : ""
  );

  const suggestions: SearchSuggestion[] = searchResults.map((p: any) => ({
    id: p._id || p.id || "",
    name: p.name,
    price: p.price,
    image: p.image || (p.images && p.images.length > 0 ? p.images[0] : ""),
  }));

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    navigate(`/product/${suggestion.id}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left Side - Dropdown Menu (Desktop) */}
          <div className="hidden lg:flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="group flex items-center gap-1 transition-all duration-200 hover:bg-accent">
                  <Menu className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">Shop</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 bg-background border shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
              >
                {categories.map((category, index) => (
                  <DropdownMenuItem
                    key={(category as any)._id}
                    asChild
                    className="transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <Link
                      to={`/category/${(category as any).name}`}
                      className="w-full cursor-pointer animate-fade-in"
                    >
                      {(category as any).name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  asChild
                  className="transition-colors duration-150 hover:bg-primary/10"
                >
                  <Link to="/new-arrivals" className="w-full cursor-pointer text-primary font-medium">
                    New Arrivals
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="transition-colors duration-150 hover:bg-primary/10"
                >
                  {/* Bug #112: Trending is now in the desktop menu */}
                  <Link to="/trending" className="w-full cursor-pointer text-primary font-medium">
                    Trending
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="transition-colors duration-150 hover:bg-primary/10"
                >
                  <Link to="/sale" className="w-full cursor-pointer text-primary font-medium">
                    Sale
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              {/* Bug #296: Logo link at top of mobile menu */}
              <Link to="/" className="flex items-center mb-2 mt-1" onClick={() => setIsMobileMenuOpen(false)}>
                <img src="/Tag logo-01.png" alt="Urban Drape" className="h-16 w-auto" />
              </Link>
              <nav className="flex flex-col gap-4 mt-2">
                <Link
                  to="/"
                  className="text-lg font-medium hover:text-primary transition-colors uppercase tracking-wide"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                {categories.map((category) => (
                  <Link
                    key={(category as any)._id}
                    to={`/category/${(category as any).name}`}
                    className="text-lg font-medium hover:text-primary transition-colors uppercase tracking-wide"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {(category as any).name}
                  </Link>
                ))}
                <Link
                  to="/new-arrivals"
                  className="text-lg font-medium text-primary hover:text-primary/80 transition-colors uppercase tracking-wide"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  New Arrivals
                </Link>
                {/* Bug #112: Trending was missing from mobile menu */}
                <Link
                  to="/trending"
                  className="text-lg font-medium text-primary hover:text-primary/80 transition-colors uppercase tracking-wide"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Trending
                </Link>
                <Link
                  to="/sale"
                  className="text-lg font-medium text-primary hover:text-primary/80 transition-colors uppercase tracking-wide"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sale
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center justify-center mx-auto">
            <img src="/Tag logo-01.png" alt="Urban Drape" className="h-24 w-auto" />
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center relative" ref={searchRef}>
              {isSearchOpen ? (
                <div className="relative">
                  <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
                    <Input
                      placeholder="Search products..."
                      className="w-64 h-9"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setShowSuggestions(true)}
                    />
                    <Button type="submit" variant="ghost" size="icon" aria-label="Search">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Close search"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                        setShowSuggestions(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </form>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && searchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
                      {isLoadingProducts ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : suggestions.length > 0 ? (
                        <>
                          <div className="p-2 border-b bg-muted/50">
                            <span className="text-xs font-medium text-muted-foreground">
                              Suggestions
                            </span>
                          </div>
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <img
                                src={suggestion.image}
                                alt={suggestion.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {suggestion.name}
                                </p>
                                <p className="text-sm text-primary font-semibold">
                                  {formatPrice(suggestion.price)}
                                </p>
                              </div>
                            </button>
                          ))}
                          <button
                            className="w-full p-3 text-center text-sm text-primary font-medium hover:bg-accent transition-colors border-t"
                            onClick={() => handleSearch()}
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </>
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No products found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Search"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Mobile Search */}
            {/* Bug #47: Mobile search now has auto-suggestions dropdown */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <div className="relative mt-4" ref={searchRef}>
                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Input
                      placeholder="Search products..."
                      className="flex-1"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      autoFocus
                    />
                    <Button type="submit" size="icon" aria-label="Search">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                  {/* Mobile Suggestions Dropdown */}
                  {showSuggestions && searchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-background border rounded-lg shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
                      {isLoadingProducts ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : suggestions.length > 0 ? (
                        <>
                          <div className="p-2 border-b bg-muted/50 sticky top-0">
                            <span className="text-xs font-medium text-muted-foreground">
                              Suggestions
                            </span>
                          </div>
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left border-b last:border-b-0"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <img
                                src={suggestion.image}
                                alt={suggestion.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {suggestion.name}
                                </p>
                                <p className="text-sm text-primary font-semibold">
                                  {formatPrice(suggestion.price)}
                                </p>
                              </div>
                            </button>
                          ))}
                          <button
                            className="w-full p-3 text-center text-sm text-primary font-medium hover:bg-accent transition-colors border-t sticky bottom-0 bg-background"
                            onClick={() => handleSearch()}
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </>
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No products found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Wishlist */}
            <Link to="/wishlist" aria-label="Wishlist">
              <Button variant="ghost" size="icon" className="relative min-w-[44px] min-h-[44px]" aria-label="View wishlist">
                <Heart className="h-5 w-5" />
                {wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 min-w-[20px] rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                    {wishlistItems > 99 ? "99+" : wishlistItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative min-w-[44px] min-h-[44px]"
              aria-label="Shopping cart"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 min-w-[20px] rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                  {cartItems > 99 ? "99+" : cartItems}
                </span>
              )}
            </Button>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                {user ? (
                  <>
                    <DropdownMenuItem disabled className="opacity-100 font-medium pb-2 border-b mb-1">
                      Hi, {user.firstName}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent">
                      <Link to="/account" className="w-full cursor-pointer">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent cursor-pointer" onClick={logout}>
                      Logout
                    </DropdownMenuItem>
                    {/* Bug #113: Admin Login only visible to admin users */}
                    {user.isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-primary/10">
                          <Link to="/admin/login" className="w-full cursor-pointer text-primary font-medium">Admin Panel</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent">
                      <Link to="/auth" className="w-full cursor-pointer">Login or Register</Link>
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
