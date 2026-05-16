import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';

export function useCartSync() {
  const loadCartFromBackend = useCartStore(state => state.loadCartFromBackend);
  const { pathname } = useLocation();
  // Admin panel has no cart UI — don't fetch /api/cart on /admin/*.
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute) return;
    loadCartFromBackend();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadCartFromBackend();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadCartFromBackend, isAdminRoute]);
}
