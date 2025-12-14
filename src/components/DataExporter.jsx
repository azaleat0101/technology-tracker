import React, { useState } from 'react';
import './DataExporter.css';

const DataExporter = ({ technologies }) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [includeUserData, setIncludeUserData] = useState(true);

  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedFrom: 'Technology Tracker',
      technologies: includeUserData 
        ? technologies.map(tech => ({
            id: tech.id,
            title: tech.title,
            description: tech.description,
            category: tech.category,
            difficulty: tech.difficulty,
            resources: tech.resources || [],
            // Пользовательские данные
            userStatus: tech.status || 'not-started',
            userNotes: tech.notes || '',
            userDeadline: tech.deadline || '',
            userCreatedAt: tech.createdAt,
            userUpdatedAt: tech.updatedAt
          }))
        : technologies.map(({ notes, status, deadline, createdAt, updatedAt, ...tech }) => tech)
    };

    let dataStr, fileType, fileName;

    if (exportFormat === 'json') {
      dataStr = JSON.stringify(exportData, null, 2);
      fileType = 'application/json';
      fileName = `technology-roadmap-${new Date().toISOString().split('T')[0]}.json`;
    } else {
      // Для CSV можно добавить позже
      return;
    }

    // Создаем и скачиваем файл
    const blob = new Blob([dataStr], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Очистка
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    // Уведомление
    alert(`Файл "${fileName}" успешно скачан!`);
  };

  const canExport = technologies.length > 0;

  return (
    <div className="data-exporter">
      <h3 className="exporter-title">Экспорт данных</h3>
      
      <div className="export-options">
        <div className="form-group">
          <label htmlFor="export-format" className="form-label">
            Формат экспорта
          </label>
          <select
            id="export-format"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="form-select"
          >
            <option value="json">JSON (рекомендуется)</option>
            <option value="csv" disabled>CSV (скоро)</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeUserData}
              onChange={(e) => setIncludeUserData(e.target.checked)}
              className="checkbox-input"
            />
            <span className="checkbox-custom"></span>
            Включить мои заметки и прогресс
          </label>
          <p className="help-text">
            При включении будут экспортированы ваши личные заметки, статусы и сроки изучения
          </p>
        </div>
      </div>

      {!canExport && (
        <div className="export-warning">
          <span className="warning-icon">⚠️</span>
          Нет данных для экспорта. Добавьте технологии в трекер.
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={!canExport}
        className="export-button"
      >
        <span className="button-icon"></span>
        Экспортировать данные
      </button>

      <div className="export-info">
        <p className="info-title">Что будет экспортировано:</p>
        <ul className="info-list">
          <li>Название и описание технологий</li>
          <li>Категории и сложность</li>
          <li>Ссылки на ресурсы</li>
          {includeUserData && (
            <>
              <li>Ваш прогресс (статусы)</li>
              <li>Ваши заметки</li>
              <li>Сроки изучения</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DataExporter;