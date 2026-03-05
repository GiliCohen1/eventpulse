import { apiClient } from './api-client.js';
import type { IEventAnalyticsOverview } from '@/types';

export const analyticsService = {
  async getEventOverview(eventId: string): Promise<IEventAnalyticsOverview> {
    const { data } = await apiClient.get(`/analytics/events/${eventId}/overview`);
    return data.data;
  },

  async getRegistrationTimeline(eventId: string): Promise<unknown> {
    const { data } = await apiClient.get(`/analytics/events/${eventId}/registrations`);
    return data.data;
  },

  async getTrafficSources(eventId: string): Promise<unknown> {
    const { data } = await apiClient.get(`/analytics/events/${eventId}/sources`);
    return data.data;
  },

  async getGeoDistribution(eventId: string): Promise<unknown> {
    const { data } = await apiClient.get(`/analytics/events/${eventId}/geo`);
    return data.data;
  },

  async getTierBreakdown(eventId: string): Promise<unknown> {
    const { data } = await apiClient.get(`/analytics/events/${eventId}/tiers`);
    return data.data;
  },

  async getDashboard(): Promise<unknown> {
    const { data } = await apiClient.get('/analytics/dashboard');
    return data.data;
  },
};
