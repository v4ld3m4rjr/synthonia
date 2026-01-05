// ==========================================
// 1. CÁLCULOS FÍSICOS (WORKLOAD)
// ==========================================

export const calculateInternalLoad = (duration: number, rpe: number): number => {
  return duration * rpe;
};

export const calculateTotalTonnage = (exercises: { sets: number; reps: number; load_kg: number }[]): number => {
  return exercises.reduce((acc, curr) => acc + (curr.sets * curr.reps * curr.load_kg), 0);
};

export const calculateMonotony = (dailyLoads: number[]): number => {
  if (dailyLoads.length === 0) return 0;
  const avg = dailyLoads.reduce((a, b) => a + b, 0) / dailyLoads.length;
  
  // Desvio padrão
  const squareDiffs = dailyLoads.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  const stdDev = Math.sqrt(avgSquareDiff);

  if (stdDev === 0) return 0;
  return avg / stdDev;
};

export const calculateStrain = (weeklyLoad: number, monotony: number): number => {
  return weeklyLoad * monotony;
};

// ACWR: Acute (7 days) vs Chronic (28 days or 42 days)
// Usando Média Móvel Exponencial (EWMA) é mais preciso, mas para simplificar aqui usaremos média simples por enquanto
// ou implementamos EWMA se tivermos dados suficientes.
export const calculateACWR = (recentLoads: number[], chronicLoads: number[]): { acwr: number; atl: number; ctl: number; tsb: number } => {
  const atl = recentLoads.length > 0 
    ? recentLoads.reduce((a, b) => a + b, 0) / recentLoads.length 
    : 0;
    
  const ctl = chronicLoads.length > 0 
    ? chronicLoads.reduce((a, b) => a + b, 0) / chronicLoads.length 
    : 0;

  const acwr = ctl > 0 ? atl / ctl : 0;
  const tsb = ctl - atl; // Training Stress Balance (Form) -> Positivo = Fresco, Negativo = Cansado

  return { acwr, atl, ctl, tsb };
};

export const checkInjuryRisk = (monotony: number, tsb: number): boolean => {
  // Constantes padrão
  const MONOTONY_THRESHOLD = 2.0;
  const TSB_THRESHOLD = -30; // Muito cansado

  return monotony > MONOTONY_THRESHOLD || tsb < TSB_THRESHOLD;
};

// ==========================================
// 2. CÁLCULOS MENTAIS / SCORES
// ==========================================

export const calculatePHQ9Score = (answers: Record<string, number>): number => {
  return Object.values(answers).reduce((acc, val) => acc + val, 0);
};

export const calculateGAD7Score = (answers: Record<string, number>): number => {
  return Object.values(answers).reduce((acc, val) => acc + val, 0);
};

export const checkManiaRisk = (stressScoreApp: number, energyLevel: number): boolean => {
  // Se (Stress App > 80 E Energia > 8) -> Exibir alerta visual.
  return stressScoreApp > 80 && energyLevel > 8;
};

export const checkSuicideRisk = (riskLevel: number): boolean => {
  return riskLevel >= 5; // Risco moderado a alto
};

// ==========================================
// 3. NUMEROLOGIA (EXTRAS)
// ==========================================

const calculateSingleDigitSum = (num: number): number => {
  let sum = num;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) { // Números mestres
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return sum;
};

export const calculateDestinyNumber = (birthDate: string): number => {
  // birthDate format: YYYY-MM-DD
  const cleanDate = birthDate.replace(/-/g, '');
  const sum = cleanDate.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  return calculateSingleDigitSum(sum);
};

export const calculateSoulNumber = (fullName: string): number => {
  const vowels: Record<string, number> = {
    'a': 1, 'e': 5, 'i': 9, 'o': 6, 'u': 3,
    'à': 1, 'á': 1, 'ã': 1, 'â': 1,
    'é': 5, 'ê': 5,
    'í': 9,
    'ó': 6, 'õ': 6, 'ô': 6,
    'ú': 3
  };

  const normalizedName = fullName.toLowerCase();
  let sum = 0;

  for (let char of normalizedName) {
    if (vowels[char]) {
      sum += vowels[char];
    }
  }

  return calculateSingleDigitSum(sum);
};

export const getNumerologyDescription = (destinyNum: number, soulNum: number): string => {
  return `Destino ${destinyNum}: Caminho de vida focado em ${getDestinyMeaning(destinyNum)}. Alma ${soulNum}: Motivação interna ligada a ${getSoulMeaning(soulNum)}.`;
};

const getDestinyMeaning = (num: number): string => {
  const meanings: Record<number, string> = {
    1: "Liderança e Inovação",
    2: "Cooperação e Diplomacia",
    3: "Comunicação e Criatividade",
    4: "Estabilidade e Trabalho",
    5: "Liberdade e Mudança",
    6: "Responsabilidade e Cuidado",
    7: "Análise e Espiritualidade",
    8: "Poder e Materialismo",
    9: "Compaixão e Humanitarismo",
    11: "Iluminação Espiritual",
    22: "Construção de Grandes Feitos",
    33: "Serviço Universal"
  };
  return meanings[num] || "Mistério";
};

const getSoulMeaning = (num: number): string => {
  const meanings: Record<number, string> = {
    1: "Independência",
    2: "Harmonia",
    3: "Autoexpressão",
    4: "Ordem",
    5: "Aventura",
    6: "Família",
    7: "Conhecimento",
    8: "Sucesso",
    9: "Servir ao próximo",
    11: "Inspiração",
    22: "Realização",
    33: "Amor Incondicional"
  };
  return meanings[num] || "Desejo Oculto";
};
