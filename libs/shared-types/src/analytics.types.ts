// ============================================
// Analytics Types
// ============================================

export type AnalyticsEventType =
  | 'event.viewed'
  | 'event.shared'
  | 'event.registered'
  | 'event.cancelled'
  | 'event.checked_in'
  | 'search.performed'
  | 'page.viewed'
  | 'ticket.purchased'
  | 'chat.message_sent';

export type TrafficSource = 'discovery_feed' | 'search' | 'direct_link' | 'notification' | 'social';

export interface IAnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  timestamp: string;
  actor: {
    userId: string | null;
    sessionId: string;
    userAgent: string;
    ip: string;
  };
  target: {
    entityType: string;
    entityId: string;
    metadata: Record<string, unknown>;
  };
  context: {
    source: TrafficSource;
    referrer: string | null;
    utm: {
      source: string | null;
      medium: string | null;
      campaign: string | null;
    };
  };
  geo: {
    country: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}

export interface IDailyAggregation {
  id: string;
  entityType: string;
  entityId: string;
  date: string;
  metrics: {
    views: number;
    uniqueViews: number;
    registrations: number;
    cancellations: number;
    shares: number;
    chatMessages: number;
    qaQuestions: number;
    reviews: number;
    avgRating: number;
  };
  hourlyBreakdown: Record<string, number>;
  sources: Record<string, number>;
  geoBreakdown: Array<{ country: string; count: number }>;
  updatedAt: string;
}

export interface IEventAnalyticsOverview {
  eventId: string;
  period: { from: string; to: string };
  overview: {
    totalViews: number;
    uniqueViews: number;
    totalRegistrations: number;
    cancellations: number;
    conversionRate: number;
    capacityUsed: number;
    avgRating: number;
    totalReviews: number;
    chatMessages: number;
    qaQuestions: number;
  };
  trend: {
    viewsChange: number;
    registrationsChange: number;
  };
  topSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}
