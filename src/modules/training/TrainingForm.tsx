import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Plus, Trash, Save, Dumbbell } from 'lucide-react';
import type { Exercise } from '../../types';

export function TrainingForm() {
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState('');
    const [rpe, setRpe] = useState(5);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    // Exercise Input State
    const [newExercise, setNewExercise] = useState<Exercise>({ name: '', sets: 3, reps: 10, load_kg: 0 });

    const addExercise = () => {
        if (!newExercise.name) return;
        setExercises([...exercises, newExercise]);
        setNewExercise({ name: '', sets: 3, reps: 10, load_kg: 0 });
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { error } = await supabase.from('training_sessions').insert({
                patient_id: user.id,
                date: new Date().toISOString(),
                duration_minutes: parseInt(duration),
                session_rpe: rpe,
                exercises_json: exercises
            });

            if (error) throw error;
            alert('Treino registrado com sucesso!');
            // Reset form or navigate away
            setExercises([]);
            setDuration('');
        } catch (error: any) {
            alert('Erro ao salvar treino: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Dumbbell className="text-primary" />
                        <h2 className="text-2xl font-bold">Registrar Treino</h2>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Duração (min)</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded bg-background"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                placeholder="Ex: 60"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">RPE (Esforço 0-10)</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                className="w-full p-2 border rounded bg-background"
                                value={rpe}
                                onChange={e => setRpe(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Exercícios</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4 items-end">
                            <div className="md:col-span-2">
                                <label className="text-xs">Nome</label>
                                <input
                                    className="w-full p-2 border rounded bg-background"
                                    value={newExercise.name}
                                    onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                                    placeholder="Ex: Agachamento"
                                />
                            </div>
                            <div>
                                <label className="text-xs">Sets x Reps</label>
                                <div className="flex gap-1">
                                    <input className="w-12 p-2 border rounded bg-background" type="number" value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) })} />
                                    <span className="self-center">x</span>
                                    <input className="w-12 p-2 border rounded bg-background" type="number" value={newExercise.reps} onChange={e => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div>
                                    <label className="text-xs">Carga (kg)</label>
                                    <input className="w-full p-2 border rounded bg-background" type="number" value={newExercise.load_kg} onChange={e => setNewExercise({ ...newExercise, load_kg: parseFloat(e.target.value) })} />
                                </div>
                                <Button size="sm" onClick={addExercise} className="mb-0.5"><Plus size={16} /></Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {exercises.map((ex, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-secondary/20 rounded">
                                    <span>{ex.name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-muted-foreground text-sm">{ex.sets} x {ex.reps} @ {ex.load_kg}kg</span>
                                        <button onClick={() => removeExercise(idx)} className="text-red-500"><Trash size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button className="w-full gap-2" onClick={handleSubmit} disabled={loading}>
                        <Save size={16} /> Salvar Treino
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
