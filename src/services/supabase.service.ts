import { supabase } from '../lib/supabase';
import type {
  Profile,
  DailyMetricsPhysical,
  DailyMetricsMental,
  TrainingSession,
  SpravatoSession,
  ClinicalAssessment
} from '../types';

export class SupabaseService {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async getUserProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getPhysicalMetrics(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('daily_metrics_physical')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as DailyMetricsPhysical[];
  }

  async getMentalMetrics(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('daily_metrics_mental')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as DailyMetricsMental[];
  }

  async getTodayPhysicalMetrics(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_metrics_physical')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (error) throw error;
    return data as DailyMetricsPhysical | null;
  }

  async getTodayMentalMetrics(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_metrics_mental')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (error) throw error;
    return data as DailyMetricsMental | null;
  }

  async insertPhysicalMetrics(metrics: Omit<DailyMetricsPhysical, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('daily_metrics_physical')
      .insert(metrics)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async insertMentalMetrics(metrics: Omit<DailyMetricsMental, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('daily_metrics_mental')
      .insert(metrics)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getTrainingSessions(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as TrainingSession[];
  }

  async insertTrainingSession(session: Omit<TrainingSession, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('training_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getSpravatoSessions(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('spravato_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as SpravatoSession[];
  }

  async insertSpravatoSession(session: Omit<SpravatoSession, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('spravato_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getClinicalAssessments(userId: string, assessmentType?: string, limit = 30) {
    let query = supabase
      .from('clinical_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (assessmentType) {
      query = query.eq('assessment_type', assessmentType);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as ClinicalAssessment[];
  }

  async insertClinicalAssessment(assessment: Omit<ClinicalAssessment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('clinical_assessments')
      .insert(assessment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getDoctorPatients(doctorId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('doctor_id', doctorId);
    
    if (error) throw error;
    return data as Profile[];
  }

  async getCoachPatients(coachId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('coach_id', coachId);
    
    if (error) throw error;
    return data as Profile[];
  }

  async getAllDoctors() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'doctor')
      .order('full_name');
    
    if (error) throw error;
    return data;
  }

  async getAllCoaches() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'coach')
      .order('full_name');
    
    if (error) throw error;
    return data;
  }

  subscribeToMentalMetrics(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`mental-metrics-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_metrics_mental',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToPhysicalMetrics(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`physical-metrics-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_metrics_physical',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();
