import { apiClient } from './api-client.js';
import { buildQueryString } from '@/lib/utils.js';
import type { IEvent, ICategory, ITicketTier, IEventReview, PaginationMeta, EventFilters } from '@/types';

interface EventListResponse {
  events: IEvent[];
  pagination: PaginationMeta;
}

interface CreateEventPayload {
  title: string;
  description?: string;
  agenda?: string;
  categoryId: string;
  organizationId?: string;
  visibility: 'public' | 'private';
  venue: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isOnline: boolean;
  };
  startsAt: string;
  endsAt: string;
  timezone: string;
  maxCapacity?: number;
  tags?: string[];
  ticketTiers?: Array<{
    name: string;
    description?: string;
    price: number;
    capacity: number;
    salesStart?: string;
    salesEnd?: string;
  }>;
}

export const eventService = {
  async list(filters: EventFilters = {}): Promise<EventListResponse> {
    const qs = buildQueryString(filters as Record<string, unknown>);
    const { data } = await apiClient.get(`/events${qs}`);
    return data.data;
  },

  async getTrending(): Promise<IEvent[]> {
    const { data } = await apiClient.get('/events/trending');
    return data.data.events;
  },

  async getNearby(lat: number, lng: number, radius = 10): Promise<IEvent[]> {
    const qs = buildQueryString({ lat, lng, radius });
    const { data } = await apiClient.get(`/events/nearby${qs}`);
    return data.data.events;
  },

  async getById(id: string): Promise<IEvent> {
    const { data } = await apiClient.get(`/events/${id}`);
    return data.data.event;
  },

  async create(payload: CreateEventPayload): Promise<IEvent> {
    const { data } = await apiClient.post('/events', payload);
    return data.data.event;
  },

  async update(id: string, payload: Partial<CreateEventPayload>): Promise<IEvent> {
    const { data } = await apiClient.put(`/events/${id}`, payload);
    return data.data.event;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  async publish(id: string): Promise<IEvent> {
    const { data } = await apiClient.put(`/events/${id}/publish`);
    return data.data.event;
  },

  async cancel(id: string, reason: string): Promise<IEvent> {
    const { data } = await apiClient.put(`/events/${id}/cancel`, { reason });
    return data.data.event;
  },

  async goLive(id: string): Promise<IEvent> {
    const { data } = await apiClient.put(`/events/${id}/go-live`);
    return data.data.event;
  },

  async end(id: string): Promise<IEvent> {
    const { data } = await apiClient.put(`/events/${id}/end`);
    return data.data.event;
  },

  async getTiers(eventId: string): Promise<ITicketTier[]> {
    const { data } = await apiClient.get(`/events/${eventId}/tiers`);
    return data.data.tiers;
  },

  async createTier(eventId: string, tier: Omit<ITicketTier, 'id' | 'eventId' | 'registeredCount' | 'createdAt'>): Promise<ITicketTier> {
    const { data } = await apiClient.post(`/events/${eventId}/tiers`, tier);
    return data.data.tier;
  },

  async getReviews(eventId: string): Promise<IEventReview[]> {
    const { data } = await apiClient.get(`/events/${eventId}/reviews`);
    return data.data.reviews;
  },

  async submitReview(eventId: string, rating: number, comment?: string): Promise<IEventReview> {
    const { data } = await apiClient.post(`/events/${eventId}/reviews`, { rating, comment });
    return data.data.review;
  },

  async getCategories(): Promise<ICategory[]> {
    const { data } = await apiClient.get('/categories');
    return data.data.categories;
  },

  async getMyOrganized(): Promise<EventListResponse> {
    const { data } = await apiClient.get('/events/me/organized');
    return data.data;
  },

  async getMyAttending(): Promise<EventListResponse> {
    const { data } = await apiClient.get('/events/me/attending');
    return data.data;
  },
};
