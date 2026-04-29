import { apiClient } from './api-client.js';
import { buildQueryString } from '@/lib/utils.js';
import type { INotification, INotificationPreferences, PaginationMeta } from '@/types';

interface NotificationsResponse {
  notifications: INotification[];
  pagination: PaginationMeta;
}

export const notificationService = {
  async list(
    params: { isRead?: boolean; type?: string; page?: number; limit?: number } = {},
  ): Promise<NotificationsResponse> {
    const qs = buildQueryString(params as Record<string, unknown>);
    const { data } = await apiClient.get(`/notifications${qs}`);
    const raw = data.data;
    // Real API: { data: Notification[], total, page, limit }
    // Demo API: { notifications: [...], pagination: {...} }
    if (raw.notifications) return raw;
    return {
      notifications: raw.data ?? [],
      pagination: {
        total: raw.total ?? 0,
        page: raw.page ?? 1,
        limit: raw.limit ?? 20,
      } as PaginationMeta,
    };
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get('/notifications/unread-count');
    const raw = data.data;
    return typeof raw === 'number' ? raw : (raw?.count ?? 0);
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },

  async getPreferences(): Promise<INotificationPreferences> {
    const { data } = await apiClient.get('/notifications/preferences');
    return data.data?.preferences ?? data.data;
  },

  async updatePreferences(
    prefs: Partial<INotificationPreferences>,
  ): Promise<INotificationPreferences> {
    const { data } = await apiClient.put('/notifications/preferences', prefs);
    return data.data?.preferences ?? data.data;
  },
};
