import { Link } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { useMyOrganizedEvents } from '@/hooks/useEvents.js';
import { EventList } from '@/components/organisms/EventList.js';
import { Button } from '@/components/atoms/Button.js';
import { EmptyState } from '@/components/atoms/EmptyState.js';
import { LoadingScreen } from '@/components/atoms/Spinner.js';
import { ROUTES } from '@/lib/constants.js';

export function MyEventsPage(): JSX.Element {
  const { data: events, isLoading } = useMyOrganizedEvents();

  if (isLoading) return <LoadingScreen message="Loading your events..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">My Events</h1>
          <p className="mt-1 text-secondary-500">Manage your organized events</p>
        </div>
        <Link to={ROUTES.EVENT_CREATE}>
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Create Event
          </Button>
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Create your first event and start selling tickets."
          icon={<Calendar className="h-12 w-12 text-secondary-400" />}
          action={
            <Link to={ROUTES.EVENT_CREATE}>
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                Create Event
              </Button>
            </Link>
          }
        />
      ) : (
        <EventList events={events} isLoading={false} columns={3} />
      )}
    </div>
  );
}
