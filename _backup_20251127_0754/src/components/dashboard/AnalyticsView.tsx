import React, { useState, useMemo } from 'react';
import { DailyData, TrainingSession, User } from '../../types';
import { calculateMetricsTimeSeries, calculateTotalWorkVolume, calculateTrend } from '../../lib/calculations';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import TimeSelector, { TimePeriod } from '../ui/TimeSelector';
const LineChart = React.lazy(() => import('../charts/LineChart'));
const BarChart = React.lazy(() => import('../charts/BarChart'));
const MultiLineChart = React.lazy(() => import('../charts/MultiLineChart'));
import MetricsSelector, { getDefaultMetrics } from './MetricsSelector';
import NeurophysiologyExplainer from '../ai/NeurophysiologyExplainer';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Activity, 
  Target,
  Zap,
  BarChart3,
  LineChart as LineChartIcon,
  Settings,
  Eye,
  EyeOff,
  Filter,
  Download,
  Share
} from 'lucide-react';

interface AnalyticsViewProps {
  user: User;
  dailyData: DailyData[];
  trainingSessions: TrainingSession[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  user,
  dailyData,
  trainingSessions
}) => {
  if (import.meta.env.DEV) {
    console.debug('🔍 AnalyticsView - Iniciando componente', {
      userId: user?.id,
      dailyDataLength: dailyData?.length,
      trainingSessionsLength: trainingSessions?.length,
      timestamp: new Date().toISOString()
    });
  }

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(28);
  const [metrics, setMetrics] = useState(getDefaultMetrics());
  const [showMetricsSelector, setShowMetricsSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular dados das métricas
  const metricsData = useMemo(() => {
    try {
      if (import.meta.env.DEV) {
        console.debug('📊 AnalyticsView - Calculando métricas', {
          selectedPeriod,
          trainingSessionsCount: trainingSessions?.length,
          timestamp: new Date().toISOString()
        });
      }
      
      const result = calculateMetricsTimeSeries(trainingSessions, selectedPeriod);
      
      if (import.meta.env.DEV) {
        console.debug('✅ AnalyticsView - Métricas calculadas com sucesso', {
          resultLength: result?.length,
          firstItem: result?.[0],
          timestamp: new Date().toISOString()
        });
      }
      
      setError(null);
      return result;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.debug('AnalyticsView - Erro ao calcular métricas (dev):', err);
      }
      setError('Erro ao calcular métricas de treinamento');
      return [];
    }
  }, [trainingSessions, selectedPeriod]);

  // Calcular estatísticas resumidas
  const stats = useMemo(() => {
    try {
      const totalVolume = calculateTotalWorkVolume(trainingSessions, selectedPeriod);
      const recentTSS = metricsData.slice(-7).map(d => d.tss);
      const recentATL = metricsData.slice(-7).map(d => d.atl);
      const recentCTL = metricsData.slice(-7).map(d => d.ctl);
      const recentTSB = metricsData.slice(-7).map(d => d.tsb);

      return {
        totalVolume,
        avgTSS: recentTSS.length > 0 ? Math.round(recentTSS.reduce((a, b) => a + b, 0) / recentTSS.length) : 0,
        currentATL: recentATL[recentATL.length - 1] || 0,
        currentCTL: recentCTL[recentCTL.length - 1] || 0,
        currentTSB: recentTSB[recentTSB.length - 1] || 0,
        tssTrend: calculateTrend(recentTSS),
        atlTrend: calculateTrend(recentATL),
        ctlTrend: calculateTrend(recentCTL),
        tsbTrend: calculateTrend(recentTSB)
      };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.debug('AnalyticsView - Erro ao calcular estatísticas (dev):', err);
      }
      setError('Erro ao calcular estatísticas de desempenho');
      return {
        totalVolume: 0,
        avgTSS: 0,
        currentATL: 0,
        currentCTL: 0,
        currentTSB: 0,
        tssTrend: 'stable' as const,
        atlTrend: 'stable' as const,
        ctlTrend: 'stable' as const,
        tsbTrend: 'stable' as const
      };
    }
  }, [metricsData, trainingSessions, selectedPeriod]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTSBColor = (tsb: number) => {
    if (tsb > 10) return 'text-green-400';
    if (tsb < -10) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getTSBStatus = (tsb: number) => {
    if (tsb > 10) return 'Recuperado';
    if (tsb < -10) return 'Fatigado';
    return 'Equilibrado';
  };

  const getTSBRecommendation = (tsb: number) => {
    if (tsb > 10) return 'Treino intenso recomendado';
    if (tsb < -10) return 'Foco na recuperação';
    return 'Treino moderado';
  };

  // Funções para manipular métricas
  const handleMetricToggle = (metricKey: string) => {
    setMetrics(prev => prev.map(m => 
      m.key === metricKey ? { ...m, visible: !m.visible } : m
    ));
  };

  const handleSelectAllMetrics = () => {
    setMetrics(prev => prev.map(m => ({ ...m, visible: true })));
  };

  const handleDeselectAllMetrics = () => {
    setMetrics(prev => prev.map(m => ({ ...m, visible: false })));
  };

  // Preparar dados para o dashboard
  const dashboardData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - selectedPeriod);

    const filteredData = dailyData.filter(d => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });

    return filteredData.map(d => ({
      date: d.date,
      tss: d.tss || 0,
      hrv: d.hrv || 0,
      rhr: d.rhr || 0,
      sleep: d.sleep || 0,
      stress: d.stress || 0,
      fatigue: d.fatigue || 0,
      soreness: d.soreness || 0,
      mood: d.mood || 0
    }));
  }, [dailyData, selectedPeriod]);

  // Série de performance para o gráfico multi-linha (ATL, CTL, TSB)
  const performanceSeries = useMemo(() => ([
    {
      name: 'ATL',
      color: '#F59E0B',
      data: metricsData.map(d => ({ x: d.date, y: d.atl }))
    },
    {
      name: 'CTL',
      color: '#10B981',
      data: metricsData.map(d => ({ x: d.date, y: d.ctl }))
    },
    {
      name: 'TSB',
      color: '#8B5CF6',
      data: metricsData.map(d => ({ x: d.date, y: d.tsb }))
    }
  ]), [metricsData]);

  return (
    <div className="space-y-6 bg-gray-900 text-white min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Análise detalhada do seu desempenho</p>
        </div>
        
        <TimeSelector 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={setSelectedPeriod} 
        />
      </div>

      {/* Exibição de Erro */}
      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard
          title="TSS Médio"
          value={stats.avgTSS.toString()}
          subtitle={`Últimos ${selectedPeriod} dias`}
          icon={<Target className="h-6 w-6" />}
          color="bg-blue-900/50"
          trend={getTrendIcon(stats.tssTrend)}
        />
        
        <MetricCard
          title="ATL (Fadiga)"
          value={Math.round(stats.currentATL).toString()}
          subtitle={`Últimos ${selectedPeriod} dias`}
          icon={<Zap className="h-6 w-6" />}
          color="bg-orange-900/50"
          trend={getTrendIcon(stats.atlTrend)}
        />
        
        <MetricCard
          title="CTL (Fitness)"
          value={Math.round(stats.currentCTL).toString()}
          subtitle={`Últimos ${selectedPeriod} dias`}
          icon={<Activity className="h-6 w-6" />}
          color="bg-green-900/50"
          trend={getTrendIcon(stats.ctlTrend)}
        />
        
        <MetricCard
          title="TSB (Forma)"
          value={stats.currentTSB.toString()}
          subtitle={getTSBStatus(stats.currentTSB)}
          icon={<Calendar className="h-6 w-6" />}
          color="bg-purple-900/50"
          trend={getTrendIcon(stats.tsbTrend)}
          valueColor={getTSBColor(stats.currentTSB)}
        />
      </div>

      {/* Gráficos */}
      <div className="w-full max-w-[100vw] px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Gráfico de Métricas de Performance */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Métricas de Performance</h3>
                <p className="text-sm text-gray-400">ATL, CTL e TSB ao longo do tempo</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMetricsSelector(!showMetricsSelector)}
                className="bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {showMetricsSelector && (
                <div className="mb-4">
                  <MetricsSelector
                    metrics={metrics}
                    onMetricToggle={handleMetricToggle}
                    onSelectAll={handleSelectAllMetrics}
                    onDeselectAll={handleDeselectAllMetrics}
                  />
                </div>
              )}
              <React.Suspense fallback={<div className="h-72 flex items-center justify-center text-gray-400">Carregando gráfico…</div>}>
                <MultiLineChart
                  series={performanceSeries}
                  height={300}
                  darkTheme={true}
                  showGrid={true}
                  showDots={true}
                  showLegend={true}
                />
              </React.Suspense>
            </CardContent>
          </Card>

          {/* Gráfico de Volume de Treino */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h3 className="text-lg font-semibold text_white">Volume de Treino (TSS)</h3>
              <p className="text-sm text-gray-400">Distribuição diária do Training Stress Score</p>
            </CardHeader>
            <CardContent>
              <React.Suspense fallback={<div className="h-72 flex items-center justify-center text-gray-400">Carregando gráfico…</div>}>
                <BarChart
                  data={dashboardData.map(d => ({
                    label: d.date,
                    value: d.tss
                  }))}
                  height={300}
                  color="#3B82F6"
                />
              </React.Suspense>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Análise Detalhada removida conforme solicitação */}

      {/* IA Neurofisiológica */}
      <div className="grid grid-cols-1 gap-6">
        <NeurophysiologyExplainer 
          metrics={{
            atl: stats.currentATL,
            ctl: stats.currentCTL,
            tsb: stats.currentTSB,
            sleep_quality: dashboardData.length > 0 ? dashboardData[dashboardData.length - 1]?.sleep || 0 : 0,
            hrv: dashboardData.length > 0 ? dashboardData[dashboardData.length - 1]?.hrv || 0 : 0,
            stress_level: dashboardData.length > 0 ? dashboardData[dashboardData.length - 1]?.stress || 0 : 0,
            fatigue_level: dashboardData.length > 0 ? dashboardData[dashboardData.length - 1]?.fatigue || 0 : 0,
            mood: dashboardData.length > 0 ? dashboardData[dashboardData.length - 1]?.mood || 0 : 0
          }}
        />
      </div>

      {/* Resumo e Recomendações removido conforme solicitação */}
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: React.ReactNode;
  valueColor?: string;
}> = ({ title, value, subtitle, icon, color, trend, valueColor }) => {
  const colorClasses = {
    'bg-blue-900/50': 'border-blue-500/20',
    'bg-orange-900/50': 'border-orange-500/20',
    'bg-green-900/50': 'border-green-500/20',
    'bg-purple-900/50': 'border-purple-500/20'
  };

  return (
    <Card className={`${color} ${colorClasses[color as keyof typeof colorClasses] || 'border-gray-600'} bg-gray-800 border-gray-700`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-400">
            {icon}
          </div>
          {trend && <div>{trend}</div>}
        </div>
        <div className="mt-4">
          <div className={`text-2xl font-bold ${valueColor || 'text-white'}`}>
            {value}
          </div>
          <p className="text-sm text-gray-400 mt-1">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsView;