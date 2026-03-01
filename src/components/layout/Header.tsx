import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, LogOut, User as UserIcon, Settings } from "lucide-react";
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
import { useCartStore } from "@/stores/cartStore";
import { useCategories } from "@/hooks/useProducts";
import api from "@/lib/api";

interface SearchSuggestion {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "local" | "shopify";
}

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { items, isOpen: isCartOpen, setIsOpen: setIsCartOpen, fetchCart, clearCart } = useCartStore();
  const cartItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { totalItems: wishlistItems } = useWishlist();
  const [user, setUser] = useState<any>(null);

  const { data: categories = [] } = useCategories();

  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["product-search", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return [];
      const { data } = await api.get<any[]>("/products/search", { params: { q: debouncedQuery, limit: 5 } });
      return data.map((p) => ({
        id: p._id || p.id || "",
        name: p.name || "",
        price: p.price || 0,
        image: p.image || "",
        type: "local" as const,
      }));
    },
    enabled: isSearchOpen && debouncedQuery.length >= 2,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    // Check local storage for user profile session
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUser(userInfo);
        fetchCart();
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("userInfo");
    clearCart();
    setUser(null);
    navigate("/");
  };

  // Auto-close cart and mobile menu on route change
  useEffect(() => {
    setIsCartOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const renderSuggestionName = (name: string, query: string) => {
    if (!query) return name;
    const parts = name.split(new RegExp(`(${query})`, "gi"));
    return (
      <span className="truncate">
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={i} className="font-bold text-primary">{part}</strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
                    key={category._id}
                    asChild
                    className="transition-colors duration-150 p-3 lg:p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <Link
                      to={`/category/${encodeURIComponent(category.name)}`}
                      className="w-full cursor-pointer animate-fade-in"
                    >
                      {category.name}
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
            <SheetContent side="left" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  to="/"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    to={`/category/${encodeURIComponent(category.name)}`}
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
                <Link
                  to="/new-arrivals"
                  className="text-lg font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  New Arrivals
                </Link>
                <Link
                  to="/sale"
                  className="text-lg font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sale
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center justify-center">
            <img src="/Tag logo-01.png" alt="Logo" className="h-24 w-auto" />
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center relative" ref={searchRef}>
              {isSearchOpen ? (
                <div className="relative">
                  <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in relative">
                    <div className="relative flex items-center">
                      <Input
                        placeholder="Search products..."
                        className="w-64 h-9 pr-8"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                      />
                      {searchQuery.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            searchRef.current?.querySelector('input')?.focus();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Button type="submit" variant="ghost" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
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
                      {suggestions.length > 0 ? (
                        <>
                          <div className="p-2 border-b bg-muted/50">
                            <span className="text-xs font-medium text-muted-foreground">
                              Suggestions
                            </span>
                          </div>
                          {suggestions.map((suggestion) => (
                            <button
                              key={`${suggestion.type}-${suggestion.id}`}
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
                                  {renderSuggestionName(suggestion.name, debouncedQuery)}
                                </p>
                                <p className="text-sm text-primary font-semibold">
                                  {formatPrice(suggestion.price)}
                                </p>
                              </div>
                            </button>
                          ))}
                          <button
                            className="w-full p-3 text-center text-sm text-primary font-medium hover:bg-accent transition-colors border-t"
                            onClick={handleSearch}
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
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Open search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Mobile Search */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <form onSubmit={handleSearch} className="flex items-center gap-2 mt-4">
                  <Input
                    placeholder="Search products..."
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </SheetContent>
            </Sheet>

            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </Button>

            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="User account">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="w-full cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
};
