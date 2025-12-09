export const roadmapService = {
  loadRoadmapFromFile: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const roadmapData = JSON.parse(event.target.result);
          
          if (!roadmapData.title || !roadmapData.topics || !Array.isArray(roadmapData.topics)) {
            throw new Error('Неверный формат файла дорожной карты');
          }
          
          const processedTopics = roadmapData.topics.map(topic => ({
            ...topic,
            id: topic.id || Date.now() + Math.random(),
            status: topic.status || 'not-started',
            userNotes: topic.userNotes || '',
            targetDate: topic.targetDate || null,
            completedDate: topic.completedDate || null
          }));
          
          resolve({
            ...roadmapData,
            id: roadmapData.id || `roadmap_${Date.now()}`,
            topics: processedTopics
          });
        } catch (error) {
          reject(new Error('Ошибка при чтении файла: неверный JSON формат'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Ошибка при чтении файла'));
      };
      
      reader.readAsText(file);
    });
  },

  exportRoadmap: (roadmapData) => {
    const dataStr = JSON.stringify(roadmapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roadmap-${roadmapData.id || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  calculateProgress: (topics) => {
    if (!topics || topics.length === 0) return 0;
    const completedTopics = topics.filter(topic => topic.status === 'completed').length;
    return Math.round((completedTopics / topics.length) * 100);
  },

  getStats: (topics) => {
    return {
      total: topics.length,
      completed: topics.filter(t => t.status === 'completed').length,
      inProgress: topics.filter(t => t.status === 'in-progress').length,
      notStarted: topics.filter(t => t.status === 'not-started').length
    };
  }
};