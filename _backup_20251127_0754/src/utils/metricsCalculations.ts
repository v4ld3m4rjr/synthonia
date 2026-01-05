// [AI Generated] Data: 19/01/2025
// Descrição: Cálculos científicos para métricas de treinamento e recuperação
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START

import { DailyData, TrainingSession, TrainingMetrics, MetricCalculationInput, SleepMetrics, ExhaustionMetrics, AdvancedTrainingMetrics } from '../types';

/**
 * Calcula o TSS (Training Stress Score) baseado na duração e intensidade do treino
 * TSS = (Duração em horas × Intensidade normalizada² × 100) / FTP
 * Para simplificação, usamos uma fórmula adaptada baseada na intensidade percebida
 */
export const calculateTSS = (duration: number, intensity: number, rpe?: number): number => {
  if (!duration || !intensity) return 0;
  
  // Fórmula simplificada: TSS = (duração/60) × (intensidade/10)² × 100
  const durationHours = duration / 60;
  const normalizedIntensity = intensity / 10;
  const tss = durationHours * Math.pow(normalizedIntensity, 2) * 100;
  
  // Se temos RPE, ajustamos o TSS baseado na percepção de esforço
  if (rpe) {
    const rpeMultiplier = rpe / 13; // RPE médio é ~13
    return Math.round(tss * rpeMultiplier);
  }
  
  return Math.round(tss);
};

/**
 * Calcula ATL (Acute Training Load) - média móvel de 7 dias do TSS
 */
export const calculateATL = (tssHistory: number[]): number => {
  if (tssHistory.length === 0) return 0;
  
  const last7Days = tssHistory.slice(-7);
  const sum = last7Days.reduce((acc, tss) => acc + tss, 0);
  return Math.round(sum / last7Days.length);
};

/**
 * Calcula CTL (Chronic Training Load) - média móvel de 42 dias do TSS
 */
export const calculateCTL = (tssHistory: number[]): number => {
  if (tssHistory.length === 0) return 0;
  
  const last42Days = tssHistory.slice(-42);
  const sum = last42Days.reduce((acc, tss) => acc + tss, 0);
  return Math.round(sum / last42Days.length);
};

/**
 * Calcula TSB (Training Stress Balance) = CTL - ATL
 * Valores positivos indicam recuperação, negativos indicam fadiga
 */
export const calculateTSB = (ctl: number, atl: number): number => {
  return ctl - atl;
};

/**
 * Calcula TRIMP (Training Impulse) baseado na duração, FC média e FC máxima
 * TRIMP = Duração × FC_média × e^(1.92 × %FCmax)
 */
export const calculateTRIMP = (duration: number, avgHR: number, maxHR: number = 190): number => {
  if (!duration || !avgHR) return 0;
  
  const durationMinutes = duration;
  const hrPercent = avgHR / maxHR;
  const trimp = durationMinutes * avgHR * Math.exp(1.92 * hrPercent);
  
  return Math.round(trimp / 100); // Dividido por 100 para valores mais manejáveis
};

/**
 * Calcula monotonia diária baseada na variação da carga de treino
 */
export const calculateDailyMonotony = (tssHistory: number[]): number => {
  if (tssHistory.length < 7) return 0;
  
  const last7Days = tssHistory.slice(-7);
  const mean = last7Days.reduce((acc, tss) => acc + tss, 0) / last7Days.length;
  
  if (mean === 0) return 0;
  
  const variance = last7Days.reduce((acc, tss) => acc + Math.pow(tss - mean, 2), 0) / last7Days.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Monotonia = média / desvio padrão
  return standardDeviation === 0 ? 0 : Math.round((mean / standardDeviation) * 10) / 10;
};

/**
 * Calcula monotonia semanal (média de 7 dias da monotonia diária)
 */
export const calculateMonotony = (dailyMonotonyHistory: number[]): number => {
  if (dailyMonotonyHistory.length === 0) return 0;
  
  const last7Days = dailyMonotonyHistory.slice(-7);
  const sum = last7Days.reduce((acc, monotony) => acc + monotony, 0);
  return Math.round((sum / last7Days.length) * 10) / 10;
};

/**
 * Calcula PSE (Perceived Stress and Exertion) baseado no RPE e fatores de estresse
 */
export const calculatePSE = (rpe: number, stressLevel: number, fatigueLevel: number): number => {
  if (!rpe) return 0;
  
  // PSE combina RPE com fatores de estresse e fadiga
  const stressFactor = stressLevel / 10; // Normaliza para 0-1
  const fatigueFactor = fatigueLevel / 10; // Normaliza para 0-1
  
  const pse = rpe * (1 + (stressFactor + fatigueFactor) / 2);
  return Math.round(pse * 10) / 10;
};

/**
 * Calcula PSR (Perceived Stress and Recovery) baseado na qualidade do sono e recuperação
 */
export const calculatePSR = (sleepQuality: number, sleepDuration: number, restingHR?: number): number => {
  if (!sleepQuality) return 0;
  
  let psr = sleepQuality;
  
  // Ajusta baseado na duração do sono (ideal: 7-9 horas)
  if (sleepDuration) {
    if (sleepDuration >= 7 && sleepDuration <= 9) {
      psr += 1; // Bonus para duração ideal
    } else if (sleepDuration < 6 || sleepDuration > 10) {
      psr -= 1; // Penalidade para duração inadequada
    }
  }
  
  // Ajusta baseado na FC de repouso (se disponível)
  if (restingHR) {
    // Assumindo FC de repouso normal entre 50-70 bpm
    if (restingHR <= 60) {
      psr += 0.5; // Bonus para FC baixa
    } else if (restingHR > 80) {
      psr -= 0.5; // Penalidade para FC elevada
    }
  }
  
  return Math.max(0, Math.min(10, Math.round(psr * 10) / 10));
};

