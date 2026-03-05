import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/templates/MainLayout.js';
import { AuthLayout } from '@/components/templates/AuthLayout.js';
import { DashboardLayout } from '@/components/templates/DashboardLayout.js';
import {
  HomePage,
  EventsPage,
  EventDetailPage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  MyTicketsPage,
  EventCreatePage,
  NotificationsPage,
  DashboardPage,
  MyEventsPage,
  NotFoundPage,
} from '@/components/pages/index.js';
import { AuthGuard } from './AuthGuard.js';
import { OrganizerGuard } from './OrganizerGuard.js';
import { GuestGuard } from './GuestGuard.js';
import { ROUTES } from '@/lib/constants.js';

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.EVENTS} element={<EventsPage />} />
        <Route path={`${ROUTES.EVENTS}/:eventId`} element={<EventDetailPage />} />

        {/* Authenticated routes */}
        <Route
          path={ROUTES.PROFILE}
          element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          }
        />
        <Route
          path={ROUTES.MY_TICKETS}
          element={
            <AuthGuard>
              <MyTicketsPage />
            </AuthGuard>
          }
        />
        <Route
          path={ROUTES.NOTIFICATIONS}
          element={
            <AuthGuard>
              <NotificationsPage />
            </AuthGuard>
          }
        />
        <Route
          path={ROUTES.EVENT_CREATE}
          element={
            <AuthGuard>
              <OrganizerGuard>
                <EventCreatePage />
              </OrganizerGuard>
            </AuthGuard>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth routes (guest only) */}
      <Route
        element={
          <GuestGuard>
            <AuthLayout />
          </GuestGuard>
        }
      >
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      {/* Dashboard routes (organizer only) */}
      <Route
        element={
          <AuthGuard>
            <OrganizerGuard>
              <DashboardLayout />
            </OrganizerGuard>
          </AuthGuard>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.MY_EVENTS} element={<MyEventsPage />} />
      </Route>
    </Routes>
  );
}
