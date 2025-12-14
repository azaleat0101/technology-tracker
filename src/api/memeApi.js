// api/memeApi.js
import axios from 'axios';

// Используем простой API для программистских мемов
const MEME_API = 'https://meme-api.com/gimme/ProgrammerHumor';

export const memeApi = {
  // Получить случайный мем
  getRandomMeme: async () => {
    try {
      const response = await axios.get(MEME_API);
      const data = response.data;
      
      return {
        id: data.postLink?.split('/').pop() || Date.now().toString(),
        title: data.title || 'Программистский мем',
        url: data.url,
        author: data.author
      };
    } catch (error) {
      console.error('Error fetching meme:', error);
      return null;
    }
  }
};