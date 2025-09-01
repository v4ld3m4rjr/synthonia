// [AI Generated] Data: 19/12/2024
// Descrição: Configuração do cliente Supabase para autenticação e banco de dados
// Gerado por: Cursor AI
// Versão: Supabase JS 2.39.0
// AI_GENERATED_CODE_START
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          profile_type: 'athlete' | 'trainer' | 'physiotherapist'
          linked_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          profile_type: 'athlete' | 'trainer' | 'physiotherapist'
          linked_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          profile_type?: 'athlete' | 'trainer' | 'physiotherapist'
          linked_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recovery_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          sleep_quality: number
          fatigue_level: number
          muscle_soreness: number
          stress_level: number
          mood_level: number
          prs_score: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          sleep_quality: number
          fatigue_level: number
          muscle_soreness: number
          stress_level: number
          mood_level: number
          prs_score: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          sleep_quality?: number
          fatigue_level?: number
          muscle_soreness?: number
          stress_level?: number
          mood_level?: number
          prs_score?: number
          notes?: string | null
          created_at?: string
        }
      }
      training_sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          session_name: string
          duration_minutes: number
          rpe: number
          exercises: any[]
          total_tonnage: number
          density: number
          session_load: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          session_name: string
          duration_minutes: number
          rpe: number
          exercises: any[]
          total_tonnage?: number
          density?: number
          session_load?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          session_name?: string
          duration_minutes?: number
          rpe?: number
          exercises?: any[]
          total_tonnage?: number
          density?: number
          session_load?: number
          notes?: string | null
          created_at?: string
        }
      }
      pain_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          body_area: string
          pain_intensity: number
          pain_type: string
          description: string | null
          coordinates_x: number
          coordinates_y: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          body_area: string
          pain_intensity: number
          pain_type: string
          description?: string | null
          coordinates_x: number
          coordinates_y: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          body_area?: string
          pain_intensity?: number
          pain_type?: string
          description?: string | null
          coordinates_x?: number
          coordinates_y?: number
          created_at?: string
        }
      }
      sleep_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          bedtime: string
          wake_time: string
          sleep_duration: number
          sleep_quality: number
          sleep_efficiency: number | null
          deep_sleep_minutes: number | null
          rem_sleep_minutes: number | null
          awakenings: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          bedtime: string
          wake_time: string
          sleep_duration: number
          sleep_quality: number
          sleep_efficiency?: number | null
          deep_sleep_minutes?: number | null
          rem_sleep_minutes?: number | null
          awakenings?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          bedtime?: string
          wake_time?: string
          sleep_duration?: number
          sleep_quality?: number
          sleep_efficiency?: number | null
          deep_sleep_minutes?: number | null
          rem_sleep_minutes?: number | null
          awakenings?: number | null
          created_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: string
          title: string
          content: string
          data_sources: string[]
          confidence_score: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          insight_type: string
          title: string
          content: string
          data_sources: string[]
          confidence_score: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          insight_type?: string
          title?: string
          content?: string
          data_sources?: string[]
          confidence_score?: number
          created_at?: string
        }
      }
    }
  }
}
// AI_GENERATED_CODE_END