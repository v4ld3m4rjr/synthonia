// [AI Generated] Data: 19/12/2024
// Descrição: Utilitários para cálculos de métricas de saúde e performance
// Gerado por: Cursor AI
// Versão: TypeScript 5.2.2
// AI_GENERATED_CODE_START

/**
 * Calcula a duração do sono em horas baseado nos horários de dormir e acordar
 */
export const calculateSleepDuration = (bedtime: string, wakeTime: string): number => {
  const bed = new Date(`2000-01-01T${bedtime}:00`)
  let wake = new Date(`2000-01-01T${wakeTime}:00`)
  
  // Se o horário de acordar é menor que o de dormir, assumir que é no dia seguinte
  if (wake <= bed) {
    wake = new Date(`2000-01-02T${wakeTime}:00`)
  }
  
  const diffMs = wake.getTime() - bed.getTime()
  return diffMs / (1000 * 60 * 60) // Converter para horas
}

/**
 * Calcula a carga da sessão de treino (RPE × Duração)
 */
export const calculateSessionLoad = (rpe: number, durationMinutes: number): number => {
  return rpe * durationMinutes
}

/**
 * Calcula a densidade do treino (tonelagem / duração)
 */
export const calculateTrainingDensity = (tonnage: number, durationMinutes: number): number => {
  if (durationMinutes === 0) return 0
  return tonnage / durationMinutes
}

/**
 * Calcula o índice de prontidão baseado nas métricas de recovery
 */
export const calculateReadinessScore = (
  sleepQuality: number,
  fatigueLevel: number,
  muscleSoreness: number,
  stressLevel: number,
  moodLevel: number,
  prsScore: number
): number => {
  // Fatores positivos (quanto maior, melhor)
  const positiveFactors = (sleepQuality + moodLevel + prsScore) / 3
  
  // Fatores negativos (quanto menor, melhor - por isso invertemos)
  const negativeFactors = (fatigueLevel + muscleSoreness + stressLevel) / 3
  
  // Fórmula: média entre fatores positivos e fatores negativos invertidos
  const readiness = ((positiveFactors + (10 - negativeFactors)) / 2)
  
  return Math.round(readiness * 10) / 10
}

/**
 * Calcula a eficiência do sono
 */
export const calculateSleepEfficiency = (
  sleepDuration: number, 
  timeInBed: number
): number => {
  if (timeInBed === 0) return 0
  return (sleepDuration / timeInBed) * 100
}

/**
 * Calcula tendência simples baseada nos primeiros e últimos valores
 */
export const calculateTrend = (values: number[]): number => {
  if (values.length < 6) return 0
  
  const firstThree = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3
  const lastThree = values.slice(-3).reduce((a, b) => a + b, 0) / 3
  
  return lastThree - firstThree
}

/**
 * Calcula estatísticas básicas de um array de números
 */
export const calculateStats = (values: number[]) => {
  if (values.length === 0) return { avg: 0, min: 0, max: 0, std: 0 }
  
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)
  
  // Desvio padrão
  const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length
  const std = Math.sqrt(variance)
  
  return { avg, min, max, std }
}

/**
 * Determina a cor baseada na intensidade da dor
 */
export const getPainColor = (intensity: number): string => {
  if (intensity <= 3) return 'text-green-500'
  if (intensity <= 6) return 'text-yellow-500'
  if (intensity <= 8) return 'text-orange-500'
  return 'text-red-500'
}

/**
 * Determina o rótulo baseado na intensidade da dor
 */
export const getPainLabel = (intensity: number): string => {
  if (intensity <= 3) return 'Leve'
  if (intensity <= 6) return 'Moderada'
  if (intensity <= 8) return 'Intensa'
  return 'Severa'
}

/**
 * Determina a cor baseada no score de prontidão
 */
export const getReadinessColor = (score: number): string => {
  if (score >= 7) return 'text-green-500'
  if (score >= 5) return 'text-yellow-500'
  return 'text-red-500'
}

/**
 * Determina o rótulo baseado no score de prontidão
 */
export const getReadinessLabel = (score: number): string => {
  if (score >= 7) return 'Excelente'
  if (score >= 5) return 'Moderada'
  return 'Baixa'
}

/**
 * Formata duração em minutos para formato legível
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

/**
 * Calcula a zona de frequência cardíaca baseada na idade
 */
export const calculateHRZones = (age: number) => {
  const maxHR = 220 - age
  
  return {
    zone1: { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6) }, // Recuperação
    zone2: { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) }, // Aeróbico
    zone3: { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8) }, // Limiar
    zone4: { min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9) }, // Anaeróbico
    zone5: { min: Math.round(maxHR * 0.9), max: maxHR } // Neuromuscular
  }
}

/**
 * Calcula o volume de treino semanal
 */
export const calculateWeeklyVolume = (sessions: any[]): number => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  return sessions
    .filter(session => new Date(session.date) >= weekAgo)
    .reduce((total, session) => total + (session.session_load || 0), 0)
}

/**
 * Determina o status de recuperação baseado em múltiplas métricas
 */
export const getRecoveryStatus = (
  sleepQuality: number,
  fatigueLevel: number,
  stressLevel: number
): { status: string; color: string; recommendation: string } => {
  const avgScore = (sleepQuality + (10 - fatigueLevel) + (10 - stressLevel)) / 3
  
  if (avgScore >= 7) {
    return {
      status: 'Ótima Recuperação',
      color: 'text-green-600',
      recommendation: 'Você está bem recuperado! Pode treinar com intensidade normal.'
    }
  } else if (avgScore >= 5) {
    return {
      status: 'Recuperação Moderada',
      color: 'text-yellow-600',
      recommendation: 'Considere um treino de intensidade moderada ou foque em recuperação ativa.'
    }
  } else {
    return {
      status: 'Recuperação Insuficiente',
      color: 'text-red-600',
      recommendation: 'Priorize descanso e técnicas de recuperação. Evite treinos intensos.'
    }
  }
}
/**
 * Calcula a zona de frequência cardíaca baseada na idade
 */
export const calculateHRZones = (age: number) => {
  const maxHR = 220 - age
  
  return {
    zone1: { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6) }, // Recuperação
    zone2: { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) }, // Aeróbico
    zone3: { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8) }, // Limiar
    zone4: { min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9) }, // Anaeróbico
    zone5: { min: Math.round(maxHR * 0.9), max: maxHR } // Neuromuscular
  }
}
// AI_GENERATED_CODE_END