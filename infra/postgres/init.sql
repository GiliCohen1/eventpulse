-- ============================================
-- EventPulse PostgreSQL Schema
-- Matches TypeORM entity definitions exactly
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('attendee', 'organizer', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE org_member_role AS ENUM ('owner', 'admin', 'member'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE event_status AS ENUM ('draft', 'published', 'live', 'ended', 'cancelled', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE event_visibility AS ENUM ('public', 'private'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE media_type AS ENUM ('image', 'video', 'document'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'checked_in', 'waitlisted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('simulated_card', 'free'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  location VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  role user_role DEFAULT 'attendee',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(500),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role org_member_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0
);

-- ============================================
-- EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  agenda TEXT,
  organizer_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  category_id UUID REFERENCES categories(id),
  status event_status DEFAULT 'draft',
  visibility event_visibility DEFAULT 'public',
  access_code VARCHAR(50),
  venue_name VARCHAR(255),
  venue_address TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  is_online BOOLEAN DEFAULT FALSE,
  online_url VARCHAR(500),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(100) DEFAULT 'UTC',
  recurring_parent_id UUID,
  recurrence_rule VARCHAR(255),
  cover_image_url VARCHAR(500),
  max_capacity INT,
  registered_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);

-- ============================================
-- EVENT TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS event_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_tags_event ON event_tags(event_id);

-- ============================================
-- EVENT MEDIA
-- ============================================
CREATE TABLE IF NOT EXISTS event_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  type media_type DEFAULT 'image',
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TICKET TIERS
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  capacity INT NOT NULL,
  registered_count INT DEFAULT 0,
  sales_start TIMESTAMPTZ,
  sales_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event ON ticket_tiers(event_id);

-- ============================================
-- EVENT REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS event_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_event ON event_reviews(event_id);

-- ============================================
-- REGISTRATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_tier_id UUID NOT NULL REFERENCES ticket_tiers(id),
  status registration_status DEFAULT 'pending',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  method payment_method,
  transaction_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_registration ON payments(registration_id);

-- ============================================
-- TICKETS (QR Codes)
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  ticket_code VARCHAR(50) UNIQUE NOT NULL,
  qr_code_data TEXT,
  qr_code_url VARCHAR(500),
  is_used BOOLEAN DEFAULT FALSE,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER INTERESTS
-- ============================================
CREATE TABLE IF NOT EXISTS user_interests (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, category_id)
);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['users', 'organizations', 'events', 'event_reviews'])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- ============================================
-- SEED CATEGORIES
-- ============================================
INSERT INTO categories (id, name, slug, icon, parent_id, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Technology', 'technology', '💻', NULL, 1),
  ('c0000000-0000-0000-0000-000000000002', 'Music', 'music', '🎵', NULL, 2),
  ('c0000000-0000-0000-0000-000000000003', 'Business', 'business', '💼', NULL, 3),
  ('c0000000-0000-0000-0000-000000000004', 'Sports', 'sports', '⚽', NULL, 4),
  ('c0000000-0000-0000-0000-000000000005', 'Art & Design', 'art-design', '🎨', NULL, 5),
  ('c0000000-0000-0000-0000-000000000006', 'Food & Drink', 'food-drink', '🍕', NULL, 6),
  ('c0000000-0000-0000-0000-000000000007', 'Health & Wellness', 'health-wellness', '🏥', NULL, 7),
  ('c0000000-0000-0000-0000-000000000008', 'Education', 'education', '📚', NULL, 8),
  ('c0000000-0000-0000-0000-000000000009', 'Networking', 'networking', '🤝', NULL, 9),
  ('c0000000-0000-0000-0000-000000000010', 'Community', 'community', '🏘️', NULL, 10),
  ('c0000000-0000-0000-0000-000000000011', 'Web Development', 'web-development', '🌐', 'c0000000-0000-0000-0000-000000000001', 1),
  ('c0000000-0000-0000-0000-000000000012', 'AI & Machine Learning', 'ai-ml', '🧠', 'c0000000-0000-0000-0000-000000000001', 2),
  ('c0000000-0000-0000-0000-000000000013', 'DevOps & Cloud', 'devops-cloud', '☁️', 'c0000000-0000-0000-0000-000000000001', 3),
  ('c0000000-0000-0000-0000-000000000021', 'Concerts', 'concerts', '🎤', 'c0000000-0000-0000-0000-000000000002', 1),
  ('c0000000-0000-0000-0000-000000000022', 'Festivals', 'festivals', '✨', 'c0000000-0000-0000-0000-000000000002', 2),
  ('c0000000-0000-0000-0000-000000000031', 'Startups', 'startups', '🚀', 'c0000000-0000-0000-0000-000000000003', 1),
  ('c0000000-0000-0000-0000-000000000032', 'Networking Events', 'networking-events', '👥', 'c0000000-0000-0000-0000-000000000003', 2)
ON CONFLICT (slug) DO NOTHING;
