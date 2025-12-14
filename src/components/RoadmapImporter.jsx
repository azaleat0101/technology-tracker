import React, { useState, useCallback } from 'react';
import './RoadmapImporter.css';

const RoadmapImporter = ({ onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const validateRoadmap = (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Файл должен содержать JSON объект');
    }
    
    if (!data.title || typeof data.title !== 'string') {
      throw new Error('Отсутствует или некорректное поле "title"');
    }
    
    if (!Array.isArray(data.technologies)) {
      throw new Error('Поле "technologies" должно быть массивом');
    }
    
    data.technologies.forEach((tech, index) => {
      if (!tech.title || typeof tech.title !== 'string') {
        throw new Error(`Технология #${index + 1}: отсутствует название`);
      }
      
      if (tech.title.length > 100) {
        throw new Error(`Технология "${tech.title}": название слишком длинное`);
      }
    });
    
    return data;
  };

  const handleFileUpload = useCallback((file) => {
    setError('');
    setFileName(file.name);
    
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      setError('Пожалуйста, загрузите файл в формате JSON');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой (максимум 5 МБ)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsedData = JSON.parse(content);
        const validatedData = validateRoadmap(parsedData);
        
        const technologies = validatedData.technologies.map((tech, index) => ({
          id: Date.now() + index,
          title: tech.title,
          description: tech.description || '',
          status: 'not-started',
          notes: '',
          category: tech.category || 'other',
          difficulty: tech.difficulty || 'beginner',
          resources: tech.resources || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        onImport(technologies);
        
        setError('');
        setTimeout(() => {
          alert(`✅ Успешно импортировано!\n"${validatedData.title}"\nДобавлено технологий: ${technologies.length}`);
        }, 100);
        
      } catch (err) {
        setError(`Ошибка импорта: ${err.message}`);
      }
    };
    
    reader.onerror = () => {
      setError('Ошибка чтения файла');
    };
    
    reader.readAsText(file);
  }, [onImport]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleExampleImport = () => {
    const exampleRoadmap = {
      title: "Пример дорожной карты",
      description: "Демонстрационная дорожная карта для тестирования",
      technologies: [
        {
          title: "Основы JavaScript",
          description: "Изучение базового синтаксиса и возможностей языка",
          category: "frontend",
          difficulty: "beginner",
          resources: ["https://learn.javascript.ru"]
        },
        {
          title: "React Components",
          description: "Создание и использование компонентов в React",
          category: "frontend",
          difficulty: "intermediate"
        }
      ]
    };
    
    const blob = new Blob([JSON.stringify(exampleRoadmap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'example-roadmap.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="roadmap-importer">
      <h3 className="importer-title">Импорт дорожной карты</h3>
      
      <div className="importer-actions">
        <button 
          className="example-button"
          onClick={handleExampleImport}
        >
          Скачать пример файла
        </button>
      </div>
      
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-content">
          <div className="drop-icon">📂</div>
          <p className="drop-text">
            {fileName ? `Выбран файл: ${fileName}` : 'Перетащите JSON файл сюда'}
          </p>
          <p className="drop-subtext">или</p>
          
          <label className="file-button">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="file-input"
            />
            {fileName ? 'Выбрать другой файл' : 'Выбрать файл'}
          </label>
        </div>
      </div>
      
      {error && (
        <div className="error-message" role="alert">
          ❌ {error}
        </div>
      )}
      
      <div className="import-help">
        <h4 className="help-title">Требования к файлу:</h4>
        <ul className="help-list">
          <li>Формат: JSON</li>
          <li>Обязательные поля: title (строка), technologies (массив)</li>
          <li>Каждая технология должна иметь: title (строка)</li>
          <li>Максимальный размер: 5 МБ</li>
        </ul>
        
        <details className="example-details">
          <summary className="example-summary">Пример структуры JSON файла</summary>
          <pre className="example-code">{`{
  "title": "Frontend Roadmap",
  "description": "Roadmap для изучения Frontend разработки",
  "technologies": [
    {
      "title": "HTML",
      "description": "Основы HTML",
      "category": "frontend",
      "difficulty": "beginner",
      "resources": ["https://html.com"]
    },
    {
      "title": "CSS",
      "description": "Стилизация веб-страниц",
      "category": "frontend",
      "difficulty": "beginner"
    }
  ]
}`}</pre>
        </details>
      </div>
    </div>
  );
};

export default RoadmapImporter;