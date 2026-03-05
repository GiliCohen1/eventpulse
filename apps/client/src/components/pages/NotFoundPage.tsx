import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/atoms/Button.js';
import { ROUTES } from '@/lib/constants.js';

export function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-extrabold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-secondary-900">Page Not Found</h1>
      <p className="mt-2 max-w-md text-secondary-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTES.HOME} className="mt-6">
        <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
          Go Home
        </Button>
      </Link>
    </div>
  );
}
