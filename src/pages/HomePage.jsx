// pages/HomePage.jsx
import React, { useState } from 'react';
import TechnologyCard from '../components/TechnologyCard';
import Dashboard from '../components/Dashboard';
import RoadmapImporter from '../components/RoadmapImporter';
import DataExporter from '../components/DataExporter';
import MemeWidget from '../components/MemeWidget'; // Импортируем новый компонент
import './HomePage.css';

const HomePage = ({
  technologies,
  progress,
  updateStatus,
  importRoadmap,
  markAllCompleted,
  resetAllStatuses
}) => {
  const [selectedTechId, setSelectedTechId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTechnologies = technologies.filter(tech => {
    if (filter !== 'all' && tech.status !== filter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tech.title.toLowerCase().includes(query) ||
        (tech.description && tech.description.toLowerCase().includes(query)) ||
        (tech.category && tech.category.toLowerCase().includes(query)) ||
        (tech.notes && tech.notes.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const handleQuickAction = (action) => {
    switch(action) {
      case 'markAllCompleted':
        if (window.confirm('Отметить ВСЕ технологии как завершенные?')) {
          markAllCompleted();
        }
        break;
      case 'resetAll':
        if (window.confirm('Сбросить ВСЕ статусы к "не начато"?')) {
          resetAllStatuses();
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Добро пожаловать!</h1>
        <p className="page-subtitle">Систематизируйте и отслеживайте ваш прогресс в освоении новых навыков</p>
      </div>

      <div className="home-layout">
        {/* Левая колонка - основная информация */}
        <div className="main-content-column">
          <Dashboard 
            progress={progress}
            onQuickAction={handleQuickAction}
          />

          <div className="tools-section">
            <RoadmapImporter onImport={importRoadmap} />
            <DataExporter technologies={technologies} />
          </div>

          <div className="controls-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Поиск технологий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="clear-search"
                  aria-label="Очистить поиск"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Все ({technologies.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                ✅ Завершено ({progress.completed})
              </button>
              <button 
                className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
                onClick={() => setFilter('in-progress')}
              >
                🔄 В процессе ({progress.inProgress})
              </button>
              <button 
                className={`filter-btn ${filter === 'not-started' ? 'active' : ''}`}
                onClick={() => setFilter('not-started')}
              >
                ⭕ Не начато ({progress.notStarted})
              </button>
            </div>
          </div>

          {/* Правая колонка - MemeWidget */}
            <div className="sidebar-column">
            <MemeWidget />
            </div>
          
          <div className="technologies-grid">
            {filteredTechnologies.length > 0 ? (
              filteredTechnologies.map(technology => (
                <TechnologyCard
                  key={technology.id}
                  technology={technology}
                  onStatusChange={updateStatus}
                />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3 className="empty-title">
                  {searchQuery ? 'Ничего не найдено' : 'Технологий пока нет'}
                </h3>
                <p className="empty-text">
                  {searchQuery 
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Добавьте технологии или импортируйте дорожную карту'
                  }
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="empty-action"
                  >
                    Очистить поиск
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;