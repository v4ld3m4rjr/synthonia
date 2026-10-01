import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ReportView from '../components/ReportView';
import { ScoreRing } from '../components/ReportView';
import { useAuth } from '../contexts/AuthContext';
import { listAssessments } from '../lib/supabase';
import type { AssessmentRecord } from '../lib/types';

export default function History() {
  const { user } = useAuth();
  const [items, setItems] = useState<AssessmentRecord[] | null>(null);
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listAssessments(user.id).then((r) => {
      setItems(r);
      if (r.length) setSel(r[0].id);
    });
  }, [user]);

  const current = items?.find((i) => i.id === sel) || null;

  return (
    <div className="min-h-screen pb-16">
      <header className="flex items-center justify-between px-5 sm:px-8 py-4 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium">
          <ChevronLeft size={18} /> Início
        </Link>
        <h1 className="font-black text-white tracking-tight">📁 Histórico de avaliações</h1>
        <Link to="/assess" className="text-sm text-cyan-400 hover:underline font-medium">+ Nova</Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Lista */}
        <aside className="space-y-2 lg:sticky lg:top-6">
          {items == null && <p className="text-slate-500 text-sm animate-pulse p-4">Carregando…</p>}
          {items?.length === 0 && (
            <div className="bg-slate-900/60 border border-dashed border-slate-700 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-sm">Nenhuma avaliação ainda.</p>
              <Link to="/assess" className="mt-3 inline-block text-cyan-400 font-semibold text-sm hover:underline">Fazer a primeira →</Link>
            </div>
          )}
          {items?.map((a) => (
            <button key={a.id} onClick={() => setSel(a.id)}
              className={`w-full text-left rounded-xl border p-4 flex items-center gap-4 transition ${
                sel === a.id ? 'border-cyan-400 bg-cyan-400/5' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
              }`}>
              <ScoreRing score={a.score} />
              <div className="min-w-0">
                <div className="font-bold text-white text-sm">
                  {a.tipo === 'statico' ? '🧍 Estática' : '🏃 Dinâmica'} · {a.vista}
                </div>
                <div className="text-[12px] text-slate-400 mt-0.5">
                  {new Date(a.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{a.resumo_ia}</p>
              </div>
            </button>
          ))}
        </aside>

        {/* Detalhe */}
        <section>
          {!current && <p className="text-slate-500 text-sm p-8 text-center border border-dashed border-slate-800 rounded-2xl">Selecione uma avaliação ao lado.</p>}
          {current && (
            <ReportView
              nome={user?.nome}
              result={{
                tipo: current.tipo,
                vista: current.vista,
                score: current.score,
                resumo: current.resumo_ia,
                achados: current.achados,
                exercicios: current.exercicios,
                metricas: current.metricas,
              }}
            />
          )}
        </section>
      </main>
    </div>
  );
}
