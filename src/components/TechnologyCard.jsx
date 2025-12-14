import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TechnologyCard.css';

const TechnologyCard = ({ technology, onStatusChange }) => {
  const navigate = useNavigate();
  
  const { id, title, description, status, notes, category } = technology;
  
  const statusColors = {
    'not-started': '#ff6b6b',
    'in-progress': '#cac056ff',
    'completed': '#45ce7cff'
  };
  
  const statusIcons = {
    'not-started': '⭕',
    'in-progress': '🔄',
    'completed': '✅'
  };
  
  const statusTexts = {
    'not-started': 'Не начато',
    'in-progress': 'В процессе',
    'completed': 'Завершено'
  };
  
  const handleStatusClick = (e) => {
    e.stopPropagation();
    if (!onStatusChange) return;
    
    const statusOrder = ['not-started', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    onStatusChange(id, statusOrder[nextIndex]);
  };
  
  const handleCardClick = () => {
    navigate(`/technology/${id}`);
  };
  
  return (
    <div 
      className="technology-card"
      onClick={handleCardClick}
      style={{ borderLeftColor: statusColors[status] }}
      data-status={status}
    >
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <button 
          className="status-button"
          onClick={handleStatusClick}
          aria-label={`Изменить статус: ${status}`}
          title="Кликните для изменения статуса"
        >
          <span className="status-icon">
            {statusIcons[status]}
          </span>
          <span className="status-text">
            {statusTexts[status]}
          </span>
        </button>
      </div>
      
      <p className="card-description">{description}</p>
      
      {category && (
        <div className="category">
          <span className="category-badge">{category}</span>
        </div>
      )}
      
      {notes && (
        <div className="notes-preview">
          <span className="notes-icon">📝</span>
          {notes.substring(0, 50)}...
        </div>
      )}
      
      <div className="card-footer">
        <button 
          className="details-button"
          onClick={handleCardClick}
        >
          Подробнее →
        </button>
      </div>
    </div>
  );
};

export default TechnologyCard;