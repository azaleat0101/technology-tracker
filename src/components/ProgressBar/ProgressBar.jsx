import React from 'react';
import './ProgressBar.css';

function ProgressBar({ progress, stats }) {
  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3>Общий прогресс</h3>
        <span className="progress-percentage">{progress}%</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-label">Выполнено:</span>
          <span className="stat-value completed">{stats.completed}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">В работе:</span>
          <span className="stat-value in-progress">{stats.inProgress}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Осталось:</span>
          <span className="stat-value not-started">{stats.notStarted}</span>
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;