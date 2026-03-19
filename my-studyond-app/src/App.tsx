import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './components/ThemeProvider';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { ChatbotPage } from './pages/ChatbotPage';
import { ProfilePage } from './pages/ProfilePage';
import { ThreadPage } from './pages/ThreadPage';
import { useRoadmapStore } from './store/roadmap-store';
import { useEffect } from 'react';
import { thesisRoadmap } from './data/thesis-roadmap';

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatbotPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/thread/:threadId" element={<ThreadPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const setData = useRoadmapStore((s) => s.setData);

  useEffect(() => {
    setData(thesisRoadmap);
  }, [setData]);
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
