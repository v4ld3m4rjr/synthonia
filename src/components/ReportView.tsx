import type { AnalysisResult, Finding } from '../lib/types';
import { AlertTriangle, CheckCircle2, AlertOctagon, Sparkles, Dumbbell } from 'lucide-react';

const sevIcon = {
  ok: <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />,
  atencao: <AlertTriangle size={17} className="text-amber-400 shrink-0" />,
  alerta: <AlertOctagon size={17} className="text-rose-400 shrink-0" />,
};
const sevBg = {
  ok: 'border-emerald-500/25 bg-emerald-500/5',
  atencao: 'border-amber-500/30 bg-amber-500/5',
  alerta: 'border-rose-500/35 bg-rose-500/8',
};

export function ScoreRing({ score }: { score: number }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  const color = score >= 85 ? '#34d399' : score >= 65 ? '#fbbf24' : '#fb7185';
  return (
    <div className="relative w-[120px] h-[120px] shrink-0">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={R} stroke="#1e293b" strokeWidth="10" fill="none" />
        <circle cx="60" cy="60" r={R} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * C} ${C}`} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400">/100 score</span>
      </div>
    </div>
  );
}

export function FindingCard({ f }: { f: Finding }) {
  return (
    <div className={`rounded-xl border p-4 ${sevBg[f.severidade]}`}>
      <div className="flex gap-3 items-start">
        {sevIcon[f.severidade]}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-white text-sm">{f.titulo}</h4>
            <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{f.regiao}</span>
          </div>
          <p className="text-[13px] text-slate-300 leading-relaxed mt-1.5">{f.descricao}</p>
          {f.metrica && <p className="text-[12px] text-cyan-300/90 font-mono mt-2">▸ {f.metrica}</p>}
        </div>
      </div>
    </div>
  );
}

const tipoLabel: Record<string, string> = {
  mobilidade: 'Mobilidade', forca: 'Força', estabilizacao: 'Estabilização',
  correcao_gesto: 'Correção de gesto', alongamento: 'Alongamento',
};
const tipoColor: Record<string, string> = {
  mobilidade: 'bg-sky-500/15 text-sky-300', forca: 'bg-rose-500/15 text-rose-300',
  estabilizacao: 'bg-violet-500/15 text-violet-300', correcao_gesto: 'bg-amber-500/15 text-amber-300',
  alongamento: 'bg-emerald-500/15 text-emerald-300',
};

export default function ReportView({ result, nome }: { result: AnalysisResult; nome?: string }) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho com resumo da IA */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-cyan-500/25 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={17} className="text-cyan-300" />
          <h3 className="font-bold text-cyan-300 text-sm uppercase tracking-wider">Análise da Inteligência Artificial</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <ScoreRing score={result.score} />
          <p className="text-[14px] text-slate-200 leading-relaxed flex-1">{result.resumo}</p>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(result.metricas)
          .filter(([k]) => !['n_frames'].includes(k))
          .slice(0, 8)
          .map(([k, v]) =>
            v == null ? null : (
              <div key={k} className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-white">
                  {Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)}
                  {k.includes('graus') || k.includes('angulo') || k.includes('valgo') || k.includes('tronco') || k.includes('cabeca') || k.includes('quadril_lateral') || k.includes('joelho') ? '°' : ''}
                  {k.includes('spm') ? ' ppm' : ''}
                  {k.includes('simetria') ? '%' : ''}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500 mt-1 leading-tight">{labelMetrica(k)}</div>
              </div>
            ),
          )}
      </div>

      {/* Achados */}
      <section>
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">🔎 O que a IA encontrou</h3>
        <div className="space-y-3">
          {result.achados.map((f) => <FindingCard key={f.id} f={f} />)}
        </div>
      </section>

      {/* Exercícios */}
      <section>
        <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Dumbbell size={18} className="text-fuchsia-400" /> 🏋️ Exercícios recomendados</h3>
        {result.exercicios.length === 0 ? (
          <p className="text-sm text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            Nenhum desvio relevante — mantenha rotina de força 2–3×/semana e aquecimento dinâmico antes de correr.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {result.exercicios.map((e) => (
              <div key={e.nome} className="bg-slate-900/70 border border-slate-800 hover:border-fuchsia-500/40 rounded-xl p-4 transition">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-sm leading-snug">{e.nome}</h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0 ${tipoColor[e.tipo]}`}>{tipoLabel[e.tipo]}</span>
                </div>
                <p className="text-[13px] text-slate-300 mt-2">🎯 {e.objetivo}</p>
                <div className="flex gap-4 mt-2 text-[12px] text-slate-400">
                  <span>📊 {e.series}</span>
                  <span>🗓️ {e.frequencia}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-[12px] text-slate-600 text-center pt-2">
        Relatório gerado por IA local (MediaPipe + regras biomecânicas){nome ? ` para ${nome}` : ''}. Não substitui avaliação clínica presencial.
      </p>
    </div>
  );
}

function labelMetrica(k: string): string {
  const map: Record<string, string> = {
    troncoFrontal: 'Tronco (desvio)', quadrilLateral: 'Ângulo quadril', quadrilFrontal: 'Pelve (plano)',
    joelhosLateral: 'Ângulo joelho', valgoVaro: 'Valgo/Varo', cabeca: 'Projeção cabeça',
    assimetriaOmbros: 'Assim. ombros %', assimetriaQuadris: 'Assim. pelve %',
    cadencia_spm: 'Cadência', simetria: 'Simetria', amplitude_joelho: 'Amplitude joelho',
    flexao_swing_joelho: 'Flexão swing', oscilacao_quadril_pct: 'Oscilação quadril', n_ciclos: 'Ciclos detectados',
  };
  return map[k] || k.replace(/_/g, ' ');
}
