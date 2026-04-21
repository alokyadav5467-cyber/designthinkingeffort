export type SessionStatus = 'active' | 'paused' | 'completed';
export type EventType = 'focus' | 'distraction' | 'idle' | 'tab_switch' | 'interruption';
export type EventSubtype = 'needed_break' | 'distraction' | 'finished_task' | null;
export type FocusState = 'focused' | 'distracted' | 'idle';

export interface Session {
  id: string;
  task_name: string;
  planned_minutes: number;
  started_at: string;
  ended_at: string | null;
  total_duration: number;
  focus_time: number;
  avoidance_time: number;
  idle_time: number;
  interruption_count: number;
  tab_switch_count: number;
  focus_score: number;
  effort_accuracy: number;
  status: SessionStatus;
  created_at: string;
}

export interface SessionEvent {
  id: string;
  session_id: string;
  event_type: EventType;
  event_subtype: EventSubtype;
  timestamp: string;
  duration: number;
  metadata: Record<string, unknown>;
}

export interface AllowedSite {
  id: string;
  user_id: string | null;
  domain: string;
  category: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string | null;
  idle_threshold_seconds: number;
  distraction_threshold: number;
  focus_block_minutes: number;
  theme: string;
  notifications_enabled: boolean;
  updated_at: string;
}

export interface ActivityState {
  focusState: FocusState;
  isVisible: boolean;
  isIdle: boolean;
  lastActivity: number;
  tabSwitchCount: number;
  focusStartTime: number | null;
}

export interface TabSwitchDetail {
  id: string;
  session_id: string;
  user_id: string | null;
  reason: string | null;
  planned_duration_minutes: number | null;
  actual_duration_seconds: number;
  destination_url: string | null;
  switched_at: string;
  returned_at: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
