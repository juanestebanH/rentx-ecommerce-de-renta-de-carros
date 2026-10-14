import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';

export type RequiredRole = 'client' | 'admin';

const LOGIN_PATH: Record<RequiredRole, string> = {
  client: '/login',
  admin: '/admin/login',
};

interface ProtectedRouteProps {
  requiredRole: RequiredRole;
  children: ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user || user.rol !== requiredRole) {
    const from = `${location.pathname}${location.search}`;
    return (
      <Navigate to={LOGIN_PATH[requiredRole]} replace state={{ from }} />
    );
  }

  return <>{children}</>;
}