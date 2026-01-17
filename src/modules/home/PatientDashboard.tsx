
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ReadinessTrendChart } from '../../components/charts/ReadinessTrendChart';
import { MentalHealthScoreChart } from '../../components/charts/MentalHealthScoreChart';
import { TrainingLoadChart } from '../../components/charts/TrainingLoadChart';
import { BarChart3, CheckCircle, Brain, Activity, Calendar, ClipboardList, Play } from 'lucide-react';
import { SchedulerSystem, type ScheduledTask } from '../../systems/SchedulerSystem';
import { QuestionnaireRunner } from '../../components/QuestionnaireRunner';
import { questionnaires } from '../../data/questionnaires';

export function PatientDashboard({ userProfile }: { userProfile: Profile }) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, [userProfile.id]);

  const loadTasks = async () => {
    setLoading(true);
    // 1. Fetch last completions from DB
    // This is a simplified fetch - ideally we'd query a 'completions' view or specific tables
    // For now we will mock/infer or fetch latest from each table

    // Fetch latest clinical assessments
    const { data: assessments } = await supabase
      .from('clinical_assessments')
      .select('type, date')
      .eq('patient_id', userProfile.id)
      .order('date', { ascending: false });

    // Fetch latest daily metrics
    const { data: physical } = await supabase.from('daily_metrics_physical').select('date').eq('patient_id', userProfile.id).order('date', { ascending: false }).limit(1).single();
    const { data: mental } = await supabase.from('daily_metrics_mental').select('date').eq('patient_id', userProfile.id).order('date', { ascending: false }).limit(1).single();

    const lastCompletions: Record<string, Date> = {};

    if (physical) lastCompletions['DAILY_PHYSICAL'] = new Date(physical.date);
    if (mental) lastCompletions['DAILY_MENTAL'] = new Date(mental.date);

    // Map assessments to dates
    assessments?.forEach((a: any) => {
      if (!lastCompletions[a.type]) {
        lastCompletions[a.type] = new Date(a.date);
      }
    });

    const pending = SchedulerSystem.getPendingTasks(lastCompletions);
    setTasks(pending);
    setLoading(false);
  };

  const handleTaskClick = (task: ScheduledTask) => {
    if (task.type === 'questionnaire' && task.questionnaireId) {
      setActiveQuestionnaire(task.questionnaireId);
    } else if (task.id === 'daily-physical') {
      navigate('/training/new');
    } else if (task.id === 'daily-mental') {
      // In the future this should be a wizard too, for now keeping legacy route or new
      setActiveQuestionnaire('daily-mental-wizard'); // TODO: Implement dedicated wizard
      navigate('/assessment'); // Fallback
    }
  };

  const handleQuestionnaireComplete = async (answers: Record<string, any>) => {
    if (!activeQuestionnaire) return;

    const qData = questionnaires.find(q => q.id === activeQuestionnaire);
    if (!qData) return;

    let score = 0;
    if (qData.calculateScore) {
      score = qData.calculateScore(answers);
    }

    // Save to DB
    const { error } = await supabase.from('clinical_assessments').insert({
      patient_id: userProfile.id,
      date: new Date().toISOString().split('T')[0],
      type: activeQuestionnaire,
      raw_scores: answers,
      total_score: score
    });

    if (error) {
      console.error('Error saving assessment:', error);
      alert('Erro ao salvar. Tente novamente.');
    } else {
      // Refresh tasks
      setActiveQuestionnaire(null);
      loadTasks();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Bom dia, {userProfile.full_name?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Seu monitoramento neuropsicofisiológico está <span className="text-green-600 font-medium">Ativo</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/history')}>
            <Calendar className="w-4 h-4 mr-2" /> Histórico
          </Button>
        </div>
      </div>

      {/* Smart Briefing Card */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Briefing Diário
        </h2>

        {loading ? (
          <p>Carregando cronograma...</p>
        ) : tasks.length === 0 ? (
          <div className="flex items-center gap-3 text-green-600 bg-green-50/50 p-4 rounded-lg">
            <CheckCircle className="w-6 h-6" />
            <p className="font-medium">Tudo em dia! Você completou todas as avaliações programadas.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map(task => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={`
                            group flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all
                            ${task.priority === 'high'
                    ? 'bg-indigo-50/50 border-indigo-200 hover:bg-indigo-100 hover:shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}
                        `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                                w-2 h-12 rounded-full 
                                ${task.priority === 'high' ? 'bg-indigo-500' : 'bg-slate-400'}
                            `} />
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</h3>
                    <p className="text-sm text-slate-500">
                      {task.priority === 'high' ? 'Recomendado para hoje' : 'Disponível nesta semana'}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant={task.priority === 'high' ? 'default' : 'outline'}>
                  Iniciar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts / Neurons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Prontidão Neurofisiológica</h3>
              <p className="text-xs text-slate-500">Monitoramento de recuperação do SNC</p>
            </div>
          </div>
          <ReadinessTrendChart userId={userProfile.id} days={14} />
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Oscilação de Humor & Sintomas</h3>
              <p className="text-xs text-slate-500">Correlação: Mania vs Depressão</p>
            </div>
          </div>
          <MentalHealthScoreChart userId={userProfile.id} days={30} />
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md col-span-1 lg:col-span-2 group">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Carga de Treino (Fitness vs Fadiga)</h3>
              <p className="text-xs text-slate-500">Modelo de Banister (ATL / CTL / TSB)</p>
            </div>
          </div>
          <TrainingLoadChart userId={userProfile.id} days={28} />
        </div>
      </div>

      {/* Assessment Library */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Biblioteca de Avaliações</h3>
            <p className="text-xs text-slate-500">Acesse qualquer questionário sob demanda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionnaires.map((q) => (
            <div
              key={q.id}
              onClick={() => setActiveQuestionnaire(q.id)}
              className="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-4 h-4 text-indigo-500" />
              </div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1 pr-6">{q.title}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
                  {q.category}
                </span>
                <span className="text-xs text-slate-400">{q.questions.length} questões</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Questionnaire Modal */}
      {activeQuestionnaire && (() => {
        const q = questionnaires.find(i => i.id === activeQuestionnaire);
        if (!q) return null;
        return (
          <QuestionnaireRunner
            questionnaire={q}
            onClose={() => setActiveQuestionnaire(null)}
            onComplete={handleQuestionnaireComplete}
          />
        );
      })()}

    </div>
  );
}

