import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Save, Syringe } from 'lucide-react';

export function SpravatoForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        dose_mg: 56, // Dose padrão comum
        dissociation_level: 0,
        nausea_physical: 0,
        bp_pre: '',
        bp_post: '',
        trip_quality: '',
        insights: '',
        mood_24h_after: 0
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { error } = await supabase.from('spravato_sessions').insert({
                patient_id: user.id,
                date: new Date().toISOString(),
                ...formData
            });

            if (error) throw error;
            alert('Sessão registrada com sucesso!');
        } catch (error: any) {
            alert('Erro ao salvar sessão: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Syringe className="text-purple-500" />
                        <h2 className="text-2xl font-bold">Registro Spravato (Esketamina)</h2>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Dose (mg)</label>
                            <select 
                                className="w-full p-2 border rounded bg-background"
                                value={formData.dose_mg}
                                onChange={e => handleChange('dose_mg', parseFloat(e.target.value))}
                            >
                                <option value={28}>28 mg (1 frasco)</option>
                                <option value={56}>56 mg (2 frascos)</option>
                                <option value={84}>84 mg (3 frascos)</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">Qualidade da Viagem</label>
                             <input 
                                className="w-full p-2 border rounded bg-background"
                                value={formData.trip_quality}
                                onChange={e => handleChange('trip_quality', e.target.value)}
                                placeholder="Ex: Intensa, Calma..."
                             />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Dissociação (0-10)</label>
                            <input 
                                type="range" min="0" max="10" className="w-full"
                                value={formData.dissociation_level}
                                onChange={e => handleChange('dissociation_level', parseInt(e.target.value))}
                            />
                            <div className="text-center">{formData.dissociation_level}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Náusea (0-10)</label>
                            <input 
                                type="range" min="0" max="10" className="w-full"
                                value={formData.nausea_physical}
                                onChange={e => handleChange('nausea_physical', parseInt(e.target.value))}
                            />
                            <div className="text-center">{formData.nausea_physical}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">PA Pré (mmHg)</label>
                            <input 
                                className="w-full p-2 border rounded bg-background"
                                placeholder="120/80"
                                value={formData.bp_pre}
                                onChange={e => handleChange('bp_pre', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">PA Pós (mmHg)</label>
                            <input 
                                className="w-full p-2 border rounded bg-background"
                                placeholder="130/85"
                                value={formData.bp_post}
                                onChange={e => handleChange('bp_post', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Insights / Anotações</label>
                        <textarea 
                            className="w-full p-2 border rounded bg-background h-24"
                            value={formData.insights}
                            onChange={e => handleChange('insights', e.target.value)}
                            placeholder="O que você sentiu ou pensou durante a sessão?"
                        />
                    </div>

                    <Button className="w-full gap-2" onClick={handleSubmit} disabled={loading}>
                        <Save size={16} /> Salvar Sessão
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
