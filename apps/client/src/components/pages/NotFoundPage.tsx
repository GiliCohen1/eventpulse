import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/atoms/Button.js';
import { ROUTES } from '@/lib/constants.js';
import { t } from '@/lib/i18n.js';

export function NotFoundPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-extrabold text-primary-600/20">{t('notFound.code')}</p>
      <h1 className="mt-4 text-2xl font-bold text-secondary-900">{t('notFound.title')}</h1>
      <p className="mt-2 max-w-md text-secondary-500">{t('notFound.description')}</p>
      <div className="mt-8 flex items-center gap-3">
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(-1)}
        >
          {t('common.goBack')}
        </Button>
        <Link to={ROUTES.HOME}>
          <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
            {t('common.goHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
