import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const DEMO_USER = {
  id: 'usr_demo_1',
  email: 'demo@eventpulse.local',
  firstName: 'Demo',
  lastName: 'User',
  avatarUrl: null,
  bio: 'Welcome to EventPulse demo mode.',
  location: 'Remote',
  googleId: null,
  role: 'organizer',
  isActive: true,
  emailVerified: true,
  createdAt: '2026-01-01T09:00:00.000Z',
  updatedAt: '2026-01-01T09:00:00.000Z',
};

const DEMO_TOKENS = {
  accessToken: 'demo_access_token',
  refreshToken: 'demo_refresh_token',
  expiresIn: 3600,
};

const DEMO_CATEGORIES = [
  {
    id: 'cat_tech',
    name: 'Technology',
    slug: 'technology',
    icon: 'cpu',
    parentId: null,
    sortOrder: 1,
  },
  { id: 'cat_music', name: 'Music', slug: 'music', icon: 'music', parentId: null, sortOrder: 2 },
  {
    id: 'cat_business',
    name: 'Business',
    slug: 'business',
    icon: 'briefcase',
    parentId: null,
    sortOrder: 3,
  },
  {
    id: 'cat_edu',
    name: 'Education',
    slug: 'education',
    icon: 'graduation-cap',
    parentId: null,
    sortOrder: 4,
  },
];

const DEMO_EVENTS = [
  {
    id: 'evt_tech_summit',
    title: 'Tech Summit 2026',
    description: 'A full-day conference about AI, cloud, and developer tooling.',
    agenda: '09:00 Keynote, 11:00 Panels, 14:00 Workshops',
    organizerId: 'usr_demo_1',
    organizationId: 'org_eventpulse',
    categoryId: 'cat_tech',
    status: 'live',
    visibility: 'public',
    accessCode: null,
    venueName: 'Innovation Hall',
    venueAddress: '123 Main St, Tel Aviv',
    latitude: 32.0853,
    longitude: 34.7818,
    isOnline: false,
    onlineUrl: null,
    startsAt: '2026-03-14T09:00:00.000Z',
    endsAt: '2026-03-14T18:00:00.000Z',
    timezone: 'Asia/Jerusalem',
    recurringParentId: null,
    recurrenceRule: null,
    coverImageUrl: null,
    maxCapacity: 500,
    registeredCount: 342,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-03-06T10:00:00.000Z',
    publishedAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'evt_music_night',
    title: 'City Music Night',
    description: 'Live performances from local artists and guest DJs.',
    agenda: 'Doors 18:00, First set 19:30',
    organizerId: 'usr_demo_1',
    organizationId: 'org_eventpulse',
    categoryId: 'cat_music',
    status: 'published',
    visibility: 'public',
    accessCode: null,
    venueName: 'Riverfront Stage',
    venueAddress: '88 River Rd, Haifa',
    latitude: 32.794,
    longitude: 34.9896,
    isOnline: false,
    onlineUrl: null,
    startsAt: '2026-03-22T18:00:00.000Z',
    endsAt: '2026-03-22T23:00:00.000Z',
    timezone: 'Asia/Jerusalem',
    recurringParentId: null,
    recurrenceRule: null,
    coverImageUrl: null,
    maxCapacity: 1200,
    registeredCount: 740,
    createdAt: '2026-01-05T10:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
    publishedAt: '2026-01-08T12:00:00.000Z',
  },
  {
    id: 'evt_founder_forum',
    title: 'Founder Growth Forum',
    description: 'Practical sessions on fundraising, go-to-market, and retention.',
    agenda: 'Networking + keynote + AMA',
    organizerId: 'usr_demo_1',
    organizationId: 'org_eventpulse',
    categoryId: 'cat_business',
    status: 'published',
    visibility: 'public',
    accessCode: null,
    venueName: 'Skyline Hub',
    venueAddress: '5 Startup Ave, Jerusalem',
    latitude: 31.7683,
    longitude: 35.2137,
    isOnline: true,
    onlineUrl: 'https://demo.eventpulse.local/live/founder-forum',
    startsAt: '2026-03-28T14:00:00.000Z',
    endsAt: '2026-03-28T20:00:00.000Z',
    timezone: 'Asia/Jerusalem',
    recurringParentId: null,
    recurrenceRule: null,
    coverImageUrl: null,
    maxCapacity: 350,
    registeredCount: 201,
    createdAt: '2026-02-02T11:00:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
    publishedAt: '2026-02-04T11:00:00.000Z',
  },
];

