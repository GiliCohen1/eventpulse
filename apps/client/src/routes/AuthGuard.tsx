import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store.js';
import { LoadingScreen } from '@/components/atoms/Spinner.js';
import { ROUTES } from '@/lib/constants.js';

interface AuthGuardProps {
  children: JSX.Element;
}

export function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}
