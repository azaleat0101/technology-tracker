import React, { useRef, useState } from 'react';
import './FileUploader.css';

function FileUploader({ onFileLoaded, onError }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      processFile(file);
    } else {
      onError && onError('Пожалуйста, выберите JSON файл');
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    
    if (file.type !== 'application/json') {
      onError && onError('Файл должен быть в формате JSON');
      return;
    }

    try {
      onFileLoaded && onFileLoaded(file);
    } catch (error) {
      onError && onError(error.message);
    }
  };

  return (
    <div className="file-uploader-container">
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📁</div>
        <p className="upload-title">Загрузите дорожную карту</p>
        <p className="upload-subtitle">
          Перетащите JSON файл сюда или нажмите для выбора
        </p>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".json,application/json"
          className="file-input"
        />
      </div>
      
      <div className="upload-hint">
        <p>✅ Формат файла: JSON с полями title, description и topics</p>
        <p>📊 Каждая тема должна иметь id, title и description</p>
      </div>
    </div>
  );
}

export default FileUploader;