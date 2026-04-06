/*
  # Effort Mirror - Productivity Tracking Database Schema
  
  ## Overview
  This migration creates the complete database schema for the Effort Mirror application,
  a behavioral productivity tracker that monitors focus vs. avoidance patterns.
  
  ## New Tables
  
  ### `sessions`
  Stores study session data with focus metrics and classifications
  - `id` (uuid, primary key)
  - `task_name` (text) - What the user planned to work on
  - `planned_minutes` (integer) - How long they intended to study
  - `started_at` (timestamptz) - Session start time
  - `ended_at` (timestamptz) - Session end time (null if active)
  - `total_duration` (integer) - Total session duration in seconds
  - `focus_time` (integer) - Time spent in focused state (seconds)
  - `avoidance_time` (integer) - Time spent in avoidance behavior (seconds)
  - `idle_time` (integer) - Time spent idle (seconds)
  - `interruption_count` (integer) - Number of interruptions
  - `tab_switch_count` (integer) - Number of tab switches
  - `focus_score` (numeric) - Calculated focus percentage (0-100)
  - `effort_accuracy` (numeric) - Actual vs planned effort (0-100+)
  - `status` (text) - Current session status: active, paused, completed
  - `created_at` (timestamptz)
  
  ### `session_events`
  Tracks all behavioral events during sessions for detailed analysis
  - `id` (uuid, primary key)
  - `session_id` (uuid, foreign key) - Links to sessions table
  - `event_type` (text) - Type: focus, distraction, idle, tab_switch, interruption
  - `event_subtype` (text) - Additional classification (needed_break, distraction, etc)
  - `timestamp` (timestamptz) - When the event occurred
  - `duration` (integer) - Event duration in seconds
  - `metadata` (jsonb) - Additional event data (URLs, notes, etc)
  
  ### `allowed_sites`
  User-defined whitelist of productive websites
  - `id` (uuid, primary key)
  - `user_id` (uuid) - For future multi-user support
  - `domain` (text) - Domain name (e.g., "github.com")
  - `category` (text) - Site category (coding, research, learning, etc)
  - `created_at` (timestamptz)
  
  ### `user_settings`
  Application configuration and preferences
  - `id` (uuid, primary key)
  - `user_id` (uuid) - For future multi-user support
  - `idle_threshold_seconds` (integer) - When to mark user as idle (default 60)
  - `distraction_threshold` (integer) - Tab switches before marking avoidance (default 4)
  - `focus_block_minutes` (integer) - Minimum continuous time for focus (default 3)
  - `theme` (text) - UI theme preference
  - `notifications_enabled` (boolean) - Enable focus reminders
  - `updated_at` (timestamptz)
  
  ## Security
  - RLS enabled on all tables
  - Public access for demo purposes (single-user app)
  - Can be restricted to authenticated users in production
  
  ## Indexes
  - Session lookup by status and date
  - Event lookup by session and timestamp
  - Efficient querying for analytics
*/

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name text NOT NULL,
  planned_minutes integer NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  total_duration integer DEFAULT 0,
  focus_time integer DEFAULT 0,
  avoidance_time integer DEFAULT 0,
  idle_time integer DEFAULT 0,
  interruption_count integer DEFAULT 0,
  tab_switch_count integer DEFAULT 0,
  focus_score numeric(5,2) DEFAULT 0,
  effort_accuracy numeric(5,2) DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create session_events table
CREATE TABLE IF NOT EXISTS session_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_subtype text,
  timestamp timestamptz DEFAULT now(),
  duration integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create allowed_sites table
CREATE TABLE IF NOT EXISTS allowed_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  domain text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  idle_threshold_seconds integer DEFAULT 60,
  distraction_threshold integer DEFAULT 4,
  focus_block_minutes integer DEFAULT 3,
  theme text DEFAULT 'dark',
  notifications_enabled boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_events_session_id ON session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_timestamp ON session_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_allowed_sites_domain ON allowed_sites(domain);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for demo app)
CREATE POLICY "Public can view all sessions"
  ON sessions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert sessions"
  ON sessions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update sessions"
  ON sessions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete sessions"
  ON sessions FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can view all session events"
  ON session_events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert session events"
  ON session_events FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view allowed sites"
  ON allowed_sites FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can manage allowed sites"
  ON allowed_sites FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update allowed sites"
  ON allowed_sites FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete allowed sites"
  ON allowed_sites FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can view user settings"
  ON user_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can manage user settings"
  ON user_settings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update user settings"
  ON user_settings FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert default user settings
INSERT INTO user_settings (user_id, idle_threshold_seconds, distraction_threshold, focus_block_minutes, theme, notifications_enabled)
VALUES (null, 60, 4, 3, 'dark', true)
ON CONFLICT DO NOTHING;

-- Insert some default allowed sites
INSERT INTO allowed_sites (user_id, domain, category) VALUES
  (null, 'github.com', 'coding'),
  (null, 'stackoverflow.com', 'coding'),
  (null, 'docs.google.com', 'research'),
  (null, 'leetcode.com', 'coding'),
  (null, 'notion.so', 'productivity'),
  (null, 'coursera.org', 'learning')
ON CONFLICT DO NOTHING;