// [AI Generated] Data: 19/01/2025
// Descrição: Cards de estatísticas rápidas
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React from 'react';
import { DailyData, TrainingSession, User } from '../../types';
import { calculateReadinessScore, calculateTotalWorkVolume } from '../../lib/calculations';
import { Card, CardContent } from '../ui/Card';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Award,
  Activity,
  Moon,
  Heart
} from 'lucide-react';

interface QuickStatsProps {
  dailyData: DailyData[];
  trainingSessions: TrainingSession[];
  user: User;
}

const QuickStats: React.FC<QuickStatsProps> = ({ 
  dailyData, 
  trainingSessions, 
  user 
}) => {
  
  // Calcular estatísticas
  const last7Days = dailyData.slice(0, 7);
  const averageReadiness = last7Days.length > 0 
    ? Math.round(last7Days.reduce((sum, d) => sum + calculateReadinessScore(d), 0) / last7Days.length)
    : 0;

  const totalSessions = trainingSessions.length;
  const totalTSS = calculateTotalWorkVolume(trainingSessions, 30);
  
  const averageSleep = last7Days.length > 0
    ? (last7Days.reduce((sum, d) => sum + d.sleep_quality, 0) / last7Days.length).toFixed(1)
    : 0;

  const streak = calculateConsistencyStreak(dailyData);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      
      <StatCard
        title="Readiness Médio"
        value={`${averageReadiness}%`}
        subtitle="Últimos 7 dias"
        icon={<Target className="h-5 w-5" />}
        color="text-blue-600"
        bgColor="bg-blue-50"
        trend={getTrendArrow(averageReadiness, 70)}
      />

      <StatCard
        title="Volume Total (TSS)"
        value={totalTSS.toString()}
        subtitle="Últimos 30 dias"
        icon={<Activity className="h-5 w-5" />}
        color="text-green-600"
        bgColor="bg-green-50"
      />

      <StatCard
        title="Qualidade do Sono"
        value={averageSleep.toString()}
        subtitle="Média semanal"
        icon={<Moon className="h-5 w-5" />}
        color="text-purple-600"
        bgColor="bg-purple-50"
        trend={getTrendArrow(parseFloat(averageSleep), 7)}
      />

      <StatCard
        title="Sequência"
        value={`${streak} dias`}
        subtitle="Avaliações consecutivas"
        icon={<Award className="h-5 w-5" />}
        color="text-orange-600"
        bgColor="bg-orange-50"
      />
      
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: React.ReactNode;
}> = ({ title, value, subtitle, icon, color, bgColor, trend }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`p-2 rounded-lg ${bgColor}`}>
                <span className={color}>{icon}</span>
              </div>
              {trend && (
                <div className="text-xs">
                  {trend}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-xs text-gray-300">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Função auxiliar para calcular sequência de dias
const calculateConsistencyStreak = (dailyData: DailyData[]): number => {
  if (dailyData.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < dailyData.length; i++) {
    const dataDate = new Date(dailyData[i].date);
    const daysDiff = Math.floor((today.getTime() - dataDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Função auxiliar para mostrar tendência
const getTrendArrow = (current: number, benchmark: number) => {
  if (current > benchmark) {
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  } else if (current < benchmark) {
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  }
  return null;
};

export default QuickStats;
// AI_GENERATED_CODE_END