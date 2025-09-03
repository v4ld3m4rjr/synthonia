// [AI Generated] Data: 19/12/2024
// Descrição: Utilitários de diagnóstico para debug da aplicação
// Gerado por: Cursor AI
// Versão: TypeScript 5.2.2
// AI_GENERATED_CODE_START
export const runDiagnostics = () => {
  console.log('🔍 === DIAGNÓSTICO COMPLETO DA APLICAÇÃO ===')
  
  // Verificar variáveis de ambiente
  console.log('\n📋 VARIÁVEIS DE AMBIENTE:')
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || '❌ NÃO DEFINIDA')
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ DEFINIDA' : '❌ NÃO DEFINIDA')
  
  // Verificar se estamos no ambiente correto
  console.log('\n🌍 AMBIENTE:')
  console.log('Mode:', import.meta.env.MODE)
  console.log('Base URL:', import.meta.env.BASE_URL)
  console.log('Dev:', import.meta.env.DEV)
  console.log('Prod:', import.meta.env.PROD)
  
  // Verificar conectividade básica
  console.log('\n🌐 CONECTIVIDADE:')
  console.log('Navigator online:', navigator.onLine)
  console.log('User Agent:', navigator.userAgent)
  
  // Verificar localStorage
  console.log('\n💾 STORAGE:')
  try {
    const supabaseAuth = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')
    console.log('Token Supabase no localStorage:', supabaseAuth ? 'Presente' : 'Ausente')
  } catch (e) {
    console.log('Erro ao verificar localStorage:', e)
  }
  
  console.log('\n🔍 === FIM DO DIAGNÓSTICO ===\n')
}

export const testSupabaseConnection = async () => {
  console.log('🧪 Testando conexão com Supabase...')
  
  try {
    const { supabase } = await import('@/lib/supabase')
    
    // Teste simples de conexão
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Erro ao obter sessão:', error)
      return false
    }
    
    console.log('✅ Conexão com Supabase OK')
    console.log('Sessão atual:', data.session ? 'Presente' : 'Ausente')
    return true
    
  } catch (error) {
    console.error('❌ Erro crítico na conexão com Supabase:', error)
    return false
  }
}
// AI_GENERATED_CODE_END