import React from 'react';
import './Dashboard.css';

const Dashboard = ({ progress, onQuickAction }) => {
  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Общий прогресс</h3>
          <div className="circular-progress">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${progress.percentage * 3.39} 339`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="progress-text">
              <span className="percentage">{progress.percentage}%</span>
              <span className="label">выполнено</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Статистика</h3>
          <div className="stats-list">
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">Завершено:</span>
              </div>
              <span className="stat-value">{progress.completed}</span>
            </div>
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">В процессе:</span>
              </div>
              <span className="stat-value">{progress.inProgress}</span>
            </div>
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">Не начато:</span>
              </div>
              <span className="stat-value">{progress.notStarted}</span>
            </div>
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">Всего:</span>
              </div>
              <span className="stat-value">{progress.total}</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Быстрые действия</h3>
          <div className="quick-actions">
            <button 
              className="action-button"
              onClick={() => onQuickAction('markAllCompleted')}
              disabled={progress.completed === progress.total}
            >
              <span className="action-text">Отметить все как выполненные</span>
            </button>
            <button 
              className="action-button"
              onClick={() => onQuickAction('resetAll')}
            >
              <span className="action-text">Сбросить все статусы</span>
            </button>
            <button 
              className="action-button"
              onClick={() => onQuickAction('export')}
              disabled={progress.total === 0}
            >
              <span className="action-text">Экспорт данных</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;