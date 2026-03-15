import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useCartStore, setCartSyncErrorCallback } from '../stores/cartStore';
import { useCallback } from 'react';
import { User } from '../hooks/useAuth';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('userInfo');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));

    // Bug #55, #56: Load cart from backend on login and handle errors
    const cartStore = useCartStore.getState();
    cartStore.loadCartFromBackend().catch(err => {
      console.error('Cart sync error during login:', err);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('userInfo');
    // Bug #57: Clear cart and wishlist data on logout
    localStorage.removeItem('urban-drape-cart');
    localStorage.removeItem('wishlist');
    // Reset Zustand cart store
    useCartStore.getState().clearCart();
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
