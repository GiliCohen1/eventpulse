import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '@/services/ticket.service.js';
import { Spinner, LoadingScreen } from '@/components/atoms/Spinner.js';
import { Badge } from '@/components/atoms/Badge.js';
import { Button } from '@/components/atoms/Button.js';
import { EmptyState } from '@/components/atoms/EmptyState.js';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils.js';
import { QUERY_KEYS, ROUTES } from '@/lib/constants.js';
import { type RegistrationStatus } from '@eventpulse/shared-types';

const STATUS_VARIANT: Record<RegistrationStatus, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  'checked-in': 'primary',
  waitlisted: 'neutral',
};

export function MyTicketsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { data: registrations, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myRegistrations(),
    queryFn: () => ticketService.getMyRegistrations(),
  });

  const cancelMutation = useMutation({
    mutationFn: (registrationId: string) => ticketService.cancelRegistration(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myRegistrations() });
    },
  });

  if (isLoading) return <LoadingScreen message="Loading your tickets..." />;

  return (
    <div className="container-app py-8">
      <h1 className="mb-8 text-2xl font-bold text-secondary-900">My Tickets</h1>

      {!registrations || registrations.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="Browse events and register to get started."
          icon={<Calendar className="h-12 w-12 text-secondary-400" />}
          action={
            <Link to={ROUTES.EVENTS}>
              <Button variant="primary">Browse Events</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Link
                    to={`${ROUTES.EVENTS}/${reg.eventId}`}
                    className="text-lg font-semibold text-secondary-900 hover:text-primary-600"
                  >
                    {reg.event?.title ?? 'Event'}
                  </Link>
                  <Badge variant={STATUS_VARIANT[reg.status]}>
                    {reg.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(reg.event?.startDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(reg.event?.startDate)}
                  </span>
                  {reg.event?.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {reg.event.venue}
                    </span>
                  )}
                </div>
                {reg.ticketTier && (
                  <p className="mt-1 text-sm text-secondary-600">
                    {reg.ticketTier.name} — {reg.ticketTier.price === 0 ? 'Free' : formatCurrency(reg.ticketTier.price)}
                  </p>
                )}
              </div>

              {(reg.status === 'confirmed' || reg.status === 'pending') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cancelMutation.mutate(reg.id)}
                  isLoading={cancelMutation.isPending}
                  leftIcon={<XCircle className="h-4 w-4" />}
                  className="text-error-600 hover:text-error-700"
                >
                  Cancel
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
