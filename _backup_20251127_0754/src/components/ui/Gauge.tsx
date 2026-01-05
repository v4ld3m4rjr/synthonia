// [AI Generated] Data: 19/01/2025
// Descrição: Componente gauge circular para exibir readiness score
// Gerado por: Cursor AI
// Versão: React 18.3.1 com animações SVG
// AI_GENERATED_CODE_START
import React from 'react';

interface GaugeProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  size = 200,
  strokeWidth = 20,
  color,
  label = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  // Determinar cor baseada no valor se não fornecida
  const gaugeColor = color || getColorByValue(value);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-x-hidden">
        <svg
          className="transform -rotate-90 w-full h-auto block"
          viewBox={`0 0 ${size} ${size}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-gray-800">
            {value}
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};

function getColorByValue(value: number): string {
  if (value >= 76) return '#3B82F6'; // Azul
  if (value >= 51) return '#10B981'; // Verde
  if (value >= 26) return '#F59E0B'; // Amarelo
  return '#EF4444'; // Vermelho
}
// AI_GENERATED_CODE_END