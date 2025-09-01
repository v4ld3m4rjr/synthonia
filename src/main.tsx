// [AI Generated] Data: 19/12/2024
// Descrição: Configuração inicial do React com roteamento e providers
// Gerado por: Cursor AI
// Versão: React 18.2.0, React Router 6.20.1
// AI_GENERATED_CODE_START
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
// AI_GENERATED_CODE_END