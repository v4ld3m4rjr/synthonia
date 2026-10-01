import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, RotateCcw, Send, Loader2, ArrowRight } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';
import ReportView from '../components/ReportView';
import { useAuth } from '../contexts/AuthContext';
import { computeStaticAngles, computeDynamic, buildStaticReport, buildDynamicReport, composeResumo } from '../lib/analysis';
import { saveAssessment } from '../lib/supabase';
import type { NamedLM } from '../lib/pose';
import type { AnalysisResult, AssessmentType, AssessmentView, PoseFrame } from '../lib/types';

type Phase = 'config' | 'capture' | 'analyzing' | 'result';

const VISTAS: { v: AssessmentView; label: string; hint: string }[] = [
  { v: 'frontal', label: '🧍‍♂️ Frontal', hint: 'Fique de frente para a câmera, pés juntos, braços relaxados ao lado do corpo.' },
  { v: 'lateral', label: '🚶 Lateral', hint: 'Fique de perfil (lado esquerdo ou direito) para a câmera, olhando para frente.' },
  { v: 'posterior', label: '🔙 Posterior', hint: 'De costas para a câmera, pés juntos — avalia alinhamento de pelve e joelhos por trás.' },
];

export default function Assess() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [tipo, setTipo] = useState<AssessmentType>((params.get('mode') as AssessmentType) || 'statico');
  const [vista, setVista] = useState<AssessmentView>('frontal');
  const [phase, setPhase] = useState<Phase>('config');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const framesRef = useRef<PoseFrame[]>([]);
  const analyzingRef = useRef(false);

  const durationMs = tipo === 'statico' ? 6000 : 10000;

  const onFrame = useCallback((lm: NamedLM, tMs: number) => {
    const thin: Record<string, { x: number; y: number; visibility?: number }> = {};
    for (const [k, p] of Object.entries(lm)) {
      if (p) thin[k] = { x: p.x, y: p.y, visibility: p.v };
    }
    framesRef.current.push({ t: tMs, lm: thin });
  }, []);

  const startCapture = () => {
    framesRef.current = [];
    setResult(null);
    setPhase('capture');
    // pequeno atraso para o componente montar a câmera
    setTimeout(() => setRunning(true), 300);
  };

  const analyze = useCallback(async () => {
    if (analyzingRef.current) return;
    analyzingRef.current = true;
    setRunning(false);
    setPhase('analyzing');
    const frames = framesRef.current;
    await new Promise((r) => setTimeout(r, 900)); // UI de processamento

    try {
      if (frames.length < 8) {
        toast.error('Não foi possível rastrear seu corpo no vídeo. Melhore a iluminação, afaste a câmera e tente novamente.');
        setPhase('config');
        analyzingRef.current = false;
        return;
      }
      let res: AnalysisResult;
      if (tipo === 'statico') {
        const angles = computeStaticAngles(frames, vista);
        res = buildStaticReport(angles, vista);
      } else {
        const dyn = computeDynamic(frames, vista);
        res = buildDynamicReport(dyn, vista);
      }
      res.metricas.n_frames = frames.length;
      res.resumo = composeResumo(res, user?.nome);

      // IA opcional via OpenAI (se chave configurada)
      try {
        const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
        if (key) {
          const aiTxt = await refineWithLLM(key, res);
          if (aiTxt) res.resumo = aiTxt;
        }
      } catch (e) {
        console.warn('Refinamento LLM indisponível:', e);
      }

      setResult(res);
      setPhase('result');

      // salvar no Supabase / local
      if (user) {
        await saveAssessment({
          user_id: user.id,
          tipo,
          vista,
          score: res.score,
          resumo_ia: res.resumo,
          achados: res.achados,
          exercicios: res.exercicios,
          metricas: res.metricas,
          video_url: null,
          duracao_s: durationMs / 1000,
          frames_analisados: frames.length,
        });
        toast.success('Avaliação salva no seu histórico ✅');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao analisar o vídeo. Tente novamente.');
      setPhase('config');
    } finally {
      analyzingRef.current = false;
    }
  }, [tipo, vista, user, durationMs]);

  const onFinish = useCallback(() => {
    void analyze();
  }, [analyze]);

  const currentVista = useMemo(() => VISTAS.find((x) => x.v === vista)!, [vista]);

  return (
    <div className="min-h-screen pb-16">
      <header className="flex items-center justify-between px-5 sm:px-8 py-4 max-w-5xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium">
          <ChevronLeft size={18} /> Início
        </Link>
        <h1 className="font-black text-white tracking-tight">Nova análise</h1>
        <Link to="/history" className="text-sm text-cyan-400 hover:underline font-medium">Histórico</Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* Etapas */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 text-[11px] font-bold uppercase tracking-wider">
          {(['config', 'capture', 'analyzing', 'result'] as Phase[]).map((p, i) => (
            <div key={p} className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                phase === p ? 'bg-cyan-500 text-slate-950 border-cyan-400 scale-110' :
                ['config','capture','analyzing','result'].indexOf(phase) > i ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'border-slate-700 text-slate-500'
              }`}>{i + 1}</span>
              <span className={phase === p ? 'text-cyan-300' : 'text-slate-500 hidden sm:inline'}>
                {p === 'config' ? 'Configurar' : p === 'capture' ? 'Gravar' : p === 'analyzing' ? 'IA analisando' : 'Laudo'}
              </span>
              {i < 3 && <ArrowRight size={12} className="text-slate-700 hidden sm:block" />}
            </div>
          ))}
        </div>

        {phase === 'config' && (
          <div className="max-w-xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Tipo de análise</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setTipo('statico'); setVista(vista); }}
                  className={`rounded-xl border p-4 text-left transition ${tipo === 'statico' ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-700 hover:border-slate-500'}`}>
                  <div className="text-2xl mb-1">🧍</div>
                  <div className="font-bold text-white text-sm">Parado (estático)</div>
                  <div className="text-[12px] text-slate-400 mt-1">Postura em pé • 6 segundos</div>
                </button>
                <button onClick={() => { setTipo('dinamico'); setVista('lateral'); }}
                  className={`rounded-xl border p-4 text-left transition ${tipo === 'dinamico' ? 'border-fuchsia-400 bg-fuchsia-400/10' : 'border-slate-700 hover:border-slate-500'}`}>
                  <div className="text-2xl mb-1">🏃</div>
                  <div className="font-bold text-white text-sm">Correndo (dinâmico)</div>
                  <div className="text-[12px] text-slate-400 mt-1">Marcha/passada • 10 segundos</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Vista da câmera</label>
              <div className="grid grid-cols-3 gap-2">
                {VISTAS.map((v) => (
                  <button key={v.v} onClick={() => setVista(v.v)} disabled={tipo === 'dinamico' && v.v === 'posterior'}
                    className={`rounded-xl border px-2 py-3 text-sm font-semibold transition disabled:opacity-40 ${
                      vista === v.v ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300' : 'border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}>
                    {v.label}
                  </button>
                ))}
              </div>
              <p className="text-[13px] text-slate-400 mt-3 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
                💡 {currentVista.hint}
                {tipo === 'dinamico' && ' Para correr, posicione a câmera lateralmente a ~3 m e desloque-se pelo campo de visão (ou use uma esteira).'}
              </p>
            </div>

            <div className="text-[13px] text-slate-400 space-y-1 border-t border-slate-800 pt-4">
              <p>✅ Roupa justa ou que permita ver braços e pernas</p>
              <p>✅ Boa iluminação, fundo sem poluição visual</p>
              <p>✅ Corpo inteiro visível (da cabeça aos pés)</p>
            </div>

            <button onClick={startCapture}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold py-3.5 flex items-center justify-center gap-2 transition">
              <Send size={17} /> Iniciar gravação ({durationMs / 1000}s)
            </button>
          </div>
        )}

        {(phase === 'capture' || phase === 'analyzing') && (
          <div className="max-w-md mx-auto space-y-4">
            <CameraCapture
              running={running}
              onFrame={onFrame}
              onFinish={onFinish}
              durationMs={durationMs}
              mirror={tipo === 'statico'}
              overlayHint={
                tipo === 'statico'
                  ? `🧍 Mantenha-se parado — vista ${currentVista.label}`
                  : '🏃 Corra/marche atravessando o quadro da câmera'
              }
            />
            {phase === 'capture' && !running && (
              <p className="text-center text-sm text-slate-400 animate-pulse">Preparando câmera…</p>
            )}
            {phase === 'analyzing' && (
              <div className="flex items-center justify-center gap-3 text-cyan-300 font-semibold py-2">
                <Loader2 className="animate-spin" size={20} /> IA processando {framesRef.current.length} quadros…
              </div>
            )}
            <button onClick={() => { setRunning(false); setPhase('config'); }} className="w-full text-sm text-slate-400 hover:text-white py-1">
              Cancelar
            </button>
          </div>
        )}

        {phase === 'result' && result && (
          <div className="space-y-6">
            <ReportView result={result} nome={user?.nome} />
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setPhase('config'); setResult(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 hover:border-cyan-400 text-slate-200 font-semibold px-6 py-3 transition">
                <RotateCcw size={16} /> Refazer esta análise
              </button>
              <button onClick={() => { setTipo(tipo === 'statico' ? 'dinamico' : 'statico'); setVista(tipo === 'statico' ? 'lateral' : 'frontal'); setPhase('config'); setResult(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold px-6 py-3 transition">
                {tipo === 'statico' ? '🏃 Agora analisar a corrida' : '🧍 Agora analisar postura'}
              </button>
              <Link to="/history" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3 transition">
                📁 Ver histórico
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

async function refineWithLLM(apiKey: string, r: AnalysisResult): Promise<string | null> {
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Você é um biomecologista esportivo. Responda em português do Brasil, máx. 120 palavras, tom direto e didático, citando os dados recebidos.' },
      { role: 'user', content: JSON.stringify({ tipo: r.tipo, vista: r.vista, score: r.score, metricas: r.metricas, achados: r.achados.map((a) => `${a.severidade}: ${a.titulo} (${a.metrica ?? ''})`) }) },
    ],
    temperature: 0.4,
    max_tokens: 260,
  };
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!resp.ok) return null;
  const json = await resp.json();
  return json?.choices?.[0]?.message?.content ?? null;
}
