import React from 'react';
import { Link } from 'react-router-dom';
import './TechnologyCard.css';

function TechnologyCard({ topic, searchQuery = '' }) {
  // Определяем иконку в зависимости от статуса
  const getStatusConfig = (status) => {
    switch(status) {
      case 'completed':
        return { 
          icon: '✅', 
          label: 'Выполнено',
          className: 'completed'
        };
      case 'in-progress':
        return { 
          icon: '🔄', 
          label: 'В работе',
          className: 'in-progress'
        };
      default:
        return { 
          icon: '⏳', 
          label: 'Не начато',
          className: 'not-started'
        };
    }
  };

  // Функция для подсветки совпадений в тексте
  const highlightText = (text) => {
    if (!searchQuery.trim() || !text) return text;
    
    const query = searchQuery.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Если нет совпадений, возвращаем обычный текст
    if (!textLower.includes(query)) return text;
    
    // Регулярное выражение для поиска и замены с сохранением регистра
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  };

  const statusConfig = getStatusConfig(topic.status);

  // Форматируем описание с учетом длины
  const formatDescription = (description) => {
    if (description.length > 100) {
      return `${description.substring(0, 100)}...`;
    }
    return description;
  };

  return (
    <Link to={`/topic/${topic.id}`} className="technology-card-link">
      <div className={`technology-card ${statusConfig.className}`}>
        <div className="card-header">
          <h3 
            className="card-title"
            dangerouslySetInnerHTML={{
              __html: highlightText(topic.title)
            }}
          />
          <span className="status-icon">{statusConfig.icon}</span>
        </div>
        
        <p 
          className="card-description"
          dangerouslySetInnerHTML={{
            __html: highlightText(formatDescription(topic.description))
          }}
        />
        
        {topic.userNotes && (
          <div className="card-notes-preview">
            <span className="notes-icon">📝</span>
            <span 
              className="notes-text"
              dangerouslySetInnerHTML={{
                __html: highlightText(topic.userNotes.length > 50 
                  ? `${topic.userNotes.substring(0, 50)}...` 
                  : topic.userNotes)
              }}
            />
          </div>
        )}
        
        <div className="card-footer">
          <span className={`status-badge ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
          
          {topic.targetDate && (
            <span className="date-indicator">
              📅 {new Date(topic.targetDate).toLocaleDateString('ru-RU')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default TechnologyCard;