import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAdminAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};
