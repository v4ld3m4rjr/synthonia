// [AI Generated] Data: 19/01/2025
// Descrição: Grid de métricas em formato circular
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React from 'react';
import { DailyData, TrainingSession } from '../../types';
import { calculateReadinessScore } from '../../lib/calculations';
import { calculateAllMetrics } from '../../utils/metricsCalculations';
import { 
  Activity, 
  Brain, 
  Heart, 
  Moon, 
  Zap, 
  Target,
  Timer,
  Clock,
  Battery,
  BarChart3
} from 'lucide-react';

interface CircularMetricsGridProps {
  dailyData: DailyData[];
  trainingSessions: TrainingSession[];
}

interface MetricData {
  id: string;
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  status: string;
}

const CircularMetricsGrid: React.FC<CircularMetricsGridProps> = ({ 
  dailyData, 
  trainingSessions 
}) => {
  // Calcular métricas baseadas nos dados mais recentes
  const latestData = dailyData[dailyData.length - 1];
  const readinessScore = latestData ? calculateReadinessScore(latestData) : 0;
  
  if (!latestData) {
    return <div>Carregando métricas...</div>;
  }

  // Calcular métricas usando as novas funções científicas
  const allMetrics = latestData ? calculateAllMetrics({
    currentData: latestData,
    historicalData: dailyData,
    trainingSessions: trainingSessions
  }) : null;
  
  // Calcular métricas específicas
  const physicalRecovery = latestData ? 
    Math.round(((latestData.sleep_quality + (10 - latestData.muscle_soreness) + (10 - latestData.fatigue_level)) / 3)) : 0;
  
  const mentalRecovery = latestData ? 
    Math.round(((latestData.mood + (10 - latestData.stress_level)) / 2)) : 0;
  
  const restingHR = latestData?.resting_hr || 0;
  
  const sleepDuration = latestData?.sleep_duration || 0;
  const sleepRegularity = latestData?.sleep_regularity || 0;
  const exhaustion = latestData?.exhaustion || 0;
  
  // Usar métricas calculadas cientificamente
  const tss = allMetrics?.training.tss || 0;
  const atl = allMetrics?.training.atl || 0;

  const metrics: MetricData[] = [
    {
      id: 'physical-recovery',
      label: 'RECUPERAÇÃO FÍSICA',
      value: physicalRecovery,
      maxValue: 100,
      unit: '',
      icon: <Activity className="h-6 w-6" />,
      color: '#00ff88', // verde neon vibrante
      status: physicalRecovery >= 70 ? 'BOA' : physicalRecovery >= 40 ? 'MÉDIA' : 'BAIXA'
    },
    {
      id: 'mental-recovery',
      label: 'RECUPERAÇÃO MENTAL',
      value: mentalRecovery,
      maxValue: 100,
      unit: '',
      icon: <Brain className="h-6 w-6" />,
      color: '#ff6b00', // laranja vibrante
      status: mentalRecovery >= 70 ? 'BOA' : mentalRecovery >= 40 ? 'FIQUE ATENTO' : 'BAIXA'
    },
    {
      id: 'resting-hr',
      label: 'FREQUÊNCIA CARDÍACA EM REPOUSO',
      value: restingHR,
      maxValue: 100,
      unit: 'bpm',
      icon: <Heart className="h-6 w-6" />,
      color: '#ff0066', // rosa/vermelho vibrante
      status: restingHR <= 70 ? 'BOA' : restingHR <= 85 ? 'MÉDIA' : 'ALTA'
    },
    {
      id: 'sleep-duration',
      label: 'DURAÇÃO DO SONO',
      value: sleepDuration,
      maxValue: 12,
      unit: 'h',
      icon: <Timer className="h-6 w-6" />,
      color: '#9966ff', // roxo vibrante
      status: sleepDuration >= 7 ? 'BOA' : sleepDuration >= 6 ? 'MÉDIA' : 'BAIXA'
    },
    {
      id: 'sleep-regularity',
      label: 'REGULARIDADE DO SONO',
      value: sleepRegularity,
      maxValue: 10,
      unit: '',
      icon: <Clock className="h-6 w-6" />,
      color: '#3366ff', // azul vibrante
      status: sleepRegularity >= 7 ? 'BOA' : sleepRegularity >= 5 ? 'MÉDIA' : 'BAIXA'
    },
    {
      id: 'exhaustion',
      label: 'EXAUSTÃO',
      value: exhaustion,
      maxValue: 10,
      unit: '',
      icon: <Battery className="h-6 w-6" />,
      color: '#ff3300', // vermelho vibrante
      status: exhaustion <= 3 ? 'BAIXA' : exhaustion <= 6 ? 'MÉDIA' : 'ALTA'
    },
    {
      id: 'tss',
      label: 'TSS (TRAINING STRESS SCORE)',
      value: tss,
      maxValue: 200,
      unit: '',
      icon: <Zap className="h-6 w-6" />,
      color: '#ffff00', // amarelo vibrante
      status: tss > 0 ? 'ATIVO' : 'REPOUSO'
    },
    {
      id: 'atl',
      label: 'ATL (CARGA AGUDA)',
      value: atl,
      maxValue: 100,
      unit: '',
      icon: <BarChart3 className="h-6 w-6" />,
      color: '#00ccff', // azul ciano vibrante
      status: atl > 0 ? 'ATIVO' : 'REPOUSO'
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <CircularMetric key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
};

interface CircularMetricProps {
  metric: MetricData;
}

const CircularMetric: React.FC<CircularMetricProps> = ({ metric }) => {
  const radius = 45;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  
  // Calcular progresso baseado no valor
  const progress = Math.min((metric.value || 0) / (metric.maxValue || 1), 1);
  const strokeDashoffset = circumference - (isNaN(progress) ? 0 : progress) * circumference;

  // Formatar valor para exibição
  const safeValue = metric.value || 0;
  const displayValue = metric.unit === 'h' 
    ? `${Math.floor(safeValue)}:${String(Math.round((safeValue % 1) * 60)).padStart(2, '0')}`
    : Math.round(safeValue).toString();

  return (
    <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg">
      {/* Círculo SVG */}
      <div className="relative mb-3 overflow-x-hidden">
        <svg
          className="transform -rotate-90 w-full h-auto block"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Círculo de fundo */}
          <circle
            stroke="#374151"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Círculo de progresso */}
          <circle
            stroke={metric.color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>
        {/* Ícone central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ color: metric.color }}>
            {metric.icon}
          </div>
        </div>
      </div>

      {/* Valor */}
      <div className="text-center">
        <div className="text-2xl font-bold text-white mb-1">
          {displayValue}
          {metric.unit && metric.unit !== 'h' && (
            <span className="text-sm ml-1">{metric.unit}</span>
          )}
        </div>
        
        {/* Label */}
        <div className="text-xs text-gray-400 mb-1 text-center leading-tight">
          {metric.label}
        </div>
        
        {/* Status */}
        {metric.status && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            metric.status === 'BOA' || metric.status === 'NORMAL' 
              ? 'text-green-400 bg-green-900/30' 
              : metric.status === 'MÉDIA' || metric.status === 'MÉDIO'
              ? 'text-orange-400 bg-orange-900/30'
              : metric.status === 'FIQUE ATENTO'
              ? 'text-orange-400 bg-orange-900/30'
              : 'text-red-400 bg-red-900/30'
          }`}>
            {metric.status}
          </div>
        )}
      </div>
    </div>
  );
};

export default CircularMetricsGrid;
// AI_GENERATED_CODE_END