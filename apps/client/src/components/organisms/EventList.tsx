import { type IEvent } from '@eventpulse/shared-types';
import { EventCard } from '@/components/molecules/EventCard.js';
import { Spinner } from '@/components/atoms/Spinner.js';
import { EmptyState } from '@/components/atoms/EmptyState.js';
import { Calendar } from 'lucide-react';
import { t } from '@/lib/i18n.js';

interface EventListProps {
  events: IEvent[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  columns?: 2 | 3 | 4;
}

export function EventList({
  events,
  isLoading,
  isError = false,
  emptyTitle = t('events.noEventsFound'),
  emptyDescription = t('events.adjustFilters'),
  columns = 3,
}: EventListProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <EmptyState
          title={t('events.somethingWentWrong')}
          description={t('events.loadFailed')}
          icon={<Calendar className="h-12 w-12 text-secondary-400" />}
        />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={<Calendar className="h-12 w-12 text-secondary-400" />}
        />
      </div>
    );
  }

  const gridCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns]}`}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
