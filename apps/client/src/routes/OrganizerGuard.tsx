import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store.js';
import { ROUTES } from '@/lib/constants.js';

interface OrganizerGuardProps {
  children: JSX.Element;
}

export function OrganizerGuard({ children }: OrganizerGuardProps): JSX.Element {
  const user = useAuthStore((s) => s.user);

  if (user?.role !== 'organizer' && user?.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
}
