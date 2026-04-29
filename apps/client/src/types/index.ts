export type { IUser, IUserPublicProfile, IOrganization } from '@eventpulse/shared-types';
export type {
  IEvent,
  ICategory,
  ITicketTier,
  IEventMedia,
  IEventReview,
  EventStatus,
  EventVisibility,
} from '@eventpulse/shared-types';
export type { IRegistration, IPayment, ITicket } from '@eventpulse/shared-types';
export type { IChatMessage, IChatRoom, IQAQuestion } from '@eventpulse/shared-types';
export type { INotification, INotificationPreferences } from '@eventpulse/shared-types';
export type { IEventAnalyticsOverview } from '@eventpulse/shared-types';
export type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationMeta,
  ApiErrorResponse,
} from '@eventpulse/shared-types';

export type { AuthTokens, LoginCredentials, RegisterCredentials, AuthState } from './auth.types.js';

export interface SelectOption {
  value: string;
  label: string;
}

export interface EventFilters {
  q?: string;
  category?: string | string[];
  status?: string | string[];
  startDate?: string;
  endDate?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  isOnline?: boolean;
  isFree?: boolean;
  sortBy?: 'starts_at' | 'created_at' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
