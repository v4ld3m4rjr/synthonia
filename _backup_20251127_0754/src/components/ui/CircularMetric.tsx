import React from 'react';
import { calculateDataQuality, getGradualColor, METRIC_RANGES } from '../../utils/dataQuality';

interface CircularMetricProps {
  value: number;
  metricKey: keyof typeof METRIC_RANGES;
  label: string;
  unit?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const CircularMetric: React.FC<CircularMetricProps> = ({
  value,
  metricKey,
  label,
  unit = '',
  icon,
  size = 'md'
}) => {
  const quality = calculateDataQuality(value, metricKey);
  const gradualColor = getGradualColor(quality.score);
  
  // Tamanhos baseados na prop size
  const sizes = {
    sm: { container: 'w-20 h-20', text: 'text-xs', value: 'text-sm', icon: 'w-4 h-4' },
    md: { container: 'w-24 h-24', text: 'text-sm', value: 'text-base', icon: 'w-5 h-5' },
    lg: { container: 'w-32 h-32', text: 'text-base', value: 'text-lg', icon: 'w-6 h-6' }
  };
  
  const sizeClasses = sizes[size];
  
  // Calcula o progresso para o círculo (0-100)
  const progress = quality.score;
  const circumference = 2 * Math.PI * 35; // raio de 35
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Círculo com progresso */}
      <div className={`relative ${sizeClasses.container} flex items-center justify-center`}>
        {/* SVG para o círculo de progresso */}
        <svg
          className="absolute inset-0 transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 80 80"
        >
          {/* Círculo de fundo */}
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="#374151"
            strokeWidth="6"
            fill="transparent"
            className="opacity-30"
          />
          {/* Círculo de progresso */}
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke={gradualColor}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${gradualColor}40)`
            }}
          />
        </svg>
        
        {/* Conteúdo central */}
        <div className="flex flex-col items-center justify-center text-center z-10">
          {icon && (
            <div className={`${sizeClasses.icon} mb-1 text-white opacity-80`}>
              {icon}
            </div>
          )}
          <div className={`${sizeClasses.value} font-bold text-white`}>
            {typeof value === 'number' ? value.toFixed(1) : value}
            {unit && <span className="text-xs opacity-70 ml-1">{unit}</span>}
          </div>
        </div>
        
        {/* Indicador de qualidade (pequeno ponto) */}
        <div
          className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-gray-800"
          style={{ backgroundColor: quality.color }}
          title={`Qualidade: ${quality.level}`}
        />
      </div>
      
      {/* Label */}
      <div className={`${sizeClasses.text} text-white text-center font-medium max-w-24 leading-tight`}>
        {label}
      </div>
      
      {/* Score de qualidade (opcional, para debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400">
          {quality.score}% - {quality.level}
        </div>
      )}
    </div>
  );
};

export default CircularMetric;