// [AI Generated] Data: 19/01/2025
// Descrição: Componente seletor de período de tempo para gráficos
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React from 'react';
import { Button } from './Button';
import { Calendar } from 'lucide-react';

export type TimePeriod = 7 | 14 | 21 | 28;

interface TimeSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  className?: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  className = ''
}) => {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: 7, label: '7 dias' },
    { value: 14, label: '14 dias' },
    { value: 21, label: '21 dias' },
    { value: 28, label: '28 dias' }
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Calendar className="h-4 w-4 text-gray-400" />
      <span className="text-sm font-medium text-gray-300 mr-2">Período:</span>
      <div className="flex space-x-1">
        {periods.map(({ value, label }) => (
          <Button
            key={value}
            variant={selectedPeriod === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange(value)}
            className={`text-xs px-3 py-1 transition-all duration-200 ${
              selectedPeriod === value 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
            }`}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimeSelector;
// AI_GENERATED_CODE_END