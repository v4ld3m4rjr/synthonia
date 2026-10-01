import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { UserProfile } from '../lib/types';
import { getSessionUser, signOut as sbSignOut } from '../lib/supabase';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState>({ user: null, loading: true, refresh: async () => {}, logout: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const u = await getSessionUser();
    setUser(u);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
    window.addEventListener('biomech-auth', refresh);
    return () => window.removeEventListener('biomech-auth', refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    await sbSignOut();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, refresh, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
