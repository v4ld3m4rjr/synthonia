// Componente de Avaliação Diária
// Coleta todas as variáveis necessárias para cálculo de prontidão e métricas
import React, { useState } from 'react';
import { User, DailyDataInput } from '../../types';
import { dbHelpers } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface DailyAssessmentProps {
    user: User;
    onComplete: () => void;
}

interface FormData {
    // Sono
    sleep_quality: number;
    sleep_duration: number;
    sleep_regularity: number;

    // Bem-estar
    fatigue_level: number;
    exhaustion: number;
    mood: number;
    muscle_soreness: number;
    stress_level: number;

    // Recuperação
    tqr: number;
    psr: number;
    resting_hr: number;
    hrv: number;

    notes: string;
}

const DailyAssessment: React.FC<DailyAssessmentProps> = ({ user, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FormData>({
        sleep_quality: 5,
        sleep_duration: 7,
        sleep_regularity: 5,
        fatigue_level: 5,
        exhaustion: 5,
        mood: 5,
        muscle_soreness: 5,
        stress_level: 5,
        tqr: 13,
        psr: 5,
        resting_hr: 60,
        hrv: 50,
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const steps = [
        {
            title: 'Qualidade do Sono',
            field: 'sleep_quality' as keyof FormData,
            description: 'Como você avalia a qualidade do seu sono na última noite?',
            min: 0,
            max: 10,
            type: 'scale',
            labels: { 0: 'Péssima', 5: 'Regular', 10: 'Excelente' }
        },
        {
            title: 'Duração do Sono',
            field: 'sleep_duration' as keyof FormData,
            description: 'Quantas horas você dormiu?',
            min: 0,
            max: 12,
            type: 'number',
            unit: 'horas'
        },
        {
            title: 'Regularidade do Sono',
            field: 'sleep_regularity' as keyof FormData,
            description: 'Quão regular foi seu horário de sono?',
            min: 0,
            max: 10,
            type: 'scale',
            labels: { 0: 'Muito irregular', 5: 'Moderado', 10: 'Muito regular' }
        },
        {
            title: 'Nível de Fadiga',
            field: 'fatigue_level' as keyof FormData,
            description: 'Como você se sente em relação à fadiga?',
            min: 0,
            max: 10,
            type: 'scale',
            labels: { 0: 'Sem fadiga', 5: 'Moderada', 10: 'Extremamente fatigado' }
        },
        {
            title: 'Exaustão',
            field: 'exhaustion' as keyof FormData,
            description: 'Qual seu nível de exaustão geral?',
            min: 0,
            max: 10,
            type: 'scale',
            labels: { 0: 'Nenhuma', 5: 'Moderada', 10: 'Extrema' }
        },
        {
            title: 'Humor',
            field: 'mood' as keyof FormData,
            description: 'Como está seu humor hoje?',
            min: 0,
            max: 10,
            type: 'scale',
            labels: { 0: 'Muito ruim', 5: 'Neutro', 10: 'Excelente' }
        },
        {
            title: 'Dor Muscular',
            field: 'muscle_soreness' as keyof FormData,
            description: 'Qual o nível de dor muscular?',
            min: 0,
            max: 10,
            type: 'scale',
            labels: { 0: 'Nenhuma', 5: 'Moderada', 10: 'Severa' }
        },
        {
            title: 'Nível de Estresse',
            field: 'stress_level' as keyof FormData,
            description: 'Como você avalia seu nível de estresse?',
            min: 0,
            max: 10,
            type: 'scale',
            labels: { 0: 'Sem estresse', 5: 'Moderado', 10: 'Muito estressado' }
        },
        {
            title: 'TQR - Total Quality Recovery',
            field: 'tqr' as keyof FormData,
            description: 'Escala de recuperação percebida (6-20)',
            min: 6,
            max: 20,
            type: 'scale',
            labels: { 6: 'Muito mal recuperado', 13: 'Moderadamente', 20: 'Muito bem recuperado' }
        },
        {
            title: 'PSR - Perceived Stress and Recovery',
            field: 'psr' as keyof FormData,
            description: 'Como você se sente em relação ao estresse e recuperação?',
            min: 0,
            max: 10,
            type: 'scale',
            labels: { 0: 'Muito estressado', 5: 'Equilibrado', 10: 'Muito recuperado' }
        },
        {
            title: 'Frequência Cardíaca em Repouso',
            field: 'resting_hr' as keyof FormData,
            description: 'Qual sua FC em repouso hoje? (bpm)',
            min: 30,
            max: 120,
            type: 'number',
            unit: 'bpm'
        },
        {
            title: 'HRV - Variabilidade da Frequência Cardíaca',
            field: 'hrv' as keyof FormData,
            description: 'Valor do HRV (se disponível)',
            min: 0,
            max: 200,
            type: 'number',
            unit: 'ms'
        },
        {
            title: 'Observações',
            field: 'notes' as keyof FormData,
            description: 'Alguma observação adicional sobre como você está se sentindo?',
            type: 'text'
        }
    ];

    const currentStepData = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            const dailyDataInput: DailyDataInput = {
                user_id: user.id,
                date: today,
                ...formData
            };

            const result = await dbHelpers.saveDailyData(dailyDataInput);

            if (result.error) {
                console.error('Erro ao salvar dados:', result.error);
                alert('Erro ao salvar dados. Tente novamente.');
            } else {
                onComplete();
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const updateValue = (value: number | string) => {
        setFormData({
            ...formData,
            [currentStepData.field]: value
        });
    };

    const renderInput = () => {
        const value = formData[currentStepData.field];

        if (currentStepData.type === 'text') {
            return (
                <textarea
                    value={value as string}
                    onChange={(e) => updateValue(e.target.value)}
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white min-h-32 focus:outline-none focus:border-blue-500"
                    placeholder="Digite suas observações aqui..."
                />
            );
        }

        if (currentStepData.type === 'number') {
            return (
                <div className="space-y-4">
                    <input
                        type="number"
                        value={value as number}
                        onChange={(e) => updateValue(Number(e.target.value))}
                        min={currentStepData.min}
                        max={currentStepData.max}
                        className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-2xl focus:outline-none focus:border-blue-500"
                    />
                    {currentStepData.unit && (
                        <p className="text-center text-gray-400">{currentStepData.unit}</p>
                    )}
                </div>
            );
        }

        // Scale type
        return (
            <div className="space-y-6">
                <div className="flex justify-center">
                    <div className="text-4xl font-bold text-blue-500">{value}</div>
                </div>

                <input
                    type="range"
                    value={value as number}
                    onChange={(e) => updateValue(Number(e.target.value))}
                    min={currentStepData.min}
                    max={currentStepData.max}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />

                {currentStepData.labels && (
                    <div className="flex justify-between text-xs text-gray-400">
                        {Object.entries(currentStepData.labels).map(([key, label]) => (
                            <span key={key} className="text-center max-w-[80px]">
                                {label}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex justify-between text-sm text-gray-500">
                    <span>{currentStepData.min}</span>
                    <span>{currentStepData.max}</span>
                </div>
            </div>
        );
    };

    return (
        <Card className="max-w-2xl mx-auto bg-gray-800 border-gray-700">
            <CardHeader>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Avaliação Diária</h2>
                        <span className="text-sm text-gray-400">
                            {currentStep + 1} / {steps.length}
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">
                        {currentStepData.title}
                    </h3>
                    <p className="text-gray-300">
                        {currentStepData.description}
                    </p>
                </div>

                {renderInput()}

                <div className="flex justify-between pt-6">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="px-6"
                    >
                        ← Anterior
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={loading}
                        className="px-6"
                    >
                        {loading ? 'Salvando...' : currentStep === steps.length - 1 ? 'Concluir' : 'Próximo →'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyAssessment;
