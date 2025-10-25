-- Migration: Create Volunteer Dashboard Tables
-- Description: Creates volunteers, event_registrations tables and complete_user_profiles view
-- Date: 2025-10-25

-- ============================================
-- 1. Create volunteers table
-- ============================================
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT,
  interests TEXT[],
  total_points INTEGER DEFAULT 0,
  total_hours DECIMAL DEFAULT 0,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email);

-- ============================================
-- 2. Create event_registrations table
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled', 'no-show')),
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  attendance_confirmed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(event_id, volunteer_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_volunteer ON event_registrations(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON event_registrations(status);

-- ============================================
-- 3. Create complete_user_profiles view
-- ============================================
-- Drop the view if it exists to recreate it
DROP VIEW IF EXISTS complete_user_profiles;

CREATE VIEW complete_user_profiles AS
SELECT
  v.id,
  v.user_id,
  v.username,
  v.email,
  v.total_points,
  v.rank,
  COALESCE(stats.events_completed, 0) as events_completed,
  v.total_hours,
  COALESCE(upcoming.upcoming_count, 0) as upcoming_events
FROM volunteers v
LEFT JOIN (
  SELECT volunteer_id, COUNT(*) as events_completed
  FROM event_registrations
  WHERE status = 'attended'
  GROUP BY volunteer_id
) stats ON v.id = stats.volunteer_id
LEFT JOIN (
  SELECT volunteer_id, COUNT(*) as upcoming_count
  FROM event_registrations er
  JOIN events e ON er.event_id = e.id
  WHERE er.status = 'registered'
    AND e.event_date >= CURRENT_DATE
  GROUP BY volunteer_id
) upcoming ON v.id = upcoming.volunteer_id;

-- ============================================
-- 4. Create volunteer profile auto-creation function
-- ============================================
CREATE OR REPLACE FUNCTION create_volunteer_profile(
  user_id_param UUID,
  username_param TEXT,
  email_param TEXT
) RETURNS UUID AS $$
DECLARE
  volunteer_id UUID;
  existing_volunteer UUID;
BEGIN
  -- Check if volunteer profile already exists
  SELECT id INTO existing_volunteer
  FROM volunteers
  WHERE user_id = user_id_param
  LIMIT 1;

  IF existing_volunteer IS NOT NULL THEN
    RETURN existing_volunteer;
  END IF;

  -- Create new volunteer profile
  INSERT INTO volunteers (user_id, username, email)
  VALUES (user_id_param, username_param, email_param)
  RETURNING id INTO volunteer_id;

  RETURN volunteer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Row Level Security Policies
-- ============================================

-- Enable RLS on volunteers table
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all volunteers" ON volunteers;
DROP POLICY IF EXISTS "Users can update their own profile" ON volunteers;
DROP POLICY IF EXISTS "Users can insert their own profile" ON volunteers;

-- Policy: Anyone can view volunteer profiles
CREATE POLICY "Users can view all volunteers"
  ON volunteers FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON volunteers FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON volunteers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on event_registrations table
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all registrations" ON event_registrations;
DROP POLICY IF EXISTS "Volunteers can create their own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Volunteers can update their own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Company admins can view event registrations" ON event_registrations;

-- Policy: Anyone can view registrations (for event participant counts)
CREATE POLICY "Users can view all registrations"
  ON event_registrations FOR SELECT
  USING (true);

-- Policy: Volunteers can create their own registrations
CREATE POLICY "Volunteers can create their own registrations"
  ON event_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM volunteers
      WHERE id = volunteer_id AND user_id = auth.uid()
    )
  );

-- Policy: Volunteers can update their own registrations
CREATE POLICY "Volunteers can update their own registrations"
  ON event_registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM volunteers
      WHERE id = volunteer_id AND user_id = auth.uid()
    )
  );

-- Policy: Company admins can view event registrations for their events
CREATE POLICY "Company admins can view event registrations"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN company_team_members ctm ON ctm.company_id = e.company_id
      WHERE e.id = event_id
        AND ctm.user_id = auth.uid()
        AND ctm.status = 'accepted'
    )
  );

-- ============================================
-- 6. Trigger to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON volunteers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTES:
-- ============================================
-- After running this migration, you may want to backfill volunteer profiles
-- for existing auth.users who signed up before this migration:
--
-- INSERT INTO volunteers (user_id, username, email)
-- SELECT
--   id as user_id,
--   COALESCE(raw_user_meta_data->>'username', email) as username,
--   email
-- FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM volunteers)
--   AND raw_user_meta_data->>'role' = 'volunteer';
