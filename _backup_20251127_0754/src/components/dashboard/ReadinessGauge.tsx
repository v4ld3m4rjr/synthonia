// [AI Generated] Data: 19/01/2025
// Descrição: Gauge circular principal para exibir Readiness Score
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { getReadinessColor } from '../../lib/calculations';

interface ReadinessGaugeProps {
  score: number;
  date: string;
}

const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({ score, date }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const color = getReadinessColor(score);
  const size = 280;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getScoreLabel = (score: number) => {
    if (score >= 76) return { text: 'Excelente', emoji: '💪', desc: 'Pronto para treino forte' };
    if (score >= 51) return { text: 'Bom', emoji: '⚡', desc: 'Treino moderado/intenso' };
    if (score >= 26) return { text: 'Regular', emoji: '🚶', desc: 'Treino leve recomendado' };
    return { text: 'Baixo', emoji: '🛌', desc: 'Foque na recuperação' };
  };

  const scoreLabel = getScoreLabel(score);

  return (
    <Card className="h-full">
      <CardHeader className="text-center pb-2">
        <h2 className="text-2xl font-bold text-white">Readiness Score</h2>
        <p className="text-sm text-gray-300">{date}</p>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        
        {/* Gauge SVG */}
        <div className="relative overflow-x-hidden">
          <svg
            className="transform -rotate-90 w-full h-auto block"
            viewBox={`0 0 ${size} ${size}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="opacity-30"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="100%" stopColor={color} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#gaugeGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-2000 ease-out"
            />
            {/* Inner glow */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius - 35}
              stroke={color}
              strokeWidth="2"
              fill="transparent"
              className="opacity-20"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-bold mb-2" style={{ color }}>
              {animatedScore}
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{scoreLabel.emoji}</div>
              <div className="text-lg font-semibold text-white mb-1">
                {scoreLabel.text}
              </div>
              <div className="text-sm text-gray-300 max-w-32 leading-tight">
                {scoreLabel.desc}
              </div>
            </div>
          </div>
        </div>

        {/* Score Range Indicator */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs font-medium text-gray-300 mb-2">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
          <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div className="flex-1 bg-red-400"></div>
              <div className="flex-1 bg-yellow-400"></div>
              <div className="flex-1 bg-green-400"></div>
              <div className="flex-1 bg-blue-400"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Recuperação</span>
            <span>Leve</span>
            <span>Moderado</span>
            <span>Forte</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadinessGauge;
// AI_GENERATED_CODE_END