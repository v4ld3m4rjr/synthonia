// [AI Generated] Data: 19/01/2025
// Descrição: Componente seletor de métricas para análise personalizada
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { 
  Moon, 
  Heart, 
  Brain, 
  Activity, 
  Zap, 
  Target,
  TrendingUp,
  Clock,
  BarChart3,
  Gauge
} from 'lucide-react';

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  visible: boolean;
  icon: React.ReactNode;
  category: 'sleep' | 'recovery' | 'training' | 'wellness';
}

interface MetricsSelectorProps {
  metrics: MetricConfig[];
  onMetricToggle: (metricKey: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  darkTheme?: boolean;
}

const MetricsSelector: React.FC<MetricsSelectorProps> = ({
  metrics,
  onMetricToggle,
  onSelectAll,
  onDeselectAll,
  darkTheme = true
}) => {
  const categories = {
    sleep: { label: 'Sono', color: 'bg-blue-500' },
    recovery: { label: 'Recuperação', color: 'bg-green-500' },
    training: { label: 'Treinamento', color: 'bg-orange-500' },
    wellness: { label: 'Bem-estar', color: 'bg-purple-500' }
  };

  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, MetricConfig[]>);

  const selectedCount = metrics.filter(m => m.visible).length;

  return (
    <Card className={`${darkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${darkTheme ? 'text-white' : 'text-gray-900'}`}>
            Seleção de Métricas
          </h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className={darkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
            >
              Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              className={darkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
            >
              Nenhuma
            </Button>
          </div>
        </div>
        <p className={`text-sm ${darkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          {selectedCount} de {metrics.length} métricas selecionadas
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
            <div key={category}>
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${categories[category as keyof typeof categories].color}`} />
                <h4 className={`font-medium ${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                  {categories[category as keyof typeof categories].label}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {categoryMetrics.map(metric => (
                  <button
                    key={metric.key}
                    onClick={() => onMetricToggle(metric.key)}
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200
                      ${metric.visible 
                        ? `border-2 ${darkTheme ? 'bg-gray-700 border-gray-500' : 'bg-blue-50 border-blue-300'}` 
                        : `border-gray-300 ${darkTheme ? 'bg-gray-800 hover:bg-gray-700 border-gray-600' : 'bg-white hover:bg-gray-50'}`
                      }
                    `}
                  >
                    <div 
                      className="flex-shrink-0 p-2 rounded-lg"
                      style={{ backgroundColor: metric.visible ? metric.color + '20' : undefined }}
                    >
                      <div style={{ color: metric.visible ? metric.color : (darkTheme ? '#9CA3AF' : '#6B7280') }}>
                        {metric.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${
                        metric.visible 
                          ? (darkTheme ? 'text-white' : 'text-gray-900')
                          : (darkTheme ? 'text-gray-400' : 'text-gray-600')
                      }`}>
                        {metric.label}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        metric.visible 
                          ? 'bg-blue-500 border-blue-500' 
                          : `border-gray-300 ${darkTheme ? 'border-gray-600' : ''}`
                      }`}>
                        {metric.visible && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Configuração padrão das métricas disponíveis
export const getDefaultMetrics = (): MetricConfig[] => [
  // Sono
  {
    key: 'sleep_quality',
    label: 'Qualidade do Sono',
    color: '#3B82F6',
    visible: true,
    icon: <Moon className="h-4 w-4" />,
    category: 'sleep'
  },
  {
    key: 'sleep_duration',
    label: 'Duração do Sono',
    color: '#1E40AF',
    visible: true,
    icon: <Clock className="h-4 w-4" />,
    category: 'sleep'
  },
  {
    key: 'sleep_regularity',
    label: 'Regularidade do Sono',
    color: '#60A5FA',
    visible: false,
    icon: <BarChart3 className="h-4 w-4" />,
    category: 'sleep'
  },
  
  // Recuperação
  {
    key: 'fatigue_level',
    label: 'Nível de Fadiga',
    color: '#EF4444',
    visible: true,
    icon: <Zap className="h-4 w-4" />,
    category: 'recovery'
  },
  {
    key: 'exhaustion',
    label: 'Exaustão',
    color: '#DC2626',
    visible: false,
    icon: <Target className="h-4 w-4" />,
    category: 'recovery'
  },
  {
    key: 'muscle_soreness',
    label: 'Dor Muscular',
    color: '#F59E0B',
    visible: true,
    icon: <Activity className="h-4 w-4" />,
    category: 'recovery'
  },
  {
    key: 'readiness_score',
    label: 'Score de Prontidão',
    color: '#10B981',
    visible: true,
    icon: <Gauge className="h-4 w-4" />,
    category: 'recovery'
  },
  
  // Treinamento
  {
    key: 'rpe',
    label: 'RPE (Esforço Percebido)',
    color: '#F59E0B',
    visible: false,
    icon: <TrendingUp className="h-4 w-4" />,
    category: 'training'
  },
  {
    key: 'training_intensity',
    label: 'Intensidade do Treino',
    color: '#D97706',
    visible: false,
    icon: <Activity className="h-4 w-4" />,
    category: 'training'
  },
  
  // Bem-estar
  {
    key: 'mood',
    label: 'Humor',
    color: '#8B5CF6',
    visible: true,
    icon: <Brain className="h-4 w-4" />,
    category: 'wellness'
  },
  {
    key: 'stress_level',
    label: 'Nível de Estresse',
    color: '#7C3AED',
    visible: false,
    icon: <Brain className="h-4 w-4" />,
    category: 'wellness'
  },
  {
    key: 'resting_hr',
    label: 'FC de Repouso',
    color: '#EC4899',
    visible: false,
    icon: <Heart className="h-4 w-4" />,
    category: 'wellness'
  }
];

export default MetricsSelector;
// AI_GENERATED_CODE_END