import React, { useState } from 'react';
import TechnologyCard from '../../components/TechnologyCard/TechnologyCard';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import FileUploader from '../../components/FileUploader/FileUploader';
import QuickActions from '../../components/QuickActions/QuickActions';
import { roadmapService } from '../../services/roadmapService';
import { storageService } from '../../services/storageService';
import './HomePage.css';

function HomePage({ roadmap, onRoadmapLoaded, onTopicUpdate }) {
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localRoadmap, setLocalRoadmap] = useState(roadmap);

  // Обновляем локальное состояние при изменении пропса
  React.useEffect(() => {
    setLocalRoadmap(roadmap);
  }, [roadmap]);

  const handleFileLoaded = async (file) => {
    try {
      const roadmapData = await roadmapService.loadRoadmapFromFile(file);
      const loadedRoadmap = {
        ...roadmapData,
        id: roadmapData.id || `roadmap_${Date.now()}`
      };
      
      // Сохраняем в localStorage
      storageService.saveRoadmap(loadedRoadmap.id, loadedRoadmap);
      localStorage.setItem('currentRoadmapId', loadedRoadmap.id);
      
      // Обновляем состояние
      setLocalRoadmap(loadedRoadmap);
      if (onRoadmapLoaded) {
        onRoadmapLoaded(loadedRoadmap);
      }
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleStatusChange = (topicId, newStatus) => {
    if (!localRoadmap) return;
    
    const updatedTopics = localRoadmap.topics.map(topic => 
      topic.id === topicId 
        ? { 
            ...topic, 
            status: newStatus,
            completedDate: newStatus === 'completed' ? 
              new Date().toISOString().split('T')[0] : 
              topic.completedDate
          }
        : topic
    );
    
    const updatedRoadmap = {
      ...localRoadmap,
      topics: updatedTopics
    };
    
    // Сохраняем в состояние
    setLocalRoadmap(updatedRoadmap);
    
    // Сохраняем в localStorage
    storageService.saveRoadmap(updatedRoadmap.id, updatedRoadmap);
    
    // Уведомляем родительский компонент
    if (onTopicUpdate) {
      onTopicUpdate(updatedRoadmap);
    }
  };

  const handleUpdateAllTopics = (updatedTopics) => {
    if (!localRoadmap) return;
    
    const updatedRoadmap = {
      ...localRoadmap,
      topics: updatedTopics
    };
    
    // Сохраняем в состояние
    setLocalRoadmap(updatedRoadmap);
    
    // Сохраняем в localStorage
    storageService.saveRoadmap(updatedRoadmap.id, updatedRoadmap);
    
    // Уведомляем родительский компонент
    if (onTopicUpdate) {
      onTopicUpdate(updatedRoadmap);
    }
  };

  // Функция для фильтрации по поисковому запросу и статусу
  const getFilteredTopics = () => {
    if (!localRoadmap || !localRoadmap.topics) return [];
    
    let filtered = localRoadmap.topics;
    
    // 1. Фильтрация по поисковому запросу
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(topic =>
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query) ||
        (topic.userNotes && topic.userNotes.toLowerCase().includes(query))
      );
    }
    
    // 2. Фильтрация по статусу (если выбран не "all")
    if (filter !== 'all') {
      filtered = filtered.filter(topic => topic.status === filter);
    }
    
    return filtered;
  };

  const filteredTopics = getFilteredTopics();
  const totalTopics = localRoadmap?.topics?.length || 0;

  // Рассчитываем статистику
  const stats = localRoadmap ? roadmapService.getStats(localRoadmap.topics) : { 
    completed: 0, 
    inProgress: 0, 
    notStarted: 0 
  };
  
  const progress = localRoadmap ? roadmapService.calculateProgress(localRoadmap.topics) : 0;

  if (!localRoadmap) {
    return (
      <div className="home-page">
        <div className="welcome-section">
          <h1>🚀 Персональный трекер освоения технологий</h1>
          <p className="subtitle">
            Загрузите дорожную карту в формате JSON и начните отслеживать свой прогресс
          </p>
          
          <FileUploader 
            onFileLoaded={handleFileLoaded}
            onError={setError}
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="sample-section">
            <h3>Примеры дорожных карт:</h3>
            <div className="sample-cards">
              <button 
                className="sample-card"
                onClick={async () => {
                  try {
                    const response = await fetch('/roadmaps/react-roadmap.json');
                    const data = await response.json();
                    const loadedRoadmap = {
                      ...data,
                      id: data.id || `roadmap_${Date.now()}`
                    };
                    storageService.saveRoadmap(loadedRoadmap.id, loadedRoadmap);
                    localStorage.setItem('currentRoadmapId', loadedRoadmap.id);
                    setLocalRoadmap(loadedRoadmap);
                    if (onRoadmapLoaded) onRoadmapLoaded(loadedRoadmap);
                  } catch (error) {
                    setError('Ошибка загрузки примера: ' + error.message);
                  }
                }}
              >
                <span>⚛️</span>
                <h4>React Developer</h4>
                <p>4 темы для изучения</p>
              </button>
              
              <button 
                className="sample-card"
                onClick={async () => {
                  try {
                    const response = await fetch('/roadmaps/javascript-roadmap.json');
                    const data = await response.json();
                    const loadedRoadmap = {
                      ...data,
                      id: data.id || `roadmap_${Date.now()}`
                    };
                    storageService.saveRoadmap(loadedRoadmap.id, loadedRoadmap);
                    localStorage.setItem('currentRoadmapId', loadedRoadmap.id);
                    setLocalRoadmap(loadedRoadmap);
                    if (onRoadmapLoaded) onRoadmapLoaded(loadedRoadmap);
                  } catch (error) {
                    setError('Ошибка загрузки примера: ' + error.message);
                  }
                }}
              >
                <span>📜</span>
                <h4>JavaScript Developer</h4>
                <p>5 тем для изучения</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="roadmap-header">
        <div>
          <h1>{localRoadmap.title}</h1>
          <p className="roadmap-description">{localRoadmap.description}</p>
        </div>
        {/* УБРАЛИ КНОПКУ ЭКСПОРТА */}
      </div>

      <ProgressBar 
        progress={progress} 
        stats={stats}
      />

      <QuickActions 
        roadmap={localRoadmap}
        onUpdateAllTopics={handleUpdateAllTopics}
      />

      {/* Блок поиска и фильтров */}
      <div className="search-container">
        <div className="search-box">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск по названию, описанию или заметкам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Очистить поиск"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="search-stats">
            <span className="search-results">
              Найдено: <strong>{filteredTopics.length}</strong> из {totalTopics}
            </span>
            
            {searchQuery && filteredTopics.length === 0 && (
              <span className="no-results">
                😔 По запросу "{searchQuery}" ничего не найдено
              </span>
            )}
          </div>
        </div>

        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Все ({totalTopics})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            ✅ Выполнено ({stats.completed})
          </button>
          <button 
            className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            🔄 В работе ({stats.inProgress})
          </button>
          <button 
            className={`filter-btn ${filter === 'not-started' ? 'active' : ''}`}
            onClick={() => setFilter('not-started')}
          >
            ⏳ Не начато ({stats.notStarted})
          </button>
        </div>
      </div>

      <div className="technologies-grid">
        {filteredTopics.length > 0 ? (
          filteredTopics.map(topic => (
            <div key={topic.id} className="card-container" id={`topic-${topic.id}`}>
              <TechnologyCard 
                topic={topic} 
                searchQuery={searchQuery}
              />
              <div className="quick-actions">
                <select 
                  value={topic.status}
                  onChange={(e) => handleStatusChange(topic.id, e.target.value)}
                  className="status-select"
                >
                  <option value="not-started">⏳ Не начато</option>
                  <option value="in-progress">🔄 В работе</option>
                  <option value="completed">✅ Выполнено</option>
                </select>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results-message">
            {searchQuery || filter !== 'all' ? (
              <>
                <h3>😔 Ничего не найдено</h3>
                <p>
                  {searchQuery 
                    ? `По запросу "${searchQuery}" ничего не найдено` 
                    : `В категории "${getFilterLabel(filter)}" нет тем`}
                </p>
                <button 
                  className="reset-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                >
                  Сбросить поиск и фильтры
                </button>
              </>
            ) : (
              <>
                <h3>📋 Нет тем для отображения</h3>
                <p>Загрузите дорожную карту чтобы начать работу</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Вспомогательная функция для получения метки фильтра
function getFilterLabel(filter) {
  switch(filter) {
    case 'completed': return 'Выполнено';
    case 'in-progress': return 'В работе';
    case 'not-started': return 'Не начато';
    default: return 'Все';
  }
}

export default HomePage;