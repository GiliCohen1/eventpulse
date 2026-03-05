import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { notificationService } from '@/services/notification.service.js';
import { NotificationItem } from '@/components/molecules/NotificationItem.js';
import { Button } from '@/components/atoms/Button.js';
import { EmptyState } from '@/components/atoms/EmptyState.js';
import { LoadingScreen } from '@/components/atoms/Spinner.js';
import { QUERY_KEYS } from '@/lib/constants.js';

export function NotificationsPage(): JSX.Element {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: QUERY_KEYS.notifications(),
    queryFn: () => notificationService.list(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unreadCount() });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unreadCount() });
    },
  });

  if (isLoading) return <LoadingScreen message="Loading notifications..." />;

  const hasUnread = notifications?.some((n) => !n.readAt);

  return (
    <div className="container-app max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Notifications</h1>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead.mutate()}
            isLoading={markAllRead.isPending}
            leftIcon={<CheckCheck className="h-4 w-4" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up!"
          icon={<Bell className="h-12 w-12 text-secondary-400" />}
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={() => markRead.mutate(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
