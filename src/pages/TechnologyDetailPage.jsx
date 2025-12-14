import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './TechnologyDetailPage.css';

const TechnologyDetailPage = ({ technologies, updateStatus, updateNotes }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [technology, setTechnology] = useState(null);
  const [editedNotes, setEditedNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    const foundTech = technologies.find(t => t.id === parseInt(id));
    if (foundTech) {
      setTechnology(foundTech);
      setEditedNotes(foundTech.notes || '');
      setDeadline(foundTech.deadline || '');
    }
  }, [id, technologies]);

  const handleSaveNotes = () => {
    if (technology) {
      updateNotes(technology.id, editedNotes);
      setIsEditing(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (technology) {
      updateStatus(technology.id, newStatus);
      setTechnology({ ...technology, status: newStatus });
    }
  };

  const handleDeadlineChange = (e) => {
    setDeadline(e.target.value);
    if (technology) {
      // Здесь можно добавить сохранение дедлайна
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Удалить технологию "${technology?.title}"?`)) {
      // Здесь можно добавить логику удаления
      navigate('/technologies');
    }
  };

  if (!technology) {
    return (
      <div className="not-found">
        <h1>Технология не найдена</h1>
        <p>Технология с ID {id} не существует или была удалена.</p>
        <Link to="/technologies" className="back-link">
          ← Вернуться к списку технологий
        </Link>
      </div>
    );
  }

  return (
    <div className="technology-detail-page">
      <div className="page-header">
        <Link to="/technologies" className="back-link">
          ← Назад к списку
        </Link>
        <div className="header-actions">
          <button 
            className="action-button edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '✕ Отмена' : '✏️ Редактировать'}
          </button>
          <button 
            className="action-button delete-button"
            onClick={handleDelete}
          >
            🗑️ Удалить
          </button>
        </div>
      </div>

      <div className="technology-content">
        <div className="main-info">
          <div className="title-section">
            <h1 className="tech-title">{technology.title}</h1>
            <div className="status-badge" data-status={technology.status}>
              {technology.status === 'completed' && '✅ Завершено'}
              {technology.status === 'in-progress' && '🔄 В процессе'}
              {technology.status === 'not-started' && '⭕ Не начато'}
            </div>
          </div>

          {technology.category && (
            <div className="category-badge">
              {technology.category}
            </div>
          )}

          <div className="description-section">
            <h3>📝 Описание</h3>
            <p className="description">{technology.description}</p>
          </div>

          {technology.resources && technology.resources.length > 0 && (
            <div className="resources-section">
              <h3>🔗 Полезные ресурсы</h3>
              <ul className="resources-list">
                {technology.resources.map((resource, index) => (
                  <li key={index} className="resource-item">
                    <a 
                      href={resource} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      {resource}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="status-control">
            <h3>📊 Статус изучения</h3>
            <div className="status-buttons">
              <button 
                className={`status-btn ${technology.status === 'not-started' ? 'active' : ''}`}
                onClick={() => handleStatusChange('not-started')}
              >
                ⭕ Не начато
              </button>
              <button 
                className={`status-btn ${technology.status === 'in-progress' ? 'active' : ''}`}
                onClick={() => handleStatusChange('in-progress')}
              >
                🔄 В процессе
              </button>
              <button 
                className={`status-btn ${technology.status === 'completed' ? 'active' : ''}`}
                onClick={() => handleStatusChange('completed')}
              >
                ✅ Завершено
              </button>
            </div>
          </div>

          <div className="deadline-control">
            <h3>📅 Срок изучения</h3>
            <input
              type="date"
              value={deadline}
              onChange={handleDeadlineChange}
              className="deadline-input"
            />
            {deadline && (
              <div className="deadline-info">
                Осталось: {Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))} дней
              </div>
            )}
          </div>

          <div className="notes-section">
            <h3>📝 Мои заметки</h3>
            {isEditing ? (
              <>
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="notes-textarea"
                  placeholder="Добавьте свои заметки, конспект, полезные команды..."
                  rows="8"
                />
                <div className="notes-actions">
                  <button 
                    className="save-button"
                    onClick={handleSaveNotes}
                  >
                    💾 Сохранить
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setEditedNotes(technology.notes || '');
                      setIsEditing(false);
                    }}
                  >
                    ✕ Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="notes-content">
                  {technology.notes ? technology.notes : 'Заметок пока нет...'}
                </div>
                <button 
                  className="edit-notes-button"
                  onClick={() => setIsEditing(true)}
                >
                  {technology.notes ? '✏️ Редактировать заметки' : '✏️ Добавить заметки'}
                </button>
              </>
            )}
          </div>

          <div className="meta-info">
            <h3>📋 Информация</h3>
            <div className="meta-item">
              <span className="meta-label">Создано:</span>
              <span className="meta-value">
                {new Date(technology.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Обновлено:</span>
              <span className="meta-value">
                {new Date(technology.updatedAt).toLocaleDateString()}
              </span>
            </div>
            {technology.difficulty && (
              <div className="meta-item">
                <span className="meta-label">Сложность:</span>
                <span className="meta-value difficulty">
                  {technology.difficulty === 'beginner' && '👶 Начинающий'}
                  {technology.difficulty === 'intermediate' && '👍 Средний'}
                  {technology.difficulty === 'advanced' && '🏆 Продвинутый'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyDetailPage;