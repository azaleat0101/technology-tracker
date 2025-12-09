import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ roadmap, onReset }) {
  const handleNewRoadmapClick = (e) => {
    if (roadmap && onReset) {
      if (window.confirm('Загрузить новую карту? Текущий прогресс будет сохранен.')) {
        onReset();
      } else {
        e.preventDefault(); // Отменяем переход если пользователь отказался
      }
    }
    // Если roadmap нет, просто разрешаем переход
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="logo-icon">🚀</span>
        <div className="logo-text">
          <h1>Technology Tracker</h1>
          <p>Персональный трекер освоения технологий</p>
        </div>
      </Link>
      
      <div className="header-actions">
        {roadmap && (
          <span className="roadmap-title">{roadmap.title}</span>
        )}
        <Link 
          to="/" 
          className="new-roadmap-btn"
          onClick={handleNewRoadmapClick}
        >
          {roadmap ? 'Новая карта' : 'Начать'}
        </Link>
      </div>
    </header>
  );
}

export default Header;