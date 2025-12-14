import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Добавляем хук темы
import './Header.css';

const Header = ({ progress }) => {
  const { theme, toggleTheme } = useTheme(); // Используем тему

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">Трекер изучения технологий</h1>
        </div>
        
        <div className="header-right">
          <div className="progress-display">
            <div className="progress-label">Общий прогресс:</div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="progress-percentage">{progress.percentage}%</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;