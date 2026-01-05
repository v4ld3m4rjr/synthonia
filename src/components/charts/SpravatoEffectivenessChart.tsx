import { useQuery } from '@tanstack/react-query';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart, Line } from 'recharts';
import { supabaseService } from '../../services/supabase.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SpravatoEffectivenessChartProps {
  userId: string;
}

export function SpravatoEffectivenessChart({ userId }: SpravatoEffectivenessChartProps) {
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['spravato-sessions', userId],
    queryFn: async () => {
      const data = await supabaseService.getSpravatoSessions(userId, 20);
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
        <p className="text-red-600">Erro ao carregar dados de Spravato</p>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhuma sessão de Spravato registrada</p>
      </div>
    );
  }

  const chartData = sessions.map((session, idx) => ({
    sessao: `#${idx + 1}`,
    date: format(new Date(session.date), 'dd/MMM', { locale: ptBR }),
    dose: session.dose_mg,
    dissociacao: session.dissociation_level || 0,
    nausea: session.nausea_level || 0,
    qualidadeTrip: session.trip_quality_rating || 0,
    humor24h: session.mood_24h_after || 0,
  }));

  const avgMood = chartData
    .filter(d => d.humor24h > 0)
    .reduce((sum, d) => sum + d.humor24h, 0) / chartData.filter(d => d.humor24h > 0).length || 0;

  const avgDissociation = chartData.reduce((sum, d) => sum + d.dissociacao, 0) / chartData.length;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Efetividade Spravato (Esketamina)</h3>
      
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Total de Sessões</p>
          <p className="text-2xl font-bold text-purple-600">{sessions.length}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Humor Médio 24h Pós</p>
          <p className="text-2xl font-bold text-blue-600">{avgMood.toFixed(1)}/10</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Dissociação Média</p>
          <p className="text-2xl font-bold text-amber-600">{avgDissociation.toFixed(1)}/10</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="sessao" 
            stroke="#6b7280" 
            style={{ fontSize: '11px' }}
          />
          <YAxis 
            stroke="#6b7280" 
            domain={[0, 10]}
            style={{ fontSize: '11px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontSize: '12px'
            }}
            formatter={(value: any, name: string) => {
              const labels: Record<string, string> = {
                dose: 'Dose (mg)',
                dissociacao: 'Dissociação',
                nausea: 'Náusea',
                qualidadeTrip: 'Qualidade Trip',
                humor24h: 'Humor 24h Pós'
              };
              return [value, labels[name] || name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          
          <Area 
            type="monotone" 
            dataKey="humor24h" 
            fill="#3b82f6" 
            fillOpacity={0.1}
            stroke="none"
          />
          <Line 
            type="monotone" 
            dataKey="humor24h" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Humor 24h Pós"
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line 
            type="monotone" 
            dataKey="qualidadeTrip" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Qualidade Trip"
            dot={{ fill: '#10b981', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="dissociacao" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Dissociação"
            dot={{ fill: '#f59e0b', r: 3 }}
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="nausea" 
            stroke="#ef4444" 
            strokeWidth={1.5}
            name="Náusea"
            dot={{ fill: '#ef4444', r: 2 }}
            strokeDasharray="3 3"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 bg-indigo-50 p-3 rounded-lg space-y-1 text-xs">
        <p className="font-semibold text-indigo-900">Interpretação Clínica:</p>
        <p><strong>Humor 24h Pós:</strong> Indicador primário de resposta antidepressiva rápida</p>
        <p><strong>Qualidade Trip:</strong> Correlacionado com neuroplasticidade e eficácia</p>
        <p><strong>Dissociação:</strong> Esperada (não relacionada diretamente com eficácia)</p>
        <p className="text-indigo-700 font-medium mt-2">Tendência ascendente de humor indica resposta positiva ao tratamento</p>
      </div>
    </div>
  );
}
