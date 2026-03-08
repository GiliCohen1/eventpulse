import { Bell, X } from 'lucide-react';
import { formatRelative, classNames } from '@/lib/utils.js';
import { t } from '@/lib/i18n.js';
import type { INotification } from '@/types';

interface NotificationItemProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
}: NotificationItemProps): JSX.Element {
  return (
    <div
      className={classNames(
        'notification-item',
        !notification.isRead && 'notification-item--unread',
      )}
    >
      <div className="rounded-full bg-primary-100 p-2">
        <Bell className="h-4 w-4 text-primary-600" />
      </div>

      <div className="min-w-0 flex-1">
        <button onClick={() => onMarkAsRead(notification.id)} className="w-full text-left">
          <p className="text-sm font-medium text-secondary-900">{notification.title}</p>
          <p className="mt-0.5 text-sm text-secondary-600">{notification.body}</p>
          <p className="mt-1 text-xs text-secondary-400">
            {formatRelative(notification.createdAt)}
          </p>
        </button>
      </div>

      {onDismiss && (
        <button
          onClick={() => onDismiss(notification.id)}
          className="text-secondary-400 hover:text-secondary-600"
          aria-label={t('common.dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
