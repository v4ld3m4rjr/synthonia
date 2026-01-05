// Utilitário para calcular qualidade dos dados e cores correspondentes

export interface QualityResult {
  score: number; // 0-100
  color: string;
  level: 'ruim' | 'abaixo' | 'mediano' | 'bom' | 'muito-bom' | 'excelente';
}

// Definições de ranges para diferentes métricas
export const METRIC_RANGES = {
  // Sono (horas)
  sleepDuration: { min: 4, max: 10, optimal: [7, 9] },
  sleepQuality: { min: 1, max: 10, optimal: [7, 10] },
  sleepEfficiency: { min: 0, max: 100, optimal: [85, 100] },
  
  // Estado físico e mental (1-10)
  fatigue: { min: 1, max: 10, optimal: [1, 3], inverted: true }, // Menor é melhor
  mood: { min: 1, max: 10, optimal: [7, 10] },
  stress: { min: 1, max: 10, optimal: [1, 3], inverted: true }, // Menor é melhor
  readinessScore: { min: 0, max: 100, optimal: [70, 100] },
  
  // Treinamento
  rpe: { min: 1, max: 10, optimal: [4, 7] }, // Moderado é ideal
  trainingDuration: { min: 0, max: 180, optimal: [30, 90] },
  intensity: { min: 1, max: 10, optimal: [5, 8] },
  tss: { min: 0, max: 300, optimal: [50, 150] },
  
  // Métricas calculadas
  atl: { min: 0, max: 200, optimal: [40, 120] },
  ctl: { min: 0, max: 150, optimal: [30, 100] },
  tsb: { min: -50, max: 50, optimal: [-10, 10] },
  monotony: { min: 0, max: 5, optimal: [0, 2], inverted: true }, // Menor é melhor
  
  // Fisiológicos
  heartRate: { min: 40, max: 200, optimal: [60, 100] },
  hrv: { min: 10, max: 100, optimal: [30, 60] },
};

// Cores baseadas na qualidade (vermelho → violeta)
export const QUALITY_COLORS = {
  ruim: '#ef4444',      // Vermelho
  abaixo: '#f97316',    // Laranja
  mediano: '#eab308',   // Amarelo
  bom: '#22c55e',       // Verde
  'muito-bom': '#3b82f6', // Azul
  excelente: '#8b5cf6'  // Violeta
};

/**
 * Calcula a qualidade de um valor baseado nos ranges definidos
 */
export function calculateDataQuality(
  value: number,
  metricKey: keyof typeof METRIC_RANGES
): QualityResult {
  const range = METRIC_RANGES[metricKey];
  if (!range) {
    return { score: 50, color: QUALITY_COLORS.mediano, level: 'mediano' };
  }

  const { min, max, optimal, inverted = false } = range;
  
  // Normaliza o valor para 0-100
  let normalizedValue = ((value - min) / (max - min)) * 100;
  normalizedValue = Math.max(0, Math.min(100, normalizedValue));
  
  // Se invertido (menor é melhor), inverte a escala
  if (inverted) {
    normalizedValue = 100 - normalizedValue;
  }
  
  // Ajusta baseado no range ótimo se definido
  if (optimal) {
    const [optimalMin, optimalMax] = optimal;
    let optimalNormalizedMin = ((optimalMin - min) / (max - min)) * 100;
    let optimalNormalizedMax = ((optimalMax - min) / (max - min)) * 100;
    
    if (inverted) {
      optimalNormalizedMin = 100 - optimalNormalizedMin;
      optimalNormalizedMax = 100 - optimalNormalizedMax;
      [optimalNormalizedMin, optimalNormalizedMax] = [optimalNormalizedMax, optimalNormalizedMin];
    }
    
    // Se está no range ótimo, aumenta o score
    if (normalizedValue >= optimalNormalizedMin && normalizedValue <= optimalNormalizedMax) {
      normalizedValue = Math.max(normalizedValue, 75); // Mínimo 75 se está no ótimo
    }
  }
  
  // Determina o nível e cor baseado no score
  let level: QualityResult['level'];
  let color: string;
  
  if (normalizedValue >= 90) {
    level = 'excelente';
    color = QUALITY_COLORS.excelente;
  } else if (normalizedValue >= 75) {
    level = 'muito-bom';
    color = QUALITY_COLORS['muito-bom'];
  } else if (normalizedValue >= 60) {
    level = 'bom';
    color = QUALITY_COLORS.bom;
  } else if (normalizedValue >= 40) {
    level = 'mediano';
    color = QUALITY_COLORS.mediano;
  } else if (normalizedValue >= 25) {
    level = 'abaixo';
    color = QUALITY_COLORS.abaixo;
  } else {
    level = 'ruim';
    color = QUALITY_COLORS.ruim;
  }
  
  return {
    score: Math.round(normalizedValue),
    color,
    level
  };
}

/**
 * Interpola entre duas cores para criar transições graduais
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Obtém cor com transição gradual baseada no score
 */
export function getGradualColor(score: number): string {
  const colors = Object.values(QUALITY_COLORS);
  const segments = colors.length - 1;
  const segmentSize = 100 / segments;
  
  const segmentIndex = Math.floor(score / segmentSize);
  const segmentProgress = (score % segmentSize) / segmentSize;
  
  if (segmentIndex >= segments) {
    return colors[colors.length - 1];
  }
  
  return interpolateColor(colors[segmentIndex], colors[segmentIndex + 1], segmentProgress);
}