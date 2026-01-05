import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { DailyMetricsMental, Profile } from '../../types';
import { checkManiaRisk, checkSuicideRisk } from '../../utils/calculations';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ReadinessTrendChart } from '../../components/charts/ReadinessTrendChart';
import { MentalHealthScoreChart } from '../../components/charts/MentalHealthScoreChart';
import { BarChart3 } from 'lucide-react';

// Componente simples de Card para garantir que não quebre se o ui/Card não existir
interface SimpleCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const SimpleCard = ({ title, children, className = '', onClick }: SimpleCardProps) => (
  <div onClick={onClick} className={`bg-card border border-border rounded-xl p-6 shadow-sm ${className}`}>
    <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
    {children}
  </div>
);

export function PatientDashboard({ userProfile }: { userProfile: Profile }) {
  const [mentalMetrics, setMentalMetrics] = useState<DailyMetricsMental | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodayMetrics = async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data: mentalData } = await supabase
        .from('daily_metrics_mental')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', today)
        .single();

      if (mentalData) setMentalMetrics(mentalData);
    };

    fetchTodayMetrics();
  }, [userProfile.id]);

  // Alertas
  const showManiaRisk = mentalMetrics && checkManiaRisk(mentalMetrics.mania_risk_score || 0, mentalMetrics.energy_level || 0);
  const showSuicideRisk = mentalMetrics && checkSuicideRisk(mentalMetrics.suicide_risk || 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Olá, {userProfile.full_name}</h1>
        <Button onClick={() => navigate('/assessment')}>Check-in Diário</Button>
      </div>

      {/* Alertas Críticos */}
      {showSuicideRisk && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg animate-pulse">
          <strong>⚠️ ALERTA DE SEGURANÇA:</strong> Por favor, entre em contato com seu médico ou suporte imediatamente.
        </div>
      )}

      {showManiaRisk && (
        <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 p-4 rounded-lg">
          <strong>⚠️ Alerta de Energia:</strong> Risco elevado de mania detectado. Evite estimulantes e priorize o sono.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Botão Registro Diário (Treino) */}
        <SimpleCard title="Registro Diário" className="hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => navigate('/training/new')}>
          <div className="flex flex-col items-center justify-center py-6 gap-3">
             <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-300"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 18.657a1 1 0 0 1 0 1.414l-4.242 4.243a1 1 0 0 1-1.415 0l-4.242-4.243a1 1 0 0 1 0-1.414l4.242-4.243a1 1 0 0 1 1.415 0l4.242 4.243Z"/><path d="m9.6 9.6-4.243 4.243a1 1 0 0 1-1.414 0L1.115 11.015a1 1 0 0 1 0-1.415l4.243-4.242a1 1 0 0 1 1.414 0L9.6 9.6Z"/><path d="m14.4 14.4 4.243-4.243a1 1 0 0 1 1.414 0l2.828 2.829a1 1 0 0 1 0 1.414l-4.243 4.243a1 1 0 0 1-1.414 0L14.4 14.4Z"/><path d="m9.6 9.6 4.8-4.8"/></svg>
             </div>
             <span className="font-semibold text-primary">Registrar Treino</span>
          </div>
        </SimpleCard>

        {/* Botão Spravato */}
        <SimpleCard title="Sessão Spravato" className="hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => navigate('/spravato/new')}>
          <div className="flex flex-col items-center justify-center py-6 gap-3">
             <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-300"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
             </div>
             <span className="font-semibold text-primary">Nova Sessão</span>
          </div>
        </SimpleCard>

        {/* Botão Testes */}
        <SimpleCard title="Testes / Avaliação" className="hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => navigate('/assessment')}>
          <div className="flex flex-col items-center justify-center py-6 gap-3">
             <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-300"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
             </div>
             <span className="font-semibold text-primary">Realizar Testes</span>
          </div>
        </SimpleCard>
      </div>

      <SimpleCard title="Histórico de Prontidão (Readiness)">
        <ReadinessTrendChart userId={userProfile.id} days={14} />
      </SimpleCard>

      <SimpleCard title="Saúde Mental - Últimos 30 dias">
        <MentalHealthScoreChart userId={userProfile.id} days={30} />
      </SimpleCard>

      <div className="mt-6">
        <Button 
          onClick={() => navigate('/history')}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          Ver Histórico Completo
        </Button>
      </div>
    </div>
  );
}
