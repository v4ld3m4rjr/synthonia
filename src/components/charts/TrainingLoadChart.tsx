import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabaseService } from '../../services/supabase.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateInternalLoad } from '../../utils/calculations';

interface TrainingLoadChartProps {
  userId: string;
  days?: number;
}

export function TrainingLoadChart({ userId, days = 14 }: TrainingLoadChartProps) {
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['training-sessions', userId, days],
    queryFn: async () => {
      const data = await supabaseService.getTrainingSessions(userId, days);
      return data.reverse();
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-72 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-72 flex items-center justify-center bg-red-50 rounded-lg">
        <p className="text-red-600">Erro ao carregar dados de treino</p>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhum treino registrado ainda</p>
      </div>
    );
  }

  const chartData = sessions.map(session => {
    const internalLoad = calculateInternalLoad(session.duration_minutes || 0, session.rpe || 0);
    
    return {
      date: format(new Date(session.date), 'dd/MMM', { locale: ptBR }),
      cargaInterna: internalLoad,
      duracao: session.duration_minutes || 0,
      rpe: session.rpe || 0,
    };
  });

  const maxLoad = Math.max(...chartData.map(d => d.cargaInterna));
  const avgLoad = chartData.reduce((sum, d) => sum + d.cargaInterna, 0) / chartData.length;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Carga de Treino ({days} últimos treinos)</h3>
      <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-indigo-50 p-3 rounded-lg">
          <p className="text-gray-600 text-xs">Carga Máxima</p>
          <p className="text-xl font-bold text-indigo-600">{maxLoad.toFixed(0)}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-gray-600 text-xs">Carga Média</p>
          <p className="text-xl font-bold text-green-600">{avgLoad.toFixed(0)}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-gray-600 text-xs">Total de Treinos</p>
          <p className="text-xl font-bold text-purple-600">{sessions.length}</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
            label={{ value: 'Carga Interna (AU)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'cargaInterna') return [value.toFixed(0), 'Carga Interna'];
              if (name === 'duracao') return [value, 'Duração (min)'];
              if (name === 'rpe') return [value, 'RPE'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar 
            dataKey="cargaInterna" 
            fill="#4f46e5" 
            radius={[8, 8, 0, 0]}
            name="Carga Interna"
          />
        </BarChart>
      </ResponsiveContainer>
      
      <p className="text-xs text-gray-500 mt-2">
        Carga Interna = Duração × RPE | RPE: Percepção Subjetiva de Esforço (0-10)
      </p>
    </div>
  );
}
