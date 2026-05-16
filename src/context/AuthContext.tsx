import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useCartStore, setCartSyncErrorCallback } from '../stores/cartStore';
import { useCallback } from 'react';
import { User } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';

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

    // Sprint 1 / BUG-F-001: keep the secondary stores in sync in the SAME tab.
    // The `storage` event only fires in OTHER tabs, so without this the Header
    // (which reads from useAuthStore) shows "Login" until refresh.
    try {
      useAuthStore.getState().setUser(userData);
      // If the logged-in user is an admin, also flip the admin store so they don't
      // have to log in twice. Non-admin payloads are rejected by the store.
      if ((userData as any)?.isAdmin === true) {
        useAdminAuthStore.getState().login({
          email: userData.email,
          isAdmin: true,
          firstName: (userData as any).firstName,
          lastName: (userData as any).lastName,
        });
      }
    } catch (e) {
      console.warn('Auth store sync skipped:', e);
    }

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

    // Sprint 1 / BUG-F-001: clear both auth stores in the same tab.
    try {
      useAuthStore.getState().logout();
      useAdminAuthStore.getState().logout();
    } catch (e) {
      console.warn('Auth store clear skipped:', e);
    }
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
