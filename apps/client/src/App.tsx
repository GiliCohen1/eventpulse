import { useEffect } from 'react';
import { AppRoutes } from '@/routes/index.js';
import { useAuthStore } from '@/stores/auth.store.js';

export function App(): JSX.Element {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <AppRoutes />;
}
