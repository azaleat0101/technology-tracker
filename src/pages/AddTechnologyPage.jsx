// AddTechnologyPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext'; // Добавляем хук
import './AddTechnologyPage.css';

const AddTechnologyPage = ({ addTechnology }) => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, showInfo } = useNotification(); // Используем хук
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    resources: [''],
    status: 'not-started',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleResourceChange = (index, value) => {
    const newResources = [...formData.resources];
    newResources[index] = value;
    setFormData(prev => ({
      ...prev,
      resources: newResources
    }));
    
    // Очищаем ошибку ресурса
    if (errors[`resource_${index}`]) {
      setErrors(prev => ({
        ...prev,
        [`resource_${index}`]: ''
      }));
    }
  };

  const addResourceField = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, '']
    }));
  };

  const removeResourceField = (index) => {
    if (formData.resources.length > 1) {
      const newResources = formData.resources.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        resources: newResources
      }));
    } else {
      // Если пытаются удалить последнее поле - очищаем его
      setFormData(prev => ({
        ...prev,
        resources: ['']
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
      showError('Пожалуйста, введите название технологии');
    } else if (formData.title.length > 100) {
      newErrors.title = 'Название слишком длинное (макс. 100 символов)';
      showError('Название слишком длинное (максимум 100 символов)');
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
      showError('Пожалуйста, введите описание технологии');
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Описание слишком длинное (макс. 1000 символов)';
      showError('Описание слишком длинное (максимум 1000 символов)');
    }
    
    // Проверка URL ресурсов
    formData.resources.forEach((resource, index) => {
      if (resource.trim() && !isValidUrl(resource)) {
        newErrors[`resource_${index}`] = 'Некорректный URL';
        showError(`Ресурс #${index + 1}: некорректный URL`);
      }
    });
    
    return newErrors;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) {
      showWarning('Пожалуйста, подождите...');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formErrors = validateForm();
      
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        setIsSubmitting(false);
        return;
      }
      
      // Фильтруем пустые ресурсы
      const filteredResources = formData.resources.filter(r => r.trim() !== '');
      
      const newTech = {
        ...formData,
        resources: filteredResources,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addTechnology(newTech);
      
      // Показываем уведомление об успехе через NotificationContext
      showSuccess(`✅ Технология "${formData.title}" успешно добавлена!`);
      
      // Сбрасываем форму
      setFormData({
        title: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        resources: [''],
        status: 'not-started',
        notes: ''
      });
      
      // Ждем немного перед перенаправлением, чтобы пользователь увидел уведомление
      setTimeout(() => {
        navigate('/technologies');
      }, 1500);
      
    } catch (error) {
      console.error('Error adding technology:', error);
      showError('❌ Произошла ошибка при сохранении технологии');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = 
      formData.title.trim() || 
      formData.description.trim() || 
      formData.category.trim() || 
      formData.notes.trim() ||
      formData.resources.some(r => r.trim());
    
    if (hasChanges) {
      if (window.confirm('Отменить добавление технологии? Все несохраненные данные будут потеряны.')) {
        navigate('/technologies');
      }
    } else {
      navigate('/technologies');
    }
  };

  const handleReset = () => {
    if (window.confirm('Сбросить все поля формы?')) {
      setFormData({
        title: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        resources: [''],
        status: 'not-started',
        notes: ''
      });
      setErrors({});
      showInfo('Форма сброшена');
    }
  };

  return (
    <div className="add-technology-page">
      <div className="page-header">
        <h1>Добавить новую технологию</h1>
        <p className="page-subtitle">Заполните информацию о технологии, которую хотите изучать</p>
      </div>

      <form onSubmit={handleSubmit} className="technology-form">
        <div className="form-grid">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title" className="form-label required">
                Название технологии
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Например: React, TypeScript, Node.js"
                maxLength={100}
                disabled={isSubmitting}
              />
              {errors.title && (
                <div className="error-message">{errors.title}</div>
              )}
              <div className="char-count">
                {formData.title.length}/100 символов
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label required">
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Опишите, что это за технология, для чего используется..."
                rows="4"
                maxLength={1000}
                disabled={isSubmitting}
              />
              {errors.description && (
                <div className="error-message">{errors.description}</div>
              )}
              <div className="char-count">
                {formData.description.length}/1000 символов
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Категория
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Например: frontend, backend, database"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="difficulty" className="form-label">
                Сложность
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="form-select"
                disabled={isSubmitting}
              >
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ресурсы для изучения</label>
              <div className="resources-list">
                {formData.resources.map((resource, index) => (
                  <div key={index} className="resource-input-group">
                    <div className="resource-input-wrapper">
                      <input
                        type="url"
                        value={resource}
                        onChange={(e) => handleResourceChange(index, e.target.value)}
                        className={`form-input ${errors[`resource_${index}`] ? 'error' : ''}`}
                        placeholder="https://example.com"
                        disabled={isSubmitting}
                      />
                      {formData.resources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeResourceField(index)}
                          className="remove-resource"
                          aria-label="Удалить ресурс"
                          disabled={isSubmitting}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {errors[`resource_${index}`] && (
                      <div className="error-message">{errors[`resource_${index}`]}</div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addResourceField}
                  className="add-resource"
                  disabled={isSubmitting}
                >
                  + Добавить еще ресурс
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Предварительные заметки
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Можете добавить начальные заметки..."
                rows="3"
                disabled={isSubmitting}
              />
              <div className="char-count">
                {formData.notes.length}/500 символов
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <div className="left-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="reset-button"
              disabled={isSubmitting}
            >
              Сбросить
            </button>
          </div>
          
          <div className="right-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Сохранение...
                </>
              ) : (
                'Сохранить технологию'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Индикатор загрузки при отправке */}
      {isSubmitting && (
        <div className="submitting-overlay">
          <div className="submitting-spinner"></div>
          <p>Сохраняем технологию...</p>
        </div>
      )}
    </div>
  );
};

export default AddTechnologyPage;