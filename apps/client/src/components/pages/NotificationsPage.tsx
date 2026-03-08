import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '@/services/notification.service.js';
import { NotificationItem } from '@/components/molecules/NotificationItem.js';
import { Button } from '@/components/atoms/Button.js';
import { EmptyState } from '@/components/atoms/EmptyState.js';
import { LoadingScreen } from '@/components/atoms/Spinner.js';
import { QUERY_KEYS } from '@/lib/constants.js';
import { t } from '@/lib/i18n.js';

export function NotificationsPage(): JSX.Element {
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => notificationService.list(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNREAD_COUNT });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNREAD_COUNT });
    },
  });

  if (isLoading) return <LoadingScreen message={t('notifications.loading')} />;

  const notifications = notificationsData?.notifications;
  const hasUnread = notifications?.some((n) => !n.isRead);

  return (
    <div className="container-app max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">{t('notifications.title')}</h1>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead.mutate()}
            isLoading={markAllRead.isPending}
            leftIcon={<CheckCheck className="h-4 w-4" />}
          >
            {t('common.markAllRead')}
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <EmptyState
          title={t('notifications.empty')}
          description={t('notifications.emptyDescription')}
          icon={<Bell className="h-12 w-12 text-secondary-400" />}
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => markRead.mutate(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
