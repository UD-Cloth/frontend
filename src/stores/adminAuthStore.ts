import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Bug #172: shared localStorage key constants.
import { USER_INFO_KEY } from './authStore';

// Sprint 1 / BUG-F-002: Persist admin auth across reloads.
// Sprint 1 / BUG-F-003: Track isAdmin flag from real backend user, not just an email string.

interface AdminAuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminRole: 'admin' | 'sub-admin' | null;
  adminName: string | null;
  adminEmail: string | null;
  /**
   * `user` should be the full backend user payload that came back from POST /auth/login.
   * The store rejects login attempts where `user.isAdmin` is not strictly true, so a
   * non-admin who somehow calls `login()` (e.g. via DevTools) cannot flip the flag.
   */
  login: (user: { email: string; isAdmin?: boolean; firstName?: string; lastName?: string }) => boolean;
  logout: () => void;
}

function readUserInfo(): any | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const initialUser = readUserInfo();
const initialIsAdmin = !!(initialUser && initialUser.isAdmin === true);

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      // Rehydrate from `userInfo` so a page refresh on /admin/* doesn't bounce to login.
      isAuthenticated: initialIsAdmin,
      isAdmin: initialIsAdmin,
      adminRole: initialIsAdmin ? 'admin' : null,
      adminName: initialUser
        ? [initialUser.firstName, initialUser.lastName].filter(Boolean).join(' ').trim() ||
          initialUser.email?.split('@')[0] ||
          null
        : null,
      adminEmail: initialUser?.email ?? null,

      login: (user) => {
        if (!user || user.isAdmin !== true) {
          // Refuse to authenticate non-admins. This blocks BUG-F-003.
          return false;
        }
        set({
          isAuthenticated: true,
          isAdmin: true,
          adminRole: 'admin',
          adminName:
            [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
            user.email.split('@')[0],
          adminEmail: user.email,
        });
        return true;
      },

      logout: () =>
        set({
          isAuthenticated: false,
          isAdmin: false,
          adminRole: null,
          adminName: null,
          adminEmail: null,
        }),
    }),
    { name: 'urban-drape-admin-auth' }
  )
);
