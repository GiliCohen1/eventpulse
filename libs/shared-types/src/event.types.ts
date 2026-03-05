// ============================================
// Event Types
// ============================================

export type EventStatus = 'draft' | 'published' | 'live' | 'ended' | 'cancelled' | 'archived';

export type EventVisibility = 'public' | 'private';

export type MediaType = 'image' | 'video' | 'document';

export interface IEvent {
  id: string;
  title: string;
  description: string | null;
  agenda: string | null;
  organizerId: string;
  organizationId: string | null;
  categoryId: string;
  status: EventStatus;
  visibility: EventVisibility;
  accessCode: string | null;
  venueName: string | null;
  venueAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  isOnline: boolean;
  onlineUrl: string | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  recurringParentId: string | null;
  recurrenceRule: string | null;
  coverImageUrl: string | null;
  maxCapacity: number | null;
  registeredCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  sortOrder: number;
}

export interface IEventTag {
  id: string;
  eventId: string;
  tag: string;
}

export interface IEventMedia {
  id: string;
  eventId: string;
  url: string;
  type: MediaType;
  altText: string | null;
  sortOrder: number;
  uploadedAt: string;
}

export interface ITicketTier {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number;
  registeredCount: number;
  salesStart: string | null;
  salesEnd: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface IEventReview {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}
