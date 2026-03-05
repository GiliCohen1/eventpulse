import { apiClient } from './api-client.js';
import { buildQueryString } from '@/lib/utils.js';
import type { INotification, INotificationPreferences, PaginationMeta } from '@/types';

interface NotificationsResponse {
  notifications: INotification[];
  pagination: PaginationMeta;
}

export const notificationService = {
  async list(params: { isRead?: boolean; type?: string; page?: number; limit?: number } = {}): Promise<NotificationsResponse> {
    const qs = buildQueryString(params as Record<string, unknown>);
    const { data } = await apiClient.get(`/notifications${qs}`);
    return data.data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data.data.count;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },

  async getPreferences(): Promise<INotificationPreferences> {
    const { data } = await apiClient.get('/notifications/preferences');
    return data.data.preferences;
  },

  async updatePreferences(prefs: Partial<INotificationPreferences>): Promise<INotificationPreferences> {
    const { data } = await apiClient.put('/notifications/preferences', prefs);
    return data.data.preferences;
  },
};
