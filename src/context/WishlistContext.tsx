import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Product } from "@/data/products";
import { useAuthContext } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface WishlistContextType {
  items: any[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const isAuthenticated = !!user;
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  // Wishlist is a customer-side concept — admin panel never reads or writes it,
  // so don't fire `/auth/wishlist` while the user is on /admin/*.
  const isAdminRoute = pathname.startsWith("/admin");

  // Local state fallback for non-authenticated users
  const [localItems, setLocalItems] = React.useState<Product[]>([]);

  // Fetch wishlist from backend if authenticated
  const { data: remoteItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await api.get<any[]>("/auth/wishlist");
      return response.data ?? [];
    },
    enabled: isAuthenticated && !isAdminRoute,
  });

  // Sprint 4 / BUG-F-004: declare the mutation BEFORE any effect references it.
  // Previously this was declared below the sync effect, so on first run the
  // identifier was in the temporal dead zone → `TypeError: Cannot read
  // properties of undefined (reading 'mutate')`. Worse, the effect then
  // localStorage.removeItem'd the user's local wishlist before the sync
  // could even start.
  const toggleMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.post("/auth/wishlist", { productId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: () => {
      console.error("Failed to update wishlist");
    },
  });

  // Load local items from localStorage on mount (anonymous users only)
  useEffect(() => {
    if (isAuthenticated) return;
    try {
      const stored = localStorage.getItem("wishlist");
      if (stored) setLocalItems(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to parse local wishlist", e);
    }
  }, [isAuthenticated]);

  // Sprint 4 / BUG-F-005: gate the login-merge effect on remote query having
  // resolved. Otherwise the dedup-against-remote check uses the empty default
  // and causes duplicate adds on slow networks.
  // Bug #187: this is a MERGE, not an overwrite — local guest wishlist items
  // missing from the server wishlist are pushed via toggleMutation; items
  // already on the server are left alone, mirroring the cart store's merge.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isLoading) return;

    let stored: string | null = null;
    try {
      stored = localStorage.getItem("wishlist");
    } catch {
      return;
    }
    if (!stored) return;

    try {
      const localWishlist = JSON.parse(stored);
      if (!Array.isArray(localWishlist) || localWishlist.length === 0) return;

      localWishlist.forEach((item: any) => {
        const productId = item?._id || item?.id;
        if (
          productId &&
          !remoteItems.some((rItem: any) => (rItem._id || rItem.id) === productId)
        ) {
          toggleMutation.mutate(productId);
        }
      });

      try { localStorage.removeItem("wishlist"); } catch { /* ignore */ }
      setLocalItems([]);
    } catch (e) {
      console.error("Failed to sync wishlist on login:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  // Sync local items to localStorage (anonymous users only). Sprint 4 / BUG-F-071:
  // wrap in try/catch so private-browsing / quota failures don't crash the app.
  useEffect(() => {
    if (isAuthenticated) return;
    try {
      localStorage.setItem("wishlist", JSON.stringify(localItems));
    } catch (e) {
      console.warn("Wishlist localStorage write failed", e);
    }
  }, [localItems, isAuthenticated]);

  const items = isAuthenticated ? remoteItems : localItems;

  const addToWishlist = (product: Product) => {
    const id = product._id || product.id;
    if (!id) return;
    if (isAuthenticated) {
      if (!isInWishlist(id)) toggleMutation.mutate(id);
    } else {
      setLocalItems((prev) => {
        if (prev.some((item: any) => (item._id || item.id) === id)) return prev;
        return [...prev, product];
      });
    }
  };

  const removeFromWishlist = (productId: string) => {
    if (isAuthenticated) {
      if (isInWishlist(productId)) toggleMutation.mutate(productId);
    } else {
      setLocalItems((prev) => prev.filter((item) => (item._id || item.id) !== productId));
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return (items as Product[]).some((item: any) => (item._id || item.id) === productId);
  };

  const totalItems = (items as Product[]).length || 0;

  return (
    <WishlistContext.Provider
      // Bug #52: Fix useMemo missing dependencies
      value={React.useMemo(() => ({
        items: items as any[],
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        totalItems,
        isLoading,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }), [items, totalItems, isLoading, isAuthenticated])}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
