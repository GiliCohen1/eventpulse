// ============================================
// MongoDB Demo Seed Data — EventPulse
// Run with:  docker exec -i eventpulse-mongodb mongosh -u eventpulse -p eventpulse_secret --authenticationDatabase admin < infra/mongo/seed-demo.js
// ============================================

// Authenticate against admin database
const adminDb = db.getSiblingDB('admin');
adminDb.auth('eventpulse', 'eventpulse_secret');

// ── Reusable IDs matching seed.sql ─────────
const USER = {
  gili: 'a0000000-0000-0000-0000-000000000001',
  maya: 'a0000000-0000-0000-0000-000000000002',
  alex: 'a0000000-0000-0000-0000-000000000003',
  sarah: 'a0000000-0000-0000-0000-000000000004',
  omar: 'a0000000-0000-0000-0000-000000000005',
  emma: 'a0000000-0000-0000-0000-000000000006',
  david: 'a0000000-0000-0000-0000-000000000007',
  nina: 'a0000000-0000-0000-0000-000000000008',
  james: 'a0000000-0000-0000-0000-000000000009',
  yuki: 'a0000000-0000-0000-0000-000000000010',
};

const EVENT = {
  techconf: 'e0000000-0000-0000-0000-000000000001',
  sunsetBeats: 'e0000000-0000-0000-0000-000000000002',
  fundraising: 'e0000000-0000-0000-0000-000000000003',
  designWorkshop: 'e0000000-0000-0000-0000-000000000004',
  reactMeetup: 'e0000000-0000-0000-0000-000000000005',
  streetFood: 'e0000000-0000-0000-0000-000000000007',
  yoga: 'e0000000-0000-0000-0000-000000000008',
};

const now = new Date();
function ago(mins) {
  return new Date(now.getTime() - mins * 60 * 1000);
}
function daysAgo(d) {
  return new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
}
function dateStr(d) {
  return d.toISOString().slice(0, 10);
}

// ╔══════════════════════════════════════════╗
// ║  CHAT DATABASE                           ║
// ╚══════════════════════════════════════════╝
const chatDb = db.getSiblingDB('eventpulse_chat');

// --- Drop existing demo data ---
chatDb.rooms.deleteMany({});
chatDb.messages.deleteMany({});
chatDb.qa_questions.deleteMany({});

