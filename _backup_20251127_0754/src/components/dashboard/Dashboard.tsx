import React, { useState, useEffect } from 'react';
import { User, DailyData, TrainingSession } from '../../types';
import { dbHelpers } from '../../lib/supabase';
import { calculateReadinessScore, calculateTrainingMetrics, getTrainingRecommendation } from '../../lib/calculations';
import Header from './Header';
import ReadinessGauge from './ReadinessGauge';
import QuickStats from './QuickStats';
import CircularMetrics from './CircularMetrics';
import CircularMetricsGrid from './CircularMetricsGrid';
import DailyAssessment from '../forms/DailyAssessment';
import TrainingChart from './TrainingChart';
import RecommendationCard from './RecommendationCard';
import MetricsGrid from './MetricsGrid';
import InteractiveDashboard from './InteractiveDashboard';
import AnalyticsView from './AnalyticsView';
import HistoryView from './HistoryView';
import SettingsView from './SettingsView';
import { SleepReadinessCard } from '../SleepReadinessCard';
import { ResultsAnalysisPage } from '../ResultsAnalysisPage';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import TimeSelector, { TimePeriod } from '../ui/TimeSelector';
import { Plus, Calendar, TrendingUp, Target, Brain, Activity, Moon } from 'lucide-react';
import ErrorBoundary from '../ErrorBoundary';
import FullAIAnalysis from '../ai/FullAIAnalysis';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<'overview' | 'assessment' | 'analytics' | 'history' | 'settings' | 'sleep' | 'results'>('overview');
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [todayData, setTodayData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<TimePeriod>(28);
  const [editableUser, setEditableUser] = useState<User>(user);

  useEffect(() => {
    loadData();
  }, [user.id]);

  useEffect(() => {
    setEditableUser(user);
  }, [user]);

  const handleProfileUpdates = (updates: Partial<User>) => {
    setEditableUser(prev => ({ ...prev, ...updates }));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dailyResult, trainingResult] = await Promise.all([
        dbHelpers.getDailyData(user.id, 90),
        dbHelpers.getTrainingSessions(user.id, 90)
      ]);

      if (dailyResult.data) {
        setDailyData(dailyResult.data);
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = dailyResult.data.find(d => d.date === today);
        setTodayData(todayEntry || null);
      }

      if (trainingResult.data) {
        setTrainingSessions(trainingResult.data);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug('Dashboard - Erro ao carregar dados (dev):', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = async () => {
    await loadData();
    setCurrentView('overview');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!editableUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-400 mb-6">Não foi possível carregar suas informações. Isso geralmente ocorre devido a uma atualização no banco de dados.</p>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  // Readiness Score Calculation
  let readinessScore = 50;
  let recommendation = getTrainingRecommendation(50, 0);

  if (todayData) {
    readinessScore = calculateReadinessScore(todayData);
    const today = new Date().toISOString().split('T')[0];
    const metrics = calculateTrainingMetrics(trainingSessions, today);
    recommendation = getTrainingRecommendation(readinessScore, metrics.tsb);
  }

  if (currentView === 'assessment') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header user={editableUser} onSignOut={onLogout} currentView={currentView} setCurrentView={setCurrentView} />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentView('overview')}
              className="mb-4"
              size="sm"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
          <DailyAssessment user={editableUser} onComplete={handleAssessmentComplete} />
        </main>
      </div>
    );
  }

  if (currentView === 'analytics') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header user={editableUser} onSignOut={onLogout} currentView={currentView} setCurrentView={setCurrentView} />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentView('overview')}
              className="mb-4"
              size="sm"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
          <div className="w-screen relative left-1/2 -translate-x-1/2 px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
            <ErrorBoundary fallback={
              <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg text-red-300">
                <div className="font-semibold mb-2">Erro ao abrir Análises</div>
                <div className="text-sm">Verifique sua configuração do Supabase e tente novamente. Em dev, veja o console.</div>
              </div>
            }>
              <AnalyticsView
                user={user}
                dailyData={dailyData}
                trainingSessions={trainingSessions}
              />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    );
  }

  if (currentView === 'history') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header user={editableUser} onSignOut={onLogout} currentView={currentView} setCurrentView={setCurrentView} />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentView('overview')}
              className="mb-4"
              size="sm"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
          <HistoryView
            user={user}
            dailyData={dailyData}
            trainingSessions={trainingSessions}
          />
        </main>
      </div>
    );
  }

  if (currentView === 'sleep') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header user={editableUser} onSignOut={onLogout} currentView={currentView} setCurrentView={setCurrentView} />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentView('overview')}
              className="mb-4"
              size="sm"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
          <SleepReadinessCard />
        </main>
      </div>
    );
  }

  if (currentView === 'settings') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header user={editableUser} onSignOut={onLogout} currentView={currentView} setCurrentView={setCurrentView} />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentView('overview')}
              className="mb-4"
              size="sm"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
          <SettingsView user={editableUser} onProfileSave={handleProfileUpdates} />
        </main>
      </div>
    );
  }

  if (currentView === 'results') {
    return (
      <div className="min-h-screen bg-black">
        <Header user={editableUser} onSignOut={onLogout} currentView={currentView} setCurrentView={setCurrentView} />
        <main>
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="outline"
              onClick={() => setCurrentView('overview')}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              size="sm"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
          <FullAIAnalysis user={editableUser} dailyData={dailyData} trainingSessions={trainingSessions} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header user={editableUser} onSignOut={onLogout} currentView={currentView} setCurrentView={setCurrentView} />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Quick Actions */}
        <div className="mb-8 flex w-full items-center gap-2 flex-wrap overflow-x-hidden">
          <Button
            variant="outline"
            onClick={() => setCurrentView('results')}
            className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shrink-0 whitespace-nowrap px-2 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] md:text-xs"
            size="sm"
          >
            <Brain className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            <span>Análise IA</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentView('assessment')}
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white border-green-600 shrink-0 whitespace-nowrap px-2 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] md:text-xs"
            size="sm"
          >
            <span>📝</span>
            <span>Nova Avaliação Diária</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentView('sleep')}
            className="inline-flex items-center space-x-2 shrink-0 whitespace-nowrap px-2 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] md:text-xs"
            size="sm"
          >
            <Moon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            <span>Modelo de Sono</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentView('analytics')}
            className="inline-flex items-center space-x-2 shrink-0 whitespace-nowrap px-2 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] md:text-xs"
            size="sm"
          >
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            <span>Ver Análises</span>
          </Button>
        </div>

        <div className="mb-8">
          <TimeSelector selectedPeriod={chartPeriod} onPeriodChange={setChartPeriod} />
        </div>

        {/* Metrics Grid */}
        <div className="mb-8">
          <MetricsGrid
            dailyData={dailyData}
            trainingSessions={trainingSessions}
            selectedPeriod={chartPeriod}
          />
        </div>

        {/* Interactive Dashboard */}
        <div className="mb-8 w-full max-w-[100vw] px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
          <InteractiveDashboard
            dailyData={dailyData}
            trainingSessions={trainingSessions}
            selectedPeriod={chartPeriod}
          />
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Removido conforme solicitação: Análise IA */}
          {/* Removido conforme solicitação: Testes Físicos */}
          {/* Removido conforme solicitação: Meditação & Breathwork */}
        </div>
      </main>
    </div>
  );
};

const ModuleCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
}> = ({ icon, title, description, comingSoon }) => {
  return (
    <Card className={`bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-900/50 transition-all duration-300 ${comingSoon ? 'opacity-60' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gray-700 rounded-xl">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-300 mb-4">{description}</p>
            {comingSoon && (
              <span className="inline-block px-3 py-1 bg-gray-600 text-gray-300 text-xs font-medium rounded-full">
                Em breve
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;