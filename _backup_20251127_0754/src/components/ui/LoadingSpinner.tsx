// [AI Generated] Data: 19/01/2025
// Descrição: Componente de loading spinner animado
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React from 'react';
import SynthoniaLogo from './SynthoniaLogo';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animation-delay-75"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <SynthoniaLogo className="text-blue-600" size={24} />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">SynthonIA AI</h3>
        <p className="text-sm text-gray-400">Carregando sua plataforma...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
// AI_GENERATED_CODE_END