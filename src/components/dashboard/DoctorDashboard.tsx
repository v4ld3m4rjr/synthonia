import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';
import { Button } from '../ui/Button';
import { Eye } from 'lucide-react';

// Interface para lista de pacientes com dados de risco agregados
interface PatientSummary extends Profile {
  latest_suicide_risk?: number;
  latest_mania_risk?: boolean;
  last_checkin?: string;
}

export function DoctorDashboard({ userProfile }: { userProfile: Profile }) {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      // 1. Buscar pacientes vinculados
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('doctor_id', userProfile.id);

      if (error || !profilesData) {
        setLoading(false);
        return;
      }

      // 2. Para cada paciente, buscar o último check-in mental para avaliar risco
      // Nota: Em produção, isso deveria ser uma View ou Function no Supabase para performance
      const patientsWithRisks = await Promise.all(profilesData.map(async (patient) => {
        const { data: mentalData } = await supabase
          .from('daily_metrics_mental')
          .select('suicide_risk, energy_level, stress_score_app, date')
          .eq('patient_id', patient.id)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        return {
          ...patient,
          latest_suicide_risk: mentalData?.suicide_risk || 0,
          latest_mania_risk: (mentalData?.stress_score_app || 0) > 80 && (mentalData?.energy_level || 0) > 8,
          last_checkin: mentalData?.date
        };
      }));

      // Ordenar por risco (maior risco primeiro)
      const sorted = patientsWithRisks.sort((a, b) => (b.latest_suicide_risk || 0) - (a.latest_suicide_risk || 0));
      setPatients(sorted);
      setLoading(false);
    };

    fetchPatients();
  }, [userProfile.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Painel do Especialista</h1>
        <div className="text-sm text-muted-foreground">
          Dr(a). {userProfile.full_name}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <h2 className="text-xl font-semibold">Meus Pacientes ({patients.length})</h2>
        
        {loading ? (
          <p>Carregando pacientes...</p>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Nenhum paciente vinculado ainda.</p>
          </div>
        ) : (
          patients.map((patient) => (
            <div 
              key={patient.id} 
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:bg-secondary/10 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {patient.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{patient.full_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Último check-in: {patient.last_checkin || 'Nunca'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {patient.latest_suicide_risk && patient.latest_suicide_risk >= 5 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded-full font-bold border border-red-500/50">
                    Risco Suicídio: {patient.latest_suicide_risk}
                  </span>
                )}
                
                {patient.latest_mania_risk && (
                   <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full font-bold border border-yellow-500/50">
                    Risco Mania
                  </span>
                )}

                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/patient/${patient.id}`)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver Prontuário
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
