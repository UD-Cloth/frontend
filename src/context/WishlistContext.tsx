import React, { createContext, useContext, ReactNode, useEffect } from "react";
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

  // Local state fallback for non-authenticated users
  const [localItems, setLocalItems] = React.useState<Product[]>([]);

  // Fetch wishlist from backend if authenticated
  const { data: remoteItems = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await api.get("/auth/wishlist");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Load local items from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) {
      const stored = localStorage.getItem("wishlist");
      if (stored) {
        try {
          setLocalItems(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse local wishlist");
        }
      }
    } else {
      // Bug #54: When logging in, sync local wishlist items to backend
      const stored = localStorage.getItem("wishlist");
      if (stored) {
        try {
          const localWishlist = JSON.parse(stored);
          if (Array.isArray(localWishlist) && localWishlist.length > 0) {
            // Add each local item to the backend wishlist
            localWishlist.forEach((item: any) => {
              const productId = item._id || item.id;
              if (productId && !remoteItems.some((rItem: any) => (rItem._id || rItem.id) === productId)) {
                toggleMutation.mutate(productId);
              }
            });
            // Clear local storage after syncing
            localStorage.removeItem("wishlist");
            setLocalItems([]);
          }
        } catch (e) {
          console.error("Failed to sync wishlist on login:", e);
        }
      }
    }
  }, [isAuthenticated]);

  // Sync local items to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("wishlist", JSON.stringify(localItems));
    }
  }, [localItems, isAuthenticated]);

  const items = isAuthenticated ? remoteItems : localItems;

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

  const addToWishlist = (product: Product) => {
    if (isAuthenticated) {
      if (!isInWishlist(product._id || product.id)) {
        toggleMutation.mutate(product._id || product.id);
      }
    } else {
      setLocalItems((prev) => {
        const id = product._id || product.id;
        if (prev.some((item: any) => (item._id || item.id) === id)) return prev;
        
        return [...prev, product];
      });
    }
  };

  const removeFromWishlist = (productId: string) => {
    if (isAuthenticated) {
      if (isInWishlist(productId)) {
        toggleMutation.mutate(productId);
      }
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
