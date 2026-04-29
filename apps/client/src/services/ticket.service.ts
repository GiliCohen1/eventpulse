import { apiClient } from './api-client.js';
import type { IRegistration } from '@/types';

export const ticketService = {
  async register(eventId: string, ticketTierId: string) {
    const { data } = await apiClient.post(`/events/${eventId}/register`, { ticketTierId });
    const raw = data.data;
    // Real API returns flat Registration; demo-api may wrap in { registration: ... }
    return raw?.registration ?? raw;
  },

  async cancelRegistration(eventId: string): Promise<void> {
    await apiClient.delete(`/events/${eventId}/register`);
  },

  async getMyRegistrations(): Promise<IRegistration[]> {
    const { data } = await apiClient.get('/registrations/me');
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.registrations ?? []);
  },

  async getRegistration(id: string) {
    const { data } = await apiClient.get(`/registrations/${id}`);
    const raw = data.data;
    return raw?.registration ?? raw;
  },

  async checkIn(ticketCode: string): Promise<void> {
    await apiClient.post(`/tickets/${ticketCode}/check-in`);
  },

  async getEventAttendees(eventId: string): Promise<unknown[]> {
    const { data } = await apiClient.get(`/events/${eventId}/attendees`);
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.attendees ?? []);
  },
};
