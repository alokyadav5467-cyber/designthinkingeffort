/*
  # Add Streak Tracking Feature

  ## Overview
  This migration adds user streak tracking to motivate consistent daily focus sessions.

  ## New Tables

  ### `user_streaks`
  Tracks user's daily session streaks
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `current_streak` (integer) - Number of consecutive days with sessions
  - `longest_streak` (integer) - Longest streak achieved
  - `last_session_date` (date) - Last day a session was completed
  - `updated_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - RLS policies restrict access to user's own streaks
*/

CREATE TABLE IF NOT EXISTS user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_session_date date,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON user_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON user_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update streak when session ends
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_today date;
  v_yesterday date;
  v_current_streak integer;
  v_longest_streak integer;
  v_last_session_date date;
BEGIN
  v_today := CURRENT_DATE;
  v_yesterday := CURRENT_DATE - INTERVAL '1 day';
  
  -- Get or create streak record
  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_session_date)
  VALUES (p_user_id, 1, 1, v_today)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE
      WHEN user_streaks.last_session_date = v_today THEN user_streaks.current_streak
      WHEN user_streaks.last_session_date = v_yesterday THEN user_streaks.current_streak + 1
      ELSE 1
    END,
    longest_streak = CASE
      WHEN user_streaks.last_session_date = v_today THEN user_streaks.longest_streak
      WHEN user_streaks.last_session_date = v_yesterday AND (user_streaks.current_streak + 1) > user_streaks.longest_streak THEN user_streaks.current_streak + 1
      WHEN user_streaks.last_session_date = v_yesterday THEN user_streaks.longest_streak
      ELSE GREATEST(1, user_streaks.longest_streak)
    END,
    last_session_date = v_today,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update streak when session completes
CREATE OR REPLACE FUNCTION public.on_session_complete()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM public.update_user_streak(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_session_completed ON sessions;
CREATE TRIGGER on_session_completed
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.on_session_complete();