const DEMO_NOTIFICATIONS = [
  {
    id: 'not_1',
    userId: 'usr_demo_1',
    type: 'event_live',
    title: 'Tech Summit is live',
    body: 'Your event just switched to live mode.',
    data: { eventId: 'evt_tech_summit' },
    channels: {
      inApp: { sent: true, sentAt: '2026-03-07T19:50:00.000Z', readAt: null },
      email: { sent: false, sentAt: null, messageId: null },
      push: { sent: false, reason: null },
    },
    isRead: false,
    createdAt: '2026-03-07T19:50:00.000Z',
    expiresAt: null,
  },
  {
    id: 'not_2',
    userId: 'usr_demo_1',
    type: 'ticket_confirmed',
    title: 'Registration confirmed',
    body: 'A new attendee registration has been confirmed.',
    data: { eventId: 'evt_music_night' },
    channels: {
      inApp: { sent: true, sentAt: '2026-03-07T17:00:00.000Z', readAt: '2026-03-07T17:10:00.000Z' },
      email: { sent: true, sentAt: '2026-03-07T17:00:00.000Z', messageId: 'demo-msg-1' },
      push: { sent: false, reason: null },
    },
    isRead: true,
    createdAt: '2026-03-07T17:00:00.000Z',
    expiresAt: null,
  },
];

function makeResponse(
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
): AxiosResponse {
  return {
    config,
    data: {
      success: true,
      data,
    },
    headers: {},
    status,
    statusText: 'OK',
  };
}

function eventListData() {
  return {
    events: DEMO_EVENTS,
    pagination: {
      page: 1,
      limit: 20,
      total: DEMO_EVENTS.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

function matchEventById(url: string): (typeof DEMO_EVENTS)[number] {
  const match = url.match(/\/events\/([^/?]+)/);
  const eventId = match?.[1];
  return DEMO_EVENTS.find((event) => event.id === eventId) ?? DEMO_EVENTS[0];
}

function registrationData() {
  return {
    id: 'reg_demo_1',
    userId: DEMO_USER.id,
    eventId: DEMO_EVENTS[0].id,
    ticketTierId: 'tier_general',
    status: 'confirmed',
    registeredAt: '2026-03-07T18:30:00.000Z',
    cancelledAt: null,
    checkedInAt: null,
  };
}

export function resolveDemoResponse(config: InternalAxiosRequestConfig): AxiosResponse | null {
  const method = (config.method ?? 'get').toLowerCase();
  const rawUrl = config.url ?? '';
  // Strip /api/v1 prefix if present to normalize paths
  let url = rawUrl.startsWith('http') ? new URL(rawUrl).pathname : rawUrl;
  url = url.replace(/^\/api\/v1/, '');

  if (
    method === 'post' &&
    (url === '/auth/login' || url === '/auth/register' || url === '/auth/google')
  ) {
    return makeResponse(config, { user: DEMO_USER, tokens: DEMO_TOKENS });
  }

  if (method === 'post' && url === '/auth/refresh') {
    return makeResponse(config, { tokens: DEMO_TOKENS });
  }

  if (method === 'get' && url === '/auth/me') {
    return makeResponse(config, { user: DEMO_USER });
  }

  if (url.startsWith('/auth/')) {
    return makeResponse(config, {});
  }

  if (method === 'get' && url === '/categories') {
    return makeResponse(config, { categories: DEMO_CATEGORIES });
  }

  if (method === 'get' && url === '/events/trending') {
    return makeResponse(config, { events: DEMO_EVENTS.slice(0, 3) });
  }

  if (method === 'get' && url.startsWith('/events/nearby')) {
    return makeResponse(config, { events: DEMO_EVENTS });
  }

  if (
    method === 'get' &&
    (url === '/events/me/organized' ||
      url === '/events/me/attending' ||
      url.startsWith('/events?') ||
      url === '/events')
  ) {
    return makeResponse(config, eventListData());
  }

  if (method === 'get' && /\/events\/[^/]+$/.test(url)) {
    return makeResponse(config, { event: matchEventById(url) });
  }

  if (method === 'get' && /\/events\/[^/]+\/tiers$/.test(url)) {
    return makeResponse(config, {
      tiers: [
        {
          id: 'tier_general',
          eventId: matchEventById(url).id,
          name: 'General Admission',
          description: 'Main floor access',
          price: 49,
          capacity: 500,
          registeredCount: 280,
          salesStart: '2026-01-01T00:00:00.000Z',
          salesEnd: '2026-03-20T23:59:59.000Z',
          isActive: true,
          sortOrder: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
  }

  if (method === 'post' && /\/events\/[^/]+\/register$/.test(url)) {
    const registration = registrationData();
    return makeResponse(config, {
      registration: {
        ...registration,
        event: {
          id: DEMO_EVENTS[0].id,
          title: DEMO_EVENTS[0].title,
          startsAt: DEMO_EVENTS[0].startsAt,
        },
        ticketTier: { id: 'tier_general', name: 'General Admission', price: 49 },
        payment: {
          id: 'pay_demo_1',
          amount: 49,
          currency: 'USD',
          status: 'completed',
          transactionId: 'txn_demo_1',
          method: 'simulated_card',
        },
        ticket: {
          ticketCode: 'EVP-DEMO-0001',
          qrCodeUrl: null,
          issuedAt: '2026-03-07T18:30:01.000Z',
        },
      },
    });
  }

  if (method === 'get' && url === '/registrations/me') {
    return makeResponse(config, { registrations: [registrationData()] });
  }

  if (method === 'get' && /\/registrations\/[^/]+$/.test(url)) {
    return makeResponse(config, {
      registration: {
        ...registrationData(),
        event: {
          id: DEMO_EVENTS[0].id,
          title: DEMO_EVENTS[0].title,
          startsAt: DEMO_EVENTS[0].startsAt,
        },
        ticketTier: { id: 'tier_general', name: 'General Admission', price: 49 },
        payment: {
          id: 'pay_demo_1',
          amount: 49,
          currency: 'USD',
          status: 'completed',
          transactionId: 'txn_demo_1',
          method: 'simulated_card',
        },
        ticket: {
          ticketCode: 'EVP-DEMO-0001',
          qrCodeUrl: null,
          issuedAt: '2026-03-07T18:30:01.000Z',
        },
      },
    });
  }

  if (method === 'get' && /\/events\/[^/]+\/attendees$/.test(url)) {
    return makeResponse(config, {
      attendees: [
        {
          userId: DEMO_USER.id,
          firstName: DEMO_USER.firstName,
          lastName: DEMO_USER.lastName,
          status: 'confirmed',
        },
      ],
    });
  }

  if (method === 'get' && url === '/notifications/unread-count') {
    const count = DEMO_NOTIFICATIONS.filter((notification) => !notification.isRead).length;
    return makeResponse(config, { count });
  }

  if (
    method === 'get' &&
    url.startsWith('/notifications') &&
    !url.includes('preferences') &&
    !url.includes('unread-count')
  ) {
    return makeResponse(config, {
      notifications: DEMO_NOTIFICATIONS,
      pagination: {
        page: 1,
        limit: 20,
        total: DEMO_NOTIFICATIONS.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }

  if (method === 'get' && url === '/notifications/preferences') {
    return makeResponse(config, {
      preferences: {
        id: 'notif_pref_demo',
        userId: DEMO_USER.id,
        channels: {
          email: { enabled: true, frequency: 'daily_digest' },
          inApp: { enabled: true },
          push: { enabled: false },
        },
        types: {
          event_live: { email: true, inApp: true, push: false },
          ticket_confirmed: { email: true, inApp: true, push: false },
        },
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    });
  }

  if (url.startsWith('/notifications/')) {
    return makeResponse(config, {});
  }

  if (method === 'get' && url === '/users/me') {
    return makeResponse(config, { user: DEMO_USER });
  }

  if (method === 'put' && (url === '/users/me' || url === '/users/me/avatar')) {
    return makeResponse(config, { user: DEMO_USER });
  }

  if (method === 'get' && url === '/users/me/interests') {
    return makeResponse(config, { interests: ['cat_tech', 'cat_business'] });
  }

  if (method === 'put' && url === '/users/me/interests') {
    return makeResponse(config, {});
  }

  if (method === 'get' && /\/users\/[^/]+$/.test(url)) {
    return makeResponse(config, { user: DEMO_USER });
  }

  if (method === 'get' && url === '/analytics/dashboard') {
    return makeResponse(config, {
      stats: {
        totalEvents: 12,
        totalAttendees: 1734,
        totalRevenue: 48620,
        conversionRate: 19.7,
      },
      registrationTimeline: [
        { date: 'Mar 1', count: 34 },
        { date: 'Mar 2', count: 42 },
        { date: 'Mar 3', count: 38 },
        { date: 'Mar 4', count: 57 },
        { date: 'Mar 5', count: 61 },
        { date: 'Mar 6', count: 49 },
        { date: 'Mar 7', count: 73 },
      ],
      trafficSources: [
        { source: 'discovery_feed', count: 530 },
        { source: 'search', count: 404 },
        { source: 'direct_link', count: 280 },
        { source: 'notification', count: 190 },
      ],
    });
  }

  if (method === 'get' && /\/analytics\/events\/[^/]+\/overview$/.test(url)) {
    const event = matchEventById(url);
    return makeResponse(config, {
      eventId: event.id,
      period: { from: '2026-03-01', to: '2026-03-07' },
      overview: {
        totalViews: 4000,
        uniqueViews: 2300,
        totalRegistrations: 340,
        cancellations: 11,
        conversionRate: 14.8,
        capacityUsed: 68,
        avgRating: 4.6,
        totalReviews: 84,
        chatMessages: 210,
        qaQuestions: 42,
      },
      trend: { viewsChange: 18.2, registrationsChange: 12.4 },
      topSources: [
        { source: 'discovery_feed', count: 1800, percentage: 45 },
        { source: 'search', count: 1320, percentage: 33 },
        { source: 'direct_link', count: 880, percentage: 22 },
      ],
    });
  }

  if (
    method === 'get' &&
    /\/analytics\/events\/[^/]+\/(registrations|sources|geo|tiers)$/.test(url)
  ) {
    return makeResponse(config, {
      items: [{ key: 'demo', value: 1 }],
    });
  }

  if (method === 'get' && /\/events\/[^/]+\/chat\/rooms$/.test(url)) {
    return makeResponse(config, {
      rooms: [
        {
          id: 'room_main',
          roomId: 'main',
          eventId: matchEventById(url).id,
          type: 'event_chat',
          name: 'Main Chat',
          participants: [
            { userId: DEMO_USER.id, joinedAt: '2026-03-07T18:00:00.000Z', role: 'organizer' },
          ],
          participantCount: 89,
          isActive: true,
          settings: {
            slowMode: false,
            slowModeInterval: 0,
            onlyOrganizersCanPost: false,
            maxMessageLength: 1000,
          },
          createdAt: '2026-03-01T00:00:00.000Z',
          updatedAt: '2026-03-07T18:00:00.000Z',
        },
      ],
    });
  }

  if (method === 'get' && /\/events\/[^/]+\/chat\/messages/.test(url)) {
    return makeResponse(config, {
      messages: [
        {
          id: 'msg_1',
          roomId: 'room_main',
          roomType: 'event_chat',
          sender: {
            userId: DEMO_USER.id,
            firstName: DEMO_USER.firstName,
            lastName: DEMO_USER.lastName,
            avatarUrl: null,
          },
          content: 'Welcome to demo mode. Backend is currently offline.',
          type: 'system',
          replyTo: null,
          reactions: [],
          isEdited: false,
          isDeleted: false,
          createdAt: '2026-03-07T18:35:00.000Z',
          updatedAt: '2026-03-07T18:35:00.000Z',
        },
      ],
      pagination: {
        hasMore: false,
        nextCursor: null,
      },
    });
  }

  if (method === 'post' && /\/events\/[^/]+\/chat\/messages$/.test(url)) {
    return makeResponse(config, {
      message: {
        id: `msg_${Date.now()}`,
        roomId: 'room_main',
        roomType: 'event_chat',
        sender: {
          userId: DEMO_USER.id,
          firstName: DEMO_USER.firstName,
          lastName: DEMO_USER.lastName,
          avatarUrl: null,
        },
        content: 'Demo reply',
        type: 'text',
        replyTo: null,
        reactions: [],
        isEdited: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  if (method === 'get' && /\/events\/[^/]+\/qa$/.test(url)) {
    return makeResponse(config, {
      questions: [
        {
          id: 'qa_1',
          eventId: matchEventById(url).id,
          author: {
            userId: DEMO_USER.id,
            firstName: DEMO_USER.firstName,
            lastName: DEMO_USER.lastName,
            avatarUrl: null,
          },
          question: 'Is this app running without backend?',
          status: 'answered',
          upvotes: [DEMO_USER.id],
          upvoteCount: 1,
          answer: {
            content: 'Yes, this is local demo mode fallback data.',
            answeredBy: {
              userId: DEMO_USER.id,
              firstName: DEMO_USER.firstName,
              lastName: DEMO_USER.lastName,
            },
            answeredAt: '2026-03-07T18:40:00.000Z',
          },
          isPinned: true,
          createdAt: '2026-03-07T18:36:00.000Z',
          updatedAt: '2026-03-07T18:40:00.000Z',
        },
      ],
    });
  }

  if (method === 'post' && /\/events\/[^/]+\/qa$/.test(url)) {
    return makeResponse(config, {
      question: {
        id: `qa_${Date.now()}`,
        eventId: matchEventById(url).id,
        author: {
          userId: DEMO_USER.id,
          firstName: DEMO_USER.firstName,
          lastName: DEMO_USER.lastName,
          avatarUrl: null,
        },
        question: 'Demo question',
        status: 'pending',
        upvotes: [],
        upvoteCount: 0,
        answer: null,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  if (method === 'post' && /\/events\/[^/]+\/qa\/[^/]+\/(upvote|answer)$/.test(url)) {
    return makeResponse(config, {});
  }

  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    return makeResponse(config, {});
  }

  return null;
}
