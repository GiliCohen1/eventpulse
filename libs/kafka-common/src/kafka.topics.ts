// ============================================
// Kafka Topic Constants
// ============================================

export const KAFKA_TOPICS = {
  // User Events
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',

  // Event Events
  EVENT_CREATED: 'event.created',
  EVENT_PUBLISHED: 'event.published',
  EVENT_UPDATED: 'event.updated',
  EVENT_CANCELLED: 'event.cancelled',
  EVENT_LIVE: 'event.live',
  EVENT_ENDED: 'event.ended',

  // Ticket Events
  TICKET_RESERVED: 'ticket.reserved',
  TICKET_CONFIRMED: 'ticket.confirmed',
  TICKET_CANCELLED: 'ticket.cancelled',
  TICKET_CHECKED_IN: 'ticket.checked_in',

  // Payment Events
  PAYMENT_COMPLETED: 'payment.completed',

  // Chat Events
  CHAT_MESSAGE_SENT: 'chat.message_sent',

  // Generic
  NOTIFICATION_SEND: 'notification.send',
  ANALYTICS_TRACK: 'analytics.track',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

export const CONSUMER_GROUPS = {
  NOTIFICATION_SERVICE: 'notification-service-group',
  ANALYTICS_SERVICE: 'analytics-service-group',
  CHAT_SERVICE: 'chat-service-group',
  EVENT_SERVICE: 'event-service-group',
} as const;
