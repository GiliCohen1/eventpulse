import { useNavigate, Link } from 'react-router-dom';
import { Calendar, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '@/services/ticket.service.js';
import { LoadingScreen } from '@/components/atoms/Spinner.js';
import { Badge } from '@/components/atoms/Badge.js';
import { Button } from '@/components/atoms/Button.js';
import { EmptyState } from '@/components/atoms/EmptyState.js';
import { formatDate } from '@/lib/utils.js';
import { QUERY_KEYS, ROUTES } from '@/lib/constants.js';
import { t } from '@/lib/i18n.js';
import { type RegistrationStatus } from '@eventpulse/shared-types';

const STATUS_VARIANT: Record<
  RegistrationStatus,
  'primary' | 'success' | 'warning' | 'error' | 'neutral'
> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  checked_in: 'primary',
};

export function MyTicketsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: registrations, isLoading } = useQuery({
    queryKey: QUERY_KEYS.MY_REGISTRATIONS,
    queryFn: () => ticketService.getMyRegistrations(),
  });

  const cancelMutation = useMutation({
    mutationFn: (registrationId: string) => ticketService.cancelRegistration(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_REGISTRATIONS });
    },
  });

  if (isLoading) return <LoadingScreen message={t('myTickets.loading')} />;

  return (
    <div className="container-app py-8">
      <h1 className="mb-8 text-2xl font-bold text-secondary-900">{t('myTickets.title')}</h1>

      {!registrations || registrations.length === 0 ? (
        <EmptyState
          title={t('myTickets.empty')}
          description={t('myTickets.emptyDescription')}
          icon={<Calendar className="h-12 w-12 text-secondary-400" />}
          action={{
            label: t('myTickets.browseEvents'),
            onClick: () => navigate(ROUTES.EVENTS),
          }}
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
                    {t('myTickets.viewEvent')}
                  </Link>
                  <Badge variant={STATUS_VARIANT[reg.status] ?? 'neutral'}>{reg.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(reg.registeredAt)}
                  </span>
                </div>
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
                  {t('myTickets.cancel')}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
