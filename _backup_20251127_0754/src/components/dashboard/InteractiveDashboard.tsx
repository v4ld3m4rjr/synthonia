import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DailyData, TrainingSession } from '../../types';
import { calculateReadinessScore, calculateTrainingMetrics } from '../../lib/calculations';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Heart, 
  Moon, 
  Brain, 
  Activity, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock,
  Gauge,
  BarChart3,
  Timer,
  Thermometer
} from 'lucide-react';

interface InteractiveDashboardProps {
  dailyData: DailyData[];
  trainingSessions: TrainingSession[];
  selectedPeriod: number;
}

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  category: string;
  unit?: string;
  dataSource: 'daily' | 'training' | 'calculated';
}

const METRIC_CONFIGS: MetricConfig[] = [
  // Sono e Recuperação
  { key: 'sleep_quality', label: 'Qualidade do Sono', color: '#3B82F6', icon: <Moon className="h-4 w-4" />, category: 'Sono', unit: '/10', dataSource: 'daily' },
  { key: 'sleep_duration', label: 'Duração do Sono', color: '#6366F1', icon: <Clock className="h-4 w-4" />, category: 'Sono', unit: 'h', dataSource: 'daily' },
  { key: 'sleep_regularity', label: 'Regularidade do Sono', color: '#8B5CF6', icon: <Timer className="h-4 w-4" />, category: 'Sono', unit: '/10', dataSource: 'daily' },
  { key: 'readiness_score', label: 'Readiness Score', color: '#10B981', icon: <Gauge className="h-4 w-4" />, category: 'Sono', unit: '/100', dataSource: 'calculated' },
  
  // Estado Físico/Mental
  { key: 'fatigue_level', label: 'Nível de Fadiga', color: '#EF4444', icon: <Thermometer className="h-4 w-4" />, category: 'Estado', unit: '/10', dataSource: 'daily' },
  { key: 'mood', label: 'Humor', color: '#F59E0B', icon: <Brain className="h-4 w-4" />, category: 'Estado', unit: '/10', dataSource: 'daily' },
  { key: 'muscle_soreness', label: 'Dor Muscular', color: '#F97316', icon: <Activity className="h-4 w-4" />, category: 'Estado', unit: '/10', dataSource: 'daily' },
  { key: 'stress_level', label: 'Nível de Estresse', color: '#EC4899', icon: <Zap className="h-4 w-4" />, category: 'Estado', unit: '/10', dataSource: 'daily' },
  { key: 'exhaustion', label: 'Exaustão', color: '#DC2626', icon: <Thermometer className="h-4 w-4" />, category: 'Estado', unit: '/10', dataSource: 'daily' },
  
  // Treinamento
  { key: 'tss', label: 'TSS', color: '#059669', icon: <BarChart3 className="h-4 w-4" />, category: 'Treinamento', dataSource: 'training' },
  { key: 'rpe', label: 'RPE', color: '#0891B2', icon: <Gauge className="h-4 w-4" />, category: 'Treinamento', unit: '/10', dataSource: 'training' },
  { key: 'duration', label: 'Duração', color: '#0D9488', icon: <Clock className="h-4 w-4" />, category: 'Treinamento', unit: 'min', dataSource: 'training' },
  { key: 'intensity', label: 'Intensidade', color: '#7C3AED', icon: <Zap className="h-4 w-4" />, category: 'Treinamento', unit: '/10', dataSource: 'training' },
  
  // Métricas Calculadas
  { key: 'atl', label: 'ATL (Carga Aguda)', color: '#DC2626', icon: <TrendingUp className="h-4 w-4" />, category: 'Calculadas', dataSource: 'calculated' },
  { key: 'ctl', label: 'CTL (Carga Crônica)', color: '#2563EB', icon: <BarChart3 className="h-4 w-4" />, category: 'Calculadas', dataSource: 'calculated' },
  { key: 'tsb', label: 'TSB (Balanço)', color: '#7C3AED', icon: <Gauge className="h-4 w-4" />, category: 'Calculadas', dataSource: 'calculated' },
  { key: 'monotony', label: 'Monotonia', color: '#6B7280', icon: <Timer className="h-4 w-4" />, category: 'Calculadas', dataSource: 'calculated' },
  
  // Fisiológicos
  { key: 'resting_hr', label: 'FC Repouso', color: '#DC2626', icon: <Heart className="h-4 w-4" />, category: 'Fisiológicos', unit: 'bpm', dataSource: 'daily' },
];

