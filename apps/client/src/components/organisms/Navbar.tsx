import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Menu,
  Plus,
  LogOut,
  User,
  LayoutDashboard,
  Ticket,
  X,
  Calendar,
  Home,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.js';
import { useUnreadCount } from '@/hooks/useNotifications.js';
import { useUIStore } from '@/stores/ui.store.js';
import { Avatar } from '@/components/atoms/Avatar.js';
import { Button } from '@/components/atoms/Button.js';
import { ROUTES } from '@/lib/constants.js';
import { classNames } from '@/lib/utils.js';
import { t } from '@/lib/i18n.js';
import { useState, useRef, useEffect } from 'react';

function NavLink({ to, children }: { to: string; children: React.ReactNode }): JSX.Element {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={classNames(
        'text-sm font-medium transition-colors',
        isActive ? 'text-primary-600' : 'text-secondary-600 hover:text-primary-600',
      )}
    >
      {children}
    </Link>
  );
}

export function Navbar(): JSX.Element {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: unreadCount } = useUnreadCount();
  const isMobileMenuOpen = useUIStore((s: { isMobileMenuOpen: boolean }) => s.isMobileMenuOpen);
  const setMobileMenuOpen = useUIStore(
    (s: { setMobileMenuOpen: (open: boolean) => void }) => s.setMobileMenuOpen,
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  const location = useLocation();
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-secondary-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-app flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden btn-ghost p-2"
            aria-label={isMobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
              EP
            </div>
            <span className="hidden text-xl font-bold text-secondary-900 sm:block">
              {t('common.appName')}
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          <NavLink to={ROUTES.HOME}>{t('nav.home')}</NavLink>
          <NavLink to={ROUTES.EVENTS}>{t('nav.discover')}</NavLink>
          {isAuthenticated && <NavLink to={ROUTES.MY_TICKETS}>{t('nav.myTickets')}</NavLink>}
          {isAuthenticated && (user?.role === 'organizer' || user?.role === 'admin') && (
            <NavLink to={ROUTES.MY_EVENTS}>{t('nav.myEvents')}</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {(user?.role === 'organizer' || user?.role === 'admin') && (
                <Link to={ROUTES.EVENT_CREATE} className="hidden sm:block">
                  <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                    {t('nav.createEvent')}
                  </Button>
                </Link>
              )}

              <Link
                to={ROUTES.NOTIFICATIONS}
                className="relative btn-ghost p-2"
                aria-label={t('nav.notifications')}
              >
                <Bell className="h-5 w-5" />
                {unreadCount && unreadCount > 0 ? (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </Link>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-secondary-100"
                  aria-expanded={isProfileOpen}
                  aria-label={t('nav.userMenu')}
                >
                  <Avatar
                    src={user?.avatarUrl}
                    firstName={user?.firstName ?? ''}
                    lastName={user?.lastName ?? ''}
                    size="sm"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-secondary-200 bg-white py-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="border-b border-secondary-100 px-4 py-3">
                      <p className="text-sm font-medium text-secondary-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-secondary-500">{user?.email}</p>
                    </div>

                    <Link
                      to={ROUTES.PROFILE}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 transition-colors hover:bg-secondary-50"
                    >
                      <User className="h-4 w-4" />
                      {t('nav.profile')}
                    </Link>
                    <Link
                      to={ROUTES.MY_TICKETS}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 transition-colors hover:bg-secondary-50"
                    >
                      <Ticket className="h-4 w-4" />
                      {t('nav.myTickets')}
                    </Link>
                    {(user?.role === 'organizer' || user?.role === 'admin') && (
                      <Link
                        to={ROUTES.DASHBOARD}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 transition-colors hover:bg-secondary-50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t('nav.dashboard')}
                      </Link>
                    )}

                    <div className="border-t border-secondary-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error-600 transition-colors hover:bg-error-50"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('common.signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  {t('common.signIn')}
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER} className="hidden sm:block">
                <Button variant="primary" size="sm">
                  {t('common.signUp')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="relative z-10 border-b border-secondary-200 bg-white px-4 py-4 shadow-lg">
            <div className="flex flex-col gap-1">
              <MobileNavLink to={ROUTES.HOME} icon={<Home className="h-5 w-5" />}>
                {t('nav.home')}
              </MobileNavLink>
              <MobileNavLink to={ROUTES.EVENTS} icon={<Calendar className="h-5 w-5" />}>
                {t('nav.discoverEvents')}
              </MobileNavLink>

              {isAuthenticated && (
                <>
                  <MobileNavLink to={ROUTES.MY_TICKETS} icon={<Ticket className="h-5 w-5" />}>
                    {t('nav.myTickets')}
                  </MobileNavLink>
                  <MobileNavLink to={ROUTES.NOTIFICATIONS} icon={<Bell className="h-5 w-5" />}>
                    {t('nav.notifications')}
                    {unreadCount && unreadCount > 0 ? (
                      <span className="ml-auto rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-700">
                        {unreadCount}
                      </span>
                    ) : null}
                  </MobileNavLink>
                  <MobileNavLink to={ROUTES.PROFILE} icon={<User className="h-5 w-5" />}>
                    {t('nav.profile')}
                  </MobileNavLink>

                  {(user?.role === 'organizer' || user?.role === 'admin') && (
                    <>
                      <div className="my-2 border-t border-secondary-100" />
                      <MobileNavLink to={ROUTES.MY_EVENTS} icon={<Calendar className="h-5 w-5" />}>
                        {t('nav.myEvents')}
                      </MobileNavLink>
                      <MobileNavLink
                        to={ROUTES.DASHBOARD}
                        icon={<LayoutDashboard className="h-5 w-5" />}
                      >
                        {t('nav.dashboard')}
                      </MobileNavLink>
                      <MobileNavLink to={ROUTES.EVENT_CREATE} icon={<Plus className="h-5 w-5" />}>
                        {t('nav.createEvent')}
                      </MobileNavLink>
                    </>
                  )}

                  <div className="my-2 border-t border-secondary-100" />
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-error-600 transition-colors hover:bg-error-50"
                  >
                    <LogOut className="h-5 w-5" />
                    {t('common.signOut')}
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <div className="my-2 border-t border-secondary-100" />
                  <div className="flex gap-3 px-3 pt-2">
                    <Link
                      to={ROUTES.LOGIN}
                      className="flex-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="secondary" className="w-full">
                        {t('common.signIn')}
                      </Button>
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      className="flex-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="primary" className="w-full">
                        {t('common.signUp')}
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileNavLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}): JSX.Element {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={classNames(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive ? 'bg-primary-50 text-primary-700' : 'text-secondary-700 hover:bg-secondary-50',
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
