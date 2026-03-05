// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | 'ticket_confirmed'
  | 'event_reminder'
  | 'event_updated'
  | 'event_cancelled'
  | 'new_follower'
  | 'chat_mention'
  | 'review_received'
  | 'event_live'
  | 'welcome';

export type NotificationChannel = 'inApp' | 'email' | 'push';

export type EmailFrequency = 'instant' | 'daily_digest' | 'weekly_digest';

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channels: {
    inApp: { sent: boolean; sentAt: string | null; readAt: string | null };
    email: { sent: boolean; sentAt: string | null; messageId: string | null };
    push: { sent: boolean; reason: string | null };
  };
  isRead: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export interface INotificationPreferences {
  id: string;
  userId: string;
  channels: {
    email: { enabled: boolean; frequency: EmailFrequency };
    inApp: { enabled: boolean };
    push: { enabled: boolean };
  };
  types: Record<string, { email: boolean; inApp: boolean; push: boolean }>;
  updatedAt: string;
}
