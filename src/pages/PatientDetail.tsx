import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabaseService } from '../services/supabase.service';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ReadinessTrendChart } from '../components/charts/ReadinessTrendChart';
import { MentalHealthScoreChart } from '../components/charts/MentalHealthScoreChart';
import { TrainingLoadChart } from '../components/charts/TrainingLoadChart';
import { WorkloadMetricsChart } from '../components/charts/WorkloadMetricsChart';
import { SpravatoEffectivenessChart } from '../components/charts/SpravatoEffectivenessChart';
import { ArrowLeft, AlertTriangle, User, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: patient, isLoading: loadingProfile } = useQuery({
    queryKey: ['patient-profile', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('ID do paciente não fornecido');
      return await supabaseService.getUserProfile(patientId);
    },
    enabled: !!patientId,
  });

  const { data: todayPhysical } = useQuery({
    queryKey: ['patient-physical-today', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      return await supabaseService.getTodayPhysicalMetrics(patientId);
    },
    enabled: !!patientId,
  });

  const { data: todayMental } = useQuery({
    queryKey: ['patient-mental-today', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      return await supabaseService.getTodayMentalMetrics(patientId);
    },
    enabled: !!patientId,
  });

  const { data: recentTraining } = useQuery({
    queryKey: ['patient-training-recent', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      return await supabaseService.getTrainingSessions(patientId, 5);
    },
    enabled: !!patientId,
  });

  const { data: recentSpravato } = useQuery({
    queryKey: ['patient-spravato-recent', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      return await supabaseService.getSpravatoSessions(patientId, 5);
    },
    enabled: !!patientId,
  });

  if (profile?.role !== 'doctor' && profile?.role !== 'coach') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Acesso negado. Somente médicos e coaches podem acessar esta página.</p>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Paciente não encontrado</p>
      </div>
    );
  }

  const suicideRisk = todayMental?.suicide_risk || 0;
  const maniaRisk = todayMental?.mania_risk_score || 0;
  const readiness = todayPhysical?.readiness_score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Voltar ao Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{patient.full_name}</h1>
                <p className="text-gray-600">{patient.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Cadastrado em {format(new Date(patient.created_at || ''), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {suicideRisk >= 5 && (
                <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Risco de Suicídio: {suicideRisk}/10</span>
                </div>
              )}
              {maniaRisk >= 7 && (
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Risco de Mania: {maniaRisk}/10</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-700 mb-1">Humor Hoje</p>
              <p className="text-3xl font-bold text-blue-900">{todayMental?.mood_score || 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Prontidão</p>
              <p className="text-3xl font-bold text-green-900">{readiness || 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <p className="text-sm text-purple-700 mb-1">Ansiedade</p>
              <p className="text-3xl font-bold text-purple-900">{todayMental?.anxiety_level || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Últimos Treinos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTraining && recentTraining.length > 0 ? (
                <div className="space-y-3">
                  {recentTraining.map((session, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">
                          {format(new Date(session.date), 'dd/MMM/yyyy', { locale: ptBR })}
                        </span>
                        <span className="text-sm text-gray-600">
                          {session.duration_minutes || 0}min | RPE: {session.rpe || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Carga Interna: {(session.duration_minutes || 0) * (session.rpe || 0)} AU
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum treino recente</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Sessões Spravato Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSpravato && recentSpravato.length > 0 ? (
                <div className="space-y-3">
                  {recentSpravato.map((session, idx) => (
                    <div key={idx} className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">
                          {format(new Date(session.date), 'dd/MMM/yyyy', { locale: ptBR })}
                        </span>
                        <span className="text-sm text-purple-700 font-semibold">
                          {session.dose_mg}mg
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Dissociação: {session.dissociation_level}/10 | Humor 24h: {session.mood_24h_after || 'N/A'}/10
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma sessão recente</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Prontidão</CardTitle>
            </CardHeader>
            <CardContent>
              <ReadinessTrendChart userId={patient.id} days={14} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saúde Mental (30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <MentalHealthScoreChart userId={patient.id} days={30} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carga de Treinamento</CardTitle>
            </CardHeader>
            <CardContent>
              <TrainingLoadChart userId={patient.id} days={14} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas Avançadas (ACWR & TSB)</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkloadMetricsChart userId={patient.id} days={28} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Efetividade Spravato</CardTitle>
            </CardHeader>
            <CardContent>
              <SpravatoEffectivenessChart userId={patient.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