/**
 * Calcula TQR (Total Quality Recovery) baseado em múltiplos fatores de recuperação
 */
export const calculateTQR = (
  sleepQuality: number,
  sleepDuration: number,
  sleepRegularity: number,
  stressLevel: number,
  mood: number,
  fatigueLevel: number
): number => {
  if (!sleepQuality) return 0;
  
  // Pesos para cada fator (total = 1.0)
  const weights = {
    sleepQuality: 0.3,
    sleepDuration: 0.2,
    sleepRegularity: 0.15,
    stress: 0.15,
    mood: 0.1,
    fatigue: 0.1
  };
  
  // Normaliza duração do sono (0-10 baseado em 4-12 horas)
  const normalizedDuration = sleepDuration ? Math.max(0, Math.min(10, (sleepDuration - 4) * 1.25)) : 5;
  
  // Inverte stress e fatigue (valores altos são ruins)
  const invertedStress = stressLevel ? 10 - stressLevel : 5;
  const invertedFatigue = fatigueLevel ? 10 - fatigueLevel : 5;
  
  const tqr = (
    sleepQuality * weights.sleepQuality +
    normalizedDuration * weights.sleepDuration +
    sleepRegularity * weights.sleepRegularity +
    invertedStress * weights.stress +
    mood * weights.mood +
    invertedFatigue * weights.fatigue
  );
  
  return Math.round(tqr * 10) / 10;
};

/**
 * Calcula métricas de sono baseadas nos dados coletados
 */
export const calculateSleepMetrics = (data: DailyData): SleepMetrics => {
  return {
    sleepEfficiency: data.sleep_duration && data.sleep_quality ? 
      Math.min(100, (data.sleep_quality / 10) * (data.sleep_duration / 8) * 100) : 0,
    sleepDebt: data.sleep_duration ? Math.max(0, 8 - data.sleep_duration) : 0,
    sleepConsistency: data.sleep_regularity || 0
  };
};

/**
 * Calcula métricas de exaustão e recuperação
 */
export const calculateExhaustionMetrics = (data: DailyData): ExhaustionMetrics => {
  const recoveryScore = data.sleep_quality && data.fatigue_level ? 
    ((data.sleep_quality + (10 - data.fatigue_level)) / 2) : 0;
  
  return {
    recoveryScore,
    stressImpact: data.stress_level || 0,
    fatigueLevel: data.fatigue_level || 0,
    exhaustionLevel: data.exhaustion || 0
  };
};

/**
 * Calcula todas as métricas avançadas de treinamento
 */
export const calculateAdvancedTrainingMetrics = (
  currentData: DailyData,
  historicalData: DailyData[],
  trainingSessions: TrainingSession[]
): AdvancedTrainingMetrics => {
  
  // Extrai histórico de TSS
  const tssHistory = trainingSessions.map(session => session.tss || 0);
  
  // Calcula métricas básicas
  const tss = currentData.training_duration && currentData.training_intensity ? 
    calculateTSS(currentData.training_duration, currentData.training_intensity, currentData.rpe) : 0;
  
  const atl = calculateATL(tssHistory);
  const ctl = calculateCTL(tssHistory);
  const tsb = calculateTSB(ctl, atl);
  
  // Calcula TRIMP (estimado baseado na intensidade)
  const estimatedAvgHR = currentData.resting_hr ? 
    currentData.resting_hr + (currentData.training_intensity || 0) * 15 : 0;
  const trimp = currentData.training_duration ? 
    calculateTRIMP(currentData.training_duration, estimatedAvgHR) : 0;
  
  // Calcula monotonia
  const dailyMonotony = calculateDailyMonotony(tssHistory);
  const monotony = calculateMonotony(historicalData.map(d => d.daily_monotony || 0));
  
  // Calcula PSE, PSR e TQR
  const pse = currentData.rpe ? 
    calculatePSE(currentData.rpe, currentData.stress_level || 0, currentData.fatigue_level || 0) : 0;
  
  const psr = calculatePSR(
    currentData.sleep_quality || 0,
    currentData.sleep_duration || 0,
    currentData.resting_hr
  );
  
  const tqr = calculateTQR(
    currentData.sleep_quality || 0,
    currentData.sleep_duration || 0,
    currentData.sleep_regularity || 0,
    currentData.stress_level || 0,
    currentData.mood || 0,
    currentData.fatigue_level || 0
  );
  
  return {
    tss,
    atl,
    ctl,
    tsb,
    daily_monotony: dailyMonotony,
    monotony,
    trimp,
    pse,
    psr,
    tqr
  };
};

/**
 * Função principal para calcular todas as métricas
 */
export const calculateAllMetrics = (input: MetricCalculationInput) => {
  const { currentData, historicalData, trainingSessions } = input;
  
  const sleepMetrics = calculateSleepMetrics(currentData);
  const exhaustionMetrics = calculateExhaustionMetrics(currentData);
  const trainingMetrics = calculateAdvancedTrainingMetrics(currentData, historicalData, trainingSessions);
  
  return {
    sleep: sleepMetrics,
    exhaustion: exhaustionMetrics,
    training: trainingMetrics
  };
};

export default {
  calculateTSS,
  calculateATL,
  calculateCTL,
  calculateTSB,
  calculateTRIMP,
  calculateDailyMonotony,
  calculateMonotony,
  calculatePSE,
  calculatePSR,
  calculateTQR,
  calculateSleepMetrics,
  calculateExhaustionMetrics,
  calculateAdvancedTrainingMetrics,
  calculateAllMetrics
};

// AI_GENERATED_CODE_END