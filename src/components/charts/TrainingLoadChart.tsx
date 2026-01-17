
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';

export const TrainingLoadChart = ({ userId, days = 28 }: { userId: string, days?: number }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: metrics } = await supabase
        .from('daily_metrics_physical')
        .select('date, ctl, atl, tsb')
        .eq('patient_id', userId)
        .order('date', { ascending: true })
        .limit(days);

      if (metrics) {
        // Format date for display
        const formatted = metrics.map(m => ({
          ...m,
          displayDate: new Date(m.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
        }));
        setData(formatted);
      }
    };
    fetchData();
  }, [userId, days]);

  return (
    <div className="w-full h-[300px] mt-4">
      {data.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <Activity className="w-8 h-8 opacity-50 mb-2" />
          <p>Ainda sem dados de Carga de Treino suficientes</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCtl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAtl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <ReferenceLine y={0} stroke="#334155" />
            <Area
              type="monotone"
              dataKey="ctl"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCtl)"
              name="Fitness (CTL)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="atl"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorAtl)"
              name="Fatiga (ATL)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
