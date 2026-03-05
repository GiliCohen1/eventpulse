export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000';

export const QUERY_KEYS = {
  AUTH_ME: ['auth', 'me'],
  EVENTS: ['events'],
  EVENT_DETAIL: (id: string) => ['events', id],
  EVENT_TIERS: (id: string) => ['events', id, 'tiers'],
  EVENT_REVIEWS: (id: string) => ['events', id, 'reviews'],
  TRENDING_EVENTS: ['events', 'trending'],
  CATEGORIES: ['categories'],
  MY_REGISTRATIONS: ['registrations', 'me'],
  REGISTRATION_DETAIL: (id: string) => ['registrations', id],
  NOTIFICATIONS: ['notifications'],
  UNREAD_COUNT: ['notifications', 'unread-count'],
  NOTIFICATION_PREFS: ['notifications', 'preferences'],
  CHAT_MESSAGES: (eventId: string) => ['chat', eventId, 'messages'],
  CHAT_ROOMS: (eventId: string) => ['chat', eventId, 'rooms'],
  QA_QUESTIONS: (eventId: string) => ['qa', eventId],
  ANALYTICS_OVERVIEW: (eventId: string) => ['analytics', eventId, 'overview'],
  ORGANIZATIONS: ['organizations'],
  MY_ORGANIZATIONS: ['organizations', 'me'],
  MY_ORGANIZED_EVENTS: ['events', 'me', 'organized'],
  MY_ATTENDING_EVENTS: ['events', 'me', 'attending'],
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  EVENTS: '/events',
  EVENT_DETAIL: (id: string) => `/events/${id}`,
  EVENT_CREATE: '/events/create',
  EVENT_EDIT: (id: string) => `/events/${id}/edit`,
  PROFILE: '/profile',
  MY_TICKETS: '/my-tickets',
  MY_EVENTS: '/my-events',
  DASHBOARD: '/dashboard',
  DASHBOARD_EVENT: (id: string) => `/dashboard/events/${id}`,
  ORGANIZATION: (id: string) => `/organizations/${id}`,
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
} as const;

export const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  live: 'Live',
  ended: 'Ended',
  cancelled: 'Cancelled',
  archived: 'Archived',
};

export const EVENT_STATUS_COLORS: Record<string, string> = {
  draft: 'badge bg-secondary-100 text-secondary-700',
  published: 'badge-primary',
  live: 'badge-success',
  ended: 'badge bg-secondary-200 text-secondary-600',
  cancelled: 'badge-error',
  archived: 'badge bg-secondary-100 text-secondary-500',
};

export const PAGINATION_DEFAULT = {
  page: 1,
  limit: 20,
} as const;
