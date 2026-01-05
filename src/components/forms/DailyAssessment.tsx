// [AI Generated] Data: 19/01/2025
// Descrição: Formulário de avaliação diária completo (Atualizado para SPRAVATTO)
// Gerado por: Trae AI
// Versão: React 18.3.1
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Moon, Zap, Brain, Activity, Save } from 'lucide-react';

interface DailyAssessmentProps {
  user: { id: string };
  onComplete: () => void;
}

const DailyAssessment: React.FC<DailyAssessmentProps> = ({ user, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Physical
    sleep_quality: 5,
    sleep_duration: '',
    sleep_regularity: 5,
    fatigue_physical: 5,
    stress_mental: 5,
    doms_pain: 5,
    mood_general: 5,
    readiness_to_train: 5,
    perception_recovery_prs: 5,
    resting_hr: '',
    
    // Mental
    sleep_score: '', 
    stress_score: '',
    energy_level: 5,
    mood_depressed: 0,
    mood_euphoria: 0,
    irritability: 0,
    anxiety: 0,
    obsessive_thoughts: 0,
    sensory_overload: 0,
    social_masking: 0,
    suicide_risk: 0,

    // Training (Legacy checkbox)
    trained: false,
  });

  const steps = [
    {
      title: 'Biológico & Sinais Vitais',
      icon: <Moon className="h-6 w-6 text-indigo-600" />,
      fields: ['sleep_duration', 'sleep_score', 'stress_score', 'resting_hr']
    },
    {
      title: 'Bipolaridade (Energia & Humor)',
      icon: <Brain className="h-6 w-6 text-purple-600" />,
      fields: ['energy_level', 'mood_depressed', 'mood_euphoria', 'irritability']
    },
    {
      title: 'Neurodivergência & Segurança',
      icon: <Activity className="h-6 w-6 text-yellow-600" />,
      fields: ['anxiety', 'obsessive_thoughts', 'suicide_risk']
    },
    {
      title: 'Físico & Recuperação',
      icon: <Zap className="h-6 w-6 text-green-600" />,
      fields: ['doms_pain', 'fatigue_physical', 'readiness_to_train']
    }
  ];

  const handleSliderChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Inserir Métricas Físicas
      const { error: physError } = await supabase
        .from('daily_metrics_physical')
        .insert({
            patient_id: user.id,
            date: today,
            sleep_quality: formData.sleep_quality,
            fatigue_physical: formData.fatigue_physical,
            stress_mental: formData.stress_mental,
            doms_pain: formData.doms_pain,
            mood_general: formData.mood_general,
            readiness_to_train: formData.readiness_to_train,
            perception_recovery_prs: formData.perception_recovery_prs,
            resting_hr: formData.resting_hr ? parseInt(formData.resting_hr) : null,
        });

      if (physError) throw new Error('Erro ao salvar dados físicos: ' + physError.message);

      // 2. Inserir Métricas Mentais
      const { error: mentalError } = await supabase
        .from('daily_metrics_mental')
        .insert({
            patient_id: user.id,
            date: today,
            sleep_hours_log: formData.sleep_duration ? parseFloat(formData.sleep_duration) : null,
            sleep_score_app: formData.sleep_score ? parseInt(formData.sleep_score) : null,
            stress_score_app: formData.stress_score ? parseInt(formData.stress_score) : null,
            energy_level: formData.energy_level,
            depression_mood: formData.mood_depressed,
            mania_euphoria: formData.mood_euphoria,
            irritability: formData.irritability,
            anxiety: formData.anxiety,
            obsessive_thoughts: formData.obsessive_thoughts,
            sensory_overload: formData.sensory_overload,
            social_masking: formData.social_masking,
            suicide_risk: formData.suicide_risk,
        });

      if (mentalError) throw new Error('Erro ao salvar dados mentais: ' + mentalError.message);

      alert('Avaliação salva com sucesso!');
      onComplete();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl border-0 bg-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Avaliação Diária</h2>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            {currentStepData.icon}
            <span className="font-medium">{currentStepData.title}</span>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
            {/* Renderização condicional dos campos baseada no step */}
            {currentStep === 0 && (
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">Sono (Horas)</label>
                        <input type="number" className="w-full p-2 rounded bg-input border border-border" value={formData.sleep_duration} onChange={e => handleInputChange('sleep_duration', e.target.value)} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Score Sono (App)</label>
                        <input type="number" className="w-full p-2 rounded bg-input border border-border" value={formData.sleep_score} onChange={e => handleInputChange('sleep_score', e.target.value)} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">FC Repouso</label>
                        <input type="number" className="w-full p-2 rounded bg-input border border-border" value={formData.resting_hr} onChange={e => handleInputChange('resting_hr', e.target.value)} />
                     </div>
                </div>
            )}
            
            {currentStep === 1 && (
                <div className="space-y-6">
                    <SliderField label="Energia" value={formData.energy_level} onChange={v => handleSliderChange('energy_level', v)} leftLabel="Exaustão" rightLabel="Mania" color="yellow" />
                    <SliderField label="Humor Depre" value={formData.mood_depressed} onChange={v => handleSliderChange('mood_depressed', v)} leftLabel="Bem" rightLabel="Mal" color="blue" />
                    <SliderField label="Euforia" value={formData.mood_euphoria} onChange={v => handleSliderChange('mood_euphoria', v)} leftLabel="Normal" rightLabel="Euforico" color="orange" />
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-6">
                    <SliderField label="Ansiedade" value={formData.anxiety} onChange={v => handleSliderChange('anxiety', v)} leftLabel="Calmo" rightLabel="Pânico" color="purple" />
                    <SliderField label="Risco Suicídio" value={formData.suicide_risk} onChange={v => handleSliderChange('suicide_risk', v)} leftLabel="Nenhum" rightLabel="Perigo" color="red" />
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6">
                     <SliderField label="Dor Muscular" value={formData.doms_pain} onChange={v => handleSliderChange('doms_pain', v)} leftLabel="Sem dor" rightLabel="Muita dor" color="red" />
                     <SliderField label="Prontidão (Readiness)" value={formData.readiness_to_train} onChange={v => handleSliderChange('readiness_to_train', v)} leftLabel="Baixa" rightLabel="Alta" color="green" />
                </div>
            )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>Anterior</Button>
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                <Save className="h-4 w-4" /> {loading ? 'Salvando...' : 'Finalizar'}
              </Button>
            ) : (
              <Button onClick={handleNext}>Próximo</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SliderField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
  color: string;
}> = ({ label, value, onChange, leftLabel, rightLabel }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="font-medium">{label}</label>
        <span className="font-bold text-primary">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
};

export default DailyAssessment;
