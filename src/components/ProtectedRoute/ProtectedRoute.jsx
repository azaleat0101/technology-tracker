import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, isAuthenticated = true, redirectTo = "/" }) {
  // Здесь можно добавить логику проверки авторизации
  // Пока используем проверку наличия roadmap как пример
  const hasRoadmap = !!localStorage.getItem('currentRoadmapId');
  
  // Если пользователь не авторизован и нет roadmap - перенаправляем
  if (!isAuthenticated && !hasRoadmap) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
}

export default ProtectedRoute;