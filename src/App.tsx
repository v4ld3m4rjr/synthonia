// [AI Generated] Data: 19/12/2024
// Descrição: Componente principal da aplicação com roteamento e layout base
// Gerado por: Cursor AI
// Versão: React 18.2.0, React Router 6.20.1
// AI_GENERATED_CODE_START
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import AuthPage from '@/pages/AuthPage'
import Dashboard from '@/pages/Dashboard'
import RecoveryModule from '@/pages/RecoveryModule'
import TrainingModule from '@/pages/TrainingModule'
import RehabilitationModule from '@/pages/RehabilitationModule'
import SleepModule from '@/pages/SleepModule'
import AnalyticsModule from '@/pages/AnalyticsModule'
import AIInsightsModule from '@/pages/AIInsightsModule'
import LoadingSpinner from '@/components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <Routes>
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/dashboard" /> : <AuthPage />} 
        />
        {user ? (
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/recovery" element={<RecoveryModule />} />
                <Route path="/training" element={<TrainingModule />} />
                <Route path="/rehabilitation" element={<RehabilitationModule />} />
                <Route path="/sleep" element={<SleepModule />} />
                <Route path="/analytics" element={<AnalyticsModule />} />
                <Route path="/ai-insights" element={<AIInsightsModule />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          } />
        ) : (
          <Route path="/*" element={<Navigate to="/auth" />} />
        )}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/auth"} />} 
        />
      </Routes>
    </div>
  )
}

export default App
// AI_GENERATED_CODE_END