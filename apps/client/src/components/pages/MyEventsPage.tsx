import { Link, useNavigate } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { useMyOrganizedEvents } from '@/hooks/useEvents.js';
import { EventList } from '@/components/organisms/EventList.js';
import { Button } from '@/components/atoms/Button.js';
import { EmptyState } from '@/components/atoms/EmptyState.js';
import { LoadingScreen } from '@/components/atoms/Spinner.js';
import { ROUTES } from '@/lib/constants.js';
import { t } from '@/lib/i18n.js';

export function MyEventsPage(): JSX.Element {
  const navigate = useNavigate();
  const { data, isLoading } = useMyOrganizedEvents();
  const events = data?.events;

  if (isLoading) return <LoadingScreen message={t('myEvents.loading')} />;

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t('myEvents.title')}</h1>
          <p className="mt-1 text-secondary-500">{t('myEvents.subtitle')}</p>
        </div>
        <Link to={ROUTES.EVENT_CREATE}>
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            {t('nav.createEvent')}
          </Button>
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <EmptyState
          title={t('myEvents.empty')}
          description={t('myEvents.emptyDescription')}
          icon={<Calendar className="h-12 w-12 text-secondary-400" />}
          action={{
            label: t('nav.createEvent'),
            onClick: () => navigate(ROUTES.EVENT_CREATE),
          }}
        />
      ) : (
        <EventList events={events} isLoading={false} columns={3} />
      )}
    </div>
  );
}
