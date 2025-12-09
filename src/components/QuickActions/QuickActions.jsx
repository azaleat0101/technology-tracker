import React, { useState } from 'react';
import './QuickActions.css';

function QuickActions({ roadmap, onUpdateAllTopics }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState('');

  // 1. Отметить все как выполненные
  const markAllAsCompleted = () => {
    if (!roadmap || !roadmap.topics) return;
    
    const updatedTopics = roadmap.topics.map(topic => ({
      ...topic,
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0]
    }));
    
    onUpdateAllTopics(updatedTopics);
    alert('✅ Все темы отмечены как выполненные!');
  };

  // 2. Сбросить все статусы
  const resetAllStatuses = () => {
    if (!roadmap || !roadmap.topics) return;
    
    const updatedTopics = roadmap.topics.map(topic => ({
      ...topic,
      status: 'not-started',
      completedDate: null
    }));
    
    onUpdateAllTopics(updatedTopics);
    alert('🔄 Все статусы сброшены!');
  };

  // 3. Случайный выбор следующей технологии
  const selectRandomTopic = () => {
    if (!roadmap || !roadmap.topics) return;
    
    // Фильтруем темы, которые еще не выполнены
    const notCompletedTopics = roadmap.topics.filter(
      topic => topic.status !== 'completed'
    );
    
    if (notCompletedTopics.length === 0) {
      alert('🎉 Все темы уже выполнены!');
      return;
    }
    
    // Выбираем случайную тему
    const randomIndex = Math.floor(Math.random() * notCompletedTopics.length);
    const randomTopic = notCompletedTopics[randomIndex];
    
    // Показываем уведомление с предложением
    const userChoice = window.confirm(
      `🎲 Случайный выбор предлагает:\n\n` +
      `📚 Тема: ${randomTopic.title}\n` +
      `📝 ${randomTopic.description.substring(0, 100)}...\n\n` +
      `Хотите отметить её как "В работе"?`
    );
    
    if (userChoice) {
      const updatedTopics = roadmap.topics.map(topic => 
        topic.id === randomTopic.id 
          ? { 
              ...topic, 
              status: 'in-progress',
              targetDate: topic.targetDate || 
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString().split('T')[0]
            }
          : topic
      );
      
      onUpdateAllTopics(updatedTopics);
      
      // Прокручиваем к выбранной теме
      setTimeout(() => {
        const element = document.getElementById(`topic-${randomTopic.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlighted');
          setTimeout(() => element.classList.remove('highlighted'), 2000);
        }
      }, 100);
    }
  };

  // 4. Экспорт данных
  const handleExport = () => {
    if (!roadmap) return;
    
    const exportObj = {
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      roadmap: {
        ...roadmap,
        exportedFrom: 'Technology Tracker App',
        totalTopics: roadmap.topics.length,
        completedTopics: roadmap.topics.filter(t => t.status === 'completed').length,
        progress: Math.round((roadmap.topics.filter(t => t.status === 'completed').length / roadmap.topics.length) * 100)
      }
    };
    
    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `technology-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 5. Подтверждение действий
  const confirmAction = (type) => {
    setActionType(type);
    setShowConfirmModal(true);
  };

  const executeConfirmedAction = () => {
    switch(actionType) {
      case 'complete-all':
        markAllAsCompleted();
        break;
      case 'reset-all':
        resetAllStatuses();
        break;
      default:
        break;
    }
    setShowConfirmModal(false);
  };

  if (!roadmap) {
    return null;
  }

  const stats = {
    total: roadmap.topics.length,
    completed: roadmap.topics.filter(t => t.status === 'completed').length,
    inProgress: roadmap.topics.filter(t => t.status === 'in-progress').length,
    notStarted: roadmap.topics.filter(t => t.status === 'not-started').length
  };

  return (
    <div className="quick-actions-container">
      <h3 className="actions-title">⚡ Быстрые действия</h3>
      
      <div className="actions-grid">
        <button 
          onClick={() => confirmAction('complete-all')}
          className="action-btn completed-action"
        >
          <span className="action-icon">✅</span>
          <span className="action-text">Все выполнено</span>
        </button>
        
        <button 
          onClick={() => confirmAction('reset-all')}
          className="action-btn reset-action"
        >
          <span className="action-icon">🔄</span>
          <span className="action-text">Сбросить всё</span>
        </button>
        
        <button 
          onClick={selectRandomTopic}
          className="action-btn random-action"
        >
          <span className="action-icon">🎲</span>
          <span className="action-text">Случайный выбор</span>
        </button>
        
        <button 
          onClick={handleExport}
          className="action-btn export-action"
        >
          <span className="action-icon">📤</span>
          <span className="action-text">Экспорт данных</span>
        </button>
      </div>
      
      <div className="actions-stats">
        <div className="stat-item">
          <span className="stat-label">Всего тем:</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Не начато:</span>
          <span className="stat-value">{stats.notStarted}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">В работе:</span>
          <span className="stat-value">{stats.inProgress}</span>
        </div>
      </div>
      
      {/* Модальное окно подтверждения */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Подтверждение действия</h3>
            <p className="confirm-message">
              {actionType === 'complete-all' 
                ? 'Вы уверены, что хотите отметить ВСЕ темы как выполненные?'
                : 'Вы уверены, что хотите сбросить ВСЕ статусы на "Не начато"?'
              }
            </p>
            <p className="confirm-warning">⚠️ Это действие нельзя отменить!</p>
            <div className="modal-actions">
              <button 
                onClick={executeConfirmedAction}
                className="btn btn-danger"
              >
                Да, продолжить
              </button>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickActions;