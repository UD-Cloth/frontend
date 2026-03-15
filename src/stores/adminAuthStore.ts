import { create } from 'zustand';

interface AdminAuthState {
  isAuthenticated: boolean;
  adminRole: 'admin' | 'sub-admin' | null;
  adminName: string | null;
  login: (email: string, role: 'admin' | 'sub-admin') => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  isAuthenticated: false,
  adminRole: null,
  adminName: null,
  login: (email, role) => set({ isAuthenticated: true, adminRole: role, adminName: email.split('@')[0] }),
  logout: () => set({ isAuthenticated: false, adminRole: null, adminName: null }),
}));
