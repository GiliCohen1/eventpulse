import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '@/components/organisms/Navbar.js';
import { ROUTES } from '@/lib/constants.js';
import { t } from '@/lib/i18n.js';

function Footer(): JSX.Element {
  return (
    <footer className="border-t border-secondary-200 bg-white">
      <div className="container-app py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to={ROUTES.HOME} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
                EP
              </div>
              <span className="text-lg font-bold text-secondary-900">{t('common.appName')}</span>
            </Link>
            <p className="mt-3 text-sm text-secondary-500">{t('common.appTagline')}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-secondary-900">{t('footer.explore')}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to={ROUTES.EVENTS}
                  className="text-sm text-secondary-500 transition-colors hover:text-primary-600"
                >
                  {t('footer.browseEvents')}
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.EVENTS + '?status=live'}
                  className="text-sm text-secondary-500 transition-colors hover:text-primary-600"
                >
                  {t('footer.liveNow')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-secondary-900">{t('footer.organize')}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to={ROUTES.EVENT_CREATE}
                  className="text-sm text-secondary-500 transition-colors hover:text-primary-600"
                >
                  {t('nav.createEvent')}
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="text-sm text-secondary-500 transition-colors hover:text-primary-600"
                >
                  {t('nav.dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-secondary-900">{t('footer.account')}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to={ROUTES.PROFILE}
                  className="text-sm text-secondary-500 transition-colors hover:text-primary-600"
                >
                  {t('nav.profile')}
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.MY_TICKETS}
                  className="text-sm text-secondary-500 transition-colors hover:text-primary-600"
                >
                  {t('nav.myTickets')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-secondary-100 pt-6 text-center">
          <p className="text-xs text-secondary-400">
            {t('common.copyright', { year: String(new Date().getFullYear()) })}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function MainLayout(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-secondary-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
