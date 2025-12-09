import React from 'react';
import { Link } from 'react-router-dom';
import './TechnologyCard.css';

function TechnologyCard({ topic }) {
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

  const statusConfig = getStatusConfig(topic.status);

  return (
    <Link to={`/topic/${topic.id}`} className="technology-card-link">
      <div className={`technology-card ${statusConfig.className}`}>
        <div className="card-header">
          <h3 className="card-title">{topic.title}</h3>
          <span className="status-icon">{statusConfig.icon}</span>
        </div>
        
        <p className="card-description">
          {topic.description.length > 100 
            ? `${topic.description.substring(0, 100)}...` 
            : topic.description}
        </p>
        
        {topic.userNotes && (
          <div className="card-notes-preview">
            <span className="notes-icon">📝</span>
            <span>Есть заметки</span>
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