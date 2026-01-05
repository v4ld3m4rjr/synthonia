import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { supabaseService } from '../../services/supabase.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MentalHealthScoreChartProps {
  userId: string;
  days?: number;
}

export function MentalHealthScoreChart({ userId, days = 30 }: MentalHealthScoreChartProps) {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['mental-metrics', userId, days],
    queryFn: async () => {
      const data = await supabaseService.getMentalMetrics(userId, days);
      return data.reverse();
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-red-50 rounded-lg">
        <p className="text-red-600">Erro ao carregar dados de saúde mental</p>
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Sem dados disponíveis</p>
      </div>
    );
  }

  const chartData = metrics.map(m => ({
    date: format(new Date(m.date), 'dd/MMM', { locale: ptBR }),
    humor: m.mood_score,
    ansiedade: m.anxiety_level,
    energia: m.energy_level,
    riscoMania: m.mania_risk_score,
    riscoSuicidio: m.suicide_risk,
  }));

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Métricas de Saúde Mental ({days} dias)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280" 
            domain={[0, 10]}
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <ReferenceLine y={5} stroke="#94a3b8" strokeDasharray="3 3" label="Limiar" />
          <Line 
            type="monotone" 
            dataKey="humor" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Humor"
            dot={{ fill: '#3b82f6', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="ansiedade" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Ansiedade"
            dot={{ fill: '#f59e0b', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="energia" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Energia"
            dot={{ fill: '#10b981', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="riscoMania" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="Risco Mania"
            dot={{ fill: '#8b5cf6', r: 3 }}
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="riscoSuicidio" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Risco Suicídio"
            dot={{ fill: '#ef4444', r: 3 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Risco Suicídio ≥ 5: Atenção máxima</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span>Risco Mania ≥ 7: Monitorar virada</span>
        </div>
      </div>
    </div>
  );
}
