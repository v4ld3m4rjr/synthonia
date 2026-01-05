import React from 'react';
import { Moon, Target, Activity } from 'lucide-react';

interface CircularMetricsProps {
  sleepScore: number;
  readinessScore: number;
  exhaustionPercentage: number;
}

const CircularMetrics: React.FC<CircularMetricsProps> = ({
  sleepScore,
  readinessScore,
  exhaustionPercentage
}) => {
  // Função para criar círculo completo
  const createCirclePath = (
    centerX: number,
    centerY: number,
    radius: number,
    percentage: number
  ) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return {
      strokeDasharray,
      strokeDashoffset
    };
  };

  // Componente individual para cada métrica
  const MetricCircle: React.FC<{
    value: number;
    maxValue: number;
    color: string;
    icon: React.ReactNode;
    label: string;
    unit?: string;
  }> = ({ value, maxValue, color, icon, label, unit = "" }) => {
    const percentage = (value / maxValue) * 100;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 mb-4 overflow-x-hidden">
          <svg className="w-full h-auto transform -rotate-90" viewBox="0 0 160 160" preserveAspectRatio="xMidYMid meet">
            {/* Círculo de fundo */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#374151"
              strokeWidth="12"
              fill="none"
            />
            {/* Círculo preenchido */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={color}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Conteúdo central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full mb-2" style={{ backgroundColor: `${color}20` }}>
              {React.cloneElement(icon as React.ReactElement, { 
                className: "w-6 h-6", 
                style: { color } 
              })}
            </div>
            <div className="text-2xl font-bold" style={{ color }}>
              {value}{unit}
            </div>
          </div>
        </div>
        
        {/* Label */}
        <div className="text-center">
          <div className="text-lg font-medium" style={{ color }}>
            {label}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 overflow-y-auto overflow-x-hidden max-h-[50vh] sm:max-h-none">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 w-full">
        {/* Sono */}
        <MetricCircle
          value={Math.round(sleepScore * 10)}
          maxValue={100}
          color="#0066ff"
          icon={<Moon />}
          label="DORMIR"
        />
        
        {/* Prontidão */}
        <MetricCircle
          value={readinessScore}
          maxValue={100}
          color="#00ff66"
          icon={<Target />}
          label="PRONTIDÃO"
        />
        
        {/* Exaustão */}
        <MetricCircle
          value={exhaustionPercentage}
          maxValue={100}
          color="#00ffff"
          icon={<Activity />}
          label="EXAUSTÃO"
          unit="%"
        />
      </div>
    </div>
  );
};

export default CircularMetrics;