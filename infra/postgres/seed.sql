-- ============================================
-- EventPulse Demo Seed Data
-- Run after init.sql has created the schema
-- ============================================

-- ── bcrypt hash of "Demo@1234" ──
-- Generated via bcryptjs.hashSync('Demo@1234', 10)
-- All demo users share this password for easy testing.

-- ============================================
-- DEMO USERS
-- ============================================
INSERT INTO users (id, email, password_hash, first_name, last_name, avatar_url, bio, location, role, is_active, email_verified) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'gili@eventpulse.dev',    '$2a$10$2WWDC/05BmSw2Xy243LJRO/2HBOXX9QhyNSvFaAI8EZbou3/UrUwO', 'Gili',   'Cohen',     'https://api.dicebear.com/7.x/avataaars/svg?seed=gili',   'Full-stack developer & event enthusiast.', 'Tel Aviv, Israel',    'organizer', true, true),
  ('a0000000-0000-0000-0000-000000000002', 'maya@eventpulse.dev',    '$2a$10$2WWDC/05BmSw2Xy243LJRO/2HBOXX9QhyNSvFaAI8EZbou3/UrUwO', 'Maya',   'Levi',      'https://api.dicebear.com/7.x/avataaars/svg?seed=maya',   'Community manager who brings people together.', 'Haifa, Israel',   'organizer', true, true),
  ('a0000000-0000-0000-0000-000000000003', 'alex@eventpulse.dev',    '$2a$10$2WWDC/05BmSw2Xy243LJRO/2HBOXX9QhyNSvFaAI8EZbou3/UrUwO', 'Alex',   'Rodriguez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',   'Music lover and tech geek.', 'New York, USA',               'attendee',  true, true),
  ('a0000000-0000-0000-0000-000000000004', 'sarah@eventpulse.dev',   '$2a$10$2WWDC/05BmSw2Xy243LJRO/2HBOXX9QhyNSvFaAI8EZbou3/UrUwO', 'Sarah',  'Kim',       'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',  'UX designer passionate about accessibility.', 'London, UK',      'attendee',  true, true),
  ('a0000000-0000-0000-0000-000000000005', 'omar@eventpulse.dev',    '$2a$10$2WWDC/05BmSw2Xy243LJRO/2HBOXX9QhyNSvFaAI8EZbou3/UrUwO', 'Omar',   'Hassan',    'https://api.dicebear.com/7.x/avataaars/svg?seed=omar',   'Startup founder and AI researcher.', 'Berlin, Germany',         'organizer', true, true),
  ('a0000000-0000-0000-0000-000000000006', 'emma@eventpulse.dev',    '$2a$10$2WWDC/05BmSw2Xy243LJRO/2HBOXX9QhyNSvFaAI8EZbou3/UrUwO', 'Emma',   'Watson',    'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',   'Fitness coach and wellness advocate.', 'Sydney, Australia',       'attendee',  true, true),
  ('a0000000-0000-0000-0000-000000000007', 'david@eventpulse.dev',   '$2a$10$2WWDC/05BmSw2Xy243LJRO/2HBOXX9QhyNSvFaAI8EZbou3/UrUwO', 'David',  'Park',      'https://api.dicebear.com/7.x/avataaars/svg?seed=david',  'DevOps engineer who automates everything.', 'Seoul, South Korea',  'attendee',  true, true),
  ('a0000000-0000-0000-0000-000000000008', 'nina@eventpulse.dev',    '$2a$10$2WWDC/05BmSw2Xy243LJRO/2HBOXX9QhyNSvFaAI8EZbou3/UrUwO', 'Nina',   'Petrova',   'https://api.dicebear.com/7.x/avataaars/svg?seed=nina',   'Art curator and creative director.', 'Paris, France',           'organizer', true, true),
  ('a0000000-0000-0000-0000-000000000009', 'james@eventpulse.dev',   '$2a$10$2WWDC/05BmSw2Xy243LJRO/2HBOXX9QhyNSvFaAI8EZbou3/UrUwO', 'James',  'Murphy',    'https://api.dicebear.com/7.x/avataaars/svg?seed=james',  'Chef and food entrepreneur.', 'Dublin, Ireland',             'organizer', true, true),
  ('a0000000-0000-0000-0000-000000000010', 'yuki@eventpulse.dev',    '$2a$10$2WWDC/05BmSw2Xy243LJRO/2HBOXX9QhyNSvFaAI8EZbou3/UrUwO', 'Yuki',   'Tanaka',    'https://api.dicebear.com/7.x/avataaars/svg?seed=yuki',   'Cloud architect and open-source contributor.', 'Tokyo, Japan',    'attendee',  true, true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- USER INTERESTS
-- ============================================
INSERT INTO user_interests (user_id, category_id) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003'),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005'),
  ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005'),
  ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000012'),
  ('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000007'),
  ('a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000013'),
  ('a0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ============================================
-- ORGANIZATIONS
-- ============================================
INSERT INTO organizations (id, name, slug, description, logo_url, website, created_by, is_verified) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'TechTLV Community', 'techtlv', 'The largest tech community in Tel Aviv. Weekly meetups, hackathons, and conferences.', 'https://api.dicebear.com/7.x/identicon/svg?seed=techtlv', 'https://techtlv.dev', 'a0000000-0000-0000-0000-000000000001', true),
  ('b0000000-0000-0000-0000-000000000002', 'Creative Minds Collective', 'creative-minds', 'A global community of designers, artists, and creative technologists.', 'https://api.dicebear.com/7.x/identicon/svg?seed=creative', 'https://creativeminds.art', 'a0000000-0000-0000-0000-000000000008', true),
  ('b0000000-0000-0000-0000-000000000003', 'Startup Nation Hub', 'startup-nation', 'Connecting entrepreneurs, investors, and innovators worldwide.', 'https://api.dicebear.com/7.x/identicon/svg?seed=startup', 'https://startupnation.io', 'a0000000-0000-0000-0000-000000000005', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO organization_members (organization_id, user_id, role) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'owner'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'admin'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008', 'owner'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'owner'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'member')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- ============================================
-- EVENTS
-- ============================================
-- Event 1: Published — upcoming tech conference
INSERT INTO events (id, title, description, agenda, organizer_id, organization_id, category_id, status, visibility, venue_name, venue_address, latitude, longitude, is_online, starts_at, ends_at, timezone, cover_image_url, max_capacity, registered_count, published_at) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'TechConf 2026 — The Future of AI',
   'Join 500+ developers for a day of cutting-edge AI talks, workshops, and networking. Featuring speakers from Google, Meta, and OpenAI.',
   E'09:00 - Registration & Coffee\n09:30 - Keynote: The Next Wave of AI\n10:30 - Workshop: Building with LLMs\n12:00 - Lunch & Networking\n13:30 - Panel: Ethics in AI\n15:00 - Lightning Talks\n16:30 - Closing & Happy Hour',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000012',
   'published', 'public', 'Tel Aviv Convention Center', 'Rokach Blvd 101, Tel Aviv', 32.1093, 34.8003, false,
   NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '8 hours', 'Asia/Jerusalem',
   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200', 500, 47, NOW() - INTERVAL '3 days');

-- Event 2: Published — music festival
INSERT INTO events (id, title, description, agenda, organizer_id, category_id, status, visibility, venue_name, venue_address, latitude, longitude, is_online, starts_at, ends_at, timezone, cover_image_url, max_capacity, registered_count, published_at) VALUES
  ('e0000000-0000-0000-0000-000000000002', 'Sunset Beats Festival 2026',
   'Three days of incredible music on the beach. Electronic, indie, and world music across 4 stages.',
   E'Day 1: Electronic Stage (DJ sets)\nDay 2: Indie Showcase\nDay 3: World Music Finale',
   'a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000022',
   'published', 'public', 'Gordon Beach', 'Gordon Beach, Tel Aviv', 32.0853, 34.7681, false,
   NOW() + INTERVAL '30 days', NOW() + INTERVAL '33 days', 'Asia/Jerusalem',
   'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200', 2000, 312, NOW() - INTERVAL '7 days');

-- Event 3: Published — online webinar
INSERT INTO events (id, title, description, organizer_id, organization_id, category_id, status, visibility, is_online, online_url, starts_at, ends_at, timezone, cover_image_url, max_capacity, registered_count, published_at) VALUES
  ('e0000000-0000-0000-0000-000000000003', 'Startup Fundraising Masterclass',
   'Learn the secrets of raising your seed round. Live Q&A with VCs from Sequoia, a16z, and Y Combinator alumni.',
   'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000031',
   'published', 'public', true, 'https://zoom.us/j/demo',
   NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '2 hours', 'UTC',
   'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200', 300, 89, NOW() - INTERVAL '2 days');

-- Event 4: LIVE right now — design workshop
INSERT INTO events (id, title, description, organizer_id, organization_id, category_id, status, visibility, venue_name, venue_address, latitude, longitude, is_online, online_url, starts_at, ends_at, timezone, cover_image_url, max_capacity, registered_count, published_at) VALUES
  ('e0000000-0000-0000-0000-000000000004', 'Design Systems Workshop — Live!',
   'Hands-on workshop building a design system from scratch with Figma and React.',
   'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005',
   'live', 'public', 'WeWork Sarona', 'Azrieli Sarona Tower, Tel Aviv', 32.0714, 34.7925, true, 'https://zoom.us/j/demo-design',
   NOW() - INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 'Asia/Jerusalem',
   'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200', 100, 67, NOW() - INTERVAL '5 days');

-- Event 5: ENDED — past meetup with reviews
INSERT INTO events (id, title, description, organizer_id, organization_id, category_id, status, visibility, venue_name, venue_address, latitude, longitude, is_online, starts_at, ends_at, timezone, cover_image_url, max_capacity, registered_count, published_at) VALUES
  ('e0000000-0000-0000-0000-000000000005', 'React Israel Meetup #42',
   'Monthly meetup for React developers in Israel. This month: Server Components deep-dive.',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000011',
   'ended', 'public', 'Google Campus TLV', 'Electra Tower, Yigal Alon 98, Tel Aviv', 32.0689, 34.7922, false,
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '3 hours', 'Asia/Jerusalem',
   'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200', 120, 98, NOW() - INTERVAL '14 days');

-- Event 6: DRAFT
INSERT INTO events (id, title, description, organizer_id, category_id, status, visibility, venue_name, is_online, starts_at, ends_at, timezone, max_capacity) VALUES
  ('e0000000-0000-0000-0000-000000000006', 'Cloud Native Day 2026',
   'A full day of Kubernetes, serverless, and cloud-native architecture talks.',
   'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000013',
   'draft', 'public', 'TBD', false,
   NOW() + INTERVAL '60 days', NOW() + INTERVAL '60 days' + INTERVAL '8 hours', 'UTC', 200);

-- Event 7: Published — food event
INSERT INTO events (id, title, description, organizer_id, category_id, status, visibility, venue_name, venue_address, latitude, longitude, is_online, starts_at, ends_at, timezone, cover_image_url, max_capacity, registered_count, published_at) VALUES
  ('e0000000-0000-0000-0000-000000000007', 'Street Food Festival Tel Aviv',
   'Taste the best street food from 30+ vendors. Live cooking demos, competitions, and unlimited tastings.',
   'a0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000006',
   'published', 'public', 'Sarona Market Outdoor', 'Sarona, Tel Aviv', 32.0722, 34.7876, false,
   NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '6 hours', 'Asia/Jerusalem',
   'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200', 1000, 203, NOW() - INTERVAL '1 day');

-- Event 8: Published — wellness event
INSERT INTO events (id, title, description, organizer_id, category_id, status, visibility, venue_name, venue_address, latitude, longitude, is_online, starts_at, ends_at, timezone, cover_image_url, max_capacity, registered_count, published_at) VALUES
  ('e0000000-0000-0000-0000-000000000008', 'Morning Yoga & Meditation on the Beach',
   'Start your weekend with a sunrise yoga session followed by guided meditation. All levels welcome.',
   'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000007',
   'published', 'public', 'Frishman Beach', 'Frishman Beach, Tel Aviv', 32.0811, 34.7647, false,
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 'Asia/Jerusalem',
   'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200', 50, 32, NOW() - INTERVAL '5 days');

-- ============================================
-- EVENT TAGS
-- ============================================
INSERT INTO event_tags (event_id, tag) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'AI'),
  ('e0000000-0000-0000-0000-000000000001', 'Machine Learning'),
  ('e0000000-0000-0000-0000-000000000001', 'Conference'),
  ('e0000000-0000-0000-0000-000000000001', 'Networking'),
  ('e0000000-0000-0000-0000-000000000002', 'Music'),
  ('e0000000-0000-0000-0000-000000000002', 'Festival'),
  ('e0000000-0000-0000-0000-000000000002', 'Beach'),
  ('e0000000-0000-0000-0000-000000000003', 'Startups'),
  ('e0000000-0000-0000-0000-000000000003', 'Fundraising'),
  ('e0000000-0000-0000-0000-000000000003', 'Webinar'),
  ('e0000000-0000-0000-0000-000000000004', 'Design'),
  ('e0000000-0000-0000-0000-000000000004', 'Workshop'),
  ('e0000000-0000-0000-0000-000000000004', 'Figma'),
  ('e0000000-0000-0000-0000-000000000005', 'React'),
  ('e0000000-0000-0000-0000-000000000005', 'Meetup'),
  ('e0000000-0000-0000-0000-000000000005', 'JavaScript'),
  ('e0000000-0000-0000-0000-000000000007', 'Food'),
  ('e0000000-0000-0000-0000-000000000007', 'Festival'),
  ('e0000000-0000-0000-0000-000000000008', 'Yoga'),
  ('e0000000-0000-0000-0000-000000000008', 'Wellness'),
  ('e0000000-0000-0000-0000-000000000008', 'Meditation');

