// [AI Generated] Data: 19/12/2024
// Descrição: Context de autenticação com Supabase e gerenciamento de estado do usuário
// Gerado por: Cursor AI
// Versão: React 18.2.0, Supabase JS 2.39.0
// AI_GENERATED_CODE_START
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  email: string
  full_name: string | null
  profile_type: 'athlete' | 'trainer' | 'physiotherapist'
  linked_to: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, profileType: Profile['profile_type']) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Função centralizada para buscar o perfil
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Se nenhum perfil for encontrado, data será null
      console.log('👤 fetchProfile: Perfil encontrado:', data ? 'Sim' : 'Não')
      setProfile(data as Profile)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      setProfile(null)
    }
  }

  useEffect(() => {
    console.log('🔄 AuthContext: Iniciando configuração de autenticação...')
    
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      console.log('🔄 AuthContext: Mudança de estado de autenticação detectada:', event)
      console.log('🔄 AuthContext: Sessão atual:', currentSession ? 'Presente' : 'Ausente')
      
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setProfile(null) // Limpa o perfil para evitar estado incorreto

      if (currentSession?.user) {
        console.log('👤 AuthContext: Usuário logado, buscando perfil...')
        await fetchProfile(currentSession.user.id)
      } else {
        console.log('👤 AuthContext: Nenhum usuário logado')
      }
      
      console.log('✅ AuthContext: Definindo loading como false')
      setLoading(false)
    }

    console.log('🔄 AuthContext: Configurando listener de mudanças de autenticação...')
    // Obter sessão inicial e escutar mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    console.log('✅ AuthContext: Listener configurado com sucesso')

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string, profileType: Profile['profile_type']) => {
    const { data, error } = await supabase.auth.signUp({
    console.log('👤 fetchProfile: Buscando perfil para usuário:', userId)
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          profile_type: profileType,
        console.error('❌ fetchProfile: Erro ao buscar perfil:', error)
        }
      }
    })

    if (error) {
      throw error
    }
    
    // O perfil será criado automaticamente via trigger do Supabase,
    // e o estado será atualizado pelo onAuthStateChange
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) {
      throw new Error('Usuário ou perfil não autenticado')
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    setProfile(data as Profile)
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
// AI_GENERATED_CODE_END