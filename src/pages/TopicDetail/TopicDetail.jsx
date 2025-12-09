import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import './TopicDetail.css';

function TopicDetail({ roadmap, onTopicUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (roadmap && id) {
      const foundTopic = roadmap.topics.find(t => t.id.toString() === id);
      if (foundTopic) {
        setTopic(foundTopic);
        setUserNotes(foundTopic.userNotes || '');
        setTargetDate(foundTopic.targetDate || '');
      }
    }
  }, [roadmap, id]);

  const handleStatusChange = (newStatus) => {
    const updatedTopics = roadmap.topics.map(t => 
      t.id === topic.id 
        ? { 
            ...t, 
            status: newStatus,
            completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : t.completedDate
          }
        : t
    );
    
    const updatedRoadmap = { ...roadmap, topics: updatedTopics };
    onTopicUpdate(updatedRoadmap);
    setTopic(updatedTopics.find(t => t.id === topic.id));
    storageService.saveRoadmap(roadmap.id, updatedRoadmap);
  };

  const handleSaveNotes = () => {
    const updatedTopics = roadmap.topics.map(t => 
      t.id === topic.id 
        ? { 
            ...t, 
            userNotes, 
            targetDate: targetDate || null,
            status: targetDate && !t.completedDate ? 'in-progress' : t.status
          }
        : t
    );
    
    const updatedRoadmap = { ...roadmap, topics: updatedTopics };
    onTopicUpdate(updatedRoadmap);
    storageService.saveRoadmap(roadmap.id, updatedRoadmap);
    setIsEditing(false);
  };

  if (!topic) {
    return (
      <div className="topic-detail">
        <div className="not-found">
          <h2>Тема не найдена</h2>
          <button onClick={() => navigate('/')} className="back-button">
            ← На главную
          </button>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch(status) {
      case 'completed':
        return { label: '✅ Выполнено', className: 'completed' };
      case 'in-progress':
        return { label: '🔄 В работе', className: 'in-progress' };
      default:
        return { label: '⏳ Не начато', className: 'not-started' };
    }
  };

  const statusConfig = getStatusConfig(topic.status);

  return (
    <div className="topic-detail">
      <button onClick={() => navigate('/')} className="back-button">
        ← Назад к списку
      </button>

      <div className="topic-header">
        <h1>{topic.title}</h1>
        <div className="topic-status">
          <span className={`status-badge ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
          <div className="status-controls">
            <button 
              onClick={() => handleStatusChange('not-started')}
              className={`status-btn ${topic.status === 'not-started' ? 'active' : ''}`}
              title="Не начато"
            >
              ⏳
            </button>
            <button 
              onClick={() => handleStatusChange('in-progress')}
              className={`status-btn ${topic.status === 'in-progress' ? 'active' : ''}`}
              title="В работе"
            >
              🔄
            </button>
            <button 
              onClick={() => handleStatusChange('completed')}
              className={`status-btn ${topic.status === 'completed' ? 'active' : ''}`}
              title="Выполнено"
            >
              ✅
            </button>
          </div>
        </div>
      </div>

      <div className="topic-content">
        <div className="description-section">
          <h3>📖 Описание темы</h3>
          <p>{topic.description}</p>
        </div>

        {topic.links && topic.links.length > 0 && (
          <div className="links-section">
            <h3>🔗 Полезные ссылки</h3>
            <ul>
              {topic.links.map((link, index) => (
                <li key={index}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="notes-section">
          <div className="section-header">
            <h3>📝 Ваши заметки</h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="edit-button">
                ✏️ Редактировать
              </button>
            ) : (
              <button onClick={handleSaveNotes} className="save-button">
                💾 Сохранить
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="edit-notes">
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Добавьте свои заметки по этой теме..."
                rows={6}
                className="notes-textarea"
              />
              
              <div className="date-input">
                <label>Желаемая дата завершения:</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="date-picker"
                />
              </div>
            </div>
          ) : (
            <div className="display-notes">
              {userNotes ? (
                <p className="notes-content">{userNotes}</p>
              ) : (
                <p className="no-notes">Заметок пока нет. Нажмите "Редактировать", чтобы добавить.</p>
              )}
              
              {topic.targetDate && (
                <div className="date-info">
                  <strong>Целевая дата:</strong> {new Date(topic.targetDate).toLocaleDateString('ru-RU')}
                </div>
              )}
              
              {topic.completedDate && (
                <div className="date-info">
                  <strong>Завершено:</strong> {new Date(topic.completedDate).toLocaleDateString('ru-RU')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopicDetail;