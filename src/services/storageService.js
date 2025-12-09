export const storageService = {
  saveRoadmap: (roadmapId, roadmapData) => {
    try {
      localStorage.setItem(`roadmap_${roadmapId}`, JSON.stringify(roadmapData));
      return true;
    } catch (error) {
      console.error('Ошибка при сохранении в localStorage:', error);
      return false;
    }
  },

  loadRoadmap: (roadmapId) => {
    try {
      const data = localStorage.getItem(`roadmap_${roadmapId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Ошибка при загрузке из localStorage:', error);
      return null;
    }
  },

  removeRoadmap: (roadmapId) => {
    localStorage.removeItem(`roadmap_${roadmapId}`);
  }
};