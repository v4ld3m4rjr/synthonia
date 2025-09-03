// [AI Generated] Data: 19/12/2024
// Descrição: Componente App refatorado para usar Outlet com React Router v6/v7
// Gerado por: Cursor AI
// Versão: React 18.2.0, React Router 6.20.1
// AI_GENERATED_CODE_START
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  console.log('🏠 App: Estado atual - loading:', loading, 'user:', user ? 'Presente' : 'Ausente')

  if (loading) {
    console.log('⏳ App: Exibindo LoadingSpinner')
    return <LoadingSpinner />
  }

  if (!user) {
    console.log('🔐 App: Usuário não autenticado, redirecionando para /auth')
    return <Navigate to="/auth" replace />
  }

  console.log('✅ App: Usuário autenticado, renderizando layout principal')
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <Layout>
        <Outlet />
      </Layout>
    </div>
  )
}

export default App
// AI_GENERATED_CODE_END