// MongoDB initialization script for EventPulse
// Runs on first start when MONGO_INITDB_ROOT_USERNAME is set

// Switch to the chat database
const chatDb = db.getSiblingDB('eventpulse_chat');

chatDb.createCollection('chat_rooms');
chatDb.createCollection('chat_messages');
chatDb.createCollection('qa_questions');

// Indexes for chat_rooms
chatDb.chat_rooms.createIndex({ eventId: 1 }, { unique: false });
chatDb.chat_rooms.createIndex({ type: 1 });

// Indexes for chat_messages
chatDb.chat_messages.createIndex({ roomId: 1, createdAt: -1 });
chatDb.chat_messages.createIndex({ userId: 1 });

// Indexes for qa_questions
chatDb.qa_questions.createIndex({ eventId: 1, status: 1 });
chatDb.qa_questions.createIndex({ upvotes: -1 });

print('✓ eventpulse_chat database initialized');

// Switch to the analytics database
const analyticsDb = db.getSiblingDB('eventpulse_analytics');

analyticsDb.createCollection('analytics_events');
analyticsDb.createCollection('daily_aggregations');

// Indexes for analytics_events
analyticsDb.analytics_events.createIndex({ eventId: 1, type: 1 });
analyticsDb.analytics_events.createIndex({ timestamp: -1 });
analyticsDb.analytics_events.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 } // TTL: 90 days
);

// Indexes for daily_aggregations
analyticsDb.daily_aggregations.createIndex({ eventId: 1, date: -1 });
analyticsDb.daily_aggregations.createIndex({ date: -1, metric: 1 });

print('✓ eventpulse_analytics database initialized');
