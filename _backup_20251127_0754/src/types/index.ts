// =====================================================
// Synthonia - TypeScript Types
// Versão: 2.0
// Alinhado 100% com schema.sql
// =====================================================

// =====================================================
// USER TYPES
// =====================================================

export type UserRole = 'athlete' | 'coach' | 'physiotherapist';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  coach_id?: string | null;
  avatar_url?: string | null;
  birth_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserMetadata {
  name: string;
  role: UserRole;
  coach_id?: string;
  birth_date?: string;
}

// =====================================================
// DAILY DATA TYPES
// =====================================================

export interface DailyData {
  id: string;
  user_id: string;
  date: string;

  // Sono
  sleep_quality?: number | null;
  sleep_duration?: number | null;
  sleep_regularity?: number | null;

  // Bem-estar
  fatigue_level?: number | null;
  exhaustion?: number | null;
  mood?: number | null;
  muscle_soreness?: number | null;
  stress_level?: number | null;

  // Recuperação
  tqr?: number | null;
  psr?: number | null;
  resting_hr?: number | null;
  hrv?: number | null;

  // Calculados
  readiness_score?: number | null;

  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyDataInput {
  user_id: string;
  date: string;

  // Sono
  sleep_quality?: number;
  sleep_duration?: number;
  sleep_regularity?: number;

  // Bem-estar
  fatigue_level?: number;
  exhaustion?: number;
  mood?: number;
  muscle_soreness?: number;
  stress_level?: number;

  // Recuperação
  tqr?: number;
  psr?: number;
  resting_hr?: number;
  hrv?: number;

  notes?: string;
}

// =====================================================
// TRAINING SESSION TYPES
// =====================================================

export type TrainingType =
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'sports'
  | 'mixed'
  | 'recovery'
  | 'other';

export interface TrainingSession {
  id: string;
  user_id: string;
  date: string;

  // Dados básicos (obrigatórios)
  duration: number;
  rpe: number;
  training_type: string;

  // Métricas opcionais
  volume?: number | null;
  intensity?: number | null;

  // Calculados
  tss?: number | null;
  pse?: number | null;
  trimp?: number | null;

  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingSessionInput {
  user_id: string;
  date: string;
  duration: number;
  rpe: number;
  training_type: string;
  volume?: number;
  intensity?: number;
  notes?: string;
}

// =====================================================
// ANALYTICS & METRICS TYPES
// =====================================================

export interface TrainingMetrics {
  date: string;
  tss: number;
  atl: number; // Acute Training Load (7 days)
  ctl: number; // Chronic Training Load (28 days)
  tsb: number; // Training Stress Balance
  monotony: number;
  trimp: number;
  pse: number;
}

export interface WellnessMetrics {
  date: string;
  readiness_score: number;
  sleep_quality: number;
  fatigue_level: number;
  mood: number;
  stress_level: number;
}

export interface AthleteSummary {
  id: string;
  name: string;
  email: string;
  total_daily_entries: number;
  total_training_sessions: number;
  avg_readiness: number;
  total_tss_7days: number;
}

// =====================================================
// FORM & UI TYPES
// =====================================================

export interface FormErrors {
  [key: string]: string;
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

// =====================================================
// CHART & VISUALIZATION TYPES
// =====================================================

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MetricConfig {
  key: string;
  label: string;
  color: string;
  unit: string;
  min?: number;
  max?: number;
}

// =====================================================
// FILTER & QUERY TYPES
// =====================================================

export interface DateRange {
  start: string;
  end: string;
}

export interface DataFilter {
  userId?: string;
  dateRange?: DateRange;
  trainingType?: string;
  metrics?: string[];
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface Error {
  message: string;
  code?: string;
  details?: any;
}

// =====================================================
// RECOMMENDATION TYPES
// =====================================================

export interface Recommendation {
  type: 'training' | 'recovery' | 'rest' | 'warning';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  color?: string;
}

// =====================================================
// GAMIFICATION TYPES
// =====================================================

export interface GamificationStats {
  user_id: string;
  consistency_points: number;
  streak_days: number;
  total_sessions: number;
  achievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}