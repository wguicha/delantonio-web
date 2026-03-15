import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isDev = import.meta.env.DEV;

  if (!isAuthenticated && !isDev) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
