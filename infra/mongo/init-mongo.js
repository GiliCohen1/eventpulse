// ============================================
// MongoDB Initialization — EventPulse
// Runs on first start via docker-entrypoint-initdb.d
// Creates databases, collections, and indexes
// matching the Mongoose schemas in the codebase.
// ============================================

// ── Chat Database ──────────────────────────
const chatDb = db.getSiblingDB('eventpulse_chat');

chatDb.createCollection('rooms');
chatDb.createCollection('messages');
chatDb.createCollection('qa_questions');

// rooms indexes
chatDb.rooms.createIndex({ roomId: 1 }, { unique: true });
chatDb.rooms.createIndex({ eventId: 1, type: 1 });

// messages indexes
chatDb.messages.createIndex({ roomId: 1, _id: -1 });

// qa_questions indexes
chatDb.qa_questions.createIndex({ eventId: 1, isPinned: -1, upvoteCount: -1 });

print('✓ eventpulse_chat database initialized');

// ── Notifications Database ─────────────────
const notificationsDb = db.getSiblingDB('eventpulse_notifications');

notificationsDb.createCollection('notifications');
notificationsDb.createCollection('notification_preferences');

// notifications indexes
notificationsDb.notifications.createIndex({ userId: 1, createdAt: -1 });
notificationsDb.notifications.createIndex({ userId: 1, isRead: 1 });
notificationsDb.notifications.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, sparse: true }
);

// notification_preferences indexes
notificationsDb.notification_preferences.createIndex({ userId: 1 }, { unique: true });

print('✓ eventpulse_notifications database initialized');

// ── Analytics Database ─────────────────────
const analyticsDb = db.getSiblingDB('eventpulse_analytics');

analyticsDb.createCollection('analytics_events');
analyticsDb.createCollection('user_activity_logs');
analyticsDb.createCollection('daily_aggregations');

// analytics_events indexes
analyticsDb.analytics_events.createIndex({ eventType: 1, timestamp: -1 });
analyticsDb.analytics_events.createIndex({ 'target.entityType': 1, 'target.entityId': 1, timestamp: -1 });
analyticsDb.analytics_events.createIndex({ 'actor.userId': 1, timestamp: -1 });
analyticsDb.analytics_events.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 180 * 24 * 60 * 60 } // TTL: 180 days
);

// user_activity_logs indexes
analyticsDb.user_activity_logs.createIndex({ userId: 1, timestamp: -1 });
analyticsDb.user_activity_logs.createIndex({ action: 1, timestamp: -1 });
analyticsDb.user_activity_logs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 } // TTL: 90 days
);

// daily_aggregations indexes (unique per entity+date)
analyticsDb.daily_aggregations.createIndex(
  { entityType: 1, entityId: 1, date: 1 },
  { unique: true }
);
analyticsDb.daily_aggregations.createIndex({ date: -1 });

print('✓ eventpulse_analytics database initialized');
