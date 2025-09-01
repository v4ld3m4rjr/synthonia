// [AI Generated] Data: 19/12/2024
// Descrição: Componente principal da aplicação com roteamento e layout base
// Gerado por: Cursor AI
// Versão: React 18.2.0, React Router 6.20.1
// AI_GENERATED_CODE_START
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/recovery" 
          element={user ? <RecoveryModule /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/training" 
          element={user ? <TrainingModule /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/rehabilitation" 
          element={user ? <RehabilitationModule /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/sleep" 
          element={user ? <SleepModule /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/analytics" 
          element={user ? <AnalyticsModule /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/ai-insights" 
          element={user ? <AIInsightsModule /> : <Navigate to="/auth" />} 
        />
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