import React, { useEffect, useRef } from 'react';
import { roadmapService } from '../../services/roadmapService';
import './ProgressChart.css';

function ProgressChart({ roadmap, chartType = 'pie', timeRange = 'all' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!roadmap || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const stats = roadmapService.getStats(roadmap.topics);
    
    drawChart(ctx, stats, chartType);
  }, [roadmap, chartType, timeRange]);

  const drawChart = (ctx, stats, type) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Очищаем canvas
    ctx.clearRect(0, 0, width, height);

    const data = [
      { value: stats.completed, color: '#4CAF50', label: 'Выполнено' },
      { value: stats.inProgress, color: '#FF9800', label: 'В работе' },
      { value: stats.notStarted, color: '#9E9E9E', label: 'Не начато' }
    ].filter(item => item.value > 0);

    if (type === 'pie') {
      drawPieChart(ctx, centerX, centerY, radius, data);
    } else if (type === 'bar') {
      drawBarChart(ctx, width, height, data);
    } else if (type === 'line') {
      drawLineChart(ctx, width, height, data);
    }

    drawLegend(ctx, width, height, data);
  };

  const drawPieChart = (ctx, centerX, centerY, radius, data) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;

    data.forEach(item => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      
      // Добавляем обводку
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += sliceAngle;
    });

    // Добавляем текст в центре
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round((data[0]?.value || 0) / total * 100)}%`, centerX, centerY);
  };

  const drawBarChart = (ctx, width, height, data) => {
    const barWidth = 60;
    const barSpacing = 40;
    const startX = 50;
    const maxValue = Math.max(...data.map(item => item.value));
    const chartHeight = height - 100;

    // Оси
    ctx.beginPath();
    ctx.moveTo(30, 20);
    ctx.lineTo(30, chartHeight);
    ctx.lineTo(width - 30, chartHeight);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Подписи осей
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Количество', 15, 10);
    ctx.save();
    ctx.translate(10, chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Статус', 0, 0);
    ctx.restore();

    // Столбцы
    data.forEach((item, index) => {
      const x = startX + index * (barWidth + barSpacing);
      const barHeight = (item.value / maxValue) * (chartHeight - 50);
      const y = chartHeight - barHeight;

      // Столбец
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Значение
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.value, x + barWidth / 2, y - 10);

      // Подпись
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.fillText(item.label, x + barWidth / 2, chartHeight + 20);
    });
  };

  const drawLineChart = (ctx, width, height, data) => {
    const chartHeight = height - 100;
    const chartWidth = width - 100;
    const startX = 50;
    const startY = chartHeight;
    const maxValue = Math.max(...data.map(item => item.value));

    // Оси
    ctx.beginPath();
    ctx.moveTo(startX, 20);
    ctx.lineTo(startX, startY);
    ctx.lineTo(startX + chartWidth, startY);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Точки и линии
    const pointRadius = 6;
    const points = data.map((item, index) => {
      const x = startX + (index / (data.length - 1)) * chartWidth;
      const y = startY - (item.value / maxValue) * (chartHeight - 50);
      return { x, y, ...item };
    });

    // Линия
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Точки
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Значения
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.value, point.x, point.y - 15);
    });

    // Подписи
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    points.forEach(point => {
      ctx.fillText(point.label, point.x, startY + 20);
    });
  };

  const drawLegend = (ctx, width, height, data) => {
    const legendX = width - 150;
    const legendY = 30;
    const itemHeight = 25;

    data.forEach((item, index) => {
      const y = legendY + index * itemHeight;

      // Цветной квадрат
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, y, 15, 15);

      // Текст
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.label}: ${item.value}`, legendX + 25, y + 12);
    });
  };

  return (
    <div className="progress-chart">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400}
        className="chart-canvas"
      />
    </div>
  );
}

export default ProgressChart;