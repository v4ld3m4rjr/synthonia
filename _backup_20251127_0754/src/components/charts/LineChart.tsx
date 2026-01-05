import React, { useRef, useEffect, useState } from 'react';

interface DataPoint {
  x: string;
  y: number;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number | string;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showGrid?: boolean;
  showDots?: boolean;
  darkTheme?: boolean;
}

function LineChart({
  data,
  width = '100%',
  height = 300,
  color = '#3b82f6',
  strokeWidth = 2,
  showGrid = true,
  showDots = true,
  darkTheme = false
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const validData = data.filter(d =>
      d &&
      typeof d.y === 'number' &&
      isFinite(d.y) &&
      !isNaN(d.y) &&
      d.x !== undefined &&
      d.x !== null
    );

    const actualWidth = typeof width === 'string' ? container.offsetWidth : width;
    const actualHeight = height;

    if (actualWidth <= 0 || actualHeight <= 0) {
      if (import.meta.env.DEV) {
        console.warn('LineChart - Dimensões inválidas:', { actualWidth, actualHeight });
      }
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = (actualWidth as number) * dpr;
    canvas.height = actualHeight * dpr;
    canvas.style.width = `${actualWidth}px`;
    canvas.style.height = `${actualHeight}px`;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = darkTheme ? '#111827' : '#ffffff';
    ctx.fillRect(0, 0, actualWidth as number, actualHeight);

    const padding = 40;
    const chartWidth = (actualWidth as number) - 2 * padding;
    const chartHeight = actualHeight - 2 * padding;

    if (validData.length === 0) {
      ctx.fillStyle = darkTheme ? '#9CA3AF' : '#6B7280';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Sem dados válidos para exibir', actualWidth / 2, actualHeight / 2);
      return;
    }

    const yValues = validData.map(d => d.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const yRange = maxY - minY || 1;

    if (showGrid) {
      ctx.strokeStyle = darkTheme ? '#374151' : '#E5E7EB';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight * i) / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }
      for (let i = 0; i <= 5; i++) {
        const x = padding + (chartWidth * i) / 5;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();
      }
    }

    if (validData.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      validData.forEach((point, index) => {
        const x = padding + (chartWidth * index) / (validData.length - 1);
        const y = padding + chartHeight - ((point.y - minY) / yRange) * chartHeight;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    if (showDots) {
      ctx.fillStyle = color;
      validData.forEach((point, index) => {
        const x = padding + (chartWidth * index) / (validData.length - 1);
        const y = padding + chartHeight - ((point.y - minY) / yRange) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [data, width, height, color, strokeWidth, showGrid, showDots, darkTheme, containerWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Inicializa com a largura atual
    setContainerWidth(container.offsetWidth);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.floor(entry.contentRect.width);
        if (newWidth !== containerWidth) {
          setContainerWidth(newWidth);
        }
      }
    });

    ro.observe(container);

    const handleWindowResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [containerWidth]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="rounded-lg w-full"
      />
    </div>
  );
}

export default LineChart;
export { LineChart };