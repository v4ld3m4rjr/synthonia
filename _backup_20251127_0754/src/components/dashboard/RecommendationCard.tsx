// [AI Generated] Data: 19/01/2025
// Descrição: Card de recomendações baseadas no readiness score
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React from 'react';
import { Recommendation } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Lightbulb, Clock, Calendar } from 'lucide-react';
import NeurophysiologyExplainer from '../ai/NeurophysiologyExplainer';

interface RecommendationCardProps {
  recommendation: Recommendation;
  aiMetrics?: { [key: string]: number };
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, aiMetrics }) => {
  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'training':
        return 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-600/50';
      case 'recovery':
        return 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-600/50';
      case 'rest':
        return 'bg-gradient-to-r from-red-900/30 to-pink-900/30 border-red-600/50';
      default:
        return 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'training':
        return 'text-blue-400';
      case 'recovery':
        return 'text-yellow-400';
      case 'rest':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className={`border ${getBackgroundColor(recommendation.type)} hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="p-3 bg-gray-700 rounded-xl shadow-sm">
              <Lightbulb className={`h-6 w-6 ${getIconColor(recommendation.type)}`} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-bold text-white">
                {recommendation.title}
              </h3>
              <span className="text-2xl">{recommendation.icon}</span>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              {recommendation.description}
            </p>

            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Recomendação para hoje</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Análise de IA aprimorada para orientação de treino */}
        {aiMetrics && (
          <div className="mt-6">
            <NeurophysiologyExplainer metrics={aiMetrics} className="bg-gray-900/20" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
// AI_GENERATED_CODE_END