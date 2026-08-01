import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { 
  Activity, 
  Dumbbell, 
  RotateCcw, 
  Sparkles, 
  Brain, 
  User, 
  LogOut, 
  TrendingUp,
  Calendar,
  BarChart3,
  Heart,
  Moon,
  Thermometer,
  Zap,
  Target,
  AlertCircle,
  X
} from 'lucide-react';
import { RecoveryMetricsChart } from '../charts/RecoveryMetricsChart';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  training_experience?: string;
}

interface DailyMetrics {
  sleep_quality?: number;
  sleep_recovery?: number;
  muscle_soreness?: number;
  fatigue_level?: number;
  stress_level?: number;
  mood?: number;
  motivation?: number;
  resting_heart_rate?: number;
  workout_duration?: number;
  workout_intensity?: number;
  trimp?: number;
  tss?: number;
  pse?: number;
  psr?: number;
  atl?: number;
  ctl?: number;
  tsb?: number;
  daily_monotony?: number;
  readiness?: number;
  recovery_index?: number;
  pain_level?: number;
}

export function RecoveryDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showCurriculo, setShowCurriculo] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('readiness');
  const [timeRange, setTimeRange] = useState<number>(14);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
    loadMetrics();
  }, []);

  useEffect(() => {
    if (selectedMetric) {
      loadChartData(selectedMetric, timeRange);
    }
  }, [selectedMetric, timeRange]);

  const loadUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      navigate('/auth');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setUser(profile);
    }
    setLoading(false);
  };

  const loadMetrics = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: physical } = await supabase
      .from('daily_metrics_physical')
      .select('*')
      .eq('patient_id', user?.id)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: mental } = await supabase
      .from('daily_metrics_mental')
      .select('*')
      .eq('patient_id', user?.id)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Combine metrics and calculate derived values
    if (physical || mental) {
      const combined = { ...physical, ...mental };
      
      // Calculate TSB (Training Stress Balance)
      const atl = combined.atl || 0;
      const ctl = combined.ctl || 0;
      const tsb = atl - ctl;

      // Calculate Recovery Index (simplified formula)
      const sleepQuality = combined.sleep_quality || 5;
      const soreness = combined.muscle_soreness || 5;
      const fatigue = combined.fatigue_level || 5;
      const recoveryIndex = ((sleepQuality + (10 - soreness) + (10 - fatigue)) / 30) * 100;

      // Calculate Readiness
      const mood = combined.mood || 5;
      const motivation = combined.motivation || 5;
      const stress = combined.stress_level || 5;
      const readiness = ((mood + motivation + (10 - stress)) / 30) * 100;

      setMetrics({
        ...combined,
        tsb,
        recovery_index: recoveryIndex,
        readiness: readiness
      });
    }
  };

  const loadChartData = async (metric: string, days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let tableName = 'daily_metrics_physical';
    let columnName = metric;

    // Map metrics to appropriate tables/columns
    const metricMapping: Record<string, { table: string; column: string }> = {
      'sleep_quality': { table: 'daily_metrics_mental', column: 'sleep_quality' },
      'sleep_recovery': { table: 'daily_metrics_mental', column: 'sleep_recovery' },
      'muscle_soreness': { table: 'daily_metrics_physical', column: 'muscle_soreness' },
      'fatigue_level': { table: 'daily_metrics_physical', column: 'fatigue_level' },
      'stress_level': { table: 'daily_metrics_mental', column: 'stress_level' },
      'mood': { table: 'daily_metrics_mental', column: 'mood' },
      'motivation': { table: 'daily_metrics_mental', column: 'motivation' },
      'trimp': { table: 'daily_metrics_physical', column: 'trimp' },
      'tss': { table: 'daily_metrics_physical', column: 'tss' },
      'pse': { table: 'daily_metrics_physical', column: 'pse' },
      'psr': { table: 'daily_metrics_physical', column: 'psr' },
      'atl': { table: 'daily_metrics_physical', column: 'atl' },
      'ctl': { table: 'daily_metrics_physical', column: 'ctl' },
      'tsb': { table: 'daily_metrics_physical', column: 'tsb' },
      'daily_monotony': { table: 'daily_metrics_physical', column: 'daily_monotony' },
      'readiness': { table: 'daily_metrics_physical', column: 'readiness' },
      'recovery_index': { table: 'daily_metrics_physical', column: 'recovery_index' },
      'pain_level': { table: 'daily_metrics_physical', column: 'pain_level' },
    };

    const mapping = metricMapping[metric] || { table: 'daily_metrics_physical', column: metric };
    tableName = mapping.table;
    columnName = mapping.column;

    const { data } = await supabase
      .from(tableName)
      .select(`${columnName}, date`)
      .eq('patient_id', user?.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (data) {
      setChartData(data.map((item: any) => ({
        date: item.date,
        value: item[columnName] || 0
      })));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const getReadinessColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getReadinessBg = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIntensityRecommendation = (readiness: number) => {
    if (readiness >= 80) return { text: 'Alta Intensidade', color: 'text-green-500', icon: Zap };
    if (readiness >= 60) return { text: 'Intensidade Moderada', color: 'text-yellow-500', icon: Activity };
    return { text: 'Baixa Intensidade / Descanso', color: 'text-red-500', icon: AlertCircle };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  const readiness = metrics?.readiness || 50;
  const recoveryIndex = metrics?.recovery_index || 50;
  const intensityRec = getIntensityRecommendation(readiness);
  const IntensityIcon = intensityRec.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain drop-shadow-lg"
            />
            
            {/* Profile with Curriculum Modal */}
            <div className="relative">
              <button
                onClick={() => setShowCurriculo(true)}
                className="relative w-16 h-16 rounded-full border-4 border-purple-400/50 overflow-hidden hover:border-purple-300 transition-all hover:scale-105 shadow-xl"
              >
                <img 
                  src="/foto-perfil.png" 
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1">
                <User className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Olá, {user?.full_name?.split(' ')[0] || 'Atleta'}
              </h1>
              <p className="text-purple-200 text-sm">
                Monitoramento de Recuperação & Prontidão
              </p>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Key Indices Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Recovery Index */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <RotateCcw className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Índice de Recuperação</h3>
                  <p className="text-purple-200 text-xs">Baseado em sono e fadiga</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${getReadinessColor(recoveryIndex)}`}>
                {recoveryIndex.toFixed(0)}%
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getReadinessBg(recoveryIndex)}`}
                style={{ width: `${recoveryIndex}%` }}
              />
            </div>
          </div>

          {/* Readiness Index */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Índice de Prontidão</h3>
                  <p className="text-purple-200 text-xs">Pronto para treinar</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${getReadinessColor(readiness)}`}>
                {readiness.toFixed(0)}%
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getReadinessBg(readiness)}`}
                style={{ width: `${readiness}%` }}
              />
            </div>
          </div>

          {/* Intensity Recommendation */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Target className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Intensidade Recomendada</h3>
                  <p className="text-purple-200 text-xs">Para o treino de hoje</p>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${intensityRec.color}`}>
              <IntensityIcon className="w-6 h-6" />
              <span className="font-bold text-lg">{intensityRec.text}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          <button
            onClick={() => setShowAssessment(true)}
            className="group flex flex-col items-center gap-2 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">Recuperação</span>
          </button>

          <button
            onClick={() => navigate('/training/new')}
            className="group flex flex-col items-center gap-2 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl group-hover:scale-110 transition-transform">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">Treino</span>
          </button>

          <button
            className="group flex flex-col items-center gap-2 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">REAB</span>
          </button>

          <button
            className="group flex flex-col items-center gap-2 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">Numerologia</span>
          </button>

          <button
            className="group flex flex-col items-center gap-2 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">Análise IA</span>
          </button>

          <button
            className="group flex flex-col items-center gap-2 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">Editar Dados</span>
          </button>

          <button
            onClick={handleLogout}
            className="group flex flex-col items-center gap-2 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-red-500/20 hover:border-red-400/50 transition-all hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl group-hover:scale-110 transition-transform">
              <LogOut className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">Deslogar</span>
          </button>
        </div>

        {/* Customizable Dashboard Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Dashboard de Métricas</h2>
                <p className="text-purple-200 text-sm">Selecione uma variável para visualizar</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-purple-200 text-sm">Período:</span>
              <div className="flex gap-1">
                {[7, 14, 21, 28].map(days => (
                  <button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      timeRange === days
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-purple-200 hover:bg-white/20'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metric Selector */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2 mb-6">
            {[
              { id: 'readiness', label: 'Prontidão', icon: Brain },
              { id: 'recovery_index', label: 'Recuperação', icon: RotateCcw },
              { id: 'sleep_quality', label: 'Sono', icon: Moon },
              { id: 'muscle_soreness', label: 'Dor Muscular', icon: Thermometer },
              { id: 'fatigue_level', label: 'Fadiga', icon: Activity },
              { id: 'trimp', label: 'TRIMP', icon: TrendingUp },
              { id: 'tss', label: 'TSS', icon: BarChart3 },
              { id: 'pse', label: 'PSE', icon: Zap },
              { id: 'psr', label: 'PSR', icon: Heart },
              { id: 'atl', label: 'ATL', icon: TrendingUp },
              { id: 'ctl', label: 'CTL', icon: BarChart3 },
              { id: 'tsb', label: 'TSB', icon: Activity },
              { id: 'daily_monotony', label: 'Monotonia', icon: Calendar },
              { id: 'pain_level', label: 'Dor', icon: AlertCircle },
            ].map(metric => {
              const Icon = metric.icon;
              return (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    selectedMetric === metric.id
                      ? 'bg-purple-500 border-purple-400 text-white'
                      : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{metric.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-white/5 rounded-xl p-4 min-h-[300px]">
            <RecoveryMetricsChart 
              data={chartData} 
              metric={selectedMetric}
            />
          </div>
        </div>
      </div>

      {/* Curriculum Modal */}
      {showCurriculo && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
          onClick={() => setShowCurriculo(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-slate-800">Currículo</h3>
              <button
                onClick={() => setShowCurriculo(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <iframe 
              src="/curriculo.pdf" 
              className="w-full h-[70vh]"
              title="Currículo"
            />
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {showAssessment && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
          onClick={() => setShowAssessment(false)}
        >
          <div 
            className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10 sticky top-0 bg-slate-900">
              <h3 className="text-xl font-bold text-white">Avaliação de Recuperação</h3>
              <button
                onClick={() => setShowAssessment(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <RecoveryAssessmentForm 
              userId={user?.id} 
              onComplete={() => {
                setShowAssessment(false);
                loadMetrics();
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Recovery Assessment Form Component
function RecoveryAssessmentForm({ userId, onComplete }: { userId?: string; onComplete: () => void }) {
  const [formData, setFormData] = useState({
    sleep_quality: 5,
    sleep_recovery: 5,
    muscle_soreness: 5,
    fatigue_level: 5,
    stress_level: 5,
    mood: 5,
    motivation: 5,
    resting_heart_rate: '',
    workout_duration: '',
    workout_intensity: 5,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate derived metrics
      const workoutIntensity = formData.workout_intensity || 5;
      const workoutDuration = parseFloat(formData.workout_duration) || 0;
      const trimp = workoutDuration * workoutIntensity * 0.5; // Simplified TRIMP
      const tss = trimp * 1.2; // Approximate TSS
      
      // Calculate ATL, CTL, TSB (simplified)
      const atl = trimp * 0.5; // Acute Training Load
      const ctl = trimp * 0.3; // Chronic Training Load
      const tsb = atl - ctl; // Training Stress Balance
      
      // Calculate daily monotony
      const dailyMonotony = workoutIntensity > 0 ? workoutIntensity : 1;
      
      // Calculate PSE and PSR
      const pse = formData.fatigue_level; // Perceived Exertion
      const psr = formData.sleep_recovery; // Perceived Recovery Status
      
      // Calculate readiness
      const readiness = ((formData.mood + formData.motivation + (10 - formData.stress_level)) / 30) * 100;
      
      // Calculate recovery index
      const recoveryIndex = ((formData.sleep_quality + (10 - formData.muscle_soreness) + (10 - formData.fatigue_level)) / 30) * 100;

      // Insert physical metrics
      await supabase.from('daily_metrics_physical').insert({
        patient_id: userId,
        date: today,
        muscle_soreness: formData.muscle_soreness,
        fatigue_level: formData.fatigue_level,
        resting_heart_rate: formData.resting_heart_rate ? parseFloat(formData.resting_heart_rate) : null,
        workout_duration: workoutDuration,
        workout_intensity: workoutIntensity,
        trimp: trimp,
        tss: tss,
        pse: pse,
        psr: psr,
        atl: atl,
        ctl: ctl,
        tsb: tsb,
        daily_monotony: dailyMonotony,
        readiness: readiness,
        recovery_index: recoveryIndex,
        pain_level: formData.muscle_soreness,
      });

      // Insert mental metrics
      await supabase.from('daily_metrics_mental').insert({
        patient_id: userId,
        date: today,
        sleep_quality: formData.sleep_quality,
        sleep_recovery: formData.sleep_recovery,
        stress_level: formData.stress_level,
        mood: formData.mood,
        motivation: formData.motivation,
      });

      alert('Avaliação salva com sucesso!');
      onComplete();
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Erro ao salvar avaliação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Sleep Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <Moon className="w-5 h-5 text-blue-400" />
          Qualidade do Sono
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-purple-200 text-sm block mb-2">
              Qualidade do Sono (1-10): {formData.sleep_quality}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.sleep_quality}
              onChange={(e) => setFormData({ ...formData, sleep_quality: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-purple-300 mt-1">
              <span>Péssimo</span>
              <span>Excelente</span>
            </div>
          </div>
          
          <div>
            <label className="text-purple-200 text-sm block mb-2">
              Recuperação do Sono (1-10): {formData.sleep_recovery}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.sleep_recovery}
              onChange={(e) => setFormData({ ...formData, sleep_recovery: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Physical Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-400" />
          Estado Físico
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-purple-200 text-sm block mb-2">
              Dor Muscular (1-10): {formData.muscle_soreness}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.muscle_soreness}
              onChange={(e) => setFormData({ ...formData, muscle_soreness: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-purple-300 mt-1">
              <span>Sem dor</span>
              <span>Muita dor</span>
            </div>
          </div>

          <div>
            <label className="text-purple-200 text-sm block mb-2">
              Nível de Fadiga (1-10): {formData.fatigue_level}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.fatigue_level}
              onChange={(e) => setFormData({ ...formData, fatigue_level: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="text-purple-200 text-sm block mb-2">
              Frequência Cardíaca em Repouso (bpm)
            </label>
            <input
              type="number"
              value={formData.resting_heart_rate}
              onChange={(e) => setFormData({ ...formData, resting_heart_rate: e.target.value })}
              placeholder="Ex: 60"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-purple-300"
            />
          </div>
        </div>
      </div>

      {/* Mental Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Estado Mental
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-purple-200 text-sm block mb-2">
              Nível de Estresse (1-10): {formData.stress_level}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.stress_level}
              onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-purple-300 mt-1">
              <span>Relaxado</span>
              <span>Estressado</span>
            </div>
          </div>

          <div>
            <label className="text-purple-200 text-sm block mb-2">
              Humor (1-10): {formData.mood}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="text-purple-200 text-sm block mb-2">
              Motivação (1-10): {formData.motivation}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Training Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-green-400" />
          Treino de Hoje
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-purple-200 text-sm block mb-2">
              Duração do Treino (minutos)
            </label>
            <input
              type="number"
              value={formData.workout_duration}
              onChange={(e) => setFormData({ ...formData, workout_duration: e.target.value })}
              placeholder="Ex: 60"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-purple-300"
            />
          </div>

          <div>
            <label className="text-purple-200 text-sm block mb-2">
              Intensidade Percebida (1-10): {formData.workout_intensity}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.workout_intensity}
              onChange={(e) => setFormData({ ...formData, workout_intensity: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3"
        isLoading={loading}
      >
        Salvar Avaliação
      </Button>
    </form>
  );
}
