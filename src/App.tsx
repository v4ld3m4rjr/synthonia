import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AssessmentPage from './pages/Assessment';
import HistoryPage from './pages/History';
import PatientDetailPage from './pages/PatientDetail';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';

import { TrainingForm } from './modules/training/TrainingForm';
import { SpravatoForm } from './modules/spravato/SpravatoForm';
import { EvaluationForm } from './modules/evaluation/EvaluationForm';
import { RecoveryAuthForm } from './components/auth/RecoveryAuthForm';
import { RecoveryDashboard } from './components/dashboard/RecoveryDashboard';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/recovery-auth" element={<RecoveryAuthForm />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/recovery-dashboard" element={
            <ProtectedRoute>
              <RecoveryDashboard />
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute allowedRoles={['subject']}>
              <HistoryPage />
            </ProtectedRoute>
          } />

          <Route path="/patient/:patientId" element={
            <ProtectedRoute allowedRoles={['doctor', 'coach']}>
              <PatientDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/assessment" element={
            <ProtectedRoute allowedRoles={['subject']}>
              <AssessmentPage />
            </ProtectedRoute>
          } />
          
          <Route path="/training/new" element={
            <ProtectedRoute allowedRoles={['subject']}>
              <TrainingForm />
            </ProtectedRoute>
          } />
          
          <Route path="/spravato/new" element={
            <ProtectedRoute allowedRoles={['subject']}>
              <SpravatoForm />
            </ProtectedRoute>
          } />
          
          <Route path="/evaluation" element={
            <ProtectedRoute allowedRoles={['subject']}>
              <EvaluationForm />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/recovery-auth" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
