import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReadinessTrendChart } from '../components/charts/ReadinessTrendChart';
import { MentalHealthScoreChart } from '../components/charts/MentalHealthScoreChart';
import { TrainingLoadChart } from '../components/charts/TrainingLoadChart';
import { WorkloadMetricsChart } from '../components/charts/WorkloadMetricsChart';
import { SpravatoEffectivenessChart } from '../components/charts/SpravatoEffectivenessChart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </button>

          <div className="flex gap-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days as 7 | 14 | 30)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === days
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {days} dias
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Histórico Completo</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prontidão Física</CardTitle>
            </CardHeader>
            <CardContent>
              <ReadinessTrendChart userId={user.id} days={timeRange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saúde Mental</CardTitle>
            </CardHeader>
            <CardContent>
              <MentalHealthScoreChart userId={user.id} days={timeRange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carga de Treinamento</CardTitle>
            </CardHeader>
            <CardContent>
              <TrainingLoadChart userId={user.id} days={timeRange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas Avançadas (ACWR & TSB)</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkloadMetricsChart userId={user.id} days={28} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tratamento Spravato</CardTitle>
            </CardHeader>
            <CardContent>
              <SpravatoEffectivenessChart userId={user.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
