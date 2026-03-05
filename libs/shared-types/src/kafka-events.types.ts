// ============================================
// Kafka Event Types
// ============================================

// Base Event Envelope
export interface KafkaEventEnvelope<T> {
  eventId: string;
  eventType: string;
  version: string;
  timestamp: string;
  source: string;
  correlationId: string;
  data: T;
}

// ── User Events ──

export interface UserRegisteredEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'attendee' | 'organizer';
  authProvider: 'local' | 'google';
  registeredAt: string;
}

export interface UserUpdatedEvent {
  userId: string;
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  updatedAt: string;
}

// ── Event Events ──

export interface EventCreatedEvent {
  eventId: string;
  title: string;
  organizerId: string;
  organizationId: string | null;
  categoryId: string;
  status: 'draft';
  createdAt: string;
}

export interface EventPublishedEvent {
  eventId: string;
  title: string;
  organizerId: string;
  organizationId: string | null;
  categoryId: string;
  categoryName: string;
  startsAt: string;
  endsAt: string;
  venue: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isOnline: boolean;
  };
  ticketTiers: Array<{
    tierId: string;
    name: string;
    price: number;
    capacity: number;
  }>;
  maxCapacity: number;
  publishedAt: string;
}

export interface EventUpdatedEvent {
  eventId: string;
  title: string;
  organizerId: string;
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  notifyAttendees: boolean;
  updatedAt: string;
}

export interface EventCancelledEvent {
  eventId: string;
  title: string;
  organizerId: string;
  reason: string;
  registeredUserIds: string[];
  cancelledAt: string;
}

export interface EventLiveEvent {
  eventId: string;
  title: string;
  organizerId: string;
  startedAt: string;
}

export interface EventEndedEvent {
  eventId: string;
  title: string;
  organizerId: string;
  endedAt: string;
  totalAttendees: number;
  checkedInCount: number;
}

// ── Ticket Events ──

export interface TicketReservedEvent {
  registrationId: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  ticketTierId: string;
  ticketTierName: string;
  price: number;
  reservedAt: string;
}

export interface TicketConfirmedEvent {
  registrationId: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  eventId: string;
  eventTitle: string;
  ticketTierId: string;
  ticketTierName: string;
  ticketCode: string;
  qrCodeUrl: string;
  transactionId: string;
  amount: number;
  confirmedAt: string;
}

export interface TicketCancelledEvent {
  registrationId: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  ticketTierId: string;
  reason: string;
  cancelledAt: string;
}

export interface TicketCheckedInEvent {
  registrationId: string;
  userId: string;
  eventId: string;
  ticketCode: string;
  checkedInAt: string;
}

// ── Payment Events ──

export interface PaymentCompletedEvent {
  paymentId: string;
  registrationId: string;
  userId: string;
  eventId: string;
  amount: number;
  currency: string;
  transactionId: string;
  method: 'simulated_card' | 'free';
  completedAt: string;
}

// ── Chat Events ──

export interface ChatMessageSentEvent {
  messageId: string;
  roomId: string;
  eventId: string;
  senderId: string;
  type: 'text' | 'image' | 'system';
  contentLength: number;
  sentAt: string;
}

// ── Generic Events ──

export interface NotificationSendEvent {
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channels: Array<'inApp' | 'email' | 'push'>;
}

export interface AnalyticsTrackEvent {
  eventType: string;
  actorId: string | null;
  sessionId: string;
  target: {
    entityType: string;
    entityId: string;
  };
  context: Record<string, unknown>;
  timestamp: string;
}
