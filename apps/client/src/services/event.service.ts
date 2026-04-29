import { apiClient } from './api-client.js';
import { buildQueryString } from '@/lib/utils.js';
import type {
  IEvent,
  ICategory,
  ITicketTier,
  IEventReview,
  PaginationMeta,
  EventFilters,
} from '@/types';

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

/**
 * Normalise a list response that may come from the real API
 * (`{ data: Event[], total, page, limit }`) or from the demo-api
 * fallback (`{ events, pagination }`).
 */
function normaliseEventList(raw: Record<string, unknown>): EventListResponse {
  // Already in expected shape (demo-api fallback)
  if (Array.isArray(raw.events)) {
    return raw as unknown as EventListResponse;
  }

  // Real API shape: { data: Event[], total, page, limit }
  const events = (raw.data ?? []) as IEvent[];
  const total = (raw.total ?? events.length) as number;
  const page = (raw.page ?? 1) as number;
  const limit = (raw.limit ?? 20) as number;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Unwrap a value that may be nested inside a wrapper key (demo-api)
 * or returned directly (real API).
 * e.g. `unwrap(raw, 'event')` handles both `{ event: {...} }` and `{...}` (direct object).
 */
function unwrap<T>(raw: unknown, key: string): T {
  if (raw && typeof raw === 'object' && key in (raw as Record<string, unknown>)) {
    return (raw as Record<string, unknown>)[key] as T;
  }
  return raw as T;
}

function unwrapArray<T>(raw: unknown, key: string): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object' && key in (raw as Record<string, unknown>)) {
    return (raw as Record<string, unknown>)[key] as T[];
  }
  return [];
}

export const eventService = {
  async list(filters: EventFilters = {}): Promise<EventListResponse> {
    const qs = buildQueryString(filters as Record<string, unknown>);
    const { data } = await apiClient.get(`/events${qs}`);
    return normaliseEventList(data.data);
  },

  async getTrending(): Promise<IEvent[]> {
    const { data } = await apiClient.get('/events/trending');
    return unwrapArray<IEvent>(data.data, 'events');
  },

  async getNearby(lat: number, lng: number, radius = 10): Promise<IEvent[]> {
    const qs = buildQueryString({ lat, lng, radius });
    const { data } = await apiClient.get(`/events/nearby${qs}`);
    return unwrapArray<IEvent>(data.data, 'events');
  },

  async getById(id: string): Promise<IEvent> {
    const { data } = await apiClient.get(`/events/${id}`);
    return unwrap<IEvent>(data.data, 'event');
  },

  async create(payload: CreateEventPayload): Promise<IEvent> {
    const { data } = await apiClient.post('/events', payload);
    return unwrap<IEvent>(data.data, 'event');
  },

  async update(id: string, payload: Partial<CreateEventPayload>): Promise<IEvent> {
    const { data } = await apiClient.put(`/events/${id}`, payload);
    return unwrap<IEvent>(data.data, 'event');
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  async publish(id: string): Promise<IEvent> {
    const { data } = await apiClient.put(`/events/${id}/publish`);
    return unwrap<IEvent>(data.data, 'event');
  },

  async cancel(id: string, reason: string): Promise<IEvent> {
    const { data } = await apiClient.put(`/events/${id}/cancel`, { reason });
    return unwrap<IEvent>(data.data, 'event');
  },

  async goLive(id: string): Promise<IEvent> {
    const { data } = await apiClient.put(`/events/${id}/go-live`);
    return unwrap<IEvent>(data.data, 'event');
  },

  async end(id: string): Promise<IEvent> {
    const { data } = await apiClient.put(`/events/${id}/end`);
    return unwrap<IEvent>(data.data, 'event');
  },

  async getTiers(eventId: string): Promise<ITicketTier[]> {
    const { data } = await apiClient.get(`/events/${eventId}/tiers`);
    return unwrapArray<ITicketTier>(data.data, 'tiers');
  },

  async createTier(
    eventId: string,
    tier: Omit<ITicketTier, 'id' | 'eventId' | 'registeredCount' | 'createdAt'>,
  ): Promise<ITicketTier> {
    const { data } = await apiClient.post(`/events/${eventId}/tiers`, tier);
    return unwrap<ITicketTier>(data.data, 'tier');
  },

  async getReviews(eventId: string): Promise<IEventReview[]> {
    const { data } = await apiClient.get(`/events/${eventId}/reviews`);
    return unwrapArray<IEventReview>(data.data, 'reviews');
  },

  async submitReview(eventId: string, rating: number, comment?: string): Promise<IEventReview> {
    const { data } = await apiClient.post(`/events/${eventId}/reviews`, { rating, comment });
    return unwrap<IEventReview>(data.data, 'review');
  },

  async getCategories(): Promise<ICategory[]> {
    const { data } = await apiClient.get('/categories');
    return unwrapArray<ICategory>(data.data, 'categories');
  },

  async getMyOrganized(): Promise<EventListResponse> {
    const { data } = await apiClient.get('/events/me/organized');
    return normaliseEventList(data.data);
  },

  async getMyAttending(): Promise<EventListResponse> {
    const { data } = await apiClient.get('/events/me/attending');
    return normaliseEventList(data.data);
  },
};
