import React from 'react';
import './StatisticsPage.css';

const StatisticsPage = ({ technologies, progress }) => {
  // Группировка по категориям
  const categories = {};
  technologies.forEach(tech => {
    const category = tech.category || 'Без категории';
    if (!categories[category]) {
      categories[category] = {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0
      };
    }
    
    categories[category].total++;
    categories[category][tech.status]++;
  });

  // Группировка по сложности
  const difficulties = {};
  technologies.forEach(tech => {
    const difficulty = tech.difficulty || 'Не указана';
    if (!difficulties[difficulty]) {
      difficulties[difficulty] = {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0
      };
    }
    
    difficulties[difficulty].total++;
    difficulties[difficulty][tech.status]++;
  });

  // Последние обновленные технологии
  const recentTechnologies = [...technologies]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  // Технологии с заметками
  const technologiesWithNotes = technologies.filter(t => t.notes).length;

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>Статистика изучения</h1>
        <p className="page-subtitle">Анализ вашего прогресса в освоении технологий</p>
      </div>

      <div className="overview-cards">
        <div className="overview-card">
          <div className="overview-icon">📚</div>
          <div className="overview-content">
            <h3>Всего технологий</h3>
            <div className="overview-value">{progress.total}</div>
          </div>
        </div>
        
        <div className="overview-card">
          <div className="overview-icon">✅</div>
          <div className="overview-content">
            <h3>Завершено</h3>
            <div className="overview-value">{progress.completed}</div>
          </div>
        </div>
        
        <div className="overview-card">
          <div className="overview-icon">🔄</div>
          <div className="overview-content">
            <h3>В процессе</h3>
            <div className="overview-value">{progress.inProgress}</div>
          </div>
        </div>
        
        <div className="overview-card">
          <div className="overview-icon">📝</div>
          <div className="overview-content">
            <h3>С заметками</h3>
            <div className="overview-value">{technologiesWithNotes}</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <h3>Прогресс по категориям</h3>
          <div className="categories-stats">
            {Object.entries(categories).map(([category, stats]) => (
              <div key={category} className="category-item">
                <div className="category-header">
                  <span className="category-name">{category}</span>
                  <span className="category-count">{stats.total}</span>
                </div>
                <div className="category-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill completed"
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    ></div>
                    <div 
                      className="progress-fill in-progress"
                      style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="progress-stats">
                    <span>✅ {stats.completed} | 🔄 {stats.inProgress} | ⭕ {stats.notStarted}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <h3>Распределение по сложности</h3>
          <div className="difficulty-stats">
            {Object.entries(difficulties).map(([difficulty, stats]) => {
              const difficultyText = {
                'beginner': 'Начинающий',
                'intermediate': 'Средний',
                'advanced': 'Продвинутый',
                'Не указана': 'Не указана'
              };
              
              return (
                <div key={difficulty} className="difficulty-item">
                  <div className="difficulty-header">
                    <span className="difficulty-name">{difficultyText[difficulty]}</span>
                    <span className="difficulty-percentage">
                      {Math.round((stats.completed / stats.total) * 100)}%
                    </span>
                  </div>
                  <div className="difficulty-details">
                    <div className="difficulty-bar">
                      <div 
                        className="difficulty-fill"
                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="difficulty-counts">
                      <span>✅ {stats.completed} | 🔄 {stats.inProgress} | ⭕ {stats.notStarted}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="recent-section">
        <div className="stats-card">
          <h3>Недавно обновленные</h3>
          {recentTechnologies.length > 0 ? (
            <div className="recent-list">
              {recentTechnologies.map(tech => (
                <div key={tech.id} className="recent-item">
                  <div className="recent-info">
                    <span className="recent-title">{tech.title}</span>
                    <span className={`recent-status status-${tech.status}`}>
                      {tech.status === 'completed' && '✅ Завершено'}
                      {tech.status === 'in-progress' && '🔄 В процессе'}
                      {tech.status === 'not-started' && '⭕ Не начато'}
                    </span>
                  </div>
                  <div className="recent-time">
                    Обновлено: {new Date(tech.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Нет данных о недавних обновлениях
            </div>
          )}
        </div>

        <div className="stats-card">
          <h3>Общая статистика</h3>
          <div className="general-stats">
            <div className="stat-item">
              <span className="stat-label">Средний прогресс:</span>
              <span className="stat-value">{progress.percentage}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Технологий в день (цель):</span>
              <span className="stat-value">
                {progress.total > 0 ? Math.round(progress.total / 30) : 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Дней до завершения всех:</span>
              <span className="stat-value">
                {progress.notStarted > 0 ? Math.round(progress.notStarted * 7) : '🎉 Готово!'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Процент с заметками:</span>
              <span className="stat-value">
                {progress.total > 0 ? Math.round((technologiesWithNotes / progress.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;