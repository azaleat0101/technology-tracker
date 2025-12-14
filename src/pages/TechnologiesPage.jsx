import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TechnologyCard from '../components/TechnologyCard';
import './TechnologiesPage.css';

const TechnologiesPage = ({ technologies, updateStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Получаем уникальные категории
  const categories = ['all', ...new Set(technologies.map(t => t.category).filter(Boolean))];

  const filteredTechnologies = technologies.filter(tech => {
    // Фильтр по категории
    if (categoryFilter !== 'all' && tech.category !== categoryFilter) return false;
    
    // Фильтр по поиску
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tech.title.toLowerCase().includes(query) ||
        tech.description.toLowerCase().includes(query) ||
        tech.category?.toLowerCase().includes(query) ||
        tech.notes?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Группируем по статусу
  const groupedTechnologies = {
    'completed': filteredTechnologies.filter(t => t.status === 'completed'),
    'in-progress': filteredTechnologies.filter(t => t.status === 'in-progress'),
    'not-started': filteredTechnologies.filter(t => t.status === 'not-started')
  };

  return (
    <div className="technologies-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Все технологии</h1>
          <div className="page-subtitle">
            Всего технологий: {technologies.length} | Показано: {filteredTechnologies.length}
          </div>
        </div>
        <Link to="/add-technology" className="add-button">
          Добавить технологию
        </Link>
      </div>

      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Поиск по названию, описанию, категории..."
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

        <div className="filter-section">
          <div className="category-filter">
            <label htmlFor="category-select" className="filter-label">
              Категория:
            </label>
            <select
              id="category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Все категории' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTechnologies.length > 0 ? (
        <div className="technologies-sections">
          {Object.entries(groupedTechnologies).map(([status, techs]) => {
            if (techs.length === 0) return null;
            
            const statusTitles = {
              'completed': `Завершено (${techs.length})`,
              'in-progress': `В процессе (${techs.length})`,
              'not-started': `Не начато (${techs.length})`
            };
            
            return (
              <div key={status} className="status-section">
                <h2 className="section-title">{statusTitles[status]}</h2>
                <div className="technologies-grid">
                  {techs.map(technology => (
                    <TechnologyCard
                      key={technology.id}
                      technology={technology}
                      onStatusChange={updateStatus}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">
            {searchQuery || categoryFilter !== 'all' 
              ? 'Технологии не найдены' 
              : 'Технологий пока нет'}
          </h3>
          <p className="empty-text">
            {searchQuery 
              ? `По запросу "${searchQuery}" ничего не найдено`
              : categoryFilter !== 'all'
                ? `В категории "${categoryFilter}" нет технологий`
                : 'Начните с добавления первой технологии'
            }
          </p>
          <div className="empty-actions">
            {(searchQuery || categoryFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="empty-action"
              >
                Сбросить фильтры
              </button>
            )}
            <Link to="/add-technology" className="empty-action primary">
              Добавить технологию
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnologiesPage;