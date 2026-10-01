import { useEffect, useRef, useState } from 'react';
import { initPose, extractNamed, drawSkeleton, type NamedLM } from '../lib/pose';

interface Props {
  /** dispara a captura; onFrame recebe landmarks de cada frame */
  running: boolean;
  onFrame?: (lm: NamedLM, tMs: number) => void;
  onFinish?: () => void;
  durationMs?: number;
  mirror?: boolean;
  overlayHint?: string;
}

export default function CameraCapture({ running, onFrame, onFinish, durationMs = 6000, mirror = true, overlayHint }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const lastTsRef = useRef<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const poseRef = useRef<Awaited<ReturnType<typeof initPose>> | null>(null);

  // câmera
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch (e: any) {
        setError(
          e?.name === 'NotAllowedError'
            ? 'Permissão da câmera negada. Habilite o acesso nas configurações do navegador.'
            : 'Não foi possível acessar a câmera. Verifique se há uma câmera disponível.',
        );
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // loop de inferência
  useEffect(() => {
    if (!running || !ready) return;
    let alive = true;
    (async () => {
      try {
        poseRef.current = await initPose();
      } catch {
        setError('Falha ao carregar o modelo de IA (verifique a conexão na primeira execução).');
        return;
      }
      startRef.current = performance.now();
      lastTsRef.current = -1;

      const tick = () => {
        if (!alive) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const landmarker = poseRef.current;
        if (video && canvas && landmarker && video.readyState >= 2) {
          const now = performance.now();
          const elapsed = now - startRef.current;
          setProgress(Math.min(1, elapsed / durationMs));
          if (now !== lastTsRef.current) {
            lastTsRef.current = now;
            let res: any;
            try {
              res = landmarker.detectForVideo(video, now);
            } catch {
              res = null;
            }
            const lm = res ? extractNamed(res.landmarks?.[0] ?? []) : null;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              if (lm) drawSkeleton(ctx, lm, canvas.width, canvas.height);
            }
            if (lm && onFrame) onFrame(lm, elapsed);
          }
          if (elapsed >= durationMs) {
            onFinish?.();
            return;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    })();
    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, ready]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${mirror ? '-scale-x-100' : ''}`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${mirror ? '-scale-x-100' : ''}`}
      />
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm bg-slate-900/80">
          Iniciando câmera…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-rose-300 text-sm bg-slate-900/90">
          {error}
        </div>
      )}
      {overlayHint && ready && (
        <div className="absolute top-3 left-3 right-3 text-center text-[13px] font-medium text-cyan-200 bg-slate-950/70 backdrop-blur rounded-lg px-3 py-2 border border-cyan-500/30">
          {overlayHint}
        </div>
      )}
      {running && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-white bg-rose-600/90 rounded-full px-3 py-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> GRAVANDO {(durationMs / 1000 - (durationMs * progress) / 1000).toFixed(0)}s
          </div>
        </>
      )}
    </div>
  );
}
