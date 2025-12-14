import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext'; // Добавляем хук темы
import './SettingsPage.css';

const SettingsPage = () => {
  const { theme, setThemeMode } = useTheme(); // Используем тему
  
  const [settings, setSettings] = useState({
    autoSave: true,
    showDeadlines: true,
    defaultStatus: 'not-started'
  });

  // Загрузка настроек
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        autoSave: parsed.autoSave !== false, // по умолчанию true
        showDeadlines: parsed.showDeadlines !== false, // по умолчанию true
        defaultStatus: parsed.defaultStatus || 'not-started'
      });
    }
  }, []);

  // Сохранение настроек
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // Обработчики изменений
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Обработчик изменения темы
  const handleThemeChange = (e) => {
    setThemeMode(e.target.value);
  };

  // Сброс настроек
  const handleResetSettings = () => {
    if (window.confirm('Сбросить все настройки к значениям по умолчанию?')) {
      const defaultSettings = {
        autoSave: true,
        showDeadlines: true,
        defaultStatus: 'not-started'
      };
      setSettings(defaultSettings);
      localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
      setThemeMode('light'); // Сбрасываем тему тоже
      alert('Настройки сброшены!');
    }
  };

  // Экспорт данных
  const handleExportData = () => {
    const allData = {
      settings,
      theme, // Добавляем тему в экспорт
      technologies: JSON.parse(localStorage.getItem('technology_tracker_data') || '[]'),
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tech-tracker-backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('✅ Данные экспортированы!');
  };

  // Очистка данных
  const handleClearData = () => {
    if (window.confirm('⚠️ Удалить ВСЕ технологии и заметки? Это необратимо!')) {
      localStorage.removeItem('technology_tracker_data');
      alert('Данные очищены. Страница будет перезагружена.');
      window.location.reload();
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Настройки</h1>
        <p className="page-subtitle">Основные настройки приложения</p>
      </div>

      <div className="settings-sections">
        {/* Настройки внешнего вида */}
        <div className="settings-section">
          <h2 className="section-title">Внешний вид</h2>
          
          <div className="setting-item">
            <label htmlFor="theme" className="setting-label">
              Тема оформления
            </label>
            <select
              id="theme"
              name="theme"
              value={theme}
              onChange={handleThemeChange}
              className="setting-input"
            >
              <option value="light">Светлая тема</option>
              <option value="dark">Темная тема</option>
            </select>
            <p className="setting-hint">
              Текущая тема: <strong>{theme === 'light' ? 'Светлая' : 'Темная'}</strong>
            </p>
          </div>
        </div>

        {/* Основные настройки */}
        <div className="settings-section">
          <h2 className="section-title">Основные</h2>
          
          <div className="setting-item">
            <label htmlFor="defaultStatus" className="setting-label">
              Статус по умолчанию для новых технологий
            </label>
            <select
              id="defaultStatus"
              name="defaultStatus"
              value={settings.defaultStatus}
              onChange={handleInputChange}
              className="setting-input"
            >
              <option value="not-started">⭕ Не начато</option>
              <option value="in-progress">🔄 В процессе</option>
              <option value="completed">✅ Завершено</option>
            </select>
          </div>

          <div className="setting-item checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="autoSave"
                checked={settings.autoSave}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              Автосохранение изменений
            </label>
            <p className="setting-hint">
              Автоматически сохранять изменения в браузере
            </p>
          </div>

          <div className="setting-item checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="showDeadlines"
                checked={settings.showDeadlines}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              Показывать сроки изучения
            </label>
            <p className="setting-hint">
              Отображать дедлайны для технологий
            </p>
          </div>
        </div>

        {/* Действия с данными */}
        <div className="settings-section">
          <h2 className="section-title">Данные</h2>
          
          <button 
            onClick={handleExportData}
            className="action-button export"
          >
            Экспорт всех данных
          </button>
          
          <button 
            onClick={handleResetSettings}
            className="action-button reset"
          >
            Сбросить настройки
          </button>
          
          <button 
            onClick={handleClearData}
            className="action-button clear"
          >
            Очистить все данные
          </button>
          
          <p className="warning-text">
            Все данные сохраняются только в вашем браузере
          </p>
        </div>

        {/* Информация */}
        <div className="settings-section">
          <h2 className="section-title">О приложении</h2>
          
          <div className="info">
            <div className="info-item">
              <span className="info-label">Версия:</span>
              <span className="info-value">1.0.0</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Технологии:</span>
              <span className="info-value">React, JavaScript</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Тип:</span>
              <span className="info-value">SPA (Single Page Application)</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Хранение данных:</span>
              <span className="info-value">LocalStorage браузера</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;