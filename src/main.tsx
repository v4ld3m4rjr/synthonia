// [AI Generated] Data: 19/12/2024
// Descrição: Configuração do React Router com future flags e roteamento baseado em objetos
// Gerado por: Cursor AI
// Versão: React 18.2.0, React Router 6.20.1
// AI_GENERATED_CODE_START
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.tsx'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import RecoveryModule from './pages/RecoveryModule'
import TrainingModule from './pages/TrainingModule'
import RehabilitationModule from './pages/RehabilitationModule'
import SleepModule from './pages/SleepModule'
import AnalyticsModule from './pages/AnalyticsModule'
import AIInsightsModule from './pages/AIInsightsModule'
import './index.css'

// [AI Generated] Data: 19/12/2024
// Descrição: Adicionado diagnóstico inicial da aplicação
// Gerado por: Cursor AI
// AI_GENERATED_CODE_START
import { runDiagnostics, testSupabaseConnection } from './utils/diagnostics'

// Executar diagnósticos na inicialização
console.log('🚀 Iniciando SynthonIA AI...')
runDiagnostics()

// Testar conexão com Supabase após um pequeno delay
setTimeout(async () => {
  await testSupabaseConnection()
}, 1000)
// AI_GENERATED_CODE_END

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "recovery",
        element: <RecoveryModule />
      },
      {
        path: "training",
        element: <TrainingModule />
      },
      {
        path: "rehabilitation",
        element: <RehabilitationModule />
      },
      {
        path: "sleep",
        element: <SleepModule />
      },
      {
        path: "analytics",
        element: <AnalyticsModule />
      },
      {
        path: "ai-insights",
        element: <AIInsightsModule />
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
// AI_GENERATED_CODE_END