import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ roadmap, onReset }) {
  const handleNewRoadmap = () => {
    if (roadmap && onReset) {
      if (window.confirm('Загрузить новую карту? Текущий прогресс будет сохранен в localStorage.')) {
        onReset();
      }
    }
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
        <button 
          className="new-roadmap-btn"
          onClick={handleNewRoadmap}
        >
          {roadmap ? 'Новая карта' : 'Начать'}
        </button>
      </div>
    </header>
  );
}

export default Header;