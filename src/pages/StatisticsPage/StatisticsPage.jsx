import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressChart from '../../components/Charts/ProgressChart';
import { roadmapService } from '../../services/roadmapService';
import { storageService } from '../../services/storageService';
import './StatisticsPage.css';

function StatisticsPage() {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [chartType, setChartType] = useState('pie');

  useEffect(() => {
    const savedRoadmapId = localStorage.getItem('currentRoadmapId');
    if (savedRoadmapId) {
      const loadedRoadmap = storageService.loadRoadmap(savedRoadmapId);
      if (loadedRoadmap) {
        setRoadmap(loadedRoadmap);
        
        const statsData = calculateDetailedStats(loadedRoadmap);
        setStats(statsData);
      }
    }
  }, []);

  const calculateDetailedStats = (roadmapData) => {
    if (!roadmapData || !roadmapData.topics) {
      return null;
    }

    const topics = roadmapData.topics;
    
    // Базовые статистики
    const baseStats = roadmapService.getStats(topics);
    
    // Дополнительные метрики
    const completedWithDates = topics.filter(t => 
      t.status === 'completed' && t.completedDate
    );
    
    const inProgressWithTarget = topics.filter(t => 
      t.status === 'in-progress' && t.targetDate
    );
    
    // Расчет среднего времени выполнения
    let avgCompletionDays = null;
    if (completedWithDates.length >= 2) {
      const dates = completedWithDates
        .map(t => new Date(t.completedDate))
        .sort((a, b) => a - b);
      
      if (dates.length >= 2) {
        const totalDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
        avgCompletionDays = Math.round(totalDays / (dates.length - 1));
      }
    }

    // Прогресс по неделям (последние 8 недель)
    const weeklyProgress = [];
    const today = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const completedThisWeek = completedWithDates.filter(t => {
        const completedDate = new Date(t.completedDate);
        return completedDate >= weekStart && completedDate <= weekEnd;
      }).length;
      
      weeklyProgress.push({
        week: `Неделя ${8 - i}`,
        date: weekStart.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
        completed: completedThisWeek
      });
    }

    return {
      ...baseStats,
      avgCompletionDays,
      weeklyProgress,
      completedWithDates: completedWithDates.length,
      inProgressWithTarget: inProgressWithTarget.length,
      onTimeCompletion: completedWithDates.filter(t => {
        if (!t.targetDate) return false;
        const completed = new Date(t.completedDate);
        const target = new Date(t.targetDate);
        return completed <= target;
      }).length,
      completionRate: baseStats.total > 0 
        ? Math.round((baseStats.completed / baseStats.total) * 100) 
        : 0,
      efficiency: completedWithDates.length > 0 && avgCompletionDays 
        ? Math.round((completedWithDates.length / avgCompletionDays) * 100) / 100 
        : 0
    };
  };

  const exportStats = () => {
    if (!stats || !roadmap) return;
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      roadmapTitle: roadmap.title,
      roadmapDescription: roadmap.description,
      statistics: stats,
      timeframe: timeRange,
      chartType: chartType,
      summary: {
        completionRate: `${stats.completionRate}%`,
        avgTopicsPerDay: stats.efficiency ? `${stats.efficiency} тем/день` : 'Недостаточно данных',
        onTimeCompletionRate: stats.completedWithDates > 0 
          ? `${Math.round((stats.onTimeCompletion / stats.completedWithDates) * 100)}%`
          : 'Нет данных'
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stats-${roadmap.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!roadmap) {
    return (
      <div className="statistics-page">
        <div className="no-data-message">
          <h2>📊 Статистика недоступна</h2>
          <p>Для просмотра статистики необходимо загрузить дорожную карту.</p>
          <button 
            onClick={() => navigate('/')}
            className="primary-btn"
          >
            ← Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <div className="stats-header">
        <button 
          onClick={() => navigate('/')}
          className="back-btn"
        >
          ← Назад
        </button>
        <h1>📊 Статистика: {roadmap.title}</h1>
      </div>

      <div className="controls-panel">
        <div className="control-group">
          <label>Период:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="all">За всё время</option>
            <option value="month">Последний месяц</option>
            <option value="week">Последняя неделя</option>
            <option value="today">Сегодня</option>
          </select>
        </div>

        <div className="control-group">
          <label>Тип графика:</label>
          <div className="chart-type-buttons">
            <button 
              className={`chart-btn ${chartType === 'pie' ? 'active' : ''}`}
              onClick={() => setChartType('pie')}
              title="Круговая диаграмма"
            >
              🍕
            </button>
            <button 
              className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              title="Столбчатая диаграмма"
            >
              📊
            </button>
            <button 
              className={`chart-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
              title="Линейный график"
            >
              📈
            </button>
          </div>
        </div>

        <button 
          onClick={exportStats}
          className="export-btn"
        >
          📥 Экспорт статистики
        </button>
      </div>

      <div className="stats-overview">
        <div className="stat-card primary">
          <h3>Общий прогресс</h3>
          <div className="stat-value">{stats.completionRate}%</div>
          <div className="stat-desc">{stats.completed} из {stats.total} тем</div>
        </div>
        
        <div className="stat-card success">
          <h3>Выполнено</h3>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-desc">{stats.completedWithDates} с указанием даты</div>
        </div>
        
        <div className="stat-card warning">
          <h3>В работе</h3>
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-desc">{stats.inProgressWithTarget} с дедлайном</div>
        </div>
        
        <div className="stat-card info">
          <h3>Эффективность</h3>
          <div className="stat-value">
            {stats.efficiency ? `${stats.efficiency}/день` : '–'}
          </div>
          <div className="stat-desc">
            {stats.avgCompletionDays ? `Среднее: ${stats.avgCompletionDays} дней` : 'Недостаточно данных'}
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="main-chart">
          <h2>Распределение тем по статусам</h2>
          <ProgressChart 
            roadmap={roadmap}
            chartType={chartType}
            timeRange={timeRange}
          />
        </div>

        <div className="side-charts">
          <div className="chart-container">
            <h3>Прогресс по неделям</h3>
            {stats.weeklyProgress && stats.weeklyProgress.length > 0 ? (
              <div className="weekly-progress">
                {stats.weeklyProgress.map((week, index) => (
                  <div key={index} className="week-item">
                    <div className="week-header">
                      <span className="week-name">{week.week}</span>
                      <span className="week-date">{week.date}</span>
                    </div>
                    <div className="week-bar">
                      <div 
                        className="week-fill"
                        style={{ 
                          width: `${(week.completed / Math.max(...stats.weeklyProgress.map(w => w.completed))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="week-count">{week.completed} тем</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">Нет данных о выполненных темах</p>
            )}
          </div>

          <div className="chart-container">
            <h3>Своевременность выполнения</h3>
            {stats.completedWithDates > 0 ? (
              <div className="timeliness-chart">
                <div className="timeliness-item">
                  <div className="timeliness-label">В срок:</div>
                  <div className="timeliness-bar">
                    <div 
                      className="timeliness-fill on-time"
                      style={{ width: `${(stats.onTimeCompletion / stats.completedWithDates) * 100}%` }}
                    ></div>
                  </div>
                  <div className="timeliness-value">
                    {stats.onTimeCompletion} ({Math.round((stats.onTimeCompletion / stats.completedWithDates) * 100)}%)
                  </div>
                </div>
                <div className="timeliness-item">
                  <div className="timeliness-label">С опозданием:</div>
                  <div className="timeliness-bar">
                    <div 
                      className="timeliness-fill late"
                      style={{ width: `${((stats.completedWithDates - stats.onTimeCompletion) / stats.completedWithDates) * 100}%` }}
                    ></div>
                  </div>
                  <div className="timeliness-value">
                    {stats.completedWithDates - stats.onTimeCompletion} 
                    ({Math.round(((stats.completedWithDates - stats.onTimeCompletion) / stats.completedWithDates) * 100)}%)
                  </div>
                </div>
              </div>
            ) : (
              <p className="no-data">Нет данных о сроках выполнения</p>
            )}
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h2>🔍 Инсайты и рекомендации</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>📈 Тенденции</h4>
            {stats.weeklyProgress && stats.weeklyProgress[stats.weeklyProgress.length - 1].completed > 0 ? (
              <p>На этой неделе вы выполнили {stats.weeklyProgress[stats.weeklyProgress.length - 1].completed} тем</p>
            ) : (
              <p>Начните выполнять темы, чтобы увидеть свои тенденции</p>
            )}
          </div>
          
          <div className="insight-card">
            <h4>🎯 Рекомендации</h4>
            {stats.inProgress > 0 ? (
              <p>У вас {stats.inProgress} тем в работе. Попробуйте сфокусироваться на одной теме</p>
            ) : (
              <p>Попробуйте функцию "Случайный выбор" для выбора следующей темы</p>
            )}
          </div>
          
          <div className="insight-card">
            <h4>⏱️ Планирование</h4>
            {stats.inProgressWithTarget > 0 ? (
              <p>{stats.inProgressWithTarget} тем имеют дедлайн. Проверьте, успеваете ли вы</p>
            ) : (
              <p>Добавляйте дедлайны к темам для лучшего планирования</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage;