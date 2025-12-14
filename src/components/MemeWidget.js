// components/MemeWidget.js
import React, { useState, useEffect } from 'react';
import './MemeWidget.css';
import { memeApi } from '../api/memeApi';
import { useNotification } from '../context/NotificationContext';

const MemeWidget = () => {
  const [meme, setMeme] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const loadMeme = async () => {
    setLoading(true);
    try {
      const newMeme = await memeApi.getRandomMeme();
      if (newMeme) {
        setMeme(newMeme);
        showSuccess('Новый мем загружен!');
      } else {
        showError('Не удалось загрузить мем');
      }
    } catch (error) {
      showError('Ошибка при загрузке мема');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeme();
  }, []);

  return (
    <div className="meme-widget">
      <h3>Рандомный мемчик!</h3>
      
      {loading ? (
        <div className="meme-loading">Загрузка...</div>
      ) : meme ? (
        <div className="meme-content">
          <img 
            src={meme.url} 
            alt={meme.title}
            className="meme-image"
            onError={(e) => {
              e.target.src = 'https://i.imgflip.com/30b1gx.jpg';
            }}
          />
          <p className="meme-title">{meme.title}</p>
          <div className="meme-actions">
            <button onClick={loadMeme} disabled={loading}>
              Новый мем
            </button>
          </div>
        </div>
      ) : (
        <div className="meme-error">
          Не удалось загрузить мем
          <button onClick={loadMeme}>Попробовать снова</button>
        </div>
      )}
    </div>
  );
};

export default MemeWidget;