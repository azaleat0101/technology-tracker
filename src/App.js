// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext'; // Добавляем
import './App.css';

// Компоненты
import Header from './components/Header';
import Navigation from './components/Navigation';

// Страницы
import HomePage from './pages/HomePage';
import TechnologiesPage from './pages/TechnologiesPage';
import TechnologyDetailPage from './pages/TechnologyDetailPage';
import AddTechnologyPage from './pages/AddTechnologyPage';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';

// Хуки
import useTechnologies from './hooks/useTechnologies';

function App() {
  const technologiesData = useTechnologies();

  return (
    <ThemeProvider>
      <NotificationProvider> {/* Добавляем провайдер уведомлений */}
        <Router>
          <div className="app">
            <Header progress={technologiesData.progress} />
            
            <div className="app-container">
              <Navigation />
              
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage {...technologiesData} />} />
                  <Route path="/technologies" element={<TechnologiesPage {...technologiesData} />} />
                  <Route path="/technology/:id" element={<TechnologyDetailPage {...technologiesData} />} />
                  <Route path="/add-technology" element={<AddTechnologyPage {...technologiesData} />} />
                  <Route path="/statistics" element={<StatisticsPage {...technologiesData} />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
            
            <footer className="app-footer">
              <div className="footer-content">
                <p>© 2024 Трекер изучения технологий. Все права защищены.</p>
                <p className="footer-version">Версия 1.0.0</p>
              </div>
            </footer>
          </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;