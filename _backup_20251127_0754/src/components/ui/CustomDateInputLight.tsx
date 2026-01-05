// [AI Generated] Data: 19/01/2025
// Descrição: Componente de entrada de data personalizado com tema claro
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React, { useState, useEffect } from 'react';

interface CustomDateInputLightProps {
  value: string; // formato YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  name?: string;
}

const CustomDateInputLight: React.FC<CustomDateInputLightProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'DD/MM/AAAA',
  required = false,
  name
}) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Converter valor inicial para campos separados
  useEffect(() => {
    if (value) {
      const [yearPart, monthPart, dayPart] = value.split('-');
      setDay(dayPart || '');
      setMonth(monthPart || '');
      setYear(yearPart || '');
    }
  }, [value]);

  // Atualizar valor quando campos mudarem
  useEffect(() => {
    if (day && month && year) {
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      onChange(formattedDate);
    } else if (!day && !month && !year) {
      onChange('');
    }
  }, [day, month, year]);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // apenas números
    if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 31)) {
      setDay(val);
      // Auto-focus no próximo campo se completou 2 dígitos
      if (val.length === 2) {
        const monthInput = e.target.parentElement?.querySelector('[data-field="month"]') as HTMLInputElement;
        monthInput?.focus();
      }
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // apenas números
    if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
      setMonth(val);
      // Auto-focus no próximo campo se completou 2 dígitos
      if (val.length === 2) {
        const yearInput = e.target.parentElement?.querySelector('[data-field="year"]') as HTMLInputElement;
        yearInput?.focus();
      }
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // apenas números
    if (val === '' || val.length <= 4) {
      setYear(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'day' | 'month' | 'year') => {
    // Permitir navegação com backspace
    if (e.key === 'Backspace') {
      const target = e.target as HTMLInputElement;
      if (target.value === '' && field !== 'day') {
        e.preventDefault();
        if (field === 'month') {
          const dayInput = target.parentElement?.querySelector('[data-field="day"]') as HTMLInputElement;
          dayInput?.focus();
        } else if (field === 'year') {
          const monthInput = target.parentElement?.querySelector('[data-field="month"]') as HTMLInputElement;
          monthInput?.focus();
        }
      }
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="text"
        data-field="day"
        value={day}
        onChange={handleDayChange}
        onKeyDown={(e) => handleKeyDown(e, 'day')}
        placeholder="DD"
        maxLength={2}
        className="w-16 px-2 py-3 text-center border border-gray-200 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        required={required}
      />
      <span className="text-gray-400">/</span>
      <input
        type="text"
        data-field="month"
        value={month}
        onChange={handleMonthChange}
        onKeyDown={(e) => handleKeyDown(e, 'month')}
        placeholder="MM"
        maxLength={2}
        className="w-16 px-2 py-3 text-center border border-gray-200 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        required={required}
      />
      <span className="text-gray-400">/</span>
      <input
        type="text"
        data-field="year"
        value={year}
        onChange={handleYearChange}
        onKeyDown={(e) => handleKeyDown(e, 'year')}
        placeholder="AAAA"
        maxLength={4}
        className="w-20 px-2 py-3 text-center border border-gray-200 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        required={required}
      />
      {/* Campo hidden para compatibilidade com formulários */}
      <input
        type="hidden"
        name={name}
        value={value}
      />
    </div>
  );
};

export default CustomDateInputLight;
// AI_GENERATED_CODE_END