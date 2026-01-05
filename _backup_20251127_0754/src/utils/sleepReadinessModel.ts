// ====================================================== 
// SynthonIA AI - Modelo de Sono e Prontidão (versão 1.0) 
// ====================================================== 

function clamp(x: number, a: number, b: number): number { 
  return Math.max(a, Math.min(b, x)); 
} 

function pickLoad24(TSS24: number | null, TRIMP24: number | null): number { 
  if (TSS24 !== null && TSS24 !== undefined) return TSS24; 
  if (TRIMP24 !== null && TRIMP24 !== undefined) return TRIMP24; 
  return 0; 
} 

function pickLoad48( 
  TSS24: number | null, 
  TSS48_prev: number | null, 
  TRIMP24: number | null, 
  TRIMP48_prev: number | null 
): number { 
  const L24 = pickLoad24(TSS24, TRIMP24); 
  const L48prev = 
    TSS48_prev !== null && TSS48_prev !== undefined 
      ? TSS48_prev 
      : TRIMP48_prev || 0; 
  return 0.6 * L24 + 0.4 * L48prev; 
} 

export interface SleepReadinessInputs {
  RHR_today: number; 
  RHR_base: number; 
  TSS24: number | null; 
  TSS48_prev: number | null; 
  TRIMP24: number | null; 
  TRIMP48_prev: number | null; 
  Sleep_last: number; 
  S_ref: number; 
  TQR: number; 
  Psy_stress: number | null; 
  L_thr: number; 
}

export interface SleepReadinessResult {
  Sleep_needed_tonight: number;
  Time_to_ready_hours: number;
  RecoveryIndex: number;
}

export function computeRecovery(inputs: SleepReadinessInputs): SleepReadinessResult { 
  const { 
    RHR_today, 
    RHR_base, 
    TSS24, 
    TSS48_prev, 
    TRIMP24, 
    TRIMP48_prev, 
    Sleep_last, 
    S_ref, 
    TQR, 
    Psy_stress, 
    L_thr, 
  } = inputs; 

  // === 1. Normalizações básicas === 
  const Load24 = pickLoad24(TSS24, TRIMP24); 
  const Load24_norm = clamp(Load24 / L_thr, 0, 2); 

  const Load48 = pickLoad48(TSS24, TSS48_prev, TRIMP24, TRIMP48_prev); 
  const Load48_norm = clamp(Load48 / (1.6 * L_thr), 0, 2); 

  const RHR_dev = clamp((RHR_today - RHR_base) / RHR_base, -0.15, 0.15); 
  const RHR_stress = (RHR_dev + 0.15) / 0.3; // 0..1 

  const Sleep_ratio = Sleep_last / S_ref; 
  const Sleep_debt = clamp(S_ref - Sleep_last, 0, 4); 

  const TQR_norm = clamp(TQR / 10, 0, 1); 
  const Psy_norm = clamp( 
    (Psy_stress !== null && Psy_stress !== undefined 
      ? Psy_stress 
      : 10 - TQR) / 10, 
    0, 
    1 
  ); 

  // === 2. Índice de Recuperação === 
  const Sleep_component = clamp(Sleep_ratio, 0, 1); 
  const Load_component = 1 - clamp(0.5 * Load24_norm + 0.5 * Load48_norm, 0, 1); 
  const RHR_component = 1 - RHR_stress; 
  const Psy_component = 1 - 0.7 * Psy_norm - 0.3 * (1 - TQR_norm); 

  const RecoveryIndex_0to1 = clamp( 
    0.35 * Sleep_component + 
      0.25 * RHR_component + 
      0.25 * Load_component + 
      0.15 * Psy_component, 
    0, 
    1 
  ); 
  const RecoveryIndex = Math.round(100 * RecoveryIndex_0to1); 

  // === 3. Horas de sono necessárias === 
  const Extra_from_debt = 0.55 * Sleep_debt; 
  const Extra_from_load = 0.9 * Load48_norm; 
  const Extra_from_RHR = 0.8 * RHR_stress; 
  const Extra_from_psy = 0.6 * Psy_norm; 
  const Bonus_from_TQR = 0.6 * TQR_norm; 

  const Need_extra = clamp( 
    Extra_from_debt + 
      Extra_from_load + 
      Extra_from_RHR + 
      Extra_from_psy - 
      Bonus_from_TQR, 
    0, 
    3 
  ); 

  let Recovery_bonus = 0; 
  if (RecoveryIndex >= 90) Recovery_bonus = 0.5; 
  else if (RecoveryIndex >= 80) Recovery_bonus = 0.25; 

  const Sleep_needed_tonight = clamp( 
    S_ref + Need_extra - Recovery_bonus, 
    6.0, 
    9.5 
  ); 

  // === 4. Tempo até prontidão (em horas) === 
  const Base_hours = 8 + 10 * Load24_norm + 6 * Load48_norm; 

  const Sleep_modifier = 1 - clamp(0.35 * (Sleep_ratio - 1.0), -0.35, 0.35); 
  const TQR_shift = -3 * TQR_norm; 
  const RHR_shift = 6 * RHR_stress; 
  const Psy_shift = 2 * Psy_norm; 

  const Time_to_ready_hours = clamp( 
    Base_hours * Sleep_modifier + TQR_shift + RHR_shift + Psy_shift, 
    6, 
    48 
  ); 

  return { 
    Sleep_needed_tonight: Number(Sleep_needed_tonight.toFixed(2)), 
    Time_to_ready_hours: Number(Time_to_ready_hours.toFixed(2)), 
    RecoveryIndex, 
  }; 
} 

// ================== 
// EXEMPLO DE USO 
// ==================
/*
const result = computeRecovery({
  RHR_today: 58,
  RHR_base: 55,
  TSS24: 95,
  TSS48_prev: 60,
  TRIMP24: null,
  TRIMP48_prev: null,
  Sleep_last: 6.8,
  S_ref: 7.5,
  TQR: 6,
  Psy_stress: 5,
  L_thr: 100,
});

// console.log(result);
// Saída esperada:
// {
//   Sleep_needed_tonight: 8.2,
//   Time_to_ready_hours: 19,
//   RecoveryIndex: 72
// }
*/