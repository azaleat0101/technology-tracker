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

  const handleFileLoaded = async (file) => {
    try {
      const roadmapData = await roadmapService.loadRoadmapFromFile(file);
      onRoadmapLoaded(roadmapData);
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleExport = () => {
    if (roadmap) {
      roadmapService.exportRoadmap(roadmap);
    }
  };

  const handleStatusChange = (topicId, newStatus) => {
    const updatedTopics = roadmap.topics.map(topic => 
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
      ...roadmap,
      topics: updatedTopics
    };
    
    onTopicUpdate(updatedRoadmap);
    storageService.saveRoadmap(roadmap.id, updatedRoadmap);
  };

  // НОВАЯ ФУНКЦИЯ: Обновление всех тем
  const handleUpdateAllTopics = (updatedTopics) => {
    const updatedRoadmap = {
      ...roadmap,
      topics: updatedTopics
    };
    
    onTopicUpdate(updatedRoadmap);
    storageService.saveRoadmap(roadmap.id, updatedRoadmap);
  };

  const filteredTopics = roadmap?.topics.filter(topic => {
    if (filter === 'all') return true;
    return topic.status === filter;
  }) || [];

  if (!roadmap) {
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
                onClick={() => {
                  fetch('/roadmaps/react-roadmap.json')
                    .then(res => res.json())
                    .then(data => onRoadmapLoaded(data));
                }}
              >
                <span>⚛️</span>
                <h4>React Developer</h4>
                <p>4 темы для изучения</p>
              </button>
              
              <button 
                className="sample-card"
                onClick={() => {
                  fetch('/roadmaps/javascript-roadmap.json')
                    .then(res => res.json())
                    .then(data => onRoadmapLoaded(data));
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

  const progress = roadmapService.calculateProgress(roadmap.topics);
  const stats = roadmapService.getStats(roadmap.topics);

  return (
    <div className="home-page">
      <div className="roadmap-header">
        <div>
          <h1>{roadmap.title}</h1>
          <p className="roadmap-description">{roadmap.description}</p>
        </div>
        <button className="export-button" onClick={handleExport}>
          📥 Экспортировать прогресс
        </button>
      </div>

      <ProgressBar progress={progress} stats={stats} />

      {/* НОВЫЙ КОМПОНЕНТ БЫСТРЫХ ДЕЙСТВИЙ */}
      <QuickActions 
        roadmap={roadmap}
        onUpdateAllTopics={handleUpdateAllTopics}
      />

      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все ({roadmap.topics.length})
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

      <div className="technologies-grid">
        {filteredTopics.map(topic => (
          <div key={topic.id} className="card-container" id={`topic-${topic.id}`}>
            <TechnologyCard topic={topic} />
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
        ))}
      </div>
    </div>
  );
}

export default HomePage;