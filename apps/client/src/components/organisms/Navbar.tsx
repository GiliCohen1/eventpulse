import { Link } from 'react-router-dom';
import { Bell, Menu, Plus, LogOut, User, LayoutDashboard, Ticket } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.js';
import { useUnreadCount } from '@/hooks/useNotifications.js';
import { useUIStore } from '@/stores/ui.store.js';
import { Avatar } from '@/components/atoms/Avatar.js';
import { Button } from '@/components/atoms/Button.js';
import { ROUTES } from '@/lib/constants.js';
import { useState, useRef, useEffect } from 'react';

export function Navbar(): JSX.Element {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: unreadCount } = useUnreadCount();
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);
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

  return (
    <header className="sticky top-0 z-50 border-b border-secondary-200 bg-white/95 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden btn-ghost p-2"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
              EP
            </div>
            <span className="hidden text-xl font-bold text-secondary-900 sm:block">
              EventPulse
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link to={ROUTES.EVENTS} className="text-sm font-medium text-secondary-600 hover:text-primary-600">
            Discover
          </Link>
          {isAuthenticated && user?.role === 'organizer' && (
            <Link to={ROUTES.MY_EVENTS} className="text-sm font-medium text-secondary-600 hover:text-primary-600">
              My Events
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === 'organizer' && (
                <Link to={ROUTES.EVENT_CREATE}>
                  <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                    Create Event
                  </Button>
                </Link>
              )}

              <Link to={ROUTES.NOTIFICATIONS} className="relative btn-ghost p-2" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unreadCount && unreadCount > 0 ? (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </Link>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-secondary-100"
                >
                  <Avatar
                    src={user?.avatarUrl}
                    firstName={user?.firstName ?? ''}
                    lastName={user?.lastName ?? ''}
                    size="sm"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-secondary-200 bg-white py-2 shadow-lg">
                    <div className="border-b border-secondary-100 px-4 py-3">
                      <p className="text-sm font-medium text-secondary-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-secondary-500">{user?.email}</p>
                    </div>

                    <Link
                      to={ROUTES.PROFILE}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to={ROUTES.MY_TICKETS}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <Ticket className="h-4 w-4" />
                      My Tickets
                    </Link>
                    {user?.role === 'organizer' && (
                      <Link
                        to={ROUTES.DASHBOARD}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    )}

                    <div className="border-t border-secondary-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
