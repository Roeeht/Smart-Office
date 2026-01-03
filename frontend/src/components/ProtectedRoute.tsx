import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { authStore } from "../stores";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Route guard component for protected routes.
 *
 * Behavior:
 * - Unauthenticated users → redirect to /login (preserves return path)
 * - Authenticated users without required role → redirect to /access-denied
 * - Authenticated users with required role → render children
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = observer(
  ({ children, requireAdmin = false }) => {
    const location = useLocation();

    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      // Redirect to login, preserving the intended destination
      return (
        <Navigate to="/login" state={{ from: location.pathname }} replace />
      );
    }

    // Check if admin role is required but user is not admin
    if (requireAdmin && !authStore.isAdmin) {
      return <Navigate to="/access-denied" replace />;
    }

    // User is authenticated (and has required role if needed)
    return <>{children}</>;
  }
);
