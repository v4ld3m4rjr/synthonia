import { useQuery } from '@tanstack/react-query';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ComposedChart, Line } from 'recharts';
import { supabaseService } from '../../services/supabase.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateInternalLoad, calculateACWR } from '../../utils/calculations';

interface WorkloadMetricsChartProps {
  userId: string;
  days?: number;
}

export function WorkloadMetricsChart({ userId, days = 28 }: WorkloadMetricsChartProps) {
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['training-sessions-workload', userId, days],
    queryFn: async () => {
      const data = await supabaseService.getTrainingSessions(userId, days);
      return data.reverse();
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-red-50 rounded-lg">
        <p className="text-red-600">Erro ao carregar métricas de carga</p>
      </div>
    );
  }

  if (!sessions || sessions.length < 7) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-yellow-50 rounded-lg">
        <div className="text-center">
          <p className="text-yellow-700 font-medium">Dados Insuficientes</p>
          <p className="text-sm text-yellow-600 mt-1">Mínimo de 7 treinos necessário para cálculo de ACWR</p>
        </div>
      </div>
    );
  }

  const loads = sessions.map(s => calculateInternalLoad(s.duration_minutes || 0, s.rpe || 0));
  
  const chartData = sessions.slice(6).map((session, idx) => {
    const currentIndex = idx + 6;
    const last7Days = loads.slice(currentIndex - 6, currentIndex + 1);
    const last28Days = loads.slice(Math.max(0, currentIndex - 27), currentIndex + 1);
    
    const metrics = calculateACWR(last7Days, last28Days);
    
    return {
      date: format(new Date(session.date), 'dd/MMM', { locale: ptBR }),
      acwr: metrics.acwr,
      atl: metrics.atl,
      ctl: metrics.ctl,
      tsb: metrics.tsb,
    };
  });

  const currentACWR = chartData[chartData.length - 1]?.acwr || 0;
  const currentTSB = chartData[chartData.length - 1]?.tsb || 0;

  const getACWRStatus = (acwr: number) => {
    if (acwr < 0.8) return { label: 'Subcarga', color: 'text-blue-600' };
    if (acwr >= 0.8 && acwr <= 1.3) return { label: 'Zona Ideal', color: 'text-green-600' };
    if (acwr > 1.3 && acwr <= 1.5) return { label: 'Atenção', color: 'text-yellow-600' };
    return { label: 'Alto Risco de Lesão', color: 'text-red-600' };
  };

  const getTSBStatus = (tsb: number) => {
    if (tsb > 0) return { label: 'Recuperado', color: 'text-green-600' };
    if (tsb >= -30 && tsb <= 0) return { label: 'Normal', color: 'text-blue-600' };
    return { label: 'Fadiga Elevada', color: 'text-red-600' };
  };

  const acwrStatus = getACWRStatus(currentACWR);
  const tsbStatus = getTSBStatus(currentTSB);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Métricas Avançadas de Carga</h3>
      
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
          <p className="text-sm text-gray-600 mb-1">ACWR Atual</p>
          <p className="text-3xl font-bold text-indigo-600">{currentACWR.toFixed(2)}</p>
          <p className={`text-sm font-medium mt-1 ${acwrStatus.color}`}>{acwrStatus.label}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <p className="text-sm text-gray-600 mb-1">TSB (Balanço de Estresse)</p>
          <p className="text-3xl font-bold text-green-600">{currentTSB.toFixed(0)}</p>
          <p className={`text-sm font-medium mt-1 ${tsbStatus.color}`}>{tsbStatus.label}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            style={{ fontSize: '11px' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#6b7280" 
            style={{ fontSize: '11px' }}
            label={{ value: 'ACWR', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#6b7280" 
            style={{ fontSize: '11px' }}
            label={{ value: 'TSB', angle: 90, position: 'insideRight', style: { fontSize: '11px' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontSize: '12px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          
          <ReferenceLine yAxisId="left" y={0.8} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Min', fontSize: 10 }} />
          <ReferenceLine yAxisId="left" y={1.3} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Max', fontSize: 10 }} />
          <ReferenceLine yAxisId="right" y={-30} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Fadiga', fontSize: 10 }} />
          
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="acwr" 
            stroke="#4f46e5" 
            strokeWidth={3}
            name="ACWR (Agudo:Crônico)"
            dot={{ fill: '#4f46e5', r: 4 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="tsb" 
            stroke="#10b981" 
            strokeWidth={2}
            name="TSB (Training Stress Balance)"
            dot={{ fill: '#10b981', r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 bg-gray-50 p-3 rounded-lg text-xs space-y-2">
        <p><strong>ACWR (Acute:Chronic Workload Ratio):</strong> Relação carga aguda (7 dias) / crônica (28 dias)</p>
        <p><strong>Zona Ideal:</strong> 0.8 - 1.3 | <strong>Alto Risco:</strong> &gt; 1.5</p>
        <p><strong>TSB:</strong> ATL - CTL | Negativo = fadiga acumulada | Positivo = recuperado</p>
      </div>
    </div>
  );
}
