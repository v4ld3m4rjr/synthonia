// [AI Generated] Data: 19/01/2025
// Descrição: Componente principal da aplicação Synthonia AI
// Gerado por: Cursor AI
// Versão: React 18.3.1, TypeScript 5.5.3
// AI_GENERATED_CODE_START
import React, { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, authHelpers, ensureSupabaseConfigured } from './lib/supabase';
import { User } from './types';
import AuthScreen from './components/auth/AuthScreen';
import Dashboard from './components/dashboard/Dashboard';
import LoadingSpinner from './components/ui/LoadingSpinner';
import CookieConsent from './components/ui/CookieConsent';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        const client = await ensureSupabaseConfigured();
        if (!active) return;
        if (!client) {
          // Fallback: tentar recuperar usuário local (modo offline)
          try {
            const localUser = await authHelpers.getCurrentUser();
            if (localUser) {
              setUser(localUser as any);
              setUserProfile({
                id: (localUser as any).id,
                email: (localUser as any).email || '',
                name: ((localUser as any).user_metadata?.name) || 'Usuário',
                role: (((localUser as any).user_metadata?.role) || 'athlete') as any,
                created_at: new Date().toISOString(),
                avatar_url: ((localUser as any).user_metadata?.avatar_url) || null
              } as any);
            }
          } catch (_) {}
          setLoading(false);
          return;
        }

        const { data: { session } } = await client.auth.getSession();
        if (!active) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }

        const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
          if (!active) return;
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchUserProfile(session.user.id);
          } else {
            setUserProfile(null);
            setLoading(false);
          }
        });
        unsubscribe = () => subscription.unsubscribe();
      } catch (err) {
        // Se Supabase falhar, ainda tentar modo local
        try {
          const localUser = await authHelpers.getCurrentUser();
          if (localUser) {
            setUser(localUser as any);
            setUserProfile({
              id: (localUser as any).id,
              email: (localUser as any).email || '',
              name: ((localUser as any).user_metadata?.name) || 'Usuário',
              role: (((localUser as any).user_metadata?.role) || 'athlete') as any,
              created_at: new Date().toISOString(),
              avatar_url: ((localUser as any).user_metadata?.avatar_url) || null
            } as any);
          }
        } catch (_) {}
        setLoading(false);
      }
    };

    init();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const client = supabase || await ensureSupabaseConfigured();
      if (!client) {
        // Fallback: construir perfil a partir do usuário local
        const localUser = await authHelpers.getCurrentUser();
        if (localUser) {
          setUserProfile({
            id: (localUser as any).id || userId,
            email: (localUser as any).email || '',
            name: ((localUser as any).user_metadata?.name) || 'Usuário',
            role: (((localUser as any).user_metadata?.role) || 'athlete') as any,
            created_at: new Date().toISOString(),
            avatar_url: ((localUser as any).user_metadata?.avatar_url) || null
          } as any);
        }
        setLoading(false);
        return;
      }
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        const authUser = user;
        setUserProfile({
          id: authUser?.id || userId,
          email: authUser?.email || '',
          name: (authUser as any)?.user_metadata?.name || 'Usuário',
          role: 'athlete',
          created_at: new Date().toISOString(),
          avatar_url: (authUser as any)?.user_metadata?.avatar_url || null
        } as any);
      } else {
        setUserProfile(data as any);
      }
    } catch (_err) {
      const authUser = user;
      setUserProfile({
        id: authUser?.id || userId,
        email: authUser?.email || '',
        name: (authUser as any)?.user_metadata?.name || 'Usuário',
        role: 'athlete',
        created_at: new Date().toISOString(),
        avatar_url: (authUser as any)?.user_metadata?.avatar_url || null
      } as any);
    } finally {
      setLoading(false);
    }
  }
  const handleLogout = async () => {
    await authHelpers.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const content = (!user || !userProfile)
    ? (<AuthScreen />)
    : (
      <div className="min-h-screen" style={{ backgroundColor: '#001a33' }}>
        <Dashboard user={userProfile} onLogout={handleLogout} />
      </div>
    );

  return (
    <>
      {content}
      <CookieConsent />
    </>
  );
}

export default App;
// AI_GENERATED_CODE_END