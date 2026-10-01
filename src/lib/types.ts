// ===== Tipos centrais do BiomechAI =====

export type Role = 'atleta' | 'treinador' | 'fisioterapeuta';

export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  role: Role;
  idade?: number | null;
  peso?: number | null;
  altura?: number | null;
  created_at?: string;
}

export type AssessmentType = 'statico' | 'dinamico';
export type AssessmentView = 'frontal' | 'lateral' | 'posterior';

export interface Finding {
  id: string;
  severidade: 'ok' | 'atencao' | 'alerta';
  titulo: string;
  descricao: string;
  regiao: string;
  metrica?: string; // ex: "Ângulo joelho: 168° (ideal ~180°)"
}

export interface ExerciseRecommendation {
  nome: string;
  objetivo: string;
  series: string;
  frequencia: string;
  tipo: 'mobilidade' | 'forca' | 'estabilizacao' | 'correcao_gesto' | 'alongamento';
}

export interface MetricsData {
  [chave: string]: number | null;
}

export interface AssessmentRecord {
  id: string;
  user_id: string;
  tipo: AssessmentType;
  vista: AssessmentView;
  score: number;
  resumo_ia: string;
  achados: Finding[];
  exercicios: ExerciseRecommendation[];
  metricas: MetricsData;
  video_url: string | null;
  duracao_s: number;
  frames_analisados: number;
  created_at: string;
}

// ===== Pose / visão computacional =====

export interface LandmarkPt {
  x: number; // normalizado 0..1 (relativo ao frame de origem)
  y: number;
  visibility?: number;
}

export interface PoseFrame {
  t: number; // timestamp em ms relativo ao início da captura
  lm: Partial<Record<string, LandmarkPt>>; // landmarks nomeados
}

export interface StaticAngles {
  troncoFrontal: number | null; // desvio lateral do tronco (graus, 0 = neutro)
  quadrilLateral: number | null; // anteversão estimada (ombro-quadril-tornozelo)
  quadrilFrontal: number | null; // inclinação pélvica lateral
  joelhosLateral: number | null; // ângulo joelho (180 = estendido)
  valgoVaro: number | null; // + vago / - varo em vista frontal (graus)
  cabeca: number | null; // projeção anterior da cabeça (graus)
  assimetriaOmbros: number | null; // diferença relativa de altura dos ombros (%)
  assimetriaQuadris: number | null; // diferença relativa de altura dos quadris (%)
}

export interface GaitCycle {
  indice: number;
  duracao_ms: number | null;
  amplitudeJoelho: number | null;
  amplitudeQuadril: number | null;
  amplitudeTornozelo: number | null;
  picoFlexJoelhoSwing: number | null;
  contatoAntePasso: boolean | null; // false = retro passo (heel striker)
  recuoTronco: number | null; // graus (torso leaning back)
  oscVerticalQuadril: number | null; // % da altura do corpo
}

export interface DynamicSummary {
  ciclos: GaitCycle[];
  cadenciaSpm: number | null;
  simetria: number | null; // 0..100
  nFrames: number;
  duracaoMs: number;
}

export interface AnalysisResult {
  tipo: AssessmentType;
  vista: AssessmentView;
  score: number;
  resumo: string;
  achados: Finding[];
  exercicios: ExerciseRecommendation[];
  metricas: MetricsData;
}
