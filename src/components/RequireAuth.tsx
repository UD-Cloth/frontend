import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

/**
 * Customer-side route guard for `/account`, `/checkout`, `/profile`,
 * `/account/orders/:id`.
 *
 *  - Anonymous → bounced to `/auth?returnUrl=…` (Sprint 4 / BUG-F-006 + BUG-F-007).
 *  - Admin     → bounced to `/admin/dashboard`. Admins shouldn't be browsing
 *                customer pages; the customer cart/order flows aren't part of
 *                their job and the backend won't always return sane data when
 *                an admin user asks for "my orders" / "my cart".
 *  - Customer  → render children.
 */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user) {
    const target = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth?returnUrl=${encodeURIComponent(target)}`}
        replace
        state={{ message: "Please sign in to continue." }}
      />
    );
  }

  if ((user as any)?.isAdmin === true) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
