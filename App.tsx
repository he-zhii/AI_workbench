import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Assistant, AppRoute, ApiConfig } from './types';
import { DEFAULT_ASSISTANTS } from './constants';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';

// --- Context ---
interface AppContextType {
  assistants: Assistant[];
  addAssistant: (assistant: Assistant) => void;
  deleteAssistant: (id: string) => void;
  updateAssistant: (id: string, data: Partial<Assistant>) => void;
  apiConfig: ApiConfig;
  updateApiConfig: (config: ApiConfig) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// --- Main App ---
const AppContent: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Routes>
          <Route path={AppRoute.DASHBOARD} element={<Dashboard />} />
          <Route path={AppRoute.GENERATOR} element={<Generator />} />
          <Route path={`${AppRoute.CHAT}/:id`} element={<Chat />} />
          <Route path={AppRoute.SETTINGS} element={<Settings />} />
          <Route path="*" element={<Navigate to={AppRoute.DASHBOARD} replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  // --- State Management ---
  const [assistants, setAssistants] = useState<Assistant[]>(() => {
    const saved = localStorage.getItem('assistants');
    return saved ? JSON.parse(saved) : DEFAULT_ASSISTANTS;
  });

  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('apiConfig');
    return saved ? JSON.parse(saved) : { 
      apiKey: process.env.API_KEY || '', 
      baseUrl: '' // Default empty uses official Google endpoint
    };
  });

  useEffect(() => {
    localStorage.setItem('assistants', JSON.stringify(assistants));
  }, [assistants]);

  useEffect(() => {
    localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
  }, [apiConfig]);

  const addAssistant = (assistant: Assistant) => {
    setAssistants((prev) => [assistant, ...prev]);
  };

  const deleteAssistant = (id: string) => {
    setAssistants((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAssistant = (id: string, data: Partial<Assistant>) => {
    setAssistants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a))
    );
  };

  const updateApiConfig = (config: ApiConfig) => {
    setApiConfig(config);
  };

  return (
    <AppContext.Provider value={{ 
      assistants, 
      addAssistant, 
      deleteAssistant, 
      updateAssistant,
      apiConfig,
      updateApiConfig
    }}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppContext.Provider>
  );
}
