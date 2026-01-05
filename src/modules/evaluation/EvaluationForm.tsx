import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Activity } from 'lucide-react';

// NOTE: This logic mimics the Python module 'python_modules/evaluation.py'
// In a full production app, this might call the Python backend via API.
export function EvaluationForm() {
    const [jumpHeight, setJumpHeight] = useState('');
    const [result, setResult] = useState<{ training_percent: number; status: string } | null>(null);

    const calculateTrainingLoad = () => {
        const jump = parseFloat(jumpHeight);
        if (isNaN(jump)) return;

        // Simple logic mirroring the Python requirement
        // "Calculo de controle de percentual de treino em função de salto"
        // Example logic: Base jump = 40cm. 
        // If jump < 35 (-10%), reduce load. 
        // If jump > 45 (+10%), increase load.
        
        let percent = 100;
        let status = 'Treino Normal';
        const BASE_CM = 40;

        const diff = (jump - BASE_CM) / BASE_CM; // e.g. -0.1 or +0.1

        if (diff < -0.1) {
            percent = 80;
            status = 'Fadiga Detectada - Reduzir Carga';
        } else if (diff > 0.1) {
            percent = 110;
            status = 'Alta Prontidão - Aumentar Carga';
        }

        setResult({ training_percent: percent, status });
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Activity className="text-blue-500" />
                        <h2 className="text-2xl font-bold">Avaliação de Salto</h2>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Altura do Salto (cm)</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border rounded bg-background"
                            value={jumpHeight}
                            onChange={e => setJumpHeight(e.target.value)}
                            placeholder="Ex: 42.5"
                        />
                    </div>

                    <Button className="w-full" onClick={calculateTrainingLoad}>
                        Calcular Percentual de Treino
                    </Button>

                    {result && (
                        <div className={`p-4 rounded-lg border ${result.training_percent < 100 ? 'bg-yellow-500/10 border-yellow-500' : 'bg-green-500/10 border-green-500'}`}>
                            <h3 className="font-bold text-lg mb-1">{result.status}</h3>
                            <p>Percentual Recomendado: <strong>{result.training_percent}%</strong></p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
