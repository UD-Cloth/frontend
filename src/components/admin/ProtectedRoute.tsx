import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

// Sprint 1 / BUG-F-003: Verify the user is actually an admin before rendering /admin/*.
// `isAuthenticated` alone is not enough — a regular customer can be authenticated.
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isAdmin } = useAdminAuthStore();

    // Defense in depth: also re-check userInfo from localStorage in case the store
    // was modified by a non-admin path. The login flow only flips the store flags
    // when the backend response has isAdmin === true.
    let storageIsAdmin = false;
    try {
        const raw = localStorage.getItem('userInfo');
        if (raw) {
            const parsed = JSON.parse(raw);
            storageIsAdmin = parsed?.isAdmin === true;
        }
    } catch {
        storageIsAdmin = false;
    }

    if (!isAuthenticated || !isAdmin || !storageIsAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};
