/*
  # Add user_id to sessions and session_events tables

  ## Overview
  This migration adds user_id columns to existing tables for user authentication support.

  ## Modified Tables

  ### `sessions`
  - Added `user_id` column to link sessions to users

  ### `session_events`
  - Added `user_id` column for user-specific event tracking
*/

-- Add user_id to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id to session_events table
ALTER TABLE session_events ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_events_user_id ON session_events(user_id);
