import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";
import api from "@/lib/api";

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      api.get("/auth/wishlist").then((res: any) => {
        setItems(res.data || []);
      }).catch(console.error);
    } else {
      const local = localStorage.getItem('ud-wishlist');
      if (local) setItems(JSON.parse(local));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ud-wishlist', JSON.stringify(items));
  }, [items]);

  const addToWishlist = async (product: Product) => {
    setItems((prevItems) => {
      if (prevItems.find((item) => (item._id || item.id) === (product._id || product.id))) {
        return prevItems;
      }
      return [...prevItems, product];
    });

    if (localStorage.getItem("userInfo")) {
      try {
        await api.post("/auth/wishlist", { productId: product._id || product.id });
      } catch (e) { console.error(e); }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => (item._id || item.id) !== productId));

    if (localStorage.getItem("userInfo")) {
      try {
        await api.post("/auth/wishlist", { productId });
      } catch (e) { console.error(e); }
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => (item._id || item.id) === productId);
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        totalItems,
      }}
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
