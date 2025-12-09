import React from 'react';
import './QuickActions.css';

function QuickActions({ roadmap, onUpdateAllTopics }) {
  // 1. Отметить все как выполненные
  const markAllAsCompleted = () => {
    if (!roadmap || !roadmap.topics) return;
    
    const updatedTopics = roadmap.topics.map(topic => ({
      ...topic,
      status: 'completed',
      completedDate: topic.status !== 'completed' ? 
        new Date().toISOString().split('T')[0] : 
        topic.completedDate
    }));
    
    onUpdateAllTopics(updatedTopics);
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
                  .toISOString().split('T')[0] // +7 дней
            }
          : topic
      );
      
      onUpdateAllTopics(updatedTopics);
      
      // Прокручиваем к выбранной теме
      setTimeout(() => {
        const element = document.getElementById(`topic-${randomTopic.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Добавляем подсветку
          element.classList.add('highlighted');
          setTimeout(() => element.classList.remove('highlighted'), 2000);
        }
      }, 100);
    }
  };

  // 4. Дополнительная фича: Поменять местами статусы выполненных/не выполненных
  const invertStatuses = () => {
    if (!roadmap || !roadmap.topics) return;
    
    const updatedTopics = roadmap.topics.map(topic => {
      let newStatus;
      if (topic.status === 'completed') {
        newStatus = 'not-started';
      } else if (topic.status === 'not-started') {
        newStatus = 'completed';
      } else {
        newStatus = 'in-progress'; // Оставляем "в работе" как есть
      }
      
      return {
        ...topic,
        status: newStatus,
        completedDate: newStatus === 'completed' ? 
          new Date().toISOString().split('T')[0] : 
          null
      };
    });
    
    onUpdateAllTopics(updatedTopics);
  };

  if (!roadmap) {
    return null; // Не показываем если нет roadmap
  }

  return (
    <div className="quick-actions-container">
      <h3 className="actions-title">⚡ Быстрые действия</h3>
      
      <div className="actions-grid">
        <button 
          onClick={markAllAsCompleted}
          className="action-btn completed-action"
          title="Отметить все темы как выполненные"
        >
          <span className="action-icon">✅</span>
          <span className="action-text">Все выполнено</span>
        </button>
        
        <button 
          onClick={resetAllStatuses}
          className="action-btn reset-action"
          title="Сбросить все статусы на 'Не начато'"
        >
          <span className="action-icon">🔄</span>
          <span className="action-text">Сбросить всё</span>
        </button>
        
        <button 
          onClick={selectRandomTopic}
          className="action-btn random-action"
          title="Выбрать случайную тему для изучения"
        >
          <span className="action-icon">🎲</span>
          <span className="action-text">Случайный выбор</span>
        </button>
        
        <button 
          onClick={invertStatuses}
          className="action-btn invert-action"
          title="Поменять местами выполненные и не выполненные"
        >
          <span className="action-icon">🔄</span>
          <span className="action-text">Инвертировать</span>
        </button>
      </div>
    </div>
  );
}

export default QuickActions;