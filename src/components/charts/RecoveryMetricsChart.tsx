import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RecoveryMetricsChartProps {
  data: Array<{ date: string; value: number }>;
  metric: string;
}

export function RecoveryMetricsChart({ data, metric }: RecoveryMetricsChartProps) {
  const getMetricColor = (metricId: string) => {
    const colors: Record<string, string> = {
      'readiness': '#8b5cf6',
      'recovery_index': '#22c55e',
      'sleep_quality': '#3b82f6',
      'muscle_soreness': '#ef4444',
      'fatigue_level': '#f97316',
      'stress_level': '#a855f7',
      'mood': '#06b6d4',
      'motivation': '#eab308',
      'trimp': '#ec4899',
      'tss': '#14b8a6',
      'pse': '#f59e0b',
      'psr': '#84cc16',
      'atl': '#6366f1',
      'ctl': '#8b5cf6',
      'tsb': '#0ea5e9',
      'daily_monotony': '#64748b',
      'pain_level': '#dc2626',
    };
    return colors[metricId] || '#8b5cf6';
  };

  const getMetricLabel = (metricId: string) => {
    const labels: Record<string, string> = {
      'readiness': 'Prontidão',
      'recovery_index': 'Recuperação',
      'sleep_quality': 'Qualidade do Sono',
      'muscle_soreness': 'Dor Muscular',
      'fatigue_level': 'Fadiga',
      'stress_level': 'Estresse',
      'mood': 'Humor',
      'motivation': 'Motivação',
      'trimp': 'TRIMP',
      'tss': 'TSS',
      'pse': 'PSE',
      'psr': 'PSR',
      'atl': 'ATL',
      'ctl': 'CTL',
      'tsb': 'TSB',
      'daily_monotony': 'Monotonia Diária',
      'pain_level': 'Dor',
    };
    return labels[metricId] || metricId;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-purple-200">
        <p className="text-lg font-medium">Nenhum dado disponível</p>
        <p className="text-sm">Complete sua avaliação diária para ver o gráfico</p>
      </div>
    );
  }

  const color = getMetricColor(metric);
  const label = getMetricLabel(metric);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
        <XAxis 
          dataKey="date" 
          stroke="#a78bfa"
          tick={{ fill: '#a78bfa', fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }}
        />
        <YAxis 
          stroke="#a78bfa"
          tick={{ fill: '#a78bfa', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e1b4b',
            border: '1px solid #4c1d95',
            borderRadius: '8px',
            color: '#f3e8ff'
          }}
          labelStyle={{ color: '#c4b5fd' }}
          labelFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('pt-BR');
          }}
          formatter={(value: number) => [`${value.toFixed(1)}`, label]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={3}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: color }}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