-- ============================================
-- TICKET TIERS
-- ============================================
INSERT INTO ticket_tiers (id, event_id, name, description, price, capacity, registered_count, is_active, sort_order) VALUES
  -- TechConf 2026 tiers
  ('d0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Early Bird', 'Limited early bird pricing — all sessions + lunch.', 49.00, 100, 100, false, 0),
  ('d0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'General Admission', 'Full access to all sessions, workshops, and networking.', 99.00, 300, 37, true, 1),
  ('d0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'VIP', 'Priority seating, speaker dinner, exclusive swag bag.', 199.00, 50, 10, true, 2),
  ('d0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'Student', 'Valid student ID required at check-in.', 25.00, 50, 0, true, 3),
  -- Sunset Beats
  ('d0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', 'Day Pass', 'Access to one day of your choice.', 45.00, 500, 112, true, 0),
  ('d0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000002', '3-Day Pass', 'Full festival access for all three days.', 120.00, 1500, 200, true, 1),
  -- Startup Masterclass (free)
  ('d0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000003', 'Free', 'Free online attendance.', 0.00, 300, 89, true, 0),
  -- Design Workshop
  ('d0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000004', 'Workshop Seat', 'Hands-on participation with materials provided.', 35.00, 100, 67, true, 0),
  -- React meetup (ended, free)
  ('d0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000005', 'Free', 'Free community meetup.', 0.00, 120, 98, true, 0),
  -- Street Food Festival
  ('d0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000007', 'General Entry', 'Entry to the festival grounds.', 15.00, 800, 153, true, 0),
  ('d0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000007', 'All-You-Can-Taste', 'Unlimited tastings from all vendors.', 55.00, 200, 50, true, 1),
  -- Yoga
  ('d0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000008', 'Drop-in', 'Single session.', 10.00, 50, 32, true, 0);

-- ============================================
-- REGISTRATIONS
-- ============================================
INSERT INTO registrations (id, user_id, event_id, ticket_tier_id, status, registered_at) VALUES
  -- React Meetup (ended)
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000009', 'checked_in', NOW() - INTERVAL '10 days'),
  ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000009', 'checked_in', NOW() - INTERVAL '10 days'),
  ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000009', 'confirmed', NOW() - INTERVAL '9 days'),
  ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000009', 'checked_in', NOW() - INTERVAL '8 days'),
  -- Design Workshop (live)
  ('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000008', 'checked_in', NOW() - INTERVAL '4 days'),
  ('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000008', 'confirmed', NOW() - INTERVAL '3 days'),
  -- TechConf
  ('f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'confirmed', NOW() - INTERVAL '2 days'),
  ('f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'confirmed', NOW() - INTERVAL '2 days'),
  ('f0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'confirmed', NOW() - INTERVAL '1 day'),
  ('f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'confirmed', NOW() - INTERVAL '1 day'),
  -- Yoga
  ('f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000012', 'confirmed', NOW() - INTERVAL '3 days'),
  -- Street Food
  ('f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000011', 'confirmed', NOW() - INTERVAL '1 day')
ON CONFLICT (event_id, user_id) DO NOTHING;

-- ============================================
-- PAYMENTS
-- ============================================
INSERT INTO payments (registration_id, user_id, amount, currency, status, method, transaction_id, metadata, paid_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 0.00, 'USD', 'completed', 'free', 'txn_free_rm42_001', '{}', NOW() - INTERVAL '10 days'),
  ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 0.00, 'USD', 'completed', 'free', 'txn_free_rm42_002', '{}', NOW() - INTERVAL '10 days'),
  ('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 35.00, 'USD', 'completed', 'simulated_card', 'txn_sim_dsw1_001', '{"last4":"4242","brand":"Visa"}', NOW() - INTERVAL '4 days'),
  ('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 35.00, 'USD', 'completed', 'simulated_card', 'txn_sim_dsw1_002', '{"last4":"1234","brand":"Mastercard"}', NOW() - INTERVAL '3 days'),
  ('f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 99.00, 'USD', 'completed', 'simulated_card', 'txn_sim_tc26_001', '{"last4":"4242","brand":"Visa"}', NOW() - INTERVAL '2 days'),
  ('f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 199.00, 'USD', 'completed', 'simulated_card', 'txn_sim_tc26_002', '{"last4":"5678","brand":"Amex"}', NOW() - INTERVAL '2 days'),
  ('f0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000006', 99.00, 'USD', 'completed', 'simulated_card', 'txn_sim_tc26_003', '{"last4":"9012","brand":"Visa"}', NOW() - INTERVAL '1 day'),
  ('f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000010', 99.00, 'USD', 'completed', 'simulated_card', 'txn_sim_tc26_004', '{"last4":"3456","brand":"Visa"}', NOW() - INTERVAL '1 day'),
  ('f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000006', 10.00, 'USD', 'completed', 'simulated_card', 'txn_sim_yoga_001', '{"last4":"7890","brand":"Mastercard"}', NOW() - INTERVAL '3 days'),
  ('f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000009', 55.00, 'USD', 'completed', 'simulated_card', 'txn_sim_sf_001', '{"last4":"2468","brand":"Visa"}', NOW() - INTERVAL '1 day');

-- ============================================
-- TICKETS (QR codes)
-- ============================================
INSERT INTO tickets (registration_id, ticket_code, qr_code_data, is_used, issued_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'EP-RM42-0001', '{"reg":"f0000000-0000-0000-0000-000000000001","event":"e5","code":"EP-RM42-0001"}', true, NOW() - INTERVAL '10 days'),
  ('f0000000-0000-0000-0000-000000000002', 'EP-RM42-0002', '{"reg":"f0000000-0000-0000-0000-000000000002","event":"e5","code":"EP-RM42-0002"}', true, NOW() - INTERVAL '10 days'),
  ('f0000000-0000-0000-0000-000000000005', 'EP-DSW1-0001', '{"reg":"f0000000-0000-0000-0000-000000000005","event":"e4","code":"EP-DSW1-0001"}', true, NOW() - INTERVAL '4 days'),
  ('f0000000-0000-0000-0000-000000000006', 'EP-DSW1-0002', '{"reg":"f0000000-0000-0000-0000-000000000006","event":"e4","code":"EP-DSW1-0002"}', false, NOW() - INTERVAL '3 days'),
  ('f0000000-0000-0000-0000-000000000007', 'EP-TC26-0001', '{"reg":"f0000000-0000-0000-0000-000000000007","event":"e1","code":"EP-TC26-0001"}', false, NOW() - INTERVAL '2 days'),
  ('f0000000-0000-0000-0000-000000000008', 'EP-TC26-0002', '{"reg":"f0000000-0000-0000-0000-000000000008","event":"e1","code":"EP-TC26-0002"}', false, NOW() - INTERVAL '2 days'),
  ('f0000000-0000-0000-0000-000000000009', 'EP-TC26-0003', '{"reg":"f0000000-0000-0000-0000-000000000009","event":"e1","code":"EP-TC26-0003"}', false, NOW() - INTERVAL '1 day'),
  ('f0000000-0000-0000-0000-000000000010', 'EP-TC26-0004', '{"reg":"f0000000-0000-0000-0000-000000000010","event":"e1","code":"EP-TC26-0004"}', false, NOW() - INTERVAL '1 day')
ON CONFLICT (ticket_code) DO NOTHING;

-- ============================================
-- EVENT REVIEWS (for ended event)
-- ============================================
INSERT INTO event_reviews (event_id, user_id, rating, comment) VALUES
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 5, 'Incredible deep-dive into Server Components! The live coding demo was mind-blowing. Already looking forward to #43.'),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 4, 'Great content and speakers. Venue was a bit cramped but the knowledge shared was top-notch.'),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000007', 5, 'Best React meetup in Israel, hands down. The community is so welcoming!'),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000010', 4, 'Learned a lot about RSC patterns. The Q&A session was particularly insightful.')
ON CONFLICT (event_id, user_id) DO NOTHING;
