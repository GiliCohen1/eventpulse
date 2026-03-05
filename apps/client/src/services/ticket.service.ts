import { apiClient } from './api-client.js';
import type { IRegistration } from '@/types';

interface RegistrationResponse {
  registration: IRegistration & {
    event: { id: string; title: string; startsAt: string };
    ticketTier: { id: string; name: string; price: number };
    payment: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      transactionId: string;
      method: string;
    };
    ticket: {
      ticketCode: string;
      qrCodeUrl: string;
      issuedAt: string;
    };
  };
}

export const ticketService = {
  async register(eventId: string, ticketTierId: string): Promise<RegistrationResponse> {
    const { data } = await apiClient.post(`/events/${eventId}/register`, { ticketTierId });
    return data.data;
  },

  async cancelRegistration(eventId: string): Promise<void> {
    await apiClient.delete(`/events/${eventId}/register`);
  },

  async getMyRegistrations(): Promise<IRegistration[]> {
    const { data } = await apiClient.get('/registrations/me');
    return data.data.registrations;
  },

  async getRegistration(id: string): Promise<RegistrationResponse> {
    const { data } = await apiClient.get(`/registrations/${id}`);
    return data.data;
  },

  async checkIn(ticketCode: string): Promise<void> {
    await apiClient.post(`/tickets/${ticketCode}/check-in`);
  },

  async getEventAttendees(eventId: string): Promise<unknown[]> {
    const { data } = await apiClient.get(`/events/${eventId}/attendees`);
    return data.data.attendees;
  },
};
