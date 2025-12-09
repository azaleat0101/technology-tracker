import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // Инициализируем состояние, пытаясь получить значение из localStorage
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Ошибка чтения из localStorage ключа "${key}":`, error);
      return initialValue;
    }
  });

  // Функция для обновления значения в состоянии и localStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Ошибка записи в localStorage ключа "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;