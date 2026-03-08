import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Wifi } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge.js';
import { formatDateTime, formatCurrency, classNames } from '@/lib/utils.js';
import { ROUTES } from '@/lib/constants.js';
import { t } from '@/lib/i18n.js';
import type { IEvent } from '@/types';

interface EventCardProps {
  event: IEvent;
  className?: string;
}

function getStatusVariant(status: string): 'primary' | 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'published':
      return 'primary';
    case 'live':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'draft':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function EventCard({ event, className }: EventCardProps): JSX.Element {
  const lowestPrice = 0; // Would compute from tiers
  const locationText = event.isOnline
    ? t('common.onlineEvent')
    : (event.venueName ?? t('common.locationTBD'));

  return (
    <Link
      to={ROUTES.EVENT_DETAIL(event.id)}
      className={classNames(
        'card group block overflow-hidden !p-0 transition-all hover:shadow-md hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-secondary-100">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100">
            <Calendar className="h-12 w-12 text-primary-400" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant={getStatusVariant(event.status)}>
            {t(`eventStatus.${event.status}`) ?? event.status}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-secondary-900 group-hover:text-primary-600">
          {event.title}
        </h3>

        <div className="mt-3 space-y-2 text-sm text-secondary-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatDateTime(event.startsAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            {event.isOnline ? (
              <Wifi className="h-4 w-4 flex-shrink-0" />
            ) : (
              <MapPin className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="truncate">{locationText}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>
                {event.registeredCount}
                {event.maxCapacity ? ` / ${event.maxCapacity}` : ''} {t('common.attending')}
              </span>
            </div>
            <span className="font-semibold text-primary-600">{formatCurrency(lowestPrice)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
