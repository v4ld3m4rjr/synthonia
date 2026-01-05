import React, { useState, useEffect } from 'react';
import { DailyData, TrainingSession, SleepReadinessResult } from '../types';
import { computeRecovery } from '../utils/sleepReadinessModel';
import { calculateReadinessScore } from '../lib/calculations';
import { Brain, Activity, Moon, Heart, Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import NeurophysiologyExplainer from './ai/NeurophysiologyExplainer';

interface ResultsAnalysisPageProps {
  className?: string;
}

// Dados pré-preenchidos do questionário principal
const mockDailyData: DailyData = {
  id: 'daily-001',
  user_id: 'user-001',
  date: new Date().toISOString().split('T')[0],
  sleep_quality: 7,
  sleep_duration: 7.5,
  sleep_regularity: 8,
  fatigue_level: 4,
  exhaustion: 3,
  mood: 8,
  muscle_soreness: 3,
  stress_level: 4,
  resting_hr: 58,
  readiness_score: 0, // Será calculado
  rpe: 6,
  training_duration: 90,
  training_intensity: 7,
  created_at: new Date().toISOString()
};

const mockTrainingSession: TrainingSession = {
  id: 'training-001',
  user_id: 'user-001',
  date: new Date().toISOString().split('T')[0],
  duration: 90,
  rpe: 6,
  training_type: 'Endurance',
  volume: 25,
  intensity: 7,
  tss: 95,
  notes: 'Treino de resistência moderada',
  created_at: new Date().toISOString()
};

interface NeuroAnalysis {
  overall_condition: 'excellent' | 'good' | 'moderate' | 'poor';
  autonomic_balance: number; // 0-100
  recovery_capacity: number; // 0-100
  stress_adaptation: number; // 0-100
  sleep_efficiency: number; // 0-100
  recommendations: string[];
  risk_factors: string[];
  strengths: string[];
}

export const ResultsAnalysisPage: React.FC<ResultsAnalysisPageProps> = ({ className = '' }) => {
  const [sleepResults, setSleepResults] = useState<SleepReadinessResult | null>(null);
  const [readinessScore, setReadinessScore] = useState<number>(0);
  const [neuroAnalysis, setNeuroAnalysis] = useState<NeuroAnalysis | null>(null);

  useEffect(() => {
    // Calcular readiness score
    const calculatedReadiness = calculateReadinessScore(mockDailyData);
    setReadinessScore(calculatedReadiness);

    // Calcular resultados do modelo de sono
    const sleepInputs = {
      RHR_today: mockDailyData.resting_hr || 58,
      RHR_base: 55,
      TSS24: mockTrainingSession.tss,
      TSS48_prev: 60,
      TRIMP24: null,
      TRIMP48_prev: null,
      Sleep_last: mockDailyData.sleep_duration,
      S_ref: 7.5,
      TQR: mockDailyData.sleep_quality,
      Psy_stress: mockDailyData.stress_level,
      L_thr: 100,
    };

    const sleepResult = computeRecovery(sleepInputs);
    setSleepResults(sleepResult);

    // Gerar análise neurofisiológica por IA
    generateNeuroAnalysis(mockDailyData, sleepResult, calculatedReadiness);
  }, []);

  const generateNeuroAnalysis = (dailyData: DailyData, sleepResult: SleepReadinessResult, readiness: number): void => {
    // Análise baseada nos dados coletados
    const autonomicBalance = Math.round(
      (100 - ((dailyData.resting_hr || 58) - 55) * 10) * 
      (dailyData.sleep_quality / 10) * 
      (1 - dailyData.stress_level / 10)
    );

    const recoveryCapacity = sleepResult.RecoveryIndex;
    
    const stressAdaptation = Math.round(
      ((10 - dailyData.stress_level) / 10) * 
      ((10 - dailyData.fatigue_level) / 10) * 
      (dailyData.mood / 10) * 100
    );

    const sleepEfficiency = Math.round(
      (dailyData.sleep_quality / 10) * 
      (dailyData.sleep_regularity / 10) * 
      Math.min(dailyData.sleep_duration / 7.5, 1) * 100
    );

    let overallCondition: 'excellent' | 'good' | 'moderate' | 'poor';
    if (readiness >= 80) overallCondition = 'excellent';
    else if (readiness >= 65) overallCondition = 'good';
    else if (readiness >= 50) overallCondition = 'moderate';
    else overallCondition = 'poor';

    const recommendations: string[] = [];
    const riskFactors: string[] = [];
    const strengths: string[] = [];

    // Análise de recomendações
    // Removido conforme solicitação: não exibir recomendações aqui
    // const recommendations: string[] = [];

    // Análise de fatores de risco
    // Removido conforme solicitação: não exibir fatores de atenção aqui
    // const riskFactors: string[] = [];

    // Análise de pontos fortes
    // Removido conforme solicitação: não exibir pontos fortes aqui
    // const strengths: string[] = [];

    setNeuroAnalysis({
      overall_condition: overallCondition,
      autonomic_balance: Math.max(0, Math.min(100, autonomicBalance)),
      recovery_capacity: recoveryCapacity,
      stress_adaptation: Math.max(0, Math.min(100, stressAdaptation)),
      sleep_efficiency: Math.max(0, Math.min(100, sleepEfficiency)),
      recommendations,
      risk_factors: riskFactors,
      strengths
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'moderate': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Boa';
      case 'moderate': return 'Moderada';
      case 'poor': return 'Baixa';
      default: return 'Indefinida';
    }
  };

  if (!sleepResults || !neuroAnalysis) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Processando análise neurofisiológica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        // (removido conforme solicitação)



        {/* IA Neurofisiológica - inserida conforme solicitação */}
        // (removido conforme solicitação)





        {/* Conclusão da IA */}
        // (removido conforme solicitação)
        // ... bloco removido ...
      </div>
    </div>
  );
};