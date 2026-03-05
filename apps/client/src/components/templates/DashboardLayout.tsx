import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/organisms/Navbar.js';
import { useUIStore } from '@/stores/ui.store.js';
import { ROUTES } from '@/lib/constants.js';

interface SidebarLink {
  label: string;
  path: string;
  icon: JSX.Element;
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { label: 'Overview', path: ROUTES.DASHBOARD, icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Events', path: ROUTES.MY_EVENTS, icon: <CalendarDays className="h-5 w-5" /> },
  { label: 'Analytics', path: ROUTES.DASHBOARD + '/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Settings', path: ROUTES.DASHBOARD + '/settings', icon: <Settings className="h-5 w-5" /> },
];

export function DashboardLayout(): JSX.Element {
  const location = useLocation();
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />

      <div className="flex">
        <aside
          className={`sticky top-16 h-[calc(100vh-4rem)] border-r border-secondary-200 bg-white transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <div className="flex h-full flex-col justify-between py-4">
            <nav className="space-y-1 px-3">
              {SIDEBAR_LINKS.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                    }`}
                    title={!isSidebarOpen ? link.label : undefined}
                  >
                    {link.icon}
                    {isSidebarOpen && <span>{link.label}</span>}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3">
              <button
                onClick={toggleSidebar}
                className="flex w-full items-center justify-center rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
                aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
