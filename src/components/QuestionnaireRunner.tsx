
import React, { useState } from 'react';
import type { Questionnaire } from '../data/questionnaires';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming cn exists or I will use standard clsx

interface QuestionnaireRunnerProps {
    questionnaire: Questionnaire;
    onComplete: (answers: Record<string, any>) => void;
    onClose: () => void;
}

export const QuestionnaireRunner: React.FC<QuestionnaireRunnerProps> = ({ questionnaire, onComplete, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = questionnaire.questions[currentStep];
    const isLastQuestion = currentStep === questionnaire.questions.length - 1;
    const progress = ((currentStep + 1) / questionnaire.questions.length) * 100;

    const handleAnswer = (value: any) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
        // Auto-advance if it's a scale/choice (optional UX choice)
        // setTimeout(() => handleNext(), 200); 
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setIsSubmitting(true);
            onComplete(answers);
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-semibold text-white tracking-tight">{questionnaire.title}</h2>
                        <p className="text-sm text-slate-400 mt-1">{questionnaire.category} Assessment</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-slate-800 w-full">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="mb-8">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                            Question {currentStep + 1} of {questionnaire.questions.length}
                        </span>
                        <h3 className="text-2xl font-medium text-white mt-3 leading-relaxed">
                            {currentQuestion.text}
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {currentQuestion.type === 'scale' && currentQuestion.options?.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleAnswer(option.value)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                                    answers[currentQuestion.id] === option.value
                                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                                        : "bg-slate-800/30 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                                )}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="font-medium">{option.label}</span>
                                    {answers[currentQuestion.id] === option.value && (
                                        <CheckCircle className="w-5 h-5 text-indigo-400" />
                                    )}
                                </div>
                            </button>
                        ))}

                        {/* Fallback for other types if needed later */}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/30 flex justify-between items-center">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={answers[currentQuestion.id] === undefined}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                        {isLastQuestion ? (isSubmitting ? 'Submitting...' : 'Complete') : 'Next'}
                        {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

            </div>
        </div>
    );
};
