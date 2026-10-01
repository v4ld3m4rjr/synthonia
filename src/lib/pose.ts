// Detecção de pose com MediaPipe Tasks Vision (Pose Landmarker).
// O WASM é servido localmente (public/pose) e o modelo .task é baixado
// em runtime e cacheado pelo navegador.
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

const WASM_URL = `${import.meta.env.BASE_URL}pose/`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export const IDX: Record<string, number> = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFootIndex: 31,
  rightFootIndex: 32,
};

let landmarkerPromise: Promise<PoseLandmarker> | null = null;

async function create(delegate: 'GPU' | 'CPU'): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: 'VIDEO',
    numPoses: 1,
  });
}

export function initPose(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = create('GPU').catch(() => create('CPU'));
  }
  return landmarkerPromise;
}

export type NamedLM = Partial<Record<string, { x: number; y: number; v: number }>>;

export function extractNamed(landmarks: any[]): NamedLM | null {
  if (!landmarks || landmarks.length === 0) return null;
  const out: NamedLM = {};
  for (const [nome, i] of Object.entries(IDX)) {
    const p = landmarks[i];
    if (p) out[nome] = { x: p.x, y: p.y, v: p.visibility ?? 0 };
  }
  return out;
}

export const SKELETON: [string, string][] = [
  ['leftShoulder', 'rightShoulder'],
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftWrist'],
  ['rightShoulder', 'rightElbow'],
  ['rightElbow', 'rightWrist'],
  ['leftShoulder', 'leftHip'],
  ['rightShoulder', 'rightHip'],
  ['leftHip', 'rightHip'],
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'],
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle'],
  ['leftAnkle', 'leftHeel'],
  ['leftAnkle', 'leftFootIndex'],
  ['rightAnkle', 'rightHeel'],
  ['rightAnkle', 'rightFootIndex'],
];

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  lm: NamedLM,
  w: number,
  h: number,
  opts?: { color?: string; pointColor?: string; showPoints?: boolean },
) {
  ctx.lineWidth = Math.max(2, w / 320);
  ctx.strokeStyle = opts?.color ?? '#22d3ee';
  for (const [a, b] of SKELETON) {
    const pa = lm[a];
    const pb = lm[b];
    if (!pa || !pb || pa.v < 0.4 || pb.v < 0.4) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x * w, pa.y * h);
    ctx.lineTo(pb.x * w, pb.y * h);
    ctx.stroke();
  }
  if (opts?.showPoints !== false) {
    ctx.fillStyle = opts?.pointColor ?? '#f472b6';
    for (const key of Object.keys(lm)) {
      const p = lm[key]!;
      if (p.v < 0.4) continue;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, Math.max(2.5, w / 230), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
