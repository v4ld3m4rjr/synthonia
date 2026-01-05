// [AI Module] Data: 11/11/2025
// Descrição: Módulo de Análise IA Completa com varredura estatística,
// explicações neurofisiológicas e recomendações de conduta.
import React, { useMemo } from 'react';
import { User, DailyData, TrainingSession } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import NeurophysiologyExplainer from './NeurophysiologyExplainer';
import { calculateTrainingMetrics, calculateReadinessScore } from '../../lib/calculations';
import { Brain, Activity, Moon, Heart, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface FullAIAnalysisProps {
  user: User;
  dailyData: DailyData[];
  trainingSessions: TrainingSession[];
}

const clamp = (n: number, min = -9999, max = 9999) => Math.max(min, Math.min(max, n));

const Stats = {
  mean: (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0,
  median: (arr: number[]) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  },
  std: (arr: number[]) => {
    if (arr.length < 2) return 0;
    const mu = Stats.mean(arr);
    const v = Stats.mean(arr.map(x => (x - mu) ** 2));
    return Math.sqrt(v);
  },
  min: (arr: number[]) => arr.length ? Math.min(...arr) : 0,
  max: (arr: number[]) => arr.length ? Math.max(...arr) : 0,
  slope: (series: { x: number; y: number }[]) => {
    if (series.length < 2) return 0;
    const n = series.length;
    const sumX = series.reduce((s, p) => s + p.x, 0);
    const sumY = series.reduce((s, p) => s + p.y, 0);
    const sumXY = series.reduce((s, p) => s + p.x * p.y, 0);
    const sumXX = series.reduce((s, p) => s + p.x * p.x, 0);
    const num = n * sumXY - sumX * sumY;
    const den = n * sumXX - sumX * sumX;
    return den === 0 ? 0 : num / den;
  },
  corr: (x: number[], y: number[]) => {
    if (x.length !== y.length || x.length < 2) return 0;
    const mx = Stats.mean(x);
    const my = Stats.mean(y);
    const sx = Stats.std(x);
    const sy = Stats.std(y);
    if (sx === 0 || sy === 0) return 0;
    const cov = Stats.mean(x.map((xi, i) => (xi - mx) * (y[i] - my)));
    return clamp(cov / (sx * sy), -1, 1);
  }
};

const FullAIAnalysis: React.FC<FullAIAnalysisProps> = ({ user, dailyData, trainingSessions }) => {
  const today = new Date().toISOString().split('T')[0];

  const latestDaily = useMemo(() => {
    const sorted = [...dailyData].sort((a, b) => (a.date < b.date ? 1 : -1));
    return sorted[0] || null;
  }, [dailyData]);

  const metricsToday = useMemo(() => {
    const tm = calculateTrainingMetrics(trainingSessions, today);
    const sleepQ = latestDaily?.sleep_quality || 0;
    const stress = latestDaily?.stress_level || 0;
    const fatigue = latestDaily?.fatigue_level || 0;
    const mood = latestDaily?.mood || 0;
    const readiness = latestDaily ? calculateReadinessScore(latestDaily) : 0;
    return {
      atl: Math.round(tm.atl || 0),
      ctl: Math.round(tm.ctl || 0),
      tsb: Math.round(tm.tsb || 0),
      sleep_quality: Math.round(sleepQ),
      stress_level: Math.round(stress),
      fatigue_level: Math.round(fatigue),
      mood: Math.round(mood),
      readiness_score: Math.round(readiness)
    };
  }, [trainingSessions, latestDaily, today]);

  const windows = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 28);
    const startISO = start.toISOString().split('T')[0];
    const periodDaily = dailyData.filter(d => d.date >= startISO && d.date <= today);
    const periodTrain = trainingSessions.filter(s => s.date >= startISO && s.date <= today);
    return { startISO, periodDaily, periodTrain };
  }, [dailyData, trainingSessions, today]);

  const stats = useMemo(() => {
    const d = windows.periodDaily;
    const t = windows.periodTrain;
    const num = (arr: (number | undefined | null)[]) => arr.map(v => (v ?? 0)).filter(v => typeof v === 'number');

    const sleepQuality = num(d.map(x => x.sleep_quality));
    const sleepDuration = num(d.map(x => x.sleep_duration));
    const stressLevel = num(d.map(x => x.stress_level));
    const fatigueLevel = num(d.map(x => x.fatigue_level));
    const mood = num(d.map(x => x.mood));
    const soreness = num(d.map(x => x.muscle_soreness));
    const restingHR = num(d.map(x => x.resting_hr));

    const tss = num(t.map(x => x.tss));
    const rpe = num(t.map(x => x.rpe));
    const duration = num(t.map(x => x.duration));
    const intensity = num(t.map(x => x.intensity ?? 0));

    const readinessSeries = d.map((x, i) => ({ x: i, y: calculateReadinessScore(x) }));
    const readinessSlope = Stats.slope(readinessSeries);

    return {
      sleepQuality: { mean: Stats.mean(sleepQuality), std: Stats.std(sleepQuality), min: Stats.min(sleepQuality), max: Stats.max(sleepQuality) },
      sleepDuration: { mean: Stats.mean(sleepDuration), std: Stats.std(sleepDuration), min: Stats.min(sleepDuration), max: Stats.max(sleepDuration) },
      stressLevel: { mean: Stats.mean(stressLevel), std: Stats.std(stressLevel), min: Stats.min(stressLevel), max: Stats.max(stressLevel) },
      fatigueLevel: { mean: Stats.mean(fatigueLevel), std: Stats.std(fatigueLevel), min: Stats.min(fatigueLevel), max: Stats.max(fatigueLevel) },
      mood: { mean: Stats.mean(mood), std: Stats.std(mood), min: Stats.min(mood), max: Stats.max(mood) },
      soreness: { mean: Stats.mean(soreness), std: Stats.std(soreness), min: Stats.min(soreness), max: Stats.max(soreness) },
      restingHR: { mean: Stats.mean(restingHR), std: Stats.std(restingHR), min: Stats.min(restingHR), max: Stats.max(restingHR) },
      tss: { mean: Stats.mean(tss), std: Stats.std(tss), min: Stats.min(tss), max: Stats.max(tss) },
      rpe: { mean: Stats.mean(rpe), std: Stats.std(rpe), min: Stats.min(rpe), max: Stats.max(rpe) },
      duration: { mean: Stats.mean(duration), std: Stats.std(duration), min: Stats.min(duration), max: Stats.max(duration) },
      intensity: { mean: Stats.mean(intensity), std: Stats.std(intensity), min: Stats.min(intensity), max: Stats.max(intensity) },
      readinessSlope
    };
  }, [windows]);

  const correlations = useMemo(() => {
    const d = windows.periodDaily;
    const t = windows.periodTrain;
    const num = (arr: (number | undefined | null)[]) => arr.map(v => (v ?? 0)).filter(v => typeof v === 'number');

    const sleepQuality = num(d.map(x => x.sleep_quality));
    const readiness = d.map(x => calculateReadinessScore(x));
    const tss = num(t.map(x => x.tss));

    return {
      sleep_readiness: Stats.corr(sleepQuality, readiness),
      sleep_tss: Stats.corr(sleepQuality.slice(0, tss.length), tss)
    };
  }, [windows]);

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    const { atl, ctl, tsb, sleep_quality, stress_level, fatigue_level, mood, readiness_score } = metricsToday;

    if (tsb < -10 && atl > ctl) recs.push('Priorize recuperação ativa nos próximos 2-3 dias. Reduza intensidade e foque em sono.');
    if (sleep_quality <= 4) recs.push('Higiene do sono: reduzir telas 2h antes de dormir, quarto escuro e fresco, rotina consistente.');
    if (stress_level >= 8) recs.push('Gestão de estresse: respiração diafragmática 5-10 min, meditação guiada, caminhadas leves.');
    if (fatigue_level >= 7) recs.push('Carga subjetiva alta: considere treino técnico de baixa intensidade ou descanso ativo.');
    if (mood <= 4) recs.push('Humor baixo: inserir atividades prazerosas leves e socialização.');
    if (readiness_score >= 70 && tsb >= 5) recs.push('Janela de supercompensação: programação de estímulo de qualidade/alta intensidade.');

    if (recs.length === 0) recs.push('Mantenha consistência: equilíbrio adequado entre estresse e recuperação. Continue monitorando suas métricas.');
    return recs;
  }, [metricsToday]);

  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => history.back()} className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
            ← Voltar
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Análise IA Completa</h2>
            </div>
            <p className="text-sm text-gray-400">Varredura estatística, interpretação neurofisiológica e condutas recomendadas.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Resumo Atual</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Readiness: <span className="text-white font-medium">{metricsToday.readiness_score}</span></li>
                  <li>ATL: <span className="text-white font-medium">{metricsToday.atl}</span> | CTL: <span className="text-white font-medium">{metricsToday.ctl}</span> | TSB: <span className="text-white font-medium">{metricsToday.tsb}</span></li>
                  <li>Sono: <span className="text-white font-medium">{metricsToday.sleep_quality}/10</span> | Estresse: <span className="text-white font-medium">{metricsToday.stress_level}/10</span></li>
                  <li>Fadiga: <span className="text-white font-medium">{metricsToday.fatigue_level}/10</span> | Humor: <span className="text-white font-medium">{metricsToday.mood}/10</span></li>
                </ul>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2"><Activity className="h-4 w-4" /> Estatísticas (28 dias)</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Sono (qualidade): média {stats.sleepQuality.mean.toFixed(1)} | desvio {stats.sleepQuality.std.toFixed(1)}</li>
                  <li>Estresse: média {stats.stressLevel.mean.toFixed(1)} | desvio {stats.stressLevel.std.toFixed(1)}</li>
                  <li>TSS: média {stats.tss.mean.toFixed(1)} | desvio {stats.tss.std.toFixed(1)}</li>
                  <li>Tendência de readiness: {stats.readinessSlope >= 0 ? 'subindo' : 'descendo'} ({stats.readinessSlope.toFixed(3)})</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2"><Heart className="h-4 w-4" /> Correlações</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Sono ↔ Readiness: {correlations.sleep_readiness.toFixed(2)}</li>
                  <li>Sono ↔ TSS: {correlations.sleep_tss.toFixed(2)}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <NeurophysiologyExplainer metrics={metricsToday} className="mb-6" />

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Condutas Recomendadas</h3>
            </div>
            <p className="text-sm text-gray-400">Orientações priorizadas conforme seu estado atual.</p>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-gray-200 space-y-2">
              {recommendations.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FullAIAnalysis;