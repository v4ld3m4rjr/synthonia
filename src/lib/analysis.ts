// ===== Motor de análise biomecânica (IA local) + geração de relatório =====
import type {
  AssessmentView,
  AnalysisResult,
  ExerciseRecommendation,
  Finding,
  PoseFrame,
  StaticAngles,
  DynamicSummary,
  GaitCycle,
} from './types';

type LM = Partial<Record<string, { x: number; y: number; v: number }>>;

const toDeg = (r: number) => (r * 180) / Math.PI;

/** Vetor A->B em coordenadas de imagem (y cresce para baixo) */
function vec(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: b.x - a.x, y: b.y - a.y };
}

/** Ângulo interno entre três pontos (vértice em B), em graus */
export function angleABC(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number {
  const v1 = vec(b, a);
  const v2 = vec(b, c);
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (m1 < 1e-6 || m2 < 1e-6) return NaN;
  let cos = dot / (m1 * m2);
  cos = Math.max(-1, Math.min(1, cos));
  return toDeg(Math.acos(cos));
}

/** Desvio da vertical de um segmento, com sinal (positivo = inclina para a direita na imagem) */
function tiltFromVertical(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y; // de cima para baixo
  if (Math.abs(dy) < 1e-6) return 90 * Math.sign(dx || 1);
  return toDeg(Math.atan2(dx, Math.abs(dy)));
}

function med3(a: number | null, b: number | null, c: number | null): number | null {
  const vals = [a, b, c].filter((v): v is number => v != null && Number.isFinite(v)).sort((x, y) => x - y);
  if (!vals.length) return null;
  return vals[Math.floor(vals.length / 2)];
}

function mean(arr: number[]): number | null {
  const f = arr.filter(Number.isFinite);
  if (!f.length) return null;
  return f.reduce((s, v) => s + v, 0) / f.length;
}

function std(arr: number[]): number | null {
  const f = arr.filter(Number.isFinite);
  if (f.length < 2) return null;
  const m = mean(f)!;
  return Math.sqrt(f.reduce((s, v) => s + (v - m) ** 2, 0) / f.length);
}

// Média móvel simples sobre uma série temporal
function smoothSeries(pts: { t: number; v: number | null }[], winMs: number) {
  const clean = pts.filter((p) => p.v != null && Number.isFinite(p.v as number)) as { t: number; v: number }[];
  if (!clean.length) return [] as { t: number; v: number }[];
  const out: { t: number; v: number }[] = [];
  for (let i = 0; i < clean.length; i++) {
    let sum = 0;
    let n = 0;
    for (let j = 0; j < clean.length; j++) {
      if (Math.abs(clean[j].t - clean[i].t) <= winMs / 2) {
        sum += clean[j].v;
        n++;
      }
    }
    out.push({ t: clean[i].t, v: sum / n });
  }
  return out;
}

function seriesOf(frames: PoseFrame[], fn: (lm: LM) => number | null) {
  return frames.map((f) => ({ t: f.t, v: fn(f.lm as LM) }));
}

// ===================== ANÁLISE ESTÁTICA =====================

export function computeStaticAngles(frames: PoseFrame[], vista: AssessmentView): StaticAngles {
  // Usa os frames centrais do clipe (descarta início/fim instáveis)
  const start = Math.floor(frames.length * 0.25);
  const end = Math.max(start + 1, Math.floor(frames.length * 0.75));
  const slice = frames.slice(start, end);

  const troncoF: number[] = [];
  const quadrilL: number[] = [];
  const quadrilF: number[] = [];
  const joelhoL: number[] = [];
  const valgo: number[] = [];
  const cabeca: number[] = [];
  const asimOmbro: number[] = [];
  const asimQuadri: number[] = [];

  for (const f of slice) {
    const lm = f.lm as LM;
    const ls = lm.leftShoulder;
    const rs = lm.rightShoulder;
    const lh = lm.leftHip;
    const rh = lm.rightHip;
    const lk = lm.leftKnee;
    const rk = lm.rightKnee;
    const la = lm.leftAnkle;
    const ra = lm.rightAnkle;
    const nose = lm.nose;
    const hipMid = lh && rh ? { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 } : null;
    const shMid = ls && rs ? { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 } : null;
    const ankMid = la && ra ? { x: (la.x + ra.x) / 2, y: (la.y + ra.y) / 2 } : null;
    const kneeMid = lk && rk ? { x: (lk.x + rk.x) / 2, y: (lk.y + rk.y) / 2 } : null;

    if (vista === 'lateral') {
      // usa o lado mais visível
      const sh = ls && ls.v >= (rs?.v ?? 0) ? ls : rs;
      const hp = lh && lh.v >= (rh?.v ?? 0) ? lh : rh;
      const kn = lk && lk.v >= (rk?.v ?? 0) ? lk : rk;
      const ak = la && la.v >= (ra?.v ?? 0) ? la : ra;
      if (sh && hp && ak) quadrilL.push(angleABC(sh, hp, ak));
      if (hp && kn && ak) joelhoL.push(angleABC(hp, kn, ak));
      if (sh && hp) troncoF.push(tiltFromVertical(hp, sh)); // >0 ombro à frente do quadril? (imagem espelhada: frente = direção dos pés)
      if (nose && sh && hp) {
        const vTronco = vec(hp, sh);
        const vCab = vec(sh, nose);
        const dot = vTronco.x * vCab.x + vTronco.y * vCab.y;
        const ang = toDeg(
          Math.acos(Math.max(-1, Math.min(1, dot / (Math.hypot(vTronco.x, vTronco.y) * Math.hypot(vCab.x, vCab.y))))),
        );
        cabeca.push(ang);
      }
    } else {
      // frontal ou posterior
      if (shMid && hipMid) troncoF.push(tiltFromVertical(hipMid, shMid));
      if (ls && rs) {
        const dy = Math.abs(ls.y - rs.y);
        const dx = Math.abs(ls.x - rs.x);
        if (dx > 0.02) asimOmbro.push((dy / dx) * 100);
      }
      if (lh && rh) {
        const dy = Math.abs(lh.y - rh.y);
        const dx = Math.abs(lh.x - rh.x);
        if (dx > 0.02) asimQuadri.push((dy / dx) * 100);
        quadrilF.push(toDeg(Math.atan2(rh.y - lh.y, rh.x - lh.x || 1e-6)) * (rh.x >= lh.x ? 1 : -1));
      }
      if (hipMid && kneeMid && ankMid) quadrilL.push(angleABC(hipMid, kneeMid, ankMid));
      // valgo/varo por perna (assinatura relativa ao alinhamento quadril-tornozelo)
      for (const [hp, kn, ak] of [
        [lh, lk, la],
        [rh, rk, ra],
      ] as const) {
        if (hp && kn && ak) {
          const vRef = vec(hp, ak);
          const vKN = vec(hp, kn);
          const cross = vRef.x * vKN.y - vRef.y * vKN.x;
          const dot = vRef.x * vKN.x + vRef.y * vKN.y;
          const off = toDeg(Math.atan2(cross, dot));
          // joelho deslocado para dentro (em relação à linha quadril-tornozelo) => valgo
          const inside = kn.x > (hp.x + ak.x) / 2 ? Math.abs(off) : -Math.abs(off);
          valgo.push(inside);
        }
      }
    }
  }

  return {
    troncoFrontal: med3(mean(troncoF), null, null),
    quadrilLateral: med3(mean(quadrilL), null, null),
    quadrilFrontal: med3(mean(quadrilF), null, null),
    joelhosLateral: med3(mean(joelhoL), null, null),
    valgoVaro: med3(mean(valgo), null, null),
    cabeca: med3(mean(cabeca), null, null),
    assimetriaOmbros: med3(mean(asimOmbro), null, null),
    assimetriaQuadris: med3(mean(asimQuadri), null, null),
  };
}

// ===================== ANÁLISE DINÂMICA =====================

export function computeDynamic(frames: PoseFrame[], _vista?: AssessmentView): DynamicSummary {
  void _vista; // reservado para ajustes futuros por vista (ex.: frontal sem swing de quadril)
  const duracaoMs = frames.length ? frames[frames.length - 1].t - frames[0].t : 0;

  // joelho (ângulo interno quadril-joelho-tornozelo) — melhor perna visível
  const kneeS = smoothSeries(
    seriesOf(frames, (lm) => {
      const pick = (h: any, k: any, a: any) => (h && k && a && h.v > 0.4 && k.v > 0.4 && a.v > 0.4 ? angleABC(h, k, a) : null);
      const l = pick(lm.leftHip, lm.leftKnee, lm.leftAnkle);
      const r = pick(lm.rightHip, lm.rightKnee, lm.rightAnkle);
      if (l != null && r != null) return (l + r) / 2;
      return l ?? r;
    }),
    260,
  );

  // altura do tornozelo (swing = sobe => y diminui)
  const ankleS = smoothSeries(
    seriesOf(frames, (lm) => {
      const ys = [lm.leftAnkle, lm.rightAnkle].filter((p: any) => p && p.v > 0.4).map((p: any) => p.y);
      return ys.length ? Math.min(...ys) : null;
    }),
    200,
  );

  // amplitude não utilizada isoladamente; mantida p/ debug futuro
  void smoothSeries(
    seriesOf(frames, (lm) => {
      const xs = [lm.leftWrist, lm.rightWrist].filter((p: any) => p && p.v > 0.4).map((p: any) => p.x);
      return xs.length ? Math.max(...xs) - Math.min(...xs) : null;
    }),
    260,
  );

  const hipY = smoothSeries(
    seriesOf(frames, (lm) => {
      const ys = [lm.leftHip, lm.rightHip].filter((p: any) => p && p.v > 0.4).map((p: any) => p.y);
      return ys.length ? (ys[0] + ys[ys.length - 1]) / 2 : null;
    }),
    200,
  );

  const shoulderTilt = smoothSeries(
    seriesOf(frames, (lm) => {
      const ls = lm.leftShoulder;
      const rs = lm.rightShoulder;
      if (!ls || !rs || ls.v < 0.4 || rs.v < 0.4) return null;
      return tiltFromVertical(ls, rs);
    }),
    300,
  );

  // Detecção de picos no joelho (flexão máxima do swing)
  const peaks = findPeaks(kneeS, 0.6);
  const cycles: GaitCycle[] = [];
  for (let i = 0; i < peaks.length - 1; i++) {
    const t0 = peaks[i].t;
    const t1 = peaks[i + 1].t;
    const win = (arr: { t: number; v: number }[]) => arr.filter((p) => p.t >= t0 && p.t <= t1).map((p) => p.v);
    const kw = win(kneeS);
    const aw = win(ankleS);
    const hw = win(hipY);
    const bodyH = estimateBodyHeight(frames);
    const ampK = kw.length ? Math.max(...kw) - Math.min(...kw) : null;
    const flexPeak = kw.length ? Math.max(...kw) : null;
    // contato: mínimo de altura do tornozelo no fim do ciclo (próximo do pico seguinte)
    const contactZone = ankleS.filter((p) => p.t >= t1 - 180 && p.t <= t1 + 180).map((p) => p.v);
    const midZone = ankleS.filter((p) => p.t >= (t0 + t1) / 2 - 120 && p.t <= (t0 + t1) / 2 + 120).map((p) => p.v);
    const antePasso = contactZone.length && midZone.length ? Math.max(...contactZone) < Math.max(...midZone) - 0.01 : null;
    cycles.push({
      indice: i,
      duracao_ms: t1 - t0,
      amplitudeJoelho: ampK,
      amplitudeQuadril: hw.length && bodyH ? ((Math.max(...hw) - Math.min(...hw)) / bodyH) * 100 : null,
      amplitudeTornozelo: aw.length && bodyH ? ((Math.max(...aw) - Math.min(...aw)) / bodyH) * 100 : null,
      picoFlexJoelhoSwing: flexPeak,
      contatoAntePasso: antePasso,
      recuoTronco: (() => {
        const sw = shoulderTilt.filter((p) => p.t >= t0 && p.t <= t1).map((p) => p.v);
        return sw.length ? mean(sw) : null;
      })(),
      oscVerticalQuadril: hw.length && bodyH ? ((Math.max(...hw) - Math.min(...hw)) / bodyH) * 100 : null,
    });
  }

  const durs = cycles.map((c) => c.duracao_ms).filter((d): d is number => d != null && d > 250 && d < 1600);
  const cadencia = durs.length ? 60000 / mean(durs)! : null;

  // Simetria: variabilidade entre ciclos + diferença de altura entre quadris
  const cv = durs.length > 1 ? (std(durs)! / meanOr0(durs)) * 100 : null;
  const asymSh = mean(shoulderTilt.map((p) => Math.abs(p.v)));
  let simetria: number | null = null;
  if (cv != null) {
    simetria = Math.max(0, Math.min(100, 100 - cv * 2.2 - (asymSh ?? 0) * 1.2));
  }

  return {
    ciclos: cycles,
    cadenciaSpm: cadencia,
    simetria,
    nFrames: frames.length,
    duracaoMs,
  };
}

function meanOr(arr: number[], fb: number): number {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : fb;
}
function meanOr0(arr: number[]): number {
  return meanOr(arr, 1);
}

function estimateBodyHeight(frames: PoseFrame[]): number | null {
  const hs = frames.map((f) => {
    const lm = f.lm as LM;
    const top = lm.leftShoulder?.y ?? lm.rightShoulder?.y ?? lm.nose?.y;
    const bot = lm.leftAnkle?.y ?? lm.rightAnkle?.y;
    return top != null && bot != null ? bot - top : null;
  }).filter((v): v is number => v != null && v > 0.05);
  return hs.length ? meanOr0(hs) : null;
}

function findPeaks(series: { t: number; v: number }[], minProminenceRatio: number) {
  if (series.length < 5) return [];
  const vals = series.map((p) => p.v);
  const mn = Math.min(...vals);
  const mx = Math.max(...vals);
  const range = mx - mn;
  if (range < 6) return []; // movimento insuficiente
  const thr = mn + range * minProminenceRatio;
  const peaks: { t: number; v: number }[] = [];
  for (let i = 2; i < series.length - 2; i++) {
    const isMax =
      series[i].v >= series[i - 1].v &&
      series[i].v >= series[i + 1].v &&
      series[i].v > series[i - 2].v &&
      series[i].v >= series[i + 2].v &&
      series[i].v >= thr;
    if (isMax && (!peaks.length || series[i].t - peaks[peaks.length - 1].t > 260)) {
      peaks.push(series[i]);
    }
  }
  return peaks;
}

// ===================== RELATÓRIO IA (heurístico, offline) =====================

interface RuleCtx {
  achados: Finding[];
  exs: Map<string, ExerciseRecommendation>;
}

function addFinding(ctx: RuleCtx, f: Omit<Finding, 'id'>) {
  ctx.achados.push({ ...f, id: `${f.regiao}-${f.titulo}`.toLowerCase().replace(/\s+/g, '-') });
}

function addEx(ctx: RuleCtx, key: string, e: ExerciseRecommendation) {
  if (!ctx.exs.has(key)) ctx.exs.set(key, e);
}

function scoreFrom(achados: Finding[]): number {
  let s = 100;
  for (const a of achados) {
    if (a.severidade === 'atencao') s -= 9;
    if (a.severidade === 'alerta') s -= 18;
  }
  return Math.max(25, Math.min(100, Math.round(s)));
}

export function buildStaticReport(a: StaticAngles, vista: AssessmentView): AnalysisResult {
  const ctx: RuleCtx = { achados: [], exs: new Map() };
  const fmt = (v: number | null, d = 1) => (v == null ? '—' : `${v.toFixed(d)}°`);

  if (vista === 'lateral') {
    if (a.quadrilLateral != null) {
      if (a.quadrilLateral < 155) {
        addFinding(ctx, {
          severidade: 'alerta',
          regiao: 'Quadril',
          titulo: 'Anteversão pélvica acentuada',
          descricao: `O ângulo ombro–quadril–joelho está em ${fmt(a.quadrilLateral)} (ideal ≈ 180°). Há projeção anterior do quadril com hiperlordose lombar compensatória, indicando encurtamento de flexores do quadril e baixa ativação de glúteos e abdominais profundos.`,
          metrica: `Ângulo do quadril: ${fmt(a.quadrilLateral)} · ideal ~180°`,
        });
        addEx(ctx, 'mobil-quadris', { nome: 'Mobilidade de flexores do quadril (90/90 + meia ajoelhada)', objetivo: 'Reduzir anteversão pélvica e encurtamento do iliopsoas', series: '2–3 sessões de 45–60 s por lado', frequencia: 'Diária', tipo: 'mobilidade' });
        addEx(ctx, 'gluteo-max', { nome: 'Elevação pélvica (bridge) progressão para single-leg', objetivo: 'Ativar glúteo máximo e reeducar retroversão', series: '3×12–15', frequencia: '3×/semana', tipo: 'forca' });
        addEx(ctx, 'core-antiv', { nome: 'Dead bug com controle neutro da pelve', objetivo: 'Estabilização lombo-pélvica', series: '3×10 por lado', frequencia: '3–4×/semana', tipo: 'estabilizacao' });
      } else if (a.quadrilLateral < 170) {
        addFinding(ctx, {
          severidade: 'atencao',
          regiao: 'Quadril',
          titulo: 'Leve anteversão pélvica',
          descricao: `Alinhamento sagital com pequena projeção anterior do quadril (${fmt(a.quadrilLateral)}). Monitore flexibilidade de iliopsoas e força de glúteos.`,
          metrica: `Ângulo do quadril: ${fmt(a.quadrilLateral)}`,
        });
        addEx(ctx, 'mobil-quadris', { nome: 'Mobilidade de flexores do quadril (meia ajoelhada)', objetivo: 'Manter amplitude de extensão do quadril', series: '2×45 s por lado', frequencia: '5×/semana', tipo: 'mobilidade' });
      } else {
        addFinding(ctx, { severidade: 'ok', regiao: 'Quadril', titulo: 'Alinhamento sagital preservado', descricao: `Ângulo ombro–quadril–joelho de ${fmt(a.quadrilLateral)}, dentro do padrão neutro.`, metrica: `Ângulo do quadril: ${fmt(a.quadrilLateral)}` });
      }
    }
    if (a.cabeca != null && a.cabeca > 42) {
      addFinding(ctx, {
        severidade: a.cabeca > 52 ? 'alerta' : 'atencao',
        regiao: 'Coluna cervical',
        titulo: 'Projeção anterior da cabeça',
        descricao: `A cabeça projeta-se à frente do eixo do ombro (${fmt(a.cabeca)} de desvio do eixo tronco–pescoço). Padrão de "forward head posture": sobrecarga em musculatura suboccipital e fraqueza de flexores cervicais profundos.`,
        metrica: `Desvio cranio-cervical: ${fmt(a.cabeca)}`,
      });
      addEx(ctx, 'deep-neck', { nome: 'Chin tuck (retração cervical)', objetivo: 'Fortalecer flexores profundos do pescoço', series: '3×10 de 5 s', frequencia: 'Diária', tipo: 'estabilizacao' });
      addEx(ctx, 'mob-toracica', { nome: 'Extensão torácica em foam roller', objetivo: 'Melhorar mobilidade da coluna torácica', series: '2×10', frequencia: '4×/semana', tipo: 'mobilidade' });
    }
    if (a.joelhosLateral != null) {
      if (a.joelhosLateral < 168) {
        addFinding(ctx, {
          severidade: 'atencao',
          regiao: 'Joelho',
          titulo: 'Flexão residual de joelhos em descarga',
          descricao: `Joelhos mantêm ${fmt(a.joelhosLateral)} (esperado ~180° em postura ereta). Pode indicar encurtamento de gastrocnêmio/sóleo ou sobrecarga anterior do joelho.`,
          metrica: `Ângulo do joelho: ${fmt(a.joelhosLateral)}`,
        });
        addEx(ctx, 'triceps-surae', { nome: 'Alongamento de tríceps sural (joelho estendido e flexionado)', objetivo: 'Ganhar dorsiflexão e reduzir flexão residual', series: '3×40 s por perna', frequencia: 'Diária', tipo: 'alongamento' });
      } else {
        addFinding(ctx, { severidade: 'ok', regiao: 'Joelho', titulo: 'Extensão completa em apoio', descricao: `Joelhos a ${fmt(a.joelhosLateral)} em descarga bilateral.`, metrica: `Ângulo do joelho: ${fmt(a.joelhosLateral)}` });
      }
    }
    if (a.troncoFrontal != null && Math.abs(a.troncoFrontal) > 8) {
      addFinding(ctx, {
        severidade: Math.abs(a.troncoFrontal) > 14 ? 'alerta' : 'atencao',
        regiao: 'Tronco',
        titulo: 'Inclinação sagital do tronco',
        descricao: `Tronco inclinado ${fmt(Math.abs(a.troncoFrontal))} em relação à vertical. Verifique rigidez torácica, estratégia postural e resistência extensora lombar.`,
        metrica: `Inclinação do tronco: ${fmt(a.troncoFrontal)}`,
      });
      addEx(ctx, 'mob-toracica', { nome: 'Rotações torácicas 90/90', objetivo: 'Mobilidade da coluna torácica', series: '2×8 por lado', frequencia: 'Diária', tipo: 'mobilidade' });
    }
  } else {
    // frontal/posterior
    if (a.valgoVaro != null) {
      if (a.valgoVaro > 6) {
        addFinding(ctx, {
          severidade: a.valgoVaro > 11 ? 'alerta' : 'atencao',
          regiao: 'Joelho',
          titulo: 'Valgo dinâmico/estático (joelhos "para dentro")',
          descricao: `Deslocamento medial do joelho de ${fmt(a.valgoVaro)} em relação ao eixo quadril–tornozelo. Sugere déficit de controle do glúteo médio e colapso medial do antepé (pronação excessiva). Fator de risco para dor femoropatelar e lesões ligamentares.`,
          metrica: `Valgo: ${fmt(a.valgoVaro)}`,
        });
        addEx(ctx, 'gluteo-med', { nome: 'Abdução de quadril com elástica / clamshell', objetivo: 'Fortalecer glúteo médio e controlar valgo', series: '3×15 por lado', frequencia: '3–4×/semana', tipo: 'forca' });
        addEx(ctx, 'step-down', { nome: 'Step-down controlado (polimento)', objetivo: 'Reeducar alinhamento joelho–pé em carga', series: '3×10 por lado', frequencia: '3×/semana', tipo: 'correcao_gesto' });
        addEx(ctx, 'short-foot', { nome: 'Short foot / domínio do arco plantar', objetivo: 'Controlar pronação do antepé', series: '3×20 s', frequencia: 'Diária', tipo: 'estabilizacao' });
      } else if (a.valgoVaro < -7) {
        addFinding(ctx, {
          severidade: 'atencao',
          regiao: 'Joelho',
          titulo: 'Varo de joelhos (arcuation)',
          descricao: `Alinhamento varo de ${fmt(Math.abs(a.valgoVaro))}. Avalie força de adutores e distribuição de carga no compartimento lateral.`,
          metrica: `Varo: ${fmt(a.valgoVaro)}`,
        });
        addEx(ctx, 'adutor', { nome: 'Adutor de quadril (Copenhagen reduzida)', objetivo: 'Equilíbrio adutores/abdutores', series: '3×20 s por lado', frequencia: '3×/semana', tipo: 'forca' });
      } else {
        addFinding(ctx, { severidade: 'ok', regiao: 'Joelho', titulo: 'Alinhamento coronal dos joelhos adequado', descricao: `Desvio de apenas ${fmt(a.valgoVaro)} — dentro da normalidade.`, metrica: `Valgo/varo: ${fmt(a.valgoVaro)}` });
      }
    }
    if (a.assimetriaOmbros != null && a.assimetriaOmbros > 7) {
      addFinding(ctx, {
        severidade: a.assimetriaOmbros > 13 ? 'alerta' : 'atencao',
        regiao: 'Ombros',
        titulo: 'Assimetria de altura dos ombros',
        descricao: `Diferença relativa de ${a.assimetriaOmbros.toFixed(1)}% entre os ombros. Pode refletir tensão unilateral de superior trapézio/escalenos ou leve escoliose funcional. Recomenda-se avaliação clínica associada.`,
        metrica: `Assimetria: ${a.assimetriaOmbros.toFixed(1)}%`,
      });
      addEx(ctx, 'trap-elem', { nome: 'Liberação de trapézio superior + escalenos', objetivo: 'Reduzir tensão unilateral cervical', series: '2×45 s por lado', frequencia: 'Diária', tipo: 'alongamento' });
      addEx(ctx, 'scap', { nome: 'Ativação escapular (Y-T-W)', objetivo: 'Simetrizar controle escapular', series: '3×10 de cada letra', frequencia: '3×/semana', tipo: 'estabilizacao' });
    }
    if (a.assimetriaQuadris != null && a.assimetriaQuadris > 6) {
      addFinding(ctx, {
        severidade: a.assimetriaQuadris > 11 ? 'alerta' : 'atencao',
        regiao: 'Pelve',
        titulo: 'Assimetria pélvica (quadril mais alto de um lado)',
        descricao: `Diferença relativa de ${a.assimetriaQuadris.toFixed(1)}% entre cristas ilíacas. Possível encurtamento de quadrado lombar/glúteo TFL unilateral ou discrepância de membros inferiores.`,
        metrica: `Assimetria pélvica: ${a.assimetriaQuadris.toFixed(1)}%`,
      });
      addEx(ctx, 'ql', { nome: 'Alongamento lateral de cadeia (quadrado lombar/TFL)', objetivo: 'Simetrizar pelve', series: '3×40 s para o lado elevado', frequencia: 'Diária', tipo: 'alongamento' });
      addEx(ctx, 'gluteo-med', { nome: 'Single-leg stance 30 s + progressões', objetivo: 'Estabilidade pélvica unilateral', series: '3× por lado', frequencia: 'Diária', tipo: 'estabilizacao' });
    }
    if (a.troncoFrontal != null && Math.abs(a.troncoFrontal) > 7) {
      addFinding(ctx, {
        severidade: Math.abs(a.troncoFrontal) > 12 ? 'alerta' : 'atencao',
        regiao: 'Coluna',
        titulo: 'Desvio lateral do tronco',
        descricao: `Eixo tronco inclinado ${fmt(Math.abs(a.troncoFrontal))} no plano frontal. Padrão compatível com escoliose funcional ou estratégia de descarga unilateral — recomenda-se avaliação presencial se persistente.`,
        metrica: `Desvio coronal: ${fmt(a.troncoFrontal)}`,
      });
      addEx(ctx, 'side-plank', { nome: 'Prancha lateral', objetivo: 'Resistência lateral do core', series: '3×20–30 s por lado', frequencia: '3×/semana', tipo: 'estabilizacao' });
    }
  }

  if (!ctx.achados.some((a2) => a2.severidade !== 'ok')) {
    ctx.achados.unshift({
      id: 'geral-ok',
      severidade: 'ok',
      regiao: 'Geral',
      titulo: 'Postura dentro dos parâmetros esperados',
      descricao: 'Nenhum desvio relevante detectado nesta vista. Continue monitorando periodicamente.',
    });
  }

  return {
    tipo: 'statico',
    vista,
    score: scoreFrom(ctx.achados),
    resumo: '',
    achados: ctx.achados,
    exercicios: [...ctx.exs.values()],
    metricas: { ...(a as unknown as Record<string, number | null>) },
  };
}

export function buildDynamicReport(dyn: DynamicSummary, vista: AssessmentView, estatico?: AnalysisResult | null): AnalysisResult {
  const ctx: RuleCtx = { achados: [], exs: new Map() };
  const cyc = dyn.ciclos;
  const avg = (sel: (c: GaitCycle) => number | null) => mean(cyc.map(sel).filter((v): v is number => v != null));

  const ampJ = avg((c) => c.amplitudeJoelho);
  const flexSwing = avg((c) => c.picoFlexJoelhoSwing);
  const oscQ = avg((c) => c.oscVerticalQuadril);
  const recuo = avg((c) => c.recuoTronco);
  const ante = cyc.filter((c) => c.contatoAntePasso != null);
  const pctAnte = ante.length ? (ante.filter((c) => c.contatoAntePasso).length / ante.length) * 100 : null;

  if (dyn.cadenciaSpm != null) {
    ctx.achados.push({
      id: 'cadencia',
      severidade: 'ok',
      regiao: 'Marcha',
      titulo: `Cadência estimada: ${dyn.cadenciaSpm.toFixed(0)} passos/min`,
      descricao:
        dyn.cadenciaSpm < 150
          ? 'Cadência abaixo de 150 ppm. Para corrida, elevar a cadência em 5–10% reduz pico de carga em joelho e quadril.'
          : 'Cadência compatível com corrida/trote confortável.',
      metrica: `${dyn.cadenciaSpm.toFixed(0)} spm`,
    });
    if (dyn.cadenciaSpm < 150) {
      addEx(ctx, 'cadencia', { nome: 'Treino de cadência com metrônomo', objetivo: 'Aumentar frequência de passos e reduzir carga articular', series: 'treinos de 10–15 min a +5–8% da cadência atual', frequencia: '2–3×/semana', tipo: 'correcao_gesto' });
    }
  }

  if (ampJ != null) {
    if (ampJ < 35) {
      addFinding(ctx, {
        severidade: 'alerta',
        regiao: 'Joelho',
        titulo: 'Amplitude de flexão do joelho reduzida',
        descricao: `A excursão angular do joelho durante o passo foi de apenas ${ampJ.toFixed(0)}° (referência ≥ 40° em corrida). Indica rigidez de cadeia posterior e/ou pouca flexão na fase oscilante — aumenta impacto na aterrissagem.`,
        metrica: `Amplitude joelho: ${ampJ.toFixed(0)}°`,
      });
      addEx(ctx, 'mob-ischio', { nome: 'Mobilidade de posteriores (swing dinâmico + ponte marchando)', objetivo: 'Ganhar amplitude de quadril/joelho', series: '2×12', frequencia: 'Pré-corrida diária', tipo: 'mobilidade' });
      addEx(ctx, 'eccentric', { nome: 'Agachamento búlgaro excêntrico lento', objetivo: 'Força em amplitude completa', series: '3×8 por perna (3 s descida)', frequencia: '2–3×/semana', tipo: 'forca' });
    } else {
      addFinding(ctx, {
        severidade: 'ok',
        regiao: 'Joelho',
        titulo: 'Boa amplitude de flexão do joelho',
        descricao: `Excursão angular média de ${ampJ.toFixed(0)}°, adequada para absorção de impacto.`,
        metrica: `Amplitude joelho: ${ampJ.toFixed(0)}°`,
      });
    }
  }

  if (flexSwing != null && flexSwing > 0 && flexSwing < 95 && vista === 'lateral') {
    addFinding(ctx, {
      severidade: 'atencao',
      regiao: 'Joelho',
      titulo: 'Baixa flexão de joelho na fase oscillante',
      descricao: `Pico de flexão no swing ≈ ${flexSwing.toFixed(0)}° (esperado > 100°). Limpa menos o solo, favorecendo "scuffing" e menor eficiência.`,
      metrica: `Flexão swing: ${flexSwing.toFixed(0)}°`,
    });
    addEx(ctx, 'march-highknee', { nome: 'High knees / skipping técnico', objetivo: 'Reeducar flexão de joelho no swing', series: '4×20 s', frequencia: '3×/semana', tipo: 'correcao_gesto' });
  }

  if (oscQ != null && oscQ > 7) {
    addFinding(ctx, {
      severidade: oscQ > 10 ? 'alerta' : 'atencao',
      regiao: 'Pelve/Core',
      titulo: 'Oscilação vertical excessiva do quadril',
      descricao: `Centro de massa oscila ${oscQ.toFixed(1)}% da altura do corpo por passo. Sinal de instabilidade pélvica (déficit de glúteo médio) ou "bounce" ineficiente.`,
      metrica: `Oscilação: ${oscQ.toFixed(1)}%`,
    });
    addEx(ctx, 'gluteo-med', { nome: 'Progressões de glúteo médio (single-leg RDL + abduções)', objetivo: 'Estabilizar pelve na marcha/corrida', series: '3×10 por perna', frequencia: '3×/semana', tipo: 'forca' });
    addEx(ctx, 'core-din', { nome: 'Pallof press + prancha com toque no ombro', objetivo: 'Anti-rotação do core', series: '3×12 por lado', frequencia: '3×/semana', tipo: 'estabilizacao' });
  }

  if (recuo != null && Math.abs(recuo) > 12) {
    addFinding(ctx, {
      severidade: 'atencao',
      regiao: 'Tronco',
      titulo: 'Assimetria/inclinação transversal do tronco',
      descricao: `Inclinação média de ${recuo.toFixed(0)}° entre ombros durante o ciclo. Pode ser artefato de câmera ou real inclinação lateral com sobrecarga unilateral.`,
      metrica: `Inclinação: ${recuo.toFixed(0)}°`,
    });
  }

  if (pctAnte != null && pctAnte > 60 && vista === 'lateral') {
    addFinding(ctx, {
      severidade: 'atencao',
      regiao: 'Pé/Tornozelo',
      titulo: 'Predomínio de contato com antepé',
      descricao: `${pctAnte.toFixed(0)}% dos contatos ocorreram com o pé relativamente alto (aterrissagem em antepé/médio). Em corrida é aceitável, mas exige capacidade de panturrilha — risco de tendinopatia aquiliana se volume subir rápido.`,
      metrica: `Contato antepé: ${pctAnte.toFixed(0)}%`,
    });
    addEx(ctx, 'panturrilha', { nome: 'Fortalecimento excêntrico de panturrilha (Alfredson)', objetivo: 'Proteger tendão calcâneo', series: '3×15 joelho estendido + 3×15 flexionado', frequencia: 'Diária ou dias alternados', tipo: 'forca' });
  }

  if (dyn.simetria != null) {
    if (dyn.simetria < 70) {
      addFinding(ctx, {
        severidade: 'alerta',
        regiao: 'Simetria',
        titulo: 'Padrão de passada assimétrico',
        descricao: `Índice de simetria ${dyn.simetria.toFixed(0)}/100 (variabilidade entre ciclos elevada). Assimetria sustentada associa-se a compensações pós-lesão e maior risco de sobrecarga unilateral.`,
        metrica: `Simetria: ${dyn.simetria.toFixed(0)}/100`,
      });
      addEx(ctx, 'unilateral', { nome: 'Bloco unilateral (agachamento búlgaro, stiff 1 perna, step-up)', objetivo: 'Igualar força entre membros', series: '3×10 por perna', frequencia: '2–3×/semana', tipo: 'forca' });
    } else {
      addFinding(ctx, {
        severidade: dyn.simetria < 85 ? 'atencao' : 'ok',
        regiao: 'Simetria',
        titulo: `Simetria de passada ${dyn.simetria >= 85 ? 'boa' : 'regular'} (${dyn.simetria.toFixed(0)}/100)`,
        descricao: 'Variabilidade entre ciclos dentro do esperado para gesto natural.',
        metrica: `Simetria: ${dyn.simetria.toFixed(0)}/100`,
      });
    }
  }

  if (cyc.length < 2) {
    addFinding(ctx, {
      severidade: 'atencao',
      regiao: 'Captura',
      titulo: 'Poucos ciclos de passada detectados',
      descricao: 'A gravação capturou poucos passos completos. Grave 8–12 s percorrendo o campo de visão (ou correndo na esteira com câmera lateral) para análise mais precisa.',
    });
  }

  if (!ctx.achados.some((a2) => a2.severidade !== 'ok')) {
    ctx.achados.unshift({
      id: 'dinamico-ok',
      severidade: 'ok',
      regiao: 'Geral',
      titulo: 'Padrão dinâmico sem alterações relevantes',
      descricao: 'Amplitudes, cadência e simetria dentro dos parâmetros esperados para a tarefa analisada.',
    });
  }

  // Complemento com base no estático (ex.: valgo estático + dinâmica)
  if (estatico) {
    for (const f of estatico.achados) {
      if (f.severidade !== 'ok' && f.regiao === 'Joelho' && ctx.achados.every((c) => c.regiao !== 'Joelho')) {
        addFinding(ctx, {
          severidade: 'atencao',
          regiao: 'Joelho',
          titulo: 'Correlação com achado postural (estático)',
          descricao: `O teste estático apontou "${f.titulo}". Na dinâmica esse desvio tende a amplificar-se sob carga — priorize os exercícios corretivos indicados na análise estática.`,
        });
      }
    }
  }

  return {
    tipo: 'dinamico',
    vista,
    score: scoreFrom(ctx.achados),
    resumo: '',
    achados: ctx.achados,
    exercicios: [...ctx.exs.values()],
    metricas: {
      cadencia_spm: dyn.cadenciaSpm,
      simetria: dyn.simetria,
      amplitude_joelho: avg((c) => c.amplitudeJoelho),
      flexao_swing_joelho: avg((c) => c.picoFlexJoelhoSwing),
      oscilacao_quadril_pct: avg((c) => c.oscVerticalQuadril),
      n_ciclos: cyc.length,
    },
  };
}

/** Monta o texto corrido do relatório da IA */
export function composeResumo(r: AnalysisResult, nome?: string): string {
  const alerts = r.achados.filter((a) => a.severidade === 'alerta');
  const warns = r.achados.filter((a) => a.severidade === 'atencao');
  const kind = r.tipo === 'statico' ? 'postural estática' : 'dinâmica da passada';
  let txt = `Olá${nome ? `, ${nome.split(' ')[0]}` : ''}! Analisei seu vídeo com a ${kind} (vista ${r.vista}) e ${r.metricas['n_frames'] ? `processei ${r.metricas['n_frames']} quadros` : 'extraí as articulações principais'}. `;
  txt += `Score biomecânico global: ${r.score}/100. `;
  if (alerts.length) {
    txt += `⚠️ Ponto(s) de atenção prioritário(s): ${alerts.map((a) => a.titulo.toLowerCase()).join('; ')}. `;
    txt += `${alerts[0].descricao} `;
  }
  if (warns.length) {
    txt += `Também observei: ${warns.map((a) => a.titulo.toLowerCase()).join('; ')} — merecem correção com treino específico. `;
  }
  if (!alerts.length && !warns.length) {
    txt += 'Não identifiquei desvios relevantes — seu padrão apresenta boa organização mecânica. ';
  }
  if (r.exercicios.length) {
    txt += `Prescrevi ${r.exercicios.length} exercício(s)-chave: ${r.exercicios.slice(0, 3).map((e) => e.nome.split('(')[0].trim()).join(', ')}${r.exercicios.length > 3 ? ' etc.' : ''}.`;
  } else {
    txt += 'Como manutenção, siga com aquecimento dinâmico e força 2–3×/semana.';
  }
  return txt;
}
