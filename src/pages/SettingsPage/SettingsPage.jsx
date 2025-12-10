import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import './SettingsPage.css';

function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'ru',
    notifications: true,
    autoSave: true,
    exportFormat: 'json',
    fontSize: 'medium',
    showCompleted: true,
    showStats: true,
    defaultView: 'grid'
  });
  
  const [roadmaps, setRoadmaps] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    // Загружаем сохраненные настройки
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Загружаем список дорожных карт
    loadRoadmapsList();
  }, []);

  const loadRoadmapsList = () => {
    const roadmapsList = [];
    
    // Получаем все ключи из localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('roadmap_')) {
        try {
          const roadmapData = JSON.parse(localStorage.getItem(key));
          roadmapsList.push({
            id: roadmapData.id,
            title: roadmapData.title,
            description: roadmapData.description,
            topicsCount: roadmapData.topics?.length || 0,
            createdAt: roadmapData.createdAt || 'Неизвестно',
            lastModified: new Date().toLocaleDateString('ru-RU'),
            size: localStorage.getItem(key).length
          });
        } catch (error) {
          console.error(`Ошибка при загрузке roadmap ${key}:`, error);
        }
      }
    }
    
    setRoadmaps(roadmapsList);
  };

  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    
    // Применяем настройки в реальном времени
    applySettings(newSettings);
  };

  const applySettings = (newSettings) => {
    // Применение темы
    document.documentElement.setAttribute('data-theme', newSettings.theme);
    
    // Применение размера шрифта
    document.documentElement.style.fontSize = {
      'small': '14px',
      'medium': '16px',
      'large': '18px'
    }[newSettings.fontSize] || '16px';
  };

  const handleExportAll = () => {
    const allData = {
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      settings: settings,
      roadmaps: roadmaps.map(roadmap => ({
        ...roadmap,
        data: storageService.loadRoadmap(roadmap.id)
      }))
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `technology-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        
        if (backupData.settings) {
          setSettings(backupData.settings);
          localStorage.setItem('appSettings', JSON.stringify(backupData.settings));
        }
        
        if (backupData.roadmaps) {
          backupData.roadmaps.forEach(roadmap => {
            if (roadmap.data) {
              storageService.saveRoadmap(roadmap.data.id, roadmap.data);
            }
          });
          
          alert(`Импортировано ${backupData.roadmaps.length} дорожных карт`);
          loadRoadmapsList();
        }
      } catch (error) {
        alert('Ошибка при импорте файла: неверный формат');
      }
    };
    
    reader.readAsText(file);
  };

  const confirmAction = (type) => {
    setActionType(type);
    setShowConfirm(true);
  };

  const executeAction = () => {
    switch(actionType) {
      case 'clear-data':
        // Сохраняем текущую дорожную карту
        const currentRoadmapId = localStorage.getItem('currentRoadmapId');
        const currentRoadmap = currentRoadmapId ? storageService.loadRoadmap(currentRoadmapId) : null;
        
        // Очищаем localStorage
        localStorage.clear();
        
        // Восстанавливаем настройки по умолчанию
        localStorage.setItem('appSettings', JSON.stringify(settings));
        
        // Восстанавливаем текущую дорожную карту
        if (currentRoadmap) {
          storageService.saveRoadmap(currentRoadmapId, currentRoadmap);
          localStorage.setItem('currentRoadmapId', currentRoadmapId);
        }
        
        loadRoadmapsList();
        alert('Все данные, кроме текущей карты, были очищены');
        break;
        
      case 'reset-settings':
        const defaultSettings = {
          theme: 'light',
          language: 'ru',
          notifications: true,
          autoSave: true,
          exportFormat: 'json',
          fontSize: 'medium',
          showCompleted: true,
          showStats: true,
          defaultView: 'grid'
        };
        
        setSettings(defaultSettings);
        localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
        applySettings(defaultSettings);
        alert('Настройки сброшены к значениям по умолчанию');
        break;
        
      default:
        break;
    }
    
    setShowConfirm(false);
  };

  const deleteRoadmap = (roadmapId) => {
    if (roadmapId === localStorage.getItem('currentRoadmapId')) {
      if (!window.confirm('Вы собираетесь удалить текущую дорожную карту. Продолжить?')) {
        return;
      }
      localStorage.removeItem('currentRoadmapId');
    }
    
    storageService.removeRoadmap(roadmapId);
    loadRoadmapsList();
    alert('Дорожная карта удалена');
  };

  const switchRoadmap = (roadmapId) => {
    const roadmap = storageService.loadRoadmap(roadmapId);
    if (roadmap) {
      localStorage.setItem('currentRoadmapId', roadmapId);
      alert(`Активная карта изменена на: ${roadmap.title}`);
      navigate('/');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button 
          onClick={() => navigate('/')}
          className="back-btn"
        >
          ← Назад
        </button>
        <h1>⚙️ Настройки приложения</h1>
      </div>

      <div className="settings-sections">
        {/* Секция внешнего вида */}
        <div className="settings-section">
          <h2>🎨 Внешний вид</h2>
          
          <div className="setting-item">
            <label>Тема оформления:</label>
            <select 
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="setting-select"
            >
              <option value="light">Светлая</option>
              <option value="dark">Темная</option>
              <option value="auto">Авто</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>Размер шрифта:</label>
            <div className="setting-buttons">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  className={`size-btn ${settings.fontSize === size ? 'active' : ''}`}
                  onClick={() => handleSettingChange('fontSize', size)}
                >
                  {size === 'small' ? 'Маленький' : 
                   size === 'medium' ? 'Средний' : 'Большой'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="setting-item">
            <label>Язык интерфейса:</label>
            <select 
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="setting-select"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Секция поведения */}
        <div className="settings-section">
          <h2>⚡ Поведение</h2>
          
          <div className="setting-item toggle">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
              <span>Уведомления о прогрессе</span>
            </label>
          </div>
          
          <div className="setting-item toggle">
            <label>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              />
              <span>Автосохранение изменений</span>
            </label>
          </div>
          
          <div className="setting-item toggle">
            <label>
              <input
                type="checkbox"
                checked={settings.showCompleted}
                onChange={(e) => handleSettingChange('showCompleted', e.target.checked)}
              />
              <span>Показывать выполненные темы</span>
            </label>
          </div>
          
          <div className="setting-item toggle">
            <label>
              <input
                type="checkbox"
                checked={settings.showStats}
                onChange={(e) => handleSettingChange('showStats', e.target.checked)}
              />
              <span>Показывать статистику на главной</span>
            </label>
          </div>
          
          <div className="setting-item">
            <label>Формат экспорта:</label>
            <select 
              value={settings.exportFormat}
              onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
              className="setting-select"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF (в разработке)</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>Вид по умолчанию:</label>
            <select 
              value={settings.defaultView}
              onChange={(e) => handleSettingChange('defaultView', e.target.value)}
              className="setting-select"
            >
              <option value="grid">Сетка</option>
              <option value="list">Список</option>
              <option value="timeline">Таймлайн</option>
            </select>
          </div>
        </div>

        {/* Секция управления данными */}
        <div className="settings-section">
          <h2>💾 Управление данными</h2>
          
          <div className="setting-item">
            <label>Резервное копирование:</label>
            <div className="data-buttons">
              <button 
                onClick={handleExportAll}
                className="data-btn export"
              >
                📥 Экспорт всех данных
              </button>
              
              <label className="data-btn import">
                📤 Импорт данных
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="file-input-hidden"
                />
              </label>
            </div>
          </div>
          
          <div className="setting-item">
            <label>Очистка данных:</label>
            <div className="data-buttons">
              <button 
                onClick={() => confirmAction('clear-data')}
                className="data-btn danger"
              >
                🗑️ Очистить все данные
              </button>
              
              <button 
                onClick={() => confirmAction('reset-settings')}
                className="data-btn warning"
              >
                🔄 Сбросить настройки
              </button>
            </div>
          </div>
        </div>

        {/* Секция дорожных карт */}
        <div className="settings-section">
          <h2>🗺️ Дорожные карты</h2>
          
          {roadmaps.length > 0 ? (
            <div className="roadmaps-list">
              {roadmaps.map(roadmap => (
                <div key={roadmap.id} className="roadmap-item">
                  <div className="roadmap-info">
                    <h4>{roadmap.title}</h4>
                    <p className="roadmap-description">{roadmap.description}</p>
                    <div className="roadmap-meta">
                      <span>Тем: {roadmap.topicsCount}</span>
                      <span>Создана: {roadmap.createdAt}</span>
                      <span>Размер: {Math.round(roadmap.size / 1024)} KB</span>
                    </div>
                  </div>
                  
                  <div className="roadmap-actions">
                    <button 
                      onClick={() => switchRoadmap(roadmap.id)}
                      className="action-btn switch"
                      title="Сделать активной"
                    >
                      ⭐
                    </button>
                    
                    <button 
                      onClick={() => deleteRoadmap(roadmap.id)}
                      className="action-btn delete"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Нет сохраненных дорожных карт</p>
          )}
          
          <div className="storage-info">
            <p>
              Использовано хранилища: {Math.round(JSON.stringify(localStorage).length / 1024)} KB
            </p>
            <p>
              Всего дорожных карт: {roadmaps.length}
            </p>
          </div>
        </div>

        {/* Секция информации */}
        <div className="settings-section">
          <h2>ℹ️ Информация</h2>
          
          <div className="info-grid">
            <div className="info-item">
              <h4>Версия приложения</h4>
              <p>1.0.0</p>
            </div>
            
            <div className="info-item">
              <h4>Дата сборки</h4>
              <p>{new Date().toLocaleDateString('ru-RU')}</p>
            </div>
            
            <div className="info-item">
              <h4>Поддержка</h4>
              <p>Технологии: React, LocalStorage</p>
            </div>
            
            <div className="info-item">
              <h4>Разработчик</h4>
              <p>Technology Tracker Team</p>
            </div>
          </div>
          
          <div className="about-text">
            <p>
              Это приложение помогает отслеживать прогресс в изучении технологий.
              Все данные хранятся локально в вашем браузере.
            </p>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Подтверждение действия</h3>
            <p className="confirm-message">
              {actionType === 'clear-data' 
                ? 'Вы уверены, что хотите очистить ВСЕ данные? Это действие нельзя отменить!'
                : 'Вы уверены, что хотите сбросить настройки к значениям по умолчанию?'
              }
            </p>
            <div className="modal-actions">
              <button 
                onClick={executeAction}
                className="btn btn-danger"
              >
                Подтвердить
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
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

export default SettingsPage;