import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants.js';
import { t } from '@/lib/i18n.js';

export function AuthLayout(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to={ROUTES.HOME} className="inline-flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-lg shadow-lg shadow-primary-600/25">
              EP
            </div>
            <h1 className="text-2xl font-bold text-secondary-900">{t('common.appName')}</h1>
          </Link>
          <p className="mt-2 text-sm text-secondary-500">{t('auth.tagline')}</p>
        </div>
        <div className="rounded-2xl border border-secondary-200 bg-white p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
