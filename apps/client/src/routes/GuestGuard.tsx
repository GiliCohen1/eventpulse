import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store.js';
import { LoadingScreen } from '@/components/atoms/Spinner.js';
import { ROUTES } from '@/lib/constants.js';

interface GuestGuardProps {
  children: JSX.Element;
}

/** Redirect authenticated users away from auth pages */
export function GuestGuard({ children }: GuestGuardProps): JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
}
