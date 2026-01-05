import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabaseService } from '../../services/supabase.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReadinessTrendChartProps {
  userId: string;
  days?: number;
}

export function ReadinessTrendChart({ userId, days = 14 }: ReadinessTrendChartProps) {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['physical-metrics', userId, days],
    queryFn: async () => {
      const data = await supabaseService.getPhysicalMetrics(userId, days);
      return data.reverse();
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-red-50 rounded-lg">
        <p className="text-red-600">Erro ao carregar dados</p>
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Sem dados disponíveis</p>
      </div>
    );
  }

  const chartData = metrics.map(m => ({
    date: format(new Date(m.date), 'dd/MMM', { locale: ptBR }),
    prontidao: m.readiness_score,
    sono: m.sleep_quality,
    fadiga: 10 - (m.fatigue_level || 0),
  }));

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Tendência de Prontidão ({days} dias)</h3>
      <ResponsiveContainer width="100%" height={300}>
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
          <Line 
            type="monotone" 
            dataKey="prontidao" 
            stroke="#4f46e5" 
            strokeWidth={3}
            name="Prontidão"
            dot={{ fill: '#4f46e5', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="sono" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Qualidade do Sono"
            dot={{ fill: '#10b981', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="fadiga" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Energia (inverso fadiga)"
            dot={{ fill: '#f59e0b', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