// ── Chat Rooms ─────────────────────────────
// Published events get chat rooms when published; live events have active rooms.
const rooms = [
  // TechConf — published, room available
  {
    roomId: `room-${EVENT.techconf}-chat`,
    eventId: EVENT.techconf,
    type: 'event_chat',
    name: 'TechConf 2026 — General Chat',
    participants: [
      { userId: USER.alex, joinedAt: daysAgo(2), role: 'attendee' },
      { userId: USER.sarah, joinedAt: daysAgo(2), role: 'attendee' },
      { userId: USER.emma, joinedAt: daysAgo(1), role: 'attendee' },
      { userId: USER.yuki, joinedAt: daysAgo(1), role: 'attendee' },
      { userId: USER.gili, joinedAt: daysAgo(3), role: 'organizer' },
    ],
    participantCount: 5,
    isActive: true,
    settings: {
      slowMode: false,
      slowModeInterval: 5,
      onlyOrganizersCanPost: false,
      maxMessageLength: 500,
    },
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  },
  // Design Workshop — LIVE, rooms active
  {
    roomId: `room-${EVENT.designWorkshop}-chat`,
    eventId: EVENT.designWorkshop,
    type: 'event_chat',
    name: 'Design Systems Workshop — Chat',
    participants: [
      { userId: USER.sarah, joinedAt: daysAgo(4), role: 'attendee' },
      { userId: USER.alex, joinedAt: daysAgo(3), role: 'attendee' },
      { userId: USER.nina, joinedAt: daysAgo(5), role: 'organizer' },
    ],
    participantCount: 3,
    isActive: true,
    settings: {
      slowMode: false,
      slowModeInterval: 5,
      onlyOrganizersCanPost: false,
      maxMessageLength: 500,
    },
    createdAt: daysAgo(5),
    updatedAt: ago(30),
  },
  {
    roomId: `room-${EVENT.designWorkshop}-qa`,
    eventId: EVENT.designWorkshop,
    type: 'event_qa',
    name: 'Design Systems Workshop — Q&A',
    participants: [
      { userId: USER.sarah, joinedAt: daysAgo(4), role: 'attendee' },
      { userId: USER.alex, joinedAt: daysAgo(3), role: 'attendee' },
      { userId: USER.nina, joinedAt: daysAgo(5), role: 'organizer' },
    ],
    participantCount: 3,
    isActive: true,
    settings: {
      slowMode: false,
      slowModeInterval: 5,
      onlyOrganizersCanPost: false,
      maxMessageLength: 500,
    },
    createdAt: daysAgo(5),
    updatedAt: ago(15),
  },
  // React Meetup — ended, rooms deactivated
  {
    roomId: `room-${EVENT.reactMeetup}-chat`,
    eventId: EVENT.reactMeetup,
    type: 'event_chat',
    name: 'React Israel Meetup #42 — Chat',
    participants: [
      { userId: USER.alex, joinedAt: daysAgo(10), role: 'attendee' },
      { userId: USER.sarah, joinedAt: daysAgo(10), role: 'attendee' },
      { userId: USER.david, joinedAt: daysAgo(9), role: 'attendee' },
      { userId: USER.yuki, joinedAt: daysAgo(8), role: 'attendee' },
      { userId: USER.gili, joinedAt: daysAgo(14), role: 'organizer' },
    ],
    participantCount: 5,
    isActive: false,
    settings: {
      slowMode: false,
      slowModeInterval: 5,
      onlyOrganizersCanPost: false,
      maxMessageLength: 500,
    },
    createdAt: daysAgo(14),
    updatedAt: daysAgo(7),
  },
  // Sunset Beats — published
  {
    roomId: `room-${EVENT.sunsetBeats}-chat`,
    eventId: EVENT.sunsetBeats,
    type: 'event_chat',
    name: 'Sunset Beats Festival — Chat',
    participants: [{ userId: USER.maya, joinedAt: daysAgo(7), role: 'organizer' }],
    participantCount: 1,
    isActive: true,
    settings: {
      slowMode: false,
      slowModeInterval: 5,
      onlyOrganizersCanPost: false,
      maxMessageLength: 500,
    },
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
];

chatDb.rooms.insertMany(rooms);
print(`✓ Inserted ${rooms.length} chat rooms`);

// ── Chat Messages ──────────────────────────
// Messages for the LIVE Design Workshop chat
const designChatRoomId = `room-${EVENT.designWorkshop}-chat`;
const messages = [
  {
    roomId: designChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.nina,
      firstName: 'Nina',
      lastName: 'Petrova',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina',
    },
    content: "Welcome everyone to the Design Systems Workshop! 🎨 We're starting in a few minutes.",
    type: 'system',
    replyTo: null,
    reactions: [],
    isEdited: false,
    isDeleted: false,
    createdAt: ago(65),
    updatedAt: ago(65),
  },
  {
    roomId: designChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.sarah,
      firstName: 'Sarah',
      lastName: 'Kim',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
    content:
      "Excited to be here! I've been wanting to build a proper design system for our product.",
    type: 'text',
    replyTo: null,
    reactions: [{ emoji: '🔥', users: [USER.nina, USER.alex] }],
    isEdited: false,
    isDeleted: false,
    createdAt: ago(60),
    updatedAt: ago(58),
  },
  {
    roomId: designChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.alex,
      firstName: 'Alex',
      lastName: 'Rodriguez',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
    content:
      'Same here! Quick question — are we starting with Figma tokens or jumping straight into code?',
    type: 'text',
    replyTo: null,
    reactions: [],
    isEdited: false,
    isDeleted: false,
    createdAt: ago(55),
    updatedAt: ago(55),
  },
  {
    roomId: designChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.nina,
      firstName: 'Nina',
      lastName: 'Petrova',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina',
    },
    content:
      "We'll start with design tokens in Figma, then export them to CSS custom properties and React components. Best of both worlds!",
    type: 'text',
    replyTo: null,
    reactions: [
      { emoji: '👏', users: [USER.sarah, USER.alex] },
      { emoji: '💯', users: [USER.alex] },
    ],
    isEdited: false,
    isDeleted: false,
    createdAt: ago(50),
    updatedAt: ago(48),
  },
  {
    roomId: designChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.sarah,
      firstName: 'Sarah',
      lastName: 'Kim',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
    content: 'Love it! The token-first approach is exactly what I was hoping for.',
    type: 'text',
    replyTo: null,
    reactions: [],
    isEdited: false,
    isDeleted: false,
    createdAt: ago(45),
    updatedAt: ago(45),
  },
  {
    roomId: designChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.nina,
      firstName: 'Nina',
      lastName: 'Petrova',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina',
    },
    content: "Alright, we're live! Open Figma and follow along. Link is in the event description.",
    type: 'text',
    replyTo: null,
    reactions: [{ emoji: '🚀', users: [USER.sarah] }],
    isEdited: false,
    isDeleted: false,
    createdAt: ago(40),
    updatedAt: ago(40),
  },
  {
    roomId: designChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.alex,
      firstName: 'Alex',
      lastName: 'Rodriguez',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
    content: 'Got it open. The color palette looks clean!',
    type: 'text',
    replyTo: null,
    reactions: [],
    isEdited: false,
    isDeleted: false,
    createdAt: ago(35),
    updatedAt: ago(35),
  },
  {
    roomId: designChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.sarah,
      firstName: 'Sarah',
      lastName: 'Kim',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
    content:
      'Quick tip for anyone following along: make sure you duplicate the template before editing!',
    type: 'text',
    replyTo: null,
    reactions: [{ emoji: '👍', users: [USER.nina, USER.alex] }],
    isEdited: false,
    isDeleted: false,
    createdAt: ago(25),
    updatedAt: ago(25),
  },
];

