import { create } from 'zustand';
import type { User } from '../hooks/useAuth';
import { useCartStore } from './cartStore';

// Bug #172: centralize hardcoded localStorage keys. Scoped minimally to store
// files for now; pages/components still reference the literals directly.
export const USER_INFO_KEY = 'userInfo';
export const CART_STORAGE_KEY = 'urban-drape-cart';
export const SAVED_CHECKOUT_KEY = 'urban-drape-saved-checkout';
export const SESSION_ID_KEY = 'urban-drape-session-id';
export const WISHLIST_STORAGE_KEY = 'wishlist';

/**
 * Shim of UD's `useAuthStore` that mirrors `context/AuthContext.tsx`.
 *
 * Does NOT use Firebase. Instead it reads/writes the same `userInfo`
 * localStorage entry the AuthContext uses, and exposes a `firebaseUser`-shaped
 * object so UD components compile (`firebaseUser.email`,
 * `firebaseUser.displayName`, `firebaseUser.metadata.creationTime`,
 * `firebaseUser.emailVerified`).
 */

export interface FirebaseUserShim {
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  uid: string;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

interface AuthState {
  firebaseUser: FirebaseUserShim | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

function toFirebaseShim(u: User | null): FirebaseUserShim | null {
  if (!u) return null;
  const displayName =
    [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || null;
  return {
    email: u.email ?? null,
    displayName,
    emailVerified: true,
    uid: u._id,
    metadata: {
      creationTime: undefined,
      lastSignInTime: undefined,
    },
  };
}

function readUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const initialUser = readUserFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: toFirebaseShim(initialUser),
  isAuthenticated: !!initialUser,
  isLoading: false,

  setUser: (user) =>
    set({
      firebaseUser: toFirebaseShim(user),
      isAuthenticated: !!user,
      isLoading: false,
    }),

  logout: async () => {
    try {
      localStorage.removeItem(USER_INFO_KEY);
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
      useCartStore.getState().clearCart();
    } catch {
      /* ignore */
    }
    set({ firebaseUser: null, isAuthenticated: false, isLoading: false });
  },
}));

// Keep store in sync if other tabs / AuthContext mutate `userInfo`.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === USER_INFO_KEY) {
      const u = readUserFromStorage();
      useAuthStore.getState().setUser(u);
    }
  });
}
