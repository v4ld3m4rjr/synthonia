// [AI Generated] Data: 19/01/2025
// Descrição: Componente de histórico com visualização de dados passados
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React, { useState, useMemo } from 'react';
import { DailyData, TrainingSession, User } from '../../types';
import { calculateReadinessScore, calculateTrainingMetrics } from '../../lib/calculations';
import { calculateTQR, calculateTSB, calculateATL, calculateCTL } from '../../utils/metricsCalculations';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import DayDetailsModal from '../history/DayDetailsModal';
import { 
  Calendar, 
  Activity, 
  Moon, 
  Brain, 
  Heart, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Filter,
  Shield,
  Battery
} from 'lucide-react';

interface HistoryViewProps {
  user: User;
  dailyData: DailyData[];
  trainingSessions: TrainingSession[];
}

const HistoryView: React.FC<HistoryViewProps> = ({
  user,
  dailyData,
  trainingSessions
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const [filterType, setFilterType] = useState<'all' | 'assessments' | 'trainings'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DailyData | undefined>(undefined);
  const [selectedDayTraining, setSelectedDayTraining] = useState<TrainingSession[]>([]);

  // Gerar dados do calendário
  const calendarData = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias vazios no início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      const dayData = dailyData.find(d => d.date === dateString);
      const dayTraining = trainingSessions.filter(t => t.date === dateString);
      
      // Calcular métricas de recuperação
      let recoveryScore = null;
      let tsb = null;
      
      if (dayData) {
        // TQR (Total Quality Recovery)
        recoveryScore = calculateTQR(
          dayData.sleep_quality || 0,
          dayData.sleep_duration || 0,
          dayData.sleep_regularity || 0,
          dayData.stress_level || 0,
          dayData.mood || 0,
          dayData.fatigue_level || 0
        );
        
        // TSB (Training Stress Balance) - precisa do histórico
        const trainingMetrics = calculateTrainingMetrics(trainingSessions, dateString);
        tsb = trainingMetrics.tsb;
      }
      
      days.push({
        day,
        date: dateString,
        dailyData: dayData,
        trainingSessions: dayTraining,
        readinessScore: dayData ? calculateReadinessScore(dayData) : null,
        recoveryScore,
        tsb
      });
    }
    
    return days;
  }, [selectedMonth, dailyData, trainingSessions]);

  // Dados filtrados para visualização em lista
  const listData = useMemo(() => {
    let filtered = [];
    
    if (filterType === 'all' || filterType === 'assessments') {
      filtered.push(...dailyData.map(d => ({
        type: 'assessment' as const,
        date: d.date,
        data: d,
        readinessScore: calculateReadinessScore(d)
      })));
    }
    
    if (filterType === 'all' || filterType === 'trainings') {
      filtered.push(...trainingSessions.map(t => ({
        type: 'training' as const,
        date: t.date,
        data: t
      })));
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dailyData, trainingSessions, filterType]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDayClick = (dayData: any) => {
    if (!dayData) return;
    
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), dayData.day);
    const dateString = date.toISOString().split('T')[0];
    
    const dayDailyData = dailyData.find(d => d.date === dateString);
    const dayTrainingSessions = trainingSessions.filter(t => t.date === dateString);
    
    setSelectedDate(date);
    setSelectedDayData(dayDailyData);
    setSelectedDayTraining(dayTrainingSessions);
    setIsModalOpen(true);
  };

  const getReadinessColor = (score: number | null) => {
    if (!score) return 'bg-gray-700';
    if (score >= 76) return 'bg-blue-900/30 border-blue-500';
    if (score >= 51) return 'bg-green-900/30 border-green-500';
    if (score >= 26) return 'bg-yellow-900/30 border-yellow-500';
    return 'bg-red-900/30 border-red-500';
  };

  const getTSBColor = (tsb: number | null) => {
    if (tsb === null) return 'text-gray-400';
    if (tsb > 10) return 'text-green-400'; // Bem recuperado
    if (tsb > 0) return 'text-blue-400'; // Recuperação moderada
    if (tsb > -10) return 'text-yellow-400'; // Fadiga leve
    return 'text-red-400'; // Fadiga alta
  };

  const getRecoveryColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-blue-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Histórico</h1>
          <p className="text-sm sm:text-base text-gray-300">Visualize seus dados passados e evolução</p>
        </div>
        
        <div className="flex space-x-1 sm:space-x-2">
          <Button
            variant={viewType === 'calendar' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewType('calendar')}
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Calendário</span>
          </Button>
          <Button
            variant={viewType === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewType('list')}
          >
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Lista</span>
          </Button>
        </div>
      </div>

      {viewType === 'calendar' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">
                {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
              </h2>
              <div className="flex space-x-1 sm:space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Week day headers */}
              {weekDays.map(day => (
                <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarData.map((dayData, index) => (
                <div key={index} className="aspect-square">
                  {dayData ? (
                    <div 
                      className={`h-full border-2 rounded-lg p-1 sm:p-2 ${getReadinessColor(dayData.readinessScore)} hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
                      onClick={() => handleDayClick(dayData)}
                    >
                      <div className="text-xs sm:text-sm font-medium text-white mb-1">
                        {dayData.day}
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        {dayData.readinessScore && (
                          <div className="text-xs font-bold text-white">
                            {dayData.readinessScore}%
                          </div>
                        )}
                        
                        {/* Mobile: Versão compacta com apenas ícones */}
                        <div className="block sm:hidden">
                          <div className="flex items-center justify-between">
                            {dayData.recoveryScore && (
                              <div className="flex items-center">
                                <Shield className="h-2 w-2 flex-shrink-0" />
                                <span className={`text-xs ml-0.5 ${getRecoveryColor(dayData.recoveryScore)}`}>
                                  {dayData.recoveryScore.toFixed(0)}
                                </span>
                              </div>
                            )}
                            
                            {dayData.tsb !== null && (
                              <div className="flex items-center">
                                <Battery className="h-2 w-2 flex-shrink-0" />
                                <span className={`text-xs ml-0.5 ${getTSBColor(dayData.tsb)}`}>
                                  {dayData.tsb > 0 ? '+' : ''}{Math.round(dayData.tsb)}
                                </span>
                              </div>
                            )}
                            
                            {dayData.trainingSessions.length > 0 && (
                              <div className="flex items-center">
                                <Activity className="h-2 w-2 text-blue-600 flex-shrink-0" />
                                <span className="text-xs text-blue-600 ml-0.5">
                                  {dayData.trainingSessions.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop: Versão completa */}
                        <div className="hidden sm:block space-y-1">
                          {/* Recuperação (TQR) */}
                          {dayData.recoveryScore && (
                            <div className="flex items-center space-x-1">
                              <Shield className="h-3 w-3 flex-shrink-0" />
                              <span className={`text-xs font-medium ${getRecoveryColor(dayData.recoveryScore)} truncate`}>
                                {dayData.recoveryScore.toFixed(1)}
                              </span>
                            </div>
                          )}
                          
                          {/* Prontidão (TSB) */}
                          {dayData.tsb !== null && (
                            <div className="flex items-center space-x-1">
                              <Battery className="h-3 w-3 flex-shrink-0" />
                              <span className={`text-xs font-medium ${getTSBColor(dayData.tsb)} truncate`}>
                                {dayData.tsb > 0 ? '+' : ''}{dayData.tsb}
                              </span>
                            </div>
                          )}
                          
                          {dayData.trainingSessions.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Activity className="h-3 w-3 text-blue-600 flex-shrink-0" />
                              <span className="text-xs text-blue-600 truncate">
                                {dayData.trainingSessions.length}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full"></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              {/* Readiness Score Legend */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-white mb-2">Prontidão (Readiness Score)</h4>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-900/30 border-2 border-blue-500 rounded flex-shrink-0"></div>
                    <span className="text-gray-300 text-xs sm:text-sm">Excelente (76-100)</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-900/30 border-2 border-green-500 rounded flex-shrink-0"></div>
                    <span className="text-gray-300 text-xs sm:text-sm">Bom (51-75)</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-900/30 border-2 border-yellow-500 rounded flex-shrink-0"></div>
                    <span className="text-gray-300 text-xs sm:text-sm">Regular (26-50)</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-900/30 border-2 border-red-500 rounded flex-shrink-0"></div>
                    <span className="text-gray-300 text-xs sm:text-sm">Baixo (0-25)</span>
                  </div>
                </div>
              </div>

              {/* Recovery and TSB Legend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-white mb-2 flex items-center">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Recuperação (TQR)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 text-xs">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded flex-shrink-0"></div>
                      <span className="text-gray-300">Excelente (8-10)</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-400 rounded flex-shrink-0"></div>
                      <span className="text-gray-300">Boa (6-8)</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-400 rounded flex-shrink-0"></div>
                      <span className="text-gray-300">Regular (4-6)</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-400 rounded flex-shrink-0"></div>
                      <span className="text-gray-300">Baixa (0-4)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-white mb-2 flex items-center">
                    <Battery className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Balanço de Treino (TSB)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 text-xs">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded flex-shrink-0"></div>
                      <span className="text-gray-300">Bem recuperado (+10)</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-400 rounded flex-shrink-0"></div>
                      <span className="text-gray-300">Recuperação (0 a +10)</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-400 rounded flex-shrink-0"></div>
                      <span className="text-gray-300">Fadiga leve (-10 a 0)</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-400 rounded flex-shrink-0"></div>
                      <span className="text-gray-300">Fadiga alta (-10)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {viewType === 'list' && (
        <div className="space-y-4">
          {/* Filter buttons */}
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'assessments', label: 'Avaliações' },
              { value: 'trainings', label: 'Treinos' }
            ].map(filter => (
              <Button
                key={filter.value}
                variant={filterType === filter.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterType(filter.value as 'all' | 'assessments' | 'trainings')}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-3">
            {listData.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {item.type === 'assessment' ? (
                    <AssessmentItem data={item.data} readinessScore={item.readinessScore} />
                  ) : (
                    <TrainingItem data={item.data} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal de detalhes do dia */}
      <DayDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate || new Date()}
        dailyData={selectedDayData}
        trainingSessions={selectedDayTraining}
      />
    </div>
  );
};

const AssessmentItem: React.FC<{ data: DailyData; readinessScore: number }> = ({ data, readinessScore }) => {
  const getScoreColor = (score: number) => {
    if (score >= 76) return 'text-blue-600';
    if (score >= 51) return 'text-green-600';
    if (score >= 26) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-medium text-white">Avaliação Diária</h3>
          <p className="text-sm text-gray-300">
            {new Date(data.date).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Moon className="h-4 w-4 text-indigo-500" />
            <span>{data.sleep_quality}/10</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>{11 - data.fatigue_level}/10</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4 text-red-500" />
            <span>{data.resting_hr || 'N/A'}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(readinessScore)}`}>
            {readinessScore}%
          </div>
          <div className="text-xs text-gray-400">Readiness</div>
        </div>
      </div>
    </div>
  );
};

const TrainingItem: React.FC<{ data: TrainingSession }> = ({ data }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Activity className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-medium text-white">{data.training_type}</h3>
          <p className="text-sm text-gray-300">
            {new Date(data.date).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4 text-sm">
          <div>
            <span className="text-gray-400">Duração:</span>
            <span className="ml-1 font-medium">{data.duration}min</span>
          </div>
          <div>
            <span className="text-gray-400">RPE:</span>
            <span className="ml-1 font-medium">{data.rpe}/10</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {data.tss}
          </div>
          <div className="text-xs text-gray-400">TSS</div>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
// AI_GENERATED_CODE_END