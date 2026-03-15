import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

/**
 * Automatically loads cart from the backend when the user is authenticated.
 * Call once at app root (e.g. in AppContent).
 */
export function useCartSync() {
  const loadCartFromBackend = useCartStore(state => state.loadCartFromBackend);

  useEffect(() => {
    loadCartFromBackend();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadCartFromBackend();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadCartFromBackend]);
}
