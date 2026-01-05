import React, { useRef, useEffect } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  width?: number | string;
  height?: number;
  color?: string;
  darkTheme?: boolean;
}

function BarChart({
  data,
  width = '100%',
  height = 300,
  color = '#3b82f6',
  darkTheme = false
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Validar e filtrar dados
    const validData = data.filter(d => 
      d && 
      typeof d.value === 'number' && 
      isFinite(d.value) && 
      !isNaN(d.value) &&
      d.label !== undefined && 
      d.label !== null
    );

    // Calcular largura responsiva
    const actualWidth = typeof width === 'string' ? container.offsetWidth : width;
    const actualHeight = height;

    // Verificar se as dimensões são válidas
    if (actualWidth <= 0 || actualHeight <= 0) {
      if (import.meta.env.DEV) {
        console.warn('BarChart - Dimensões inválidas:', { actualWidth, actualHeight });
      }
      return;
    }

    // Configurar alta resolução
    const dpr = window.devicePixelRatio || 1;
    canvas.width = actualWidth * dpr;
    canvas.height = actualHeight * dpr;
    canvas.style.width = `${actualWidth}px`;
    canvas.style.height = `${actualHeight}px`;
    ctx.scale(dpr, dpr);

    // Limpar canvas e definir fundo
    ctx.fillStyle = darkTheme ? '#111827' : '#ffffff';
    ctx.fillRect(0, 0, actualWidth, actualHeight);

    // Padding para o gráfico
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = actualWidth - padding.left - padding.right;
    const chartHeight = actualHeight - padding.top - padding.bottom;

    // Se não há dados válidos, mostrar mensagem
    if (validData.length === 0) {
      ctx.fillStyle = darkTheme ? '#9CA3AF' : '#6B7280';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Sem dados válidos para exibir', actualWidth / 2, actualHeight / 2);
      return;
    }

    // Encontrar valor máximo
    const maxValue = Math.max(...validData.map(d => d.value));
    
    // Calcular largura das barras
    const barWidth = chartWidth / validData.length * 0.7;
    const barSpacing = chartWidth / validData.length * 0.3;
    
    // Desenhar eixo Y
    ctx.strokeStyle = darkTheme ? '#374151' : '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    
    // Desenhar linhas horizontais e labels do eixo Y
    ctx.fillStyle = darkTheme ? '#D1D5DB' : '#4B5563';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + chartHeight - (chartHeight / ySteps) * i;
      const value = (maxValue / ySteps) * i;
      
      // Linha horizontal
      ctx.strokeStyle = darkTheme ? '#374151' : '#E5E7EB';
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      
      // Label do eixo Y
      ctx.fillStyle = darkTheme ? '#D1D5DB' : '#4B5563';
      ctx.fillText(Math.round(value).toString(), padding.left - 10, y);
    }
    
    // Desenhar barras e labels do eixo X
    validData.forEach((item, index) => {
      const x = padding.left + (chartWidth / validData.length) * index + (chartWidth / validData.length - barWidth) / 2;
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;
      
      // Desenhar barra
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Desenhar borda da barra
      ctx.strokeStyle = darkTheme ? '#1F2937' : '#F3F4F6';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);
      
      // Label do eixo X
      ctx.fillStyle = darkTheme ? '#D1D5DB' : '#4B5563';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Truncar label se for muito longo
      let label = item.label;
      const maxLabelWidth = barWidth + barSpacing;
      ctx.font = '12px Inter, sans-serif';
      if (ctx.measureText(label).width > maxLabelWidth) {
        let truncated = '';
        for (let i = 0; i < label.length; i++) {
          const testLabel = label.substring(0, i) + '...';
          if (ctx.measureText(testLabel).width > maxLabelWidth) {
            break;
          }
          truncated = testLabel;
        }
        label = truncated;
      }
      
      ctx.fillText(label, x + barWidth / 2, padding.top + chartHeight + 10);
      
      // Valor acima da barra
      ctx.fillStyle = darkTheme ? '#D1D5DB' : '#4B5563';
      ctx.textBaseline = 'bottom';
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);
    });
    
  }, [data, width, height, color, darkTheme]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="rounded-lg w-full"
      />
    </div>
  );
}

export default BarChart;
export { BarChart };