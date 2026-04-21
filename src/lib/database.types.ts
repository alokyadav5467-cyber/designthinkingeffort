export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          user_id: string | null
          task_name: string
          planned_minutes: number
          started_at: string
          ended_at: string | null
          total_duration: number
          focus_time: number
          avoidance_time: number
          idle_time: number
          interruption_count: number
          tab_switch_count: number
          focus_score: number
          effort_accuracy: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          task_name: string
          planned_minutes: number
          started_at?: string
          ended_at?: string | null
          total_duration?: number
          focus_time?: number
          avoidance_time?: number
          idle_time?: number
          interruption_count?: number
          tab_switch_count?: number
          focus_score?: number
          effort_accuracy?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          task_name?: string
          planned_minutes?: number
          started_at?: string
          ended_at?: string | null
          total_duration?: number
          focus_time?: number
          avoidance_time?: number
          idle_time?: number
          interruption_count?: number
          tab_switch_count?: number
          focus_score?: number
          effort_accuracy?: number
          status?: string
          created_at?: string
        }
      }
      session_events: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          event_type: string
          event_subtype: string | null
          timestamp: string
          duration: number
          metadata: Json
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          event_type: string
          event_subtype?: string | null
          timestamp?: string
          duration?: number
          metadata?: Json
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          event_type?: string
          event_subtype?: string | null
          timestamp?: string
          duration?: number
          metadata?: Json
        }
      }
      allowed_sites: {
        Row: {
          id: string
          user_id: string | null
          domain: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          domain: string
          category?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          domain?: string
          category?: string
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string | null
          idle_threshold_seconds: number
          distraction_threshold: number
          focus_block_minutes: number
          theme: string
          notifications_enabled: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          idle_threshold_seconds?: number
          distraction_threshold?: number
          focus_block_minutes?: number
          theme?: string
          notifications_enabled?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          idle_threshold_seconds?: number
          distraction_threshold?: number
          focus_block_minutes?: number
          theme?: string
          notifications_enabled?: boolean
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tab_switch_details: {
        Row: {
          id: string
          session_id: string | null
          user_id: string | null
          reason: string | null
          planned_duration_minutes: number | null
          actual_duration_seconds: number
          destination_url: string | null
          switched_at: string
          returned_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          reason?: string | null
          planned_duration_minutes?: number | null
          actual_duration_seconds?: number
          destination_url?: string | null
          switched_at?: string
          returned_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          reason?: string | null
          planned_duration_minutes?: number | null
          actual_duration_seconds?: number
          destination_url?: string | null
          switched_at?: string
          returned_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