// Messages for the ENDED React Meetup
const reactChatRoomId = `room-${EVENT.reactMeetup}-chat`;
const reactMessages = [
  {
    roomId: reactChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.gili,
      firstName: 'Gili',
      lastName: 'Cohen',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gili',
    },
    content:
      "Welcome to React Israel Meetup #42! Tonight we're diving deep into Server Components. 🚀",
    type: 'system',
    replyTo: null,
    reactions: [],
    isEdited: false,
    isDeleted: false,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    roomId: reactChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.alex,
      firstName: 'Alex',
      lastName: 'Rodriguez',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
    content: 'Finally! Been waiting for a proper deep-dive into RSC. The docs are still confusing.',
    type: 'text',
    replyTo: null,
    reactions: [{ emoji: '💯', users: [USER.david, USER.yuki] }],
    isEdited: false,
    isDeleted: false,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    roomId: reactChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.david,
      firstName: 'David',
      lastName: 'Park',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    },
    content:
      'The demo showing the waterfall problem was eye-opening. Server Components really solve that.',
    type: 'text',
    replyTo: null,
    reactions: [{ emoji: '🔥', users: [USER.gili, USER.alex, USER.sarah] }],
    isEdited: false,
    isDeleted: false,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    roomId: reactChatRoomId,
    roomType: 'event_chat',
    sender: {
      userId: USER.yuki,
      firstName: 'Yuki',
      lastName: 'Tanaka',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuki',
    },
    content: 'Great meetup as always! See everyone next month 🙌',
    type: 'text',
    replyTo: null,
    reactions: [{ emoji: '❤️', users: [USER.gili, USER.alex, USER.david, USER.sarah] }],
    isEdited: false,
    isDeleted: false,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
];

chatDb.messages.insertMany([...messages, ...reactMessages]);
print(`✓ Inserted ${messages.length + reactMessages.length} chat messages`);

