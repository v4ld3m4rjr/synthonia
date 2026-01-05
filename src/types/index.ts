// [AI Generated]
// Descrição: Definição de tipos TypeScript atualizada para o novo schema
// Versão: TypeScript 5.5.3

export type UserRole = 'subject' | 'patient' | 'doctor' | 'coach';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  birth_date: string | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  profile_type: string | null;
  doctor_id: string | null;
  coach_id: string | null;
  created_at: string;
}

export interface DailyMetricsPhysical {
  id: string;
  user_id: string;
  date: string;
  sleep_quality: number | null;
  sleep_duration: number | null;
  fatigue_level: number | null;
  stress_level: number | null;
  muscle_soreness: number | null;
  readiness_score: number | null;
  resting_hr: number | null;
  created_at: string;
}

export interface DailyMetricsMental {
  id: string;
  user_id: string;
  date: string;
  mood_score: number | null;
  anxiety_level: number | null;
  energy_level: number | null;
  depression_score: number | null;
  mania_risk_score: number | null;
  suicide_risk: number | null;
  obsessive_thoughts: number | null;
  sensory_overload: number | null;
  social_masking: number | null;
  irritability: number | null;
  created_at: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  load_kg: number;
}

export interface TrainingSession {
  id: string;
  user_id: string;
  date: string;
  duration_minutes: number | null;
  rpe: number | null;
  exercises: Exercise[];
  created_at: string;
}

export interface SpravatoSession {
  id: string;
  user_id: string;
  date: string;
  dose_mg: number | null;
  dissociation_level: number | null;
  nausea_level: number | null;
  bp_pre: string | null;
  bp_post: string | null;
  trip_quality_rating: number | null;
  insights: string | null;
  mood_24h_after: number | null;
  created_at: string;
}

export type AssessmentType = 'PHQ9' | 'GAD7' | 'ASRM' | 'FAST' | 'YBOCS' | 'EQ5D' | 'TSQM';

export interface ClinicalAssessment {
  id: string;
  user_id: string;
  date: string;
  assessment_type: AssessmentType;
  score: number | null;
  data: Record<string, any>;
  created_at: string;
}

// Interfaces para Cálculos e Lógica de Negócio
export interface WorkloadMetrics {
  internal_load: number; // duration * rpe
  total_tonnage: number;
  monotony: number;
  strain: number;
  acwr: number; // Acute:Chronic Workload Ratio
  atl: number; // Acute Training Load (Fatigue)
  ctl: number; // Chronic Training Load (Fitness)
  tsb: number; // Training Stress Balance (Form)
  injury_risk: boolean;
}

export interface MentalHealthAlerts {
  mania_risk: boolean;
  suicide_risk_alert: boolean;
  depression_severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
}

export interface NumerologyProfile {
  destiny_number: number;
  soul_number: number;
  description: string;
}
