import React from 'react';
import { DailyData, TrainingSession, TrainingMetrics } from '../../types';
import { calculateReadinessScore, calculateTrainingMetrics } from '../../lib/calculations';
import CircularMetric from '../ui/CircularMetric';
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

interface MetricsGridProps {
  dailyData: DailyData[];
  trainingSessions: TrainingSession[];
  selectedPeriod: number;
}



const MetricsGrid: React.FC<MetricsGridProps> = ({ 
  dailyData, 
  trainingSessions, 
  selectedPeriod 
}) => {
  // Filtrar dados pelo período selecionado
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - selectedPeriod);

  const filteredDailyData = dailyData.filter(d => {
    const dataDate = new Date(d.date);
    return dataDate >= startDate && dataDate <= endDate;
  });

  const filteredTrainingSessions = trainingSessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= startDate && sessionDate <= endDate;
  });

  // Calcular médias e valores atuais
  const latestDailyData = filteredDailyData[0];
  const latestTrainingMetrics = filteredTrainingSessions.length > 0 
    ? calculateTrainingMetrics(trainingSessions, filteredTrainingSessions[0]?.date || new Date().toISOString().split('T')[0])
    : null;

  // Médias do período
  const avgSleepQuality = filteredDailyData.reduce((sum, d) => sum + d.sleep_quality, 0) / filteredDailyData.length || 0;
  const avgSleepDuration = filteredDailyData.reduce((sum, d) => sum + d.sleep_duration, 0) / filteredDailyData.length || 0;
  const avgFatigue = filteredDailyData.reduce((sum, d) => sum + d.fatigue_level, 0) / filteredDailyData.length || 0;
  const avgMood = filteredDailyData.reduce((sum, d) => sum + d.mood, 0) / filteredDailyData.length || 0;
  const avgSoreness = filteredDailyData.reduce((sum, d) => sum + d.muscle_soreness, 0) / filteredDailyData.length || 0;
  const avgStress = filteredDailyData.reduce((sum, d) => sum + d.stress_level, 0) / filteredDailyData.length || 0;
  const avgReadiness = filteredDailyData.reduce((sum, d) => sum + calculateReadinessScore(d), 0) / filteredDailyData.length || 0;

  // Métricas de treinamento
  const totalTSS = filteredTrainingSessions.reduce((sum, s) => sum + s.tss, 0);
  const avgTSS = totalTSS / filteredTrainingSessions.length || 0;
  const totalDuration = filteredTrainingSessions.reduce((sum, s) => sum + s.duration, 0);
  const avgRPE = filteredTrainingSessions.reduce((sum, s) => sum + s.rpe, 0) / filteredTrainingSessions.length || 0;
  const avgIntensity = filteredTrainingSessions.reduce((sum, s) => sum + (s.intensity || 0), 0) / filteredTrainingSessions.length || 0;

  return (
    <div className="space-y-8 bg-black p-6 rounded-lg">
      {/* Seção: Variáveis Medidas - Sono */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center text-white">
          <Moon className="h-5 w-5 mr-2 text-blue-400" />
          Sono e Recuperação
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
          <CircularMetric
            value={avgSleepQuality}
            metricKey="sleepQuality"
            label="Qualidade do Sono"
            unit="/10"
            icon={<Moon className="h-4 w-4" />}
            size="md"
          />
          <CircularMetric
            value={avgSleepDuration}
            metricKey="sleepDuration"
            label="Duração do Sono"
            unit="h"
            icon={<Clock className="h-4 w-4" />}
            size="md"
          />
          <CircularMetric
            value={latestDailyData?.sleep_regularity || 0}
            metricKey="sleepQuality"
            label="Regularidade"
            unit="/10"
            icon={<Timer className="h-4 w-4" />}
            size="md"
          />
          <CircularMetric
            value={avgReadiness}
            metricKey="readinessScore"
            label="Readiness Score"
            unit="/100"
            icon={<Gauge className="h-4 w-4" />}
            size="md"
          />
        </div>
      </div>

      {/* Seção: Variáveis Medidas - Estado Físico/Mental */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center text-white">
          <Brain className="h-5 w-5 mr-2 text-purple-400" />
          Estado Físico e Mental
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
          <CircularMetric
            value={avgFatigue}
            metricKey="fatigue"
            label="Nível de Fadiga"
            unit="/10"
            icon={<Thermometer className="h-4 w-4" />}
            size="md"
          />
          <CircularMetric
            value={avgMood}
            metricKey="mood"
            label="Humor"
            unit="/10"
            icon={<Brain className="h-4 w-4" />}
            size="md"
          />
          <CircularMetric
            value={avgSoreness}
            metricKey="stress"
            label="Dor Muscular"
            unit="/10"
            icon={<Activity className="h-4 w-4" />}
            size="md"
          />
          <CircularMetric
            value={avgStress}
            metricKey="stress"
            label="Nível de Estresse"
            unit="/10"
            icon={<Zap className="h-4 w-4" />}
            size="md"
          />
        </div>
      </div>

      {/* Seção: Variáveis de Treinamento */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center text-white">
          <Target className="h-5 w-5 mr-2 text-green-400" />
          Métricas de Treinamento
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
          <CircularMetric
            value={totalTSS}
            metricKey="tss"
            label="TSS Total"
            icon={<BarChart3 className="h-4 w-4" />}
            size="md"
          />
          <CircularMetric
            value={avgTSS}
            metricKey="tss"
            label="TSS Médio"
            icon={<TrendingUp className="h-4 w-4" />}
            size="md"
          />
          <CircularMetric
            value={Math.round(totalDuration / 60)}
            metricKey="trainingDuration"
            label="Duração Total"
            unit="h"
            icon={<Clock className="h-4 w-4" />}
            size="md"
          />
          <CircularMetric
            value={avgRPE}
            metricKey="rpe"
            label="RPE Médio"
            unit="/10"
            icon={<Gauge className="h-4 w-4" />}
            size="md"
          />
        </div>
      </div>

      {/* Seção: Métricas Calculadas Avançadas */}
      {latestTrainingMetrics && (
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center text-white">
            <Activity className="h-5 w-5 mr-2 text-red-400" />
            Métricas Calculadas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
            <CircularMetric
              value={latestTrainingMetrics.atl}
              metricKey="atl"
              label="ATL (Carga Aguda)"
              icon={<TrendingUp className="h-4 w-4" />}
              size="md"
            />
            <CircularMetric
              value={latestTrainingMetrics.ctl}
              metricKey="ctl"
              label="CTL (Carga Crônica)"
              icon={<BarChart3 className="h-4 w-4" />}
              size="md"
            />
            <CircularMetric
              value={latestTrainingMetrics.tsb}
              metricKey="tsb"
              label="TSB (Balanço)"
              icon={<Gauge className="h-4 w-4" />}
              size="md"
            />
            <CircularMetric
              value={latestTrainingMetrics.monotony}
              metricKey="monotony"
              label="Monotonia"
              icon={<Timer className="h-4 w-4" />}
              size="md"
            />
          </div>
        </div>
      )}

      {/* Seção: Dados Fisiológicos */}
      {latestDailyData && (
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center text-white">
            <Heart className="h-5 w-5 mr-2 text-red-400" />
            Dados Fisiológicos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
            {latestDailyData.resting_hr && (
              <CircularMetric
                value={latestDailyData.resting_hr}
                metricKey="heartRate"
                label="FC Repouso"
                unit="bpm"
                icon={<Heart className="h-4 w-4" />}
                size="md"
              />
            )}
            {latestDailyData.exhaustion && (
              <CircularMetric
                value={latestDailyData.exhaustion}
                metricKey="fatigue"
                label="Exaustão"
                unit="/10"
                icon={<Thermometer className="h-4 w-4" />}
                size="md"
              />
            )}
            {avgIntensity > 0 && (
              <CircularMetric
                value={avgIntensity}
                metricKey="intensity"
                label="Intensidade Média"
                unit="/10"
                icon={<Zap className="h-4 w-4" />}
                size="md"
              />
            )}
            <CircularMetric
              value={filteredTrainingSessions.length}
              metricKey="tss"
              label="Sessões de Treino"
              icon={<Target className="h-4 w-4" />}
              size="md"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsGrid;