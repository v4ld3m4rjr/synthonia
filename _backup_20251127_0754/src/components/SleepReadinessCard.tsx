import React, { useState } from 'react';
import { computeRecovery, SleepReadinessInputs, SleepReadinessResult } from '../utils/sleepReadinessModel';

interface SleepReadinessCardProps {
  className?: string;
}

export const SleepReadinessCard: React.FC<SleepReadinessCardProps> = ({ className = '' }) => {
  const [inputs, setInputs] = useState<SleepReadinessInputs>({
    RHR_today: 58,
    RHR_base: 55,
    TSS24: 95,
    TSS48_prev: 60,
    TRIMP24: null,
    TRIMP48_prev: null,
    Sleep_last: 6.8,
    S_ref: 7.5,
    TQR: 6,
    Psy_stress: 5,
    L_thr: 100,
  });

  const [result, setResult] = useState<SleepReadinessResult | null>(null);

  const handleCalculate = () => {
    const calculatedResult = computeRecovery(inputs);
    setResult(calculatedResult);
  };

  const handleInputChange = (field: keyof SleepReadinessInputs, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const getRecoveryColor = (index: number) => {
    if (index >= 80) return 'text-green-600';
    if (index >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        SynthonIA AI - Modelo de Sono e Prontidão
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Parâmetros de Entrada</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                FC Repouso Hoje
              </label>
              <input
                type="number"
                value={inputs.RHR_today}
                onChange={(e) => handleInputChange('RHR_today', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                FC Repouso Base
              </label>
              <input
                type="number"
                value={inputs.RHR_base}
                onChange={(e) => handleInputChange('RHR_base', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                TSS 24h
              </label>
              <input
                type="number"
                value={inputs.TSS24 || ''}
                onChange={(e) => handleInputChange('TSS24', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                TSS 48h Anterior
              </label>
              <input
                type="number"
                value={inputs.TSS48_prev || ''}
                onChange={(e) => handleInputChange('TSS48_prev', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Sono Última Noite (h)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.Sleep_last}
                onChange={(e) => handleInputChange('Sleep_last', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Sono Referência (h)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.S_ref}
                onChange={(e) => handleInputChange('S_ref', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                TQR (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={inputs.TQR}
                onChange={(e) => handleInputChange('TQR', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Estresse Psicológico
              </label>
              <input
                type="number"
                value={inputs.Psy_stress || ''}
                onChange={(e) => handleInputChange('Psy_stress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Limiar de Carga
              </label>
              <input
                type="number"
                value={inputs.L_thr}
                onChange={(e) => handleInputChange('L_thr', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={handleCalculate}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Calcular Recuperação
          </button>
        </div>
        
        {/* Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Resultados</h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Índice de Recuperação</h4>
                <div className={`text-3xl font-bold ${getRecoveryColor(result.RecoveryIndex)}`}>
                  {result.RecoveryIndex}%
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Sono Necessário Hoje à Noite</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {result.Sleep_needed_tonight}h
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Tempo até Prontidão</h4>
                <div className="text-2xl font-bold text-purple-600">
                  {result.Time_to_ready_hours}h
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800 mb-2">Interpretação</h4>
                <p className="text-sm text-blue-700">
                  {result.RecoveryIndex >= 80 
                    ? "Excelente recuperação! Você está pronto para treinos intensos."
                    : result.RecoveryIndex >= 60
                    ? "Recuperação moderada. Considere treinos leves a moderados."
                    : "Recuperação baixa. Recomenda-se descanso ou treinos muito leves."
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500">
                Clique em "Calcular Recuperação" para ver os resultados
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};