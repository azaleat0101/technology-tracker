import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

function useTechnologies() {
  const [technologies, setTechnologies] = useLocalStorage('technologies', []);
  const [currentRoadmap, setCurrentRoadmap] = useLocalStorage('currentRoadmap', null);

  // Функция для загрузки roadmap
  const loadRoadmap = (roadmapData) => {
    const roadmapWithId = {
      ...roadmapData,
      id: roadmapData.id || `roadmap_${Date.now()}`
    };
    
    setCurrentRoadmap(roadmapWithId);
    
    // Сохраняем roadmap отдельно
    localStorage.setItem(`roadmap_${roadmapWithId.id}`, JSON.stringify(roadmapWithId));
    localStorage.setItem('currentRoadmapId', roadmapWithId.id);
    
    return roadmapWithId;
  };

  // Функция для обновления статуса темы
  const updateStatus = (topicId, newStatus) => {
    if (!currentRoadmap) return;
    
    const updatedTopics = currentRoadmap.topics.map(topic => 
      topic.id === topicId 
        ? { 
            ...topic, 
            status: newStatus,
            completedDate: newStatus === 'completed' ? 
              new Date().toISOString().split('T')[0] : 
              topic.completedDate
          }
        : topic
    );
    
    const updatedRoadmap = {
      ...currentRoadmap,
      topics: updatedTopics
    };
    
    setCurrentRoadmap(updatedRoadmap);
    localStorage.setItem(`roadmap_${currentRoadmap.id}`, JSON.stringify(updatedRoadmap));
    
    return updatedRoadmap;
  };

  // Функция для обновления заметок
  const updateNotes = (topicId, newNotes, targetDate = null) => {
    if (!currentRoadmap) return;
    
    const updatedTopics = currentRoadmap.topics.map(topic => 
      topic.id === topicId 
        ? { 
            ...topic, 
            userNotes: newNotes,
            targetDate: targetDate || topic.targetDate
          }
        : topic
    );
    
    const updatedRoadmap = {
      ...currentRoadmap,
      topics: updatedTopics
    };
    
    setCurrentRoadmap(updatedRoadmap);
    localStorage.setItem(`roadmap_${currentRoadmap.id}`, JSON.stringify(updatedRoadmap));
    
    return updatedRoadmap;
  };

  // Функция для обновления всех тем
  const updateAllTopics = (updatedTopics) => {
    if (!currentRoadmap) return;
    
    const updatedRoadmap = {
      ...currentRoadmap,
      topics: updatedTopics
    };
    
    setCurrentRoadmap(updatedRoadmap);
    localStorage.setItem(`roadmap_${currentRoadmap.id}`, JSON.stringify(updatedRoadmap));
    
    return updatedRoadmap;
  };

  // Функция для сброса roadmap
  const resetRoadmap = () => {
    setCurrentRoadmap(null);
    localStorage.removeItem('currentRoadmapId');
  };

  // Функция для расчета прогресса
  const calculateProgress = () => {
    if (!currentRoadmap || !currentRoadmap.topics || currentRoadmap.topics.length === 0) return 0;
    const completed = currentRoadmap.topics.filter(topic => topic.status === 'completed').length;
    return Math.round((completed / currentRoadmap.topics.length) * 100);
  };

  // Функция для получения статистики
  const getStats = () => {
    if (!currentRoadmap || !currentRoadmap.topics) {
      return { total: 0, completed: 0, inProgress: 0, notStarted: 0 };
    }
    
    return {
      total: currentRoadmap.topics.length,
      completed: currentRoadmap.topics.filter(t => t.status === 'completed').length,
      inProgress: currentRoadmap.topics.filter(t => t.status === 'in-progress').length,
      notStarted: currentRoadmap.topics.filter(t => t.status === 'not-started').length
    };
  };

  return {
    // Состояния
    technologies,
    currentRoadmap,
    
    // Действия
    loadRoadmap,
    updateStatus,
    updateNotes,
    updateAllTopics,
    resetRoadmap,
    
    // Вычисляемые значения
    progress: calculateProgress(),
    stats: getStats(),
    
    // Геттеры
    getProgress: calculateProgress,
    getStats
  };
}

export default useTechnologies;