/*
  # Add Authentication and Enhanced Tab Tracking

  ## Overview
  This migration adds user authentication support and enhances tab switch tracking
  with detailed reason capture and duration estimates.

  ## New Tables

  ### `profiles`
  User profile information linked to Supabase auth
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's display name
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `tab_switch_details`
  Detailed tracking of every tab switch with reasons
  - `id` (uuid, primary key)
  - `session_id` (uuid, foreign key) - Links to sessions
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `reason` (text) - Why the user switched tabs
  - `planned_duration_minutes` (integer) - How long user plans to be away
  - `actual_duration_seconds` (integer) - Actual time spent away
  - `destination_url` (text) - URL user navigated to (if available)
  - `switched_at` (timestamptz) - When the switch occurred
  - `returned_at` (timestamptz) - When user returned
  - `created_at` (timestamptz)

  ## Security
  - RLS policies updated to restrict data to authenticated users
  - Users can only access their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tab_switch_details table
CREATE TABLE IF NOT EXISTS tab_switch_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  planned_duration_minutes integer,
  actual_duration_seconds integer DEFAULT 0,
  destination_url text,
  switched_at timestamptz DEFAULT now(),
  returned_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_tab_switch_details_session_id ON tab_switch_details(session_id);
CREATE INDEX IF NOT EXISTS idx_tab_switch_details_user_id ON tab_switch_details(user_id);

-- Enable RLS on new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tab_switch_details ENABLE ROW LEVEL SECURITY;

-- Drop old public policies if they exist
DROP POLICY IF EXISTS "Public can view all sessions" ON sessions;
DROP POLICY IF EXISTS "Public can insert sessions" ON sessions;
DROP POLICY IF EXISTS "Public can update sessions" ON sessions;
DROP POLICY IF EXISTS "Public can delete sessions" ON sessions;
DROP POLICY IF EXISTS "Public can view all session events" ON session_events;
DROP POLICY IF EXISTS "Public can insert session events" ON session_events;
DROP POLICY IF EXISTS "Public can view allowed sites" ON allowed_sites;
DROP POLICY IF EXISTS "Public can manage allowed sites" ON allowed_sites;
DROP POLICY IF EXISTS "Public can update allowed sites" ON allowed_sites;
DROP POLICY IF EXISTS "Public can delete allowed sites" ON allowed_sites;
DROP POLICY IF EXISTS "Public can view user settings" ON user_settings;
DROP POLICY IF EXISTS "Public can manage user settings" ON user_settings;
DROP POLICY IF EXISTS "Public can update user settings" ON user_settings;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for session_events
CREATE POLICY "Users can view own session events"
  ON session_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session events"
  ON session_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for allowed_sites
CREATE POLICY "Users can view own allowed sites"
  ON allowed_sites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own allowed sites"
  ON allowed_sites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own allowed sites"
  ON allowed_sites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own allowed sites"
  ON allowed_sites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for tab_switch_details
CREATE POLICY "Users can view own tab switch details"
  ON tab_switch_details FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tab switch details"
  ON tab_switch_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tab switch details"
  ON tab_switch_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create default user settings
  INSERT INTO public.user_settings (user_id, idle_threshold_seconds, distraction_threshold, focus_block_minutes, theme, notifications_enabled)
  VALUES (NEW.id, 60, 4, 3, 'dark', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