// ── Q&A Questions (for LIVE Design Workshop) ──
const qaQuestions = [
  {
    eventId: EVENT.designWorkshop,
    author: {
      userId: USER.sarah,
      firstName: 'Sarah',
      lastName: 'Kim',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
    question: 'How do you handle responsive spacing tokens? Do you use a scale or fixed values?',
    status: 'answered',
    upvotes: [USER.alex, USER.emma, USER.david],
    upvoteCount: 3,
    answer: {
      content:
        "Great question! We use a 4px base scale (4, 8, 12, 16, 24, 32, 48, 64) — it gives enough granularity without being overwhelming. We'll cover this in the typography section.",
      answeredBy: { userId: USER.nina, firstName: 'Nina', lastName: 'Petrova' },
      answeredAt: ago(30),
    },
    isPinned: true,
    createdAt: ago(45),
    updatedAt: ago(30),
  },
  {
    eventId: EVENT.designWorkshop,
    author: {
      userId: USER.alex,
      firstName: 'Alex',
      lastName: 'Rodriguez',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
    question:
      "What's your recommended approach for dark mode tokens? Separate file or same token with alias?",
    status: 'pending',
    upvotes: [USER.sarah, USER.david],
    upvoteCount: 2,
    answer: null,
    isPinned: false,
    createdAt: ago(20),
    updatedAt: ago(20),
  },
  {
    eventId: EVENT.designWorkshop,
    author: {
      userId: USER.david,
      firstName: 'David',
      lastName: 'Park',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    },
    question: 'Can you share the Figma plugin you mentioned for exporting tokens to JSON?',
    status: 'pending',
    upvotes: [USER.alex],
    upvoteCount: 1,
    answer: null,
    isPinned: false,
    createdAt: ago(10),
    updatedAt: ago(10),
  },
];

chatDb.qa_questions.insertMany(qaQuestions);
print(`✓ Inserted ${qaQuestions.length} Q&A questions`);

// ╔══════════════════════════════════════════╗
// ║  NOTIFICATIONS DATABASE                  ║
// ╚══════════════════════════════════════════╝
const notifDb = db.getSiblingDB('eventpulse_notifications');

notifDb.notifications.deleteMany({});
notifDb.notification_preferences.deleteMany({});

const notifications = [
  // Welcome notifications
  ...[USER.gili, USER.maya, USER.alex, USER.sarah, USER.omar].map((uid, i) => ({
    userId: uid,
    type: 'welcome',
    title: 'Welcome to EventPulse! 🎉',
    body: 'Your account is set up. Start exploring events or create your own!',
    data: {},
    channels: {
      inApp: { sent: true, sentAt: daysAgo(14 - i), readAt: daysAgo(14 - i) },
      email: { sent: true, sentAt: daysAgo(14 - i), messageId: `welcome-${i}` },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: true,
    expiresAt: null,
    createdAt: daysAgo(14 - i),
    updatedAt: daysAgo(14 - i),
  })),

  // --- Alex's notifications ---
  {
    userId: USER.alex,
    type: 'ticket_confirmed',
    title: 'Ticket Confirmed — React Meetup #42',
    body: 'Your free ticket for React Israel Meetup #42 has been confirmed.',
    data: { eventId: EVENT.reactMeetup, registrationId: 'f0000000-0000-0000-0000-000000000001' },
    channels: {
      inApp: { sent: true, sentAt: daysAgo(10), readAt: daysAgo(10) },
      email: { sent: true, sentAt: daysAgo(10), messageId: 'ticket-conf-1' },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: true,
    expiresAt: null,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    userId: USER.alex,
    type: 'ticket_confirmed',
    title: 'Ticket Confirmed — Design Workshop',
    body: 'Your ticket for Design Systems Workshop has been confirmed. See you there!',
    data: { eventId: EVENT.designWorkshop, registrationId: 'f0000000-0000-0000-0000-000000000006' },
    channels: {
      inApp: { sent: true, sentAt: daysAgo(3), readAt: daysAgo(3) },
      email: { sent: true, sentAt: daysAgo(3), messageId: 'ticket-conf-2' },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: true,
    expiresAt: null,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    userId: USER.alex,
    type: 'ticket_confirmed',
    title: 'Ticket Confirmed — TechConf 2026',
    body: 'Your General Admission ticket for TechConf 2026 is confirmed! 🎟️',
    data: { eventId: EVENT.techconf, registrationId: 'f0000000-0000-0000-0000-000000000007' },
    channels: {
      inApp: { sent: true, sentAt: daysAgo(2), readAt: null },
      email: { sent: true, sentAt: daysAgo(2), messageId: 'ticket-conf-3' },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: false,
    expiresAt: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    userId: USER.alex,
    type: 'event_live',
    title: 'Design Workshop is LIVE! 🔴',
    body: 'The Design Systems Workshop just started. Join the live chat!',
    data: { eventId: EVENT.designWorkshop },
    channels: {
      inApp: { sent: true, sentAt: ago(60), readAt: ago(55) },
      email: { sent: false, sentAt: null, messageId: null },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: true,
    expiresAt: null,
    createdAt: ago(60),
    updatedAt: ago(55),
  },

  // --- Sarah's notifications ---
  {
    userId: USER.sarah,
    type: 'ticket_confirmed',
    title: 'Ticket Confirmed — TechConf 2026',
    body: 'Your VIP ticket for TechConf 2026 is confirmed! Priority seating and speaker dinner included.',
    data: { eventId: EVENT.techconf, registrationId: 'f0000000-0000-0000-0000-000000000008' },
    channels: {
      inApp: { sent: true, sentAt: daysAgo(2), readAt: daysAgo(1) },
      email: { sent: true, sentAt: daysAgo(2), messageId: 'ticket-conf-s1' },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: true,
    expiresAt: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    userId: USER.sarah,
    type: 'event_live',
    title: 'Design Workshop is LIVE! 🔴',
    body: 'The Design Systems Workshop just started. Jump in!',
    data: { eventId: EVENT.designWorkshop },
    channels: {
      inApp: { sent: true, sentAt: ago(60), readAt: ago(50) },
      email: { sent: false, sentAt: null, messageId: null },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: true,
    expiresAt: null,
    createdAt: ago(60),
    updatedAt: ago(50),
  },

  // --- Gili's organizer notifications ---
  {
    userId: USER.gili,
    type: 'event_updated',
    title: 'New registration for TechConf 2026',
    body: 'Alex Rodriguez just registered for your event. 47 total registrations.',
    data: { eventId: EVENT.techconf, attendeeName: 'Alex Rodriguez' },
    channels: {
      inApp: { sent: true, sentAt: daysAgo(2), readAt: daysAgo(2) },
      email: { sent: false, sentAt: null, messageId: null },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: true,
    expiresAt: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    userId: USER.gili,
    type: 'review_received',
    title: 'New review on React Meetup #42 ⭐',
    body: 'Alex Rodriguez left a 5-star review: "Incredible deep-dive into Server Components!"',
    data: { eventId: EVENT.reactMeetup, rating: 5, reviewerName: 'Alex Rodriguez' },
    channels: {
      inApp: { sent: true, sentAt: daysAgo(6), readAt: daysAgo(5) },
      email: { sent: true, sentAt: daysAgo(6), messageId: 'review-1' },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: true,
    expiresAt: null,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
  },

  // --- Unread notifications (for demo: show badge counts) ---
  {
    userId: USER.emma,
    type: 'event_reminder',
    title: 'Reminder: Yoga Session in 3 days',
    body: "Your Morning Yoga & Meditation session is coming up this weekend. Don't forget your mat!",
    data: { eventId: EVENT.yoga },
    channels: {
      inApp: { sent: true, sentAt: ago(120), readAt: null },
      email: { sent: true, sentAt: ago(120), messageId: 'reminder-yoga' },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: false,
    expiresAt: null,
    createdAt: ago(120),
    updatedAt: ago(120),
  },
  {
    userId: USER.yuki,
    type: 'ticket_confirmed',
    title: 'Ticket Confirmed — TechConf 2026',
    body: 'Your General Admission ticket for TechConf 2026 is confirmed! See you in 2 weeks.',
    data: { eventId: EVENT.techconf, registrationId: 'f0000000-0000-0000-0000-000000000010' },
    channels: {
      inApp: { sent: true, sentAt: daysAgo(1), readAt: null },
      email: { sent: true, sentAt: daysAgo(1), messageId: 'ticket-conf-y1' },
      push: { sent: false, reason: 'no_token' },
    },
    isRead: false,
    expiresAt: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];

notifDb.notifications.insertMany(notifications);
print(`✓ Inserted ${notifications.length} notifications`);

// Notification Preferences
const prefs = [USER.gili, USER.alex, USER.sarah, USER.nina, USER.omar].map((uid) => ({
  userId: uid,
  channels: {
    email: { enabled: true, frequency: 'instant' },
    inApp: { enabled: true },
    push: { enabled: true },
  },
  types: {},
  createdAt: daysAgo(14),
  updatedAt: daysAgo(14),
}));

notifDb.notification_preferences.insertMany(prefs);
print(`✓ Inserted ${prefs.length} notification preferences`);

// ╔══════════════════════════════════════════╗
// ║  ANALYTICS DATABASE                      ║
// ╚══════════════════════════════════════════╝
const analyticsDb = db.getSiblingDB('eventpulse_analytics');

analyticsDb.analytics_events.deleteMany({});
analyticsDb.user_activity_logs.deleteMany({});
analyticsDb.daily_aggregations.deleteMany({});

// ── Analytics Events (page views, registrations, etc.) ──
// Generate 14 days of page view events for published events
const analyticsEvents = [];
const eventTypes = ['event.viewed', 'event.shared', 'ticket.reserved', 'ticket.confirmed'];
const sources = ['direct_link', 'social_media', 'search', 'email_campaign', 'referral'];
const countries = ['Israel', 'United States', 'Germany', 'United Kingdom', 'Japan', 'France'];
const cities = ['Tel Aviv', 'New York', 'Berlin', 'London', 'Tokyo', 'Paris'];
const userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
  'Mozilla/5.0 (Linux; Android 14)',
];

const publishedEvents = [
  EVENT.techconf,
  EVENT.sunsetBeats,
  EVENT.fundraising,
  EVENT.designWorkshop,
  EVENT.reactMeetup,
  EVENT.streetFood,
  EVENT.yoga,
];

for (let day = 13; day >= 0; day--) {
  for (const eventId of publishedEvents) {
    // 3-15 views per event per day
    const viewCount = Math.floor(Math.random() * 13) + 3;
    for (let v = 0; v < viewCount; v++) {
      const hour = Math.floor(Math.random() * 18) + 6; // between 6 AM and midnight
      const minute = Math.floor(Math.random() * 60);
      const ts = new Date(daysAgo(day));
      ts.setHours(hour, minute, 0, 0);

      const countryIdx = Math.floor(Math.random() * countries.length);
      const sourceIdx = Math.floor(Math.random() * sources.length);
      const uaIdx = Math.floor(Math.random() * userAgents.length);

      analyticsEvents.push({
        eventType: 'event.viewed',
        timestamp: ts,
        actor: {
          userId: Math.random() > 0.3 ? Object.values(USER)[Math.floor(Math.random() * 10)] : null,
          sessionId: `sess-${day}-${v}-${eventId.slice(-4)}`,
          userAgent: userAgents[uaIdx],
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        },
        target: { entityType: 'event', entityId: eventId, metadata: {} },
        context: {
          source: sources[sourceIdx],
          referrer: null,
          utm: { source: null, medium: null, campaign: null },
        },
        geo: {
          country: countries[countryIdx],
          city: cities[countryIdx],
          latitude: null,
          longitude: null,
        },
        createdAt: ts,
        updatedAt: ts,
      });
    }

    // 0-2 share events per event per day
    const shareCount = Math.floor(Math.random() * 3);
    for (let s = 0; s < shareCount; s++) {
      const ts = daysAgo(day);
      ts.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
      analyticsEvents.push({
        eventType: 'event.shared',
        timestamp: ts,
        actor: {
          userId: Object.values(USER)[Math.floor(Math.random() * 10)],
          sessionId: `sess-share-${day}-${s}`,
          userAgent: userAgents[0],
          ip: '10.0.0.1',
        },
        target: {
          entityType: 'event',
          entityId: eventId,
          metadata: {
            platform: ['twitter', 'linkedin', 'whatsapp'][Math.floor(Math.random() * 3)],
          },
        },
        context: {
          source: 'direct_link',
          referrer: null,
          utm: { source: null, medium: null, campaign: null },
        },
        geo: { country: 'Israel', city: 'Tel Aviv', latitude: null, longitude: null },
        createdAt: ts,
        updatedAt: ts,
      });
    }
  }
}

// Insert in batches (avoid large single insert)
const batchSize = 500;
for (let i = 0; i < analyticsEvents.length; i += batchSize) {
  analyticsDb.analytics_events.insertMany(analyticsEvents.slice(i, i + batchSize));
}
print(`✓ Inserted ${analyticsEvents.length} analytics events`);

// ── User Activity Logs ──
const activityLogs = [
  {
    userId: USER.alex,
    action: 'event.viewed',
    target: { type: 'event', id: EVENT.techconf, name: 'TechConf 2026' },
    metadata: {},
    timestamp: daysAgo(3),
  },
  {
    userId: USER.alex,
    action: 'ticket.purchased',
    target: { type: 'event', id: EVENT.techconf, name: 'TechConf 2026' },
    metadata: { tier: 'General Admission', amount: 99 },
    timestamp: daysAgo(2),
  },
  {
    userId: USER.alex,
    action: 'event.viewed',
    target: { type: 'event', id: EVENT.designWorkshop, name: 'Design Systems Workshop' },
    metadata: {},
    timestamp: daysAgo(4),
  },
  {
    userId: USER.alex,
    action: 'ticket.purchased',
    target: { type: 'event', id: EVENT.designWorkshop, name: 'Design Systems Workshop' },
    metadata: { tier: 'Workshop Seat', amount: 35 },
    timestamp: daysAgo(3),
  },
  {
    userId: USER.sarah,
    action: 'event.viewed',
    target: { type: 'event', id: EVENT.techconf, name: 'TechConf 2026' },
    metadata: {},
    timestamp: daysAgo(3),
  },
  {
    userId: USER.sarah,
    action: 'ticket.purchased',
    target: { type: 'event', id: EVENT.techconf, name: 'TechConf 2026' },
    metadata: { tier: 'VIP', amount: 199 },
    timestamp: daysAgo(2),
  },
  {
    userId: USER.gili,
    action: 'event.created',
    target: { type: 'event', id: EVENT.techconf, name: 'TechConf 2026' },
    metadata: {},
    timestamp: daysAgo(10),
  },
  {
    userId: USER.gili,
    action: 'event.published',
    target: { type: 'event', id: EVENT.techconf, name: 'TechConf 2026' },
    metadata: {},
    timestamp: daysAgo(3),
  },
  {
    userId: USER.emma,
    action: 'ticket.purchased',
    target: { type: 'event', id: EVENT.yoga, name: 'Morning Yoga' },
    metadata: { tier: 'Drop-in', amount: 10 },
    timestamp: daysAgo(3),
  },
  {
    userId: USER.nina,
    action: 'event.created',
    target: { type: 'event', id: EVENT.designWorkshop, name: 'Design Systems Workshop' },
    metadata: {},
    timestamp: daysAgo(8),
  },
].map((l) => ({ ...l, createdAt: l.timestamp, updatedAt: l.timestamp }));

analyticsDb.user_activity_logs.insertMany(activityLogs);
print(`✓ Inserted ${activityLogs.length} user activity logs`);

// ── Daily Aggregations (14 days for top events) ──
const topEvents = [
  { id: EVENT.techconf, type: 'event', baseViews: 40 },
  { id: EVENT.sunsetBeats, type: 'event', baseViews: 55 },
  { id: EVENT.fundraising, type: 'event', baseViews: 25 },
  { id: EVENT.designWorkshop, type: 'event', baseViews: 30 },
  { id: EVENT.streetFood, type: 'event', baseViews: 35 },
];

const aggregations = [];
for (let day = 13; day >= 0; day--) {
  const d = daysAgo(day);
  const dateString = dateStr(d);

  for (const evt of topEvents) {
    const jitter = () => Math.floor(Math.random() * 15) - 5;
    const views = Math.max(5, evt.baseViews + jitter());
    const uniqueViews = Math.floor(views * 0.7);
    const regs = Math.max(0, Math.floor(Math.random() * 8));

    // Hourly breakdown (simulate peak at 10-12 and 18-20)
    const hourly = {};
    for (let h = 0; h < 24; h++) {
      let weight = 1;
      if (h >= 10 && h <= 12) weight = 4;
      else if (h >= 18 && h <= 20) weight = 3;
      else if (h >= 8 && h <= 22) weight = 2;
      hourly[String(h)] = Math.floor(Math.random() * weight * 3);
    }

    const sourcesMap = {};
    sources.forEach((s) => {
      sourcesMap[s] = Math.floor(Math.random() * Math.ceil(views / 5));
    });

    const geoBreakdown = countries.map((c) => ({
      country: c,
      count: Math.floor(Math.random() * Math.ceil(views / 6)) + 1,
    }));

    aggregations.push({
      entityType: evt.type,
      entityId: evt.id,
      date: dateString,
      metrics: {
        views,
        uniqueViews,
        registrations: regs,
        cancellations: Math.floor(Math.random() * 2),
        shares: Math.floor(Math.random() * 5),
        chatMessages: Math.floor(Math.random() * 12),
        qaQuestions: Math.floor(Math.random() * 3),
        reviews: day < 7 ? Math.floor(Math.random() * 2) : 0,
        avgRating: day < 7 ? 3.5 + Math.random() * 1.5 : 0,
      },
      hourlyBreakdown: hourly,
      sources: sourcesMap,
      geoBreakdown,
      createdAt: d,
      updatedAt: d,
    });
  }
}

analyticsDb.daily_aggregations.insertMany(aggregations);
print(`✓ Inserted ${aggregations.length} daily aggregations`);

print('\n✅ MongoDB demo seed complete!');
