import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { storageService } from './services/storageService';
import HomePage from './pages/HomePage/HomePage';
import TopicDetail from './pages/TopicDetail/TopicDetail';
import Header from './components/Header/Header';
import './App.css';

function App() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Пытаемся загрузить roadmap из localStorage
    const savedRoadmapId = localStorage.getItem('currentRoadmapId');
    if (savedRoadmapId) {
      const savedRoadmap = storageService.loadRoadmap(savedRoadmapId);
      if (savedRoadmap) {
        setRoadmap(savedRoadmap);
      }
    }
    setLoading(false);
  }, []);

  const handleRoadmapLoaded = (roadmapData) => {
    const roadmapWithId = {
      ...roadmapData,
      id: roadmapData.id || `roadmap_${Date.now()}`
    };
    
    setRoadmap(roadmapWithId);
    localStorage.setItem('currentRoadmapId', roadmapWithId.id);
    storageService.saveRoadmap(roadmapWithId.id, roadmapWithId);
    
    return roadmapWithId;
  };

  const handleTopicUpdate = (updatedRoadmap) => {
    setRoadmap(updatedRoadmap);
    storageService.saveRoadmap(updatedRoadmap.id, updatedRoadmap);
  };

  const handleReset = () => {
    setRoadmap(null);
    localStorage.removeItem('currentRoadmapId');
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Header roadmap={roadmap} onReset={handleReset} />
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  roadmap={roadmap}
                  onRoadmapLoaded={handleRoadmapLoaded}
                  onTopicUpdate={handleTopicUpdate}
                />
              } 
            />
            <Route 
              path="/topic/:id" 
              element={
                roadmap ? (
                  <TopicDetail 
                    roadmap={roadmap}
                    onTopicUpdate={handleTopicUpdate}
                  />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <footer className="App-footer">
          <p>Персональный трекер освоения технологий | React Практическое занятие</p>
          <p className="footer-note">
            Использование переиспользуемых компонентов и localStorage
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;