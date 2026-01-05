import React from 'react';

interface SynthoniaLogoProps {
  className?: string;
  size?: number;
}

const SynthoniaLogo: React.FC<SynthoniaLogoProps> = ({ 
  className = "", 
  size = 32 // Tamanho padrão maior
}) => {
  return (
    <div 
      className={`rounded-full bg-white flex items-center justify-center ${className}`}
      style={{ width: size, height: size, padding: '2px' }}
    >
      <img 
        src="/VALDEMAr.JUNIORso a logo.png"
        alt="Valdemar Junior Logo"
        className="w-full h-full object-contain"
        style={{ maxWidth: '90%', maxHeight: '90%' }}
      />
    </div>
  );
};

export default SynthoniaLogo;