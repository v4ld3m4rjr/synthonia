import React, { useRef, useEffect, useState } from 'react';

interface DataPoint {
  x: string;
  y: number;
}

interface DataSeries {
  name: string;
  data: DataPoint[];
  color?: string;
}

interface MultiLineChartProps {
  series: DataSeries[];
  width?: number | string;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  showLegend?: boolean;
  darkTheme?: boolean;
}

function MultiLineChart({
  series,
  width = '100%',
  height = 300,
  showGrid = true,
  showDots = true,
  showLegend = true,
  darkTheme = false
}: MultiLineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const actualWidth = typeof width === 'string' ? container.offsetWidth : width;
    const actualHeight = height;

    if ((actualWidth as number) <= 0 || actualHeight <= 0) {
      if (import.meta.env.DEV) {
        console.warn('MultiLineChart - Dimensões inválidas:', { actualWidth, actualHeight });
      }
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = (actualWidth as number) * dpr;
    canvas.height = actualHeight * dpr;
    canvas.style.width = `${actualWidth}px`;
    canvas.style.height = `${actualHeight}px`;
    ctx.scale(dpr, dpr);

    // Fundo
    ctx.fillStyle = darkTheme ? '#111827' : '#ffffff';
    ctx.fillRect(0, 0, actualWidth as number, actualHeight);

    // Layout
    const padding = { top: 20, right: 20, bottom: showLegend ? 60 : 30, left: 50 };
    const chartWidth = (actualWidth as number) - padding.left - padding.right;
    const chartHeight = actualHeight - padding.top - padding.bottom;

    // Normalizar dados e encontrar min/max
    const normalized: Array<{ name: string; color: string; points: DataPoint[] }> = [];
    const defaultColors = [
      '#3b82f6', // blue-500
      '#ef4444', // red-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
      '#06b6d4', // cyan-500
      '#f97316', // orange-500
    ];

    series.forEach((s, idx) => {
      const points = (s.data || []).filter(p => p && typeof p.y === 'number' && isFinite(p.y) && !isNaN(p.y));
      normalized.push({ name: s.name, color: s.color || defaultColors[idx % defaultColors.length], points });
    });

    const allY = normalized.flatMap(s => s.points.map(p => p.y));
    const minY = allY.length ? Math.min(...allY) : 0;
    const maxY = allY.length ? Math.max(...allY) : 1;
    const yRange = maxY - minY || 1;

    if (showGrid) {
      ctx.strokeStyle = darkTheme ? '#374151' : '#E5E7EB';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight * i) / 5;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
      }
      for (let i = 0; i <= 5; i++) {
        const x = padding.left + (chartWidth * i) / 5;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + chartHeight);
        ctx.stroke();
      }
    }

    // Desenhar linhas por série
    normalized.forEach(s => {
      if (s.points.length > 1) {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        s.points.forEach((p, index) => {
          const x = padding.left + (chartWidth * index) / (s.points.length - 1);
          const y = padding.top + chartHeight - ((p.y - minY) / yRange) * chartHeight;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }

      if (showDots) {
        ctx.fillStyle = s.color;
        s.points.forEach((p, index) => {
          const x = padding.left + (chartWidth * index) / (s.points.length - 1);
          const y = padding.top + chartHeight - ((p.y - minY) / yRange) * chartHeight;
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });

    // Legenda
    if (showLegend) {
      const legendY = padding.top + chartHeight + 10;
      let legendX = padding.left;
      ctx.font = '12px Inter, sans-serif';
      normalized.forEach(s => {
        // swatch
        ctx.fillStyle = s.color;
        ctx.fillRect(legendX, legendY, 14, 14);
        // label
        ctx.fillStyle = darkTheme ? '#D1D5DB' : '#4B5563';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText(s.name, legendX + 18, legendY + 7);
        legendX += 18 + ctx.measureText(s.name).width + 16;
      });
    }
  }, [series, width, height, showGrid, showDots, showLegend, darkTheme, containerWidth]);

  // Observa mudanças de tamanho do contêiner para tornar o canvas responsivo
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Inicializa com a largura atual
    setContainerWidth(container.offsetWidth);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.floor(entry.contentRect.width);
        setContainerWidth((prev) => (prev !== newWidth ? newWidth : prev));
      }
    });

    ro.observe(container);

    const handleWindowResize = () => {
      if (containerRef.current) {
        const newWidth = Math.floor(containerRef.current.offsetWidth);
        setContainerWidth((prev) => (prev !== newWidth ? newWidth : prev));
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="rounded-lg w-full" />
    </div>
  );
}

export default MultiLineChart;
export { MultiLineChart };