import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'technology_tracker_data';

// Начальные данные для демонстрации
const initialTechnologies = [
  {
    id: 1,
    title: 'React',
    description: 'Библиотека для создания пользовательских интерфейсов',
    status: 'in-progress',
    notes: 'Изучаю хуки и контекст',
    category: 'frontend',
    difficulty: 'intermediate',
    resources: ['https://react.dev', 'https://ru.reactjs.org'],
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-10T15:30:00.000Z'
  },
  {
    id: 2,
    title: 'Node.js',
    description: 'Среда выполнения JavaScript на сервере',
    status: 'not-started',
    notes: '',
    category: 'backend',
    difficulty: 'intermediate',
    resources: ['https://nodejs.org'],
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z'
  },
  {
    id: 3,
    title: 'TypeScript',
    description: 'Типизированное надмножество JavaScript',
    status: 'completed',
    notes: 'Прошел базовый курс, нужно практиковаться',
    category: 'language',
    difficulty: 'intermediate',
    resources: ['https://www.typescriptlang.org'],
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-05T14:20:00.000Z'
  },
  {
    id: 4,
    title: 'MongoDB',
    description: 'Документо-ориентированная база данных',
    status: 'not-started',
    notes: '',
    category: 'database',
    difficulty: 'beginner',
    resources: ['https://www.mongodb.com'],
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z'
  },
  {
    id: 5,
    title: 'Docker',
    description: 'Платформа для контейнеризации приложений',
    status: 'in-progress',
    notes: 'Изучаю Dockerfile и docker-compose',
    category: 'devops',
    difficulty: 'advanced',
    resources: ['https://www.docker.com', 'https://docs.docker.com'],
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-12T09:15:00.000Z'
  }
];

const useTechnologies = () => {
  const [technologies, setTechnologies] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialTechnologies;
    } catch (error) {
      console.error('Ошибка загрузки из localStorage:', error);
      return initialTechnologies;
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Сохранение в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(technologies));
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
      setError('Ошибка сохранения данных');
    }
  }, [technologies]);

  // Расчет прогресса
  const calculateProgress = useCallback(() => {
    const total = technologies.length;
    const completed = technologies.filter(t => t.status === 'completed').length;
    const inProgress = technologies.filter(t => t.status === 'in-progress').length;
    const notStarted = technologies.filter(t => t.status === 'not-started').length;
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [technologies]);

  // Обновление статуса
  const updateStatus = (id, newStatus) => {
    setTechnologies(prev => 
      prev.map(tech => 
        tech.id === id 
          ? { 
              ...tech, 
              status: newStatus, 
              updatedAt: new Date().toISOString() 
            }
          : tech
      )
    );
  };

  // Обновление заметок
  const updateNotes = (id, newNotes) => {
    setTechnologies(prev => 
      prev.map(tech => 
        tech.id === id 
          ? { 
              ...tech, 
              notes: newNotes, 
              updatedAt: new Date().toISOString() 
            }
          : tech
      )
    );
  };

  // Добавление технологии
  const addTechnology = (techData) => {
    const newTech = {
      ...techData,
      id: Date.now(),
      status: techData.status || 'not-started',
      notes: techData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTechnologies(prev => [...prev, newTech]);
    return newTech;
  };

  // Удаление технологии
  const deleteTechnology = (id) => {
    setTechnologies(prev => prev.filter(tech => tech.id !== id));
  };

  // Массовые действия
  const markAllCompleted = () => {
    setTechnologies(prev => 
      prev.map(tech => ({
        ...tech,
        status: 'completed',
        updatedAt: new Date().toISOString()
      }))
    );
  };

  const resetAllStatuses = () => {
    setTechnologies(prev => 
      prev.map(tech => ({
        ...tech,
        status: 'not-started',
        updatedAt: new Date().toISOString()
      }))
    );
  };

  // Импорт roadmap
  const importRoadmap = (roadmapTechnologies) => {
    const newTechs = roadmapTechnologies.map(tech => ({
      ...tech,
      id: tech.id || Date.now() + Math.random(),
      status: 'not-started',
      notes: tech.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    setTechnologies(prev => [...prev, ...newTechs]);
  };

  return {
    technologies,
    loading,
    error,
    progress: calculateProgress(),
    updateStatus,
    updateNotes,
    addTechnology,
    deleteTechnology,
    markAllCompleted,
    resetAllStatuses,
    importRoadmap,
    setTechnologies
  };
};

export default useTechnologies;