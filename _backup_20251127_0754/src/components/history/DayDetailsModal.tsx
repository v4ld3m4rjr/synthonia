// [AI Generated] Data: 19/01/2025
// Descrição: Modal para exibir detalhes completos de um dia específico
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React from 'react';
import Modal from '../ui/Modal';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { 
  Moon, 
  Heart, 
  Brain, 
  Activity, 
  Zap, 
  Clock,
  Thermometer,
  Shield,
  Battery,
  Target,
  Calendar,
  Timer
} from 'lucide-react';
import { DailyData, TrainingSession } from '../../types';
import { calculateReadinessScore, calculateTrainingMetrics } from '../../lib/calculations';
import { calculateTQR } from '../../utils/metricsCalculations';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  dailyData?: DailyData;
  trainingSessions: TrainingSession[];
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  date,
  dailyData,
  trainingSessions
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const readinessScore = dailyData ? calculateReadinessScore(dailyData) : 0;
  
  // Calcular TQR (Total Quality Recovery)
  const tqr = dailyData ? calculateTQR(
    dailyData.sleep_quality || 0,
    dailyData.sleep_duration || 0,
    dailyData.sleep_regularity || 0,
    dailyData.stress_level || 0,
    dailyData.mood || 0,
    dailyData.fatigue_level || 0
  ) : 0;

  // Calcular TSB (Training Stress Balance)
  const trainingMetrics = calculateTrainingMetrics(trainingSessions);
  const tsb = trainingMetrics.ctl - trainingMetrics.atl;

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTQRColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-blue-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTSBColor = (score: number) => {
    if (score > 10) return 'text-green-400';
    if (score > -10) return 'text-blue-400';
    if (score > -25) return 'text-yellow-400';
    return 'text-red-400';
  };

  const MetricCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    unit?: string;
    color?: string;
    description?: string;
  }> = ({ icon, title, value, unit, color = 'text-white', description }) => (
    <Card className="bg-gray-700 border-gray-600">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gray-600 rounded-lg">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300">{title}</h4>
            <div className="flex items-baseline space-x-1">
              <span className={`text-xl font-bold ${color}`}>{value}</span>
              {unit && <span className="text-sm text-gray-400">{unit}</span>}
            </div>
          </div>
        </div>
        {description && (
          <p className="text-xs text-gray-400 mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formatDate(date)}
      size="xl"
    >
      <div className="p-6 space-y-6">
        {!dailyData ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum dado registrado para este dia</p>
          </div>
        ) : (
          <>
            {/* Métricas Principais */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Métricas Principais</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  icon={<Gauge className="h-5 w-5 text-blue-400" />}
                  title="Readiness Score"
                  value={readinessScore}
                  unit="/100"
                  color={getReadinessColor(readinessScore)}
                  description="Pontuação geral de prontidão para treinar"
                />
                <MetricCard
                  icon={<Shield className="h-5 w-5 text-green-400" />}
                  title="TQR (Recuperação)"
                  value={tqr}
                  unit="/10"
                  color={getTQRColor(tqr)}
                  description="Qualidade total de recuperação"
                />
                <MetricCard
                  icon={<Battery className="h-5 w-5 text-purple-400" />}
                  title="TSB (Balanço)"
                  value={tsb > 0 ? `+${tsb.toFixed(1)}` : tsb.toFixed(1)}
                  color={getTSBColor(tsb)}
                  description="Balanço entre carga e recuperação"
                />
              </div>
            </div>

            {/* Sono e Recuperação */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Moon className="h-5 w-5" />
                <span>Sono e Recuperação</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={<Moon className="h-5 w-5 text-blue-400" />}
                  title="Qualidade do Sono"
                  value={dailyData.sleep_quality || 0}
                  unit="/10"
                />
                <MetricCard
                  icon={<Clock className="h-5 w-5 text-indigo-400" />}
                  title="Duração do Sono"
                  value={dailyData.sleep_duration || 0}
                  unit="h"
                />
                <MetricCard
                  icon={<Timer className="h-5 w-5 text-purple-400" />}
                  title="Regularidade"
                  value={dailyData.sleep_regularity || 0}
                  unit="/10"
                />
                <MetricCard
                  icon={<Heart className="h-5 w-5 text-red-400" />}
                  title="FC Repouso"
                  value={dailyData.resting_hr || 'N/A'}
                  unit={dailyData.resting_hr ? 'bpm' : ''}
                />
              </div>
            </div>

            {/* Estado Físico e Mental */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Estado Físico e Mental</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={<Thermometer className="h-5 w-5 text-purple-400" />}
                  title="Nível de Fadiga"
                  value={dailyData.fatigue_level || 0}
                  unit="/10"
                />
                <MetricCard
                  icon={<Brain className="h-5 w-5 text-blue-400" />}
                  title="Humor"
                  value={dailyData.mood || 0}
                  unit="/10"
                />
                <MetricCard
                  icon={<Zap className="h-5 w-5 text-yellow-400" />}
                  title="Nível de Estresse"
                  value={dailyData.stress_level || 0}
                  unit="/10"
                />
                <MetricCard
                  icon={<Activity className="h-5 w-5 text-orange-400" />}
                  title="Dor Muscular"
                  value={dailyData.muscle_soreness || 0}
                  unit="/10"
                />
              </div>
            </div>

            {/* Treinos do Dia */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Treinos do Dia ({trainingSessions.length})</span>
              </h3>
              {trainingSessions.length === 0 ? (
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Activity className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Nenhum treino registrado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {trainingSessions.map((session, index) => (
                    <Card key={index} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-600 rounded-lg">
                              <Activity className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white capitalize">
                                {session.type || 'Treino'}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {session.duration} min • Intensidade {session.intensity}/10
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-orange-400">
                              {session.training_load} TSS
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default DayDetailsModal;
// AI_GENERATED_CODE_END