const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({ 
  dailyData, 
  trainingSessions, 
  selectedPeriod 
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['readiness_score', 'tss']);
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  // Observa largura do contêiner do gráfico para garantir renderização do ResponsiveContainer em mobile
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartContainerWidth, setChartContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;

    // Inicializa com a largura atual
    setChartContainerWidth(el.offsetWidth);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.floor(entry.contentRect.width);
        setChartContainerWidth((prev) => (prev !== newWidth ? newWidth : prev));
      }
    });
    ro.observe(el);

    const handleWindowResize = () => {
      if (chartContainerRef.current) {
        const newWidth = Math.floor(chartContainerRef.current.offsetWidth);
        setChartContainerWidth((prev) => (prev !== newWidth ? newWidth : prev));
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Filtrar dados pelo período
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - selectedPeriod);

  const filteredDailyData = dailyData.filter(d => {
    const dataDate = new Date(d.date);
    return dataDate >= startDate && dataDate <= endDate;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const filteredTrainingSessions = trainingSessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= startDate && sessionDate <= endDate;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    const dataMap = new Map<string, any>();

    // Adicionar dados diários
    filteredDailyData.forEach(d => {
      const date = d.date;
      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      const dayData = dataMap.get(date);
      
      // Dados diretos
      dayData.sleep_quality = d.sleep_quality;
      dayData.sleep_duration = d.sleep_duration;
      dayData.sleep_regularity = d.sleep_regularity;
      dayData.fatigue_level = d.fatigue_level;
      dayData.mood = d.mood;
      dayData.muscle_soreness = d.muscle_soreness;
      dayData.stress_level = d.stress_level;
      dayData.exhaustion = d.exhaustion;
      dayData.resting_hr = d.resting_hr;
      
      // Dados calculados
      dayData.readiness_score = calculateReadinessScore(d);
    });

    // Adicionar dados de treinamento
    filteredTrainingSessions.forEach(s => {
      const date = s.date;
      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      const dayData = dataMap.get(date);
      
      // Somar TSS e duração se houver múltiplas sessões no mesmo dia
      dayData.tss = (dayData.tss || 0) + s.tss;
      dayData.duration = (dayData.duration || 0) + s.duration;
      dayData.rpe = s.rpe; // Usar o último RPE do dia
      dayData.intensity = s.intensity;
    });

    // Adicionar métricas calculadas avançadas
    const dataArray = Array.from(dataMap.values());
    dataArray.forEach((dayData, index) => {
      if (filteredTrainingSessions.length > 0) {
        const metrics = calculateTrainingMetrics(trainingSessions, dayData.date);
        dayData.atl = metrics.atl;
        dayData.ctl = metrics.ctl;
        dayData.tsb = metrics.tsb;
        dayData.monotony = metrics.monotony;
      }
    });

    return dataArray;
  }, [filteredDailyData, filteredTrainingSessions, trainingSessions]);

  // Filtrar métricas por categoria
  const categories = ['Todas', ...Array.from(new Set(METRIC_CONFIGS.map(m => m.category)))];
  const filteredMetrics = activeCategory === 'Todas' 
    ? METRIC_CONFIGS 
    : METRIC_CONFIGS.filter(m => m.category === activeCategory);

  const toggleMetric = (metricKey: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricKey) 
        ? prev.filter(m => m !== metricKey)
        : [...prev, metricKey]
    );
  };

  const formatTooltipValue = (value: any, name: string) => {
    const metric = METRIC_CONFIGS.find(m => m.key === name);
    if (!value) return ['--', name];
    
    const formattedValue = typeof value === 'number' ? value.toFixed(1) : value;
    const unit = metric?.unit || '';
    return [`${formattedValue}${unit}`, metric?.label || name];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard Interativo</h2>
      
      {/* Seletor de Categorias */}
      <div className="flex flex-wrap gap-1 sm:gap-2 overflow-x-hidden">
        {categories.map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className={`text-[10px] sm:text-xs px-2 py-1 transition-all duration-200 ${
              activeCategory === category 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
            }`}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Botões de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 overflow-x-hidden">
        {filteredMetrics.map(metric => (
          <Button
            key={metric.key}
            variant={selectedMetrics.includes(metric.key) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleMetric(metric.key)}
            className={`flex items-center gap-2 text-[10px] sm:text-xs h-auto py-1 px-2 transition-all duration-200 hover:scale-[1.02] ${
              selectedMetrics.includes(metric.key)
                ? 'text-white shadow-md'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
            }`}
            style={{
              backgroundColor: selectedMetrics.includes(metric.key) ? metric.color : undefined,
              borderColor: selectedMetrics.includes(metric.key) ? metric.color : undefined,
              color: selectedMetrics.includes(metric.key) ? 'white' : metric.color
            }}
          >
            {metric.icon}
            <span className="truncate">{metric.label}</span>
          </Button>
        ))}
      </div>

      {/* Gráfico */}
      <Card className="bg-gray-700 border-gray-600 overflow-hidden">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Gráfico de Tendências</h3>
          <p className="text-sm text-gray-300">
            {selectedMetrics.length} métrica(s) selecionada(s) • Últimos {selectedPeriod} dias
          </p>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-[100vw]">
            <div ref={chartContainerRef} className="w-full h-64 sm:h-72 md:h-80 lg:h-96 overflow-y-auto overflow-x-hidden">
              <ResponsiveContainer key={`rc-${chartContainerWidth}`} width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => `Data: ${formatDate(label)}`}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#F9FAFB' }}
                    formatter={(value) => {
                      const metric = METRIC_CONFIGS.find(m => m.key === value);
                      return metric?.label || value;
                    }}
                  />
                  {selectedMetrics.map(metricKey => {
                    const metric = METRIC_CONFIGS.find(m => m.key === metricKey);
                    if (!metric) return null;
                    return (
                      <Line
                        key={metricKey}
                        type="monotone"
                        dataKey={metricKey}
                        stroke={metric.color}
                        strokeWidth={2}
                        dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: metric.color, strokeWidth: 2 }}
                        connectNulls={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legenda de Cores */}
      {selectedMetrics.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedMetrics.map(metricKey => {
                const metric = METRIC_CONFIGS.find(m => m.key === metricKey);
                if (!metric) return null;
                
                return (
                  <div key={metricKey} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />
                    <span className="text-sm text-gray-700">
                      {metric.label} {metric.unit && `(${metric.unit})`}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveDashboard;