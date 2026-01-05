// [AI Generated] Data: 19/01/2025
// Descrição: Cliente Supabase para autenticação e banco de dados
// Gerado por: Cursor AI
// Versão: Supabase 2.57.4
// AI_GENERATED_CODE_START
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { User, DailyData, TrainingSession } from '../types';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const authRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL;

// Resolve dinamicamente a URL de redirecionamento (origem atual) para evitar portas incorretas
const resolveRedirectUrl = (): string | undefined => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/`;
  }
  return authRedirectUrl || undefined;
};

// Fallback: permitir configuração via localStorage quando env não estiverem definidos (útil em preview)
const fallbackSupabaseUrl = (typeof window !== 'undefined')
  ? (window.localStorage.getItem('SUPABASE_URL') || undefined)
  : undefined;
const fallbackSupabaseAnonKey = (typeof window !== 'undefined')
  ? (window.localStorage.getItem('SUPABASE_ANON_KEY') || undefined)
  : undefined;

// Preferir localStorage over .env para permitir override sem rebuild
const effectiveSupabaseUrl = fallbackSupabaseUrl || supabaseUrl;
const effectiveSupabaseAnonKey = fallbackSupabaseAnonKey || supabaseAnonKey;

console.info('[supabase] Fonte de configuração', {
  sourceUrl: fallbackSupabaseUrl ? 'localStorage' : (supabaseUrl ? '.env' : 'none'),
  sourceKey: fallbackSupabaseAnonKey ? 'localStorage' : (supabaseAnonKey ? '.env' : 'none')
});

// Export: cliente Supabase (somente após verificação de conectividade)
export let supabase: SupabaseClient | null = null;

// Verificação de conectividade: evita criar cliente quando DNS/URL estão inválidos
const checkSupabaseConnectivity = async (url: string, key: string): Promise<boolean> => {
  try {
    if (!url || !key) return false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const endpoint = `${url.replace(/\/$/, '')}/auth/v1/settings`;
    const res = await fetch(endpoint, {
      method: 'GET',
      mode: 'cors',
      headers: {
        apikey: key
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.ok; // 200/2xx indicam que o domínio respondeu
  } catch (err) {
    console.error('[supabase] Conectividade falhou', err);
    return false;
  }
};

// Inicialização dinâmica do Supabase em tempo de execução
const getRuntimeConfig = async (): Promise<{ url?: string; anonKey?: string }> => {
  try {
    const url = (typeof window !== 'undefined')
      ? (window.localStorage.getItem('SUPABASE_URL') || undefined)
      : undefined;
    const anonKey = (typeof window !== 'undefined')
      ? (window.localStorage.getItem('SUPABASE_ANON_KEY') || undefined)
      : undefined;
    if (url && anonKey) return { url, anonKey };

    if (typeof window !== 'undefined') {
      const res = await fetch('/supabase-config.json', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const jsonUrl = json.url || json.supabaseUrl || json.SUPABASE_URL;
        const jsonKey = json.anonKey || json.supabaseAnonKey || json.SUPABASE_ANON_KEY;
        if (jsonUrl && jsonKey) {
          try {
            window.localStorage.setItem('SUPABASE_URL', jsonUrl);
            window.localStorage.setItem('SUPABASE_ANON_KEY', jsonKey);
          } catch (_) { }
          return { url: jsonUrl, anonKey: jsonKey };
        }
      }
    }
  } catch (_) {
    // silencioso para não afetar UX
  }
  return {};
};

export const ensureSupabaseConfigured = async (): Promise<SupabaseClient | null> => {
  console.info('[supabase] ensureSupabaseConfigured iniciado', { supabaseExists: !!supabase });
  // Modo offline: se não houver internet, trabalhe apenas com dados locais
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    console.warn('[supabase] Offline detectado; operando em modo local sem cliente Supabase.');
    return null;
  }
  if (supabase) return supabase;

  const runtime = await getRuntimeConfig();
  console.info('[supabase] Runtime config', runtime);

  const candidates: Array<{ url: string; key: string; source: string }> = [];
  if (fallbackSupabaseUrl && fallbackSupabaseAnonKey) {
    candidates.push({ url: fallbackSupabaseUrl, key: fallbackSupabaseAnonKey, source: 'localStorage' });
  }
  if (supabaseUrl && supabaseAnonKey) {
    candidates.push({ url: supabaseUrl, key: supabaseAnonKey, source: '.env' });
  }
  if (runtime.url && runtime.anonKey) {
    candidates.push({ url: runtime.url, key: runtime.anonKey, source: 'supabase-config.json' });
  }

  console.info('[supabase] Candidatos de configuração', candidates.map(c => ({ source: c.source, hasUrl: !!c.url, hasKey: !!c.key })));

  let chosen: { url?: string; key?: string; source?: string } = {};
  for (const c of candidates) {
    console.info('[supabase] Testando conectividade com', c.source);
    const reachable = await checkSupabaseConnectivity(c.url, c.key);
    if (reachable) {
      chosen = c;
      break;
    } else {
      console.warn('[supabase] Conectividade falhou para', c.source);
    }
  }

  if (!chosen.url || !chosen.key) {
    // Limpar overrides inválidos para permitir UI de configuração aparecer
    try {
      window.localStorage.removeItem('SUPABASE_URL');
      window.localStorage.removeItem('SUPABASE_ANON_KEY');
    } catch (_) { }
    console.warn('[supabase] Nenhuma configuração Supabase válida. Continuando em modo local.');
    return null;
  }

  // Persistir a configuração escolhida para sessões futuras
  try {
    window.localStorage.setItem('SUPABASE_URL', chosen.url!);
    window.localStorage.setItem('SUPABASE_ANON_KEY', chosen.key!);
  } catch (_) { }

  console.info('[supabase] Conectividade OK via', chosen.source, '. Criando cliente Supabase');
  supabase = createClient(chosen.url!, chosen.key!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  console.info('[supabase] Cliente criado com sucesso');

  return supabase;
};

// Helpers de Autenticação
const mapAuthErrorMessage = (err: any): string => {
  const raw = (err?.message || '').toLowerCase();
  if (raw.includes('service is unavailable') || raw.includes('service unavailable')) {
    return 'Serviço de e-mail indisponível no Supabase. Configure um provider em Authentication → Email (SMTP), ou desative "Confirm email" em desenvolvimento.';
  }
  if (raw.includes('redirect_to not allowed') || raw.includes('redirect to not allowed')) {
    return 'URL de redirecionamento não permitida. Inclua "http://localhost:5177/" (dev) e seu domínio em Authentication → URL Configuration.';
  }
  if (raw.includes('rate limit')) {
    return 'Limite de taxa atingido. Aguarde alguns minutos antes de tentar novamente.';
  }
  if (raw.includes('invalid email') || raw.includes('invalid login credentials')) {
    return 'Credenciais inválidas. Verifique o e-mail e a senha.';
  }
  if (raw.includes('row level security') || raw.includes('rls')) {
    return 'Políticas de RLS bloqueando acesso à tabela. Aplique migrações e políticas em public.users.';
  }
  if (raw.includes('relation "users" does not exist') || (raw.includes('relation') && raw.includes('users') && raw.includes('does not exist'))) {
    return 'Tabela public.users inexistente. Execute as migrações SQL de criação de tabela e trigger.';
  }
  if (raw.includes('permission denied')) {
    return 'Permissão negada ao acessar public.users. Verifique RLS e autenticação.';
  }
  return err?.message || 'Erro de autenticação no Supabase.';
};

export const authHelpers = {
  async signUp(email: string, password: string, userData: any) {
    console.info('[auth] signUp iniciado', { email, userData });

    const client = await ensureSupabaseConfigured();
    console.info('[auth] Supabase configurado?', { supabase: !!client });

    if (!client) {
      // Fallback local de cadastro quando Supabase não está disponível
      try {
        const id = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
          ? (crypto as any).randomUUID()
          : `local-${Math.random().toString(36).slice(2)}`;
        const localUser: any = {
          id,
          email,
          user_metadata: { ...userData },
          created_at: new Date().toISOString(),
          provider: 'local'
        };
        try {
          localStorage.setItem('LOCAL_AUTH_USER', JSON.stringify({ ...localUser, password }));
        } catch (_) { }
        console.warn('[auth] Supabase indisponível. Conta local criada.');
        return { data: { user: localUser }, error: null } as any;
      } catch (err) {
        return { data: null, error: { message: 'Falha ao criar conta local.' } } as any;
      }
    }

    try {
      const redirectUrl = resolveRedirectUrl();
      console.info('[auth] Tentando signUp', { email, redirectUrl });

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: redirectUrl,
        }
      });
      if (error) {
        return { data: null, error: { message: mapAuthErrorMessage(error) } } as any;
      }
      console.info('[auth] signUp result', { data, error });
      return { data, error };
    } catch (networkError) {
      console.error('[auth] signUp network error', networkError);
      return {
        data: null,
        error: {
          message: 'Erro de conexão com o servidor. Verifique sua conexão com a internet e tente novamente.'
        }
      };
    }
  },

  async signIn(email: string, password: string) {
    const client = await ensureSupabaseConfigured();
    if (!client) {
      // Login local: validar contra conta local, se existir
      try {
        const raw = localStorage.getItem('LOCAL_AUTH_USER');
        const local = raw ? JSON.parse(raw) : null;
        if (local && local.email === email && (!local.password || local.password === password)) {
          const user = { id: local.id, email: local.email, user_metadata: local.user_metadata, provider: 'local' } as any;
          return { data: { user }, error: null } as any;
        }
        return { data: null, error: { message: 'Conta local não encontrada. Configure Supabase ou crie conta local.' } } as any;
      } catch (_) {
        return { data: null, error: { message: 'Falha ao acessar conta local.' } } as any;
      }
    }
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      return { data, error };
    } catch (networkError) {
      return { data: null, error: { message: 'Erro de conexão com Supabase.' } } as any;
    }
  },

  async resendSignupEmail(email: string) {
    const client = await ensureSupabaseConfigured();
    if (!client) {
      return { error: { message: 'Supabase não configurado. Ajuste URL/anon key.' } } as any;
    }
    try {
      const redirectUrl = resolveRedirectUrl();
      const { data, error } = await client.auth.resend({ type: 'signup', email, redirectTo: redirectUrl });
      if (error) {
        return { data: null, error: { message: mapAuthErrorMessage(error) } } as any;
      }
      return { data, error } as any;
    } catch (networkError) {
      return { data: null, error: { message: 'Erro de conexão com Supabase.' } } as any;
    }
  },

  async signOut() {
    const client = await ensureSupabaseConfigured();
    if (!client) {
      try { localStorage.removeItem('LOCAL_AUTH_USER'); } catch (_) { }
      return { error: null } as any;
    }
    const { error } = await client.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    if (!supabase) {
      try {
        const raw = localStorage.getItem('LOCAL_AUTH_USER');
        const local = raw ? JSON.parse(raw) : null;
        if (local) {
          return { id: local.id, email: local.email, user_metadata: local.user_metadata } as any;
        }
      } catch (_) { }
      return null;
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};
// AI_GENERATED_CODE_END
export const dbHelpers = {
  async getDailyData(userId: string, days: number = 30) {
    const client = await ensureSupabaseConfigured();
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      const startISO = startDate.toISOString().split('T')[0];
      const endISO = endDate.toISOString().split('T')[0];

      // Se cliente não existir (offline ou sem configuração), retornar somente dados locais
      if (!client) {
        let local: any[] = [];
        try {
          const key = `daily_data_local_${userId}`;
          local = JSON.parse(localStorage.getItem(key) || '[]');
        } catch { }
        const localFiltered = local.filter((e: any) => {
          const d = e?.date;
          return typeof d === 'string' && d >= startISO && d <= endISO;
        });
        const merged = [...localFiltered].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
        return { data: merged, error: null } as any;
      }

      const { data, error } = await client
        .from('daily_data')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startISO)
        .lte('date', endISO)
        .order('date', { ascending: false });

      if (error) {
        if (import.meta.env.DEV) {
          console.warn('[supabase] daily_data retornou erro', error);
          if ((error as any)?.code === '404' || /404/.test((error as any)?.message || '')) {
            console.warn('[supabase] Tabela daily_data não encontrada ou sem permissão (404). Retornando lista vazia para evitar quebra da UI.');
          }
        }
      }

      // Mesclar dados locais (fallback) com os remotos
      const remote = (data as DailyData[] | null) || [];
      let local: any[] = [];
      try {
        const key = `daily_data_local_${userId}`;
        local = JSON.parse(localStorage.getItem(key) || '[]');
      } catch { }
      const localFiltered = local.filter((e: any) => {
        const d = e?.date;
        return typeof d === 'string' && d >= startISO && d <= endISO;
      });
      const dedup = new Set(remote.map(r => `${r.user_id}|${r.date}`));
      const merged = [...remote, ...localFiltered.filter((e: any) => !dedup.has(`${e.user_id}|${e.date}`))]
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

      return { data: merged, error } as any;
    } catch (networkError) {
      return { data: [], error: { message: 'Erro de conexão com Supabase.' } } as any;
    }
  },

  async getTrainingSessions(userId: string, days: number = 30) {
    const client = await ensureSupabaseConfigured();
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      const startISO = startDate.toISOString().split('T')[0];
      const endISO = endDate.toISOString().split('T')[0];

      if (!client) {
        let local: any[] = [];
        try {
          const key = `training_sessions_local_${userId}`;
          local = JSON.parse(localStorage.getItem(key) || '[]');
        } catch { }
        const localFiltered = local.filter((e: any) => {
          const d = e?.date;
          return typeof d === 'string' && d >= startISO && d <= endISO;
        });
        const signature = (e: any) => `${e.user_id}|${e.date}|${e.duration || ''}|${e.rpe || ''}`;
        const merged = [...localFiltered]
          .filter((e: any, idx, arr) => arr.findIndex(x => signature(x) === signature(e)) === idx)
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
        return { data: merged, error: null } as any;
      }

      const { data, error } = await client
        .from('training_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startISO)
        .lte('date', endISO)
        .order('date', { ascending: false });

      if (error) {
        if (import.meta.env.DEV) {
          console.warn('[supabase] training_sessions retornou erro', error);
          if ((error as any)?.code === '404' || /404/.test((error as any)?.message || '')) {
            console.warn('[supabase] Tabela training_sessions não encontrada ou sem permissão (404). Retornando lista vazia para evitar quebra da UI.');
          }
        }
      }

      // Mesclar dados locais (fallback) com os remotos
      const remote = (data as TrainingSession[] | null) || [];
      let local: any[] = [];
      try {
        const key = `training_sessions_local_${userId}`;
        local = JSON.parse(localStorage.getItem(key) || '[]');
      } catch { }
      const localFiltered = local.filter((e: any) => {
        const d = e?.date;
        return typeof d === 'string' && d >= startISO && d <= endISO;
      });
      const signature = (e: any) => `${e.user_id}|${e.date}|${e.duration || ''}|${e.rpe || ''}`;
      const dedup = new Set(remote.map(signature));
      const merged = [...remote, ...localFiltered.filter((e: any) => !dedup.has(signature(e)))]
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

      return { data: merged, error } as any;
    } catch (networkError) {
      return { data: [], error: { message: 'Erro de conexão com Supabase.' } } as any;
    }
  },

  async saveDailyData(entry: Partial<DailyData>) {
    const client = await ensureSupabaseConfigured();
    if (!client) {
      // Fallback local: salvar em localStorage quando Supabase indisponível
      try {
        const userId = String(entry.user_id || 'unknown');
        const key = `daily_data_local_${userId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const withDefaults = {
          ...entry,
          date: entry.date || new Date().toISOString().split('T')[0]
        };
        existing.push(withDefaults);
        localStorage.setItem(key, JSON.stringify(existing));
        return { data: withDefaults, error: null } as any;
      } catch (_) {
        return { data: null, error: { message: 'Supabase não configurado e falha ao salvar localmente.' } } as any;
      }
    }
    try {
      const { data, error } = await client
        .from('daily_data')
        .insert(entry)
        .select()
        .single();
      return { data, error } as any;
    } catch (networkError) {
      return { data: null, error: { message: 'Erro de conexão com Supabase.' } } as any;
    }
  },

  async saveTrainingSession(entry: Partial<TrainingSession>) {
    const client = await ensureSupabaseConfigured();
    if (!client) {
      // Fallback local: salvar em localStorage quando Supabase indisponível
      try {
        const userId = String(entry.user_id || 'unknown');
        const key = `training_sessions_local_${userId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const withDefaults = {
          ...entry,
          date: entry.date || new Date().toISOString().split('T')[0]
        };
        existing.push(withDefaults);
        localStorage.setItem(key, JSON.stringify(existing));
        return { data: withDefaults, error: null } as any;
      } catch (_) {
        return { data: null, error: { message: 'Supabase não configurado e falha ao salvar localmente.' } } as any;
      }
    }
    try {
      const { data, error } = await client
        .from('training_sessions')
        .insert(entry)
        .select()
        .single();
      return { data, error } as any;
    } catch (networkError) {
      return { data: null, error: { message: 'Erro de conexão com Supabase.' } } as any;
    }
  },

  async updateUserProfile(updates: Partial<User> & { id: string }) {
    const client = await ensureSupabaseConfigured();
    if (!client) {
      return { data: null, error: { message: 'Supabase não configurado. Ajuste URL/anon key.' } } as any;
    }
    try {
      const payload: any = {
        id: updates.id,
        name: updates.name,
        email: updates.email,
        birth_date: updates.birth_date,
        role: updates.role,
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('users')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      return { data, error } as any;
    } catch (networkError) {
      return { data: null, error: { message: 'Erro de conexão com Supabase.' } } as any;
    }
  }
};