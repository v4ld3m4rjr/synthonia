// ===== Camada de dados: Supabase com fallback local (localStorage) =====
// Se NEXT/VITE_SUPABASE_URL e ANON_KEY estiverem ausentes, o app roda em
// "modo demo" com auth simulada no navegador — útil para desenvolvimento.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AssessmentRecord, UserProfile } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : null;

// ---------- Fallback local ----------
const LS_USERS = 'biomech.users';
const LS_SESSION = 'biomech.session';
const LS_ASSESSMENTS = 'biomech.assessments';

interface LocalUser extends UserProfile {
  senhaHash: string;
}

async function hash(texto: string): Promise<string> {
  const data = new TextEncoder().encode(texto + '::biomech-salt');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(LS_USERS) || '[]');
  } catch {
    return [];
  }
}
function writeUsers(u: LocalUser[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(u));
}
function readAssessments(): AssessmentRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LS_ASSESSMENTS) || '[]');
  } catch {
    return [];
  }
}
function writeAssessments(a: AssessmentRecord[]) {
  localStorage.setItem(LS_ASSESSMENTS, JSON.stringify(a));
}

// ---------- API unificada ----------

export async function signUp(nome: string, email: string, senha: string, role: UserProfile['role']): Promise<{ ok: boolean; message: string; needsConfirm?: boolean }> {
  if (supabase) {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, role },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { ok: false, message: traduzErro(error.message) };
    return { ok: true, message: 'Conta criada! Verifique seu e-mail para confirmar o cadastro.', needsConfirm: true };
  }
  // modo demo
  const users = readUsers();
  if (users.some((u) => u.email === email)) return { ok: false, message: 'Este e-mail já está cadastrado.' };
  const id = crypto.randomUUID();
  users.push({ id, email, nome, role, senhaHash: await hash(senha), created_at: new Date().toISOString() });
  writeUsers(users);
  return { ok: true, message: 'Cadastro realizado (modo demonstração).' };
}

export async function signIn(email: string, senha: string): Promise<{ ok: boolean; message?: string }> {
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return { ok: false, message: traduzErro(error.message) };
    return { ok: true };
  }
  const users = readUsers();
  const u = users.find((x) => x.email === email);
  if (!u || u.senhaHash !== (await hash(senha))) return { ok: false, message: 'E-mail ou senha incorretos.' };
  localStorage.setItem(LS_SESSION, JSON.stringify({ id: u.id }));
  window.dispatchEvent(new Event('biomech-auth'));
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
    return;
  }
  localStorage.removeItem(LS_SESSION);
  window.dispatchEvent(new Event('biomech-auth'));
}

export async function resetPassword(email: string): Promise<{ ok: boolean; message: string }> {
  if (supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset' });
    if (error) return { ok: false, message: traduzErro(error.message) };
    return { ok: true, message: 'Enviamos um link de redefinição para seu e-mail.' };
  }
  return { ok: false, message: 'Recuperação disponível apenas com Supabase configurado.' };
}

export async function getSessionUser(): Promise<UserProfile | null> {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user;
    if (!uid) return null;
    const meta = uid.user_metadata || {};
    let profile: UserProfile = {
      id: uid.id,
      email: uid.email || '',
      nome: (meta.nome as string) || (uid.email || 'Usuário').split('@')[0],
      role: ((meta.role as UserProfile['role']) || 'atleta'),
    };
    // tenta enriquecer com a tabela public.users
    const { data: row } = await supabase.from('users').select('*').eq('id', uid.id).maybeSingle();
    if (row) profile = { ...profile, ...mapRow(row), nome: row.name || profile.nome };
    return profile;
  }
  try {
    const s = JSON.parse(localStorage.getItem(LS_SESSION) || 'null');
    if (!s?.id) return null;
    const u = readUsers().find((x) => x.id === s.id);
    if (!u) return null;
    const { senhaHash: _h, ...prof } = u;
    void _h;
    return prof;
  } catch {
    return null;
  }
}

export async function updateProfile(patch: Partial<UserProfile>): Promise<void> {
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    await supabase.from('users').upsert({
      id: uid,
      email: data.user?.email,
      name: patch.nome,
      birth_date: patch.idade ? new Date(Date.now() - patch.idade * 365 * 864e5).toISOString().slice(0, 10) : null,
      role: mapRole(patch.role),
    });
    return;
  }
  const users = readUsers();
  const s = JSON.parse(localStorage.getItem(LS_SESSION) || 'null');
  const i = users.findIndex((u) => u.id === s?.id);
  if (i >= 0) {
    users[i] = { ...users[i], ...patch };
    writeUsers(users);
    window.dispatchEvent(new Event('biomech-auth'));
  }
}

function mapRole(r?: UserProfile['role']) {
  return r === 'treinador' ? 'coach' : r === 'fisioterapeuta' ? 'physiotherapist' : 'athlete';
}
function mapRow(row: any): Partial<UserProfile> {
  const role: UserProfile['role'] = row.role === 'coach' ? 'treinador' : row.role === 'physiotherapist' ? 'fisioterapeuta' : 'atleta';
  return { role };
}

// ---------- Avaliação ----------

export async function saveAssessment(rec: Omit<AssessmentRecord, 'id' | 'created_at'>): Promise<AssessmentRecord> {
  const full: AssessmentRecord = { ...rec, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  if (supabase) {
    const { error } = await supabase.from('assessments').insert({
      user_id: rec.user_id,
      tipo: rec.tipo,
      vista: rec.vista,
      score: rec.score,
      resumo_ia: rec.resumo_ia,
      achados: rec.achados,
      exercicios: rec.exercicios,
      metricas: rec.metricas,
      video_url: rec.video_url,
      duracao_s: rec.duracao_s,
      frames_analisados: rec.frames_analisados,
    });
    if (error) console.warn('Falha ao salvar no Supabase:', error.message);
    return full;
  }
  const all = readAssessments();
  all.unshift(full);
  writeAssessments(all);
  return full;
}

export async function listAssessments(userId: string): Promise<AssessmentRecord[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.warn('Falha ao listar avaliações:', error.message);
      return [];
    }
    return (data || []).map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      tipo: r.tipo,
      vista: r.vista,
      score: r.score ?? 0,
      resumo_ia: r.resumo_ia ?? '',
      achados: r.achados ?? [],
      exercicios: r.exercicios ?? [],
      metricas: r.metricas ?? {},
      video_url: r.video_url ?? null,
      duracao_s: r.duracao_s ?? 0,
      frames_analisados: r.frames_analisados ?? 0,
      created_at: r.created_at,
    }));
  }
  return readAssessments().filter((a) => a.user_id === userId);
}

function traduzErro(msg: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'Email not confirmed': 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
    'User already registered': 'Este e-mail já está cadastrado.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  };
  return map[msg] || msg;
}
