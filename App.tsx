import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Assistant, AppRoute, ApiConfig, LLMProvider, ExtendedApiConfig } from './types';
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
  // Legacy API config (for backwards compatibility)
  apiConfig: ApiConfig;
  updateApiConfig: (config: ApiConfig) => void;
  // New multi-provider configuration
  llmConfig: ExtendedApiConfig;
  addProvider: (provider: LLMProvider) => void;
  updateProvider: (id: string, data: Partial<LLMProvider>) => void;
  deleteProvider: (id: string) => void;
  setActiveProvider: (id: string) => void;
  getActiveProvider: () => LLMProvider | null;
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

  // Legacy API config (kept for backwards compatibility)
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('apiConfig');
    return saved ? JSON.parse(saved) : {
      apiKey: process.env.API_KEY || '',
      baseUrl: '' // Default empty uses official Google endpoint
    };
  });

  // New multi-provider LLM configuration
  const [llmConfig, setLlmConfig] = useState<ExtendedApiConfig>(() => {
    const saved = localStorage.getItem('llmConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing llmConfig:', e);
      }
    }

    // Check if we need to migrate from old apiConfig format
    const oldConfig = localStorage.getItem('apiConfig');
    if (oldConfig) {
      try {
        const parsedOld = JSON.parse(oldConfig);
        // Check if it's the old format (has apiKey and baseUrl, but no providers)
        if (parsedOld.apiKey && !parsedOld.providers) {
          // Migrate to new format
          const migratedProvider: LLMProvider = {
            id: 'migrated-provider',
            name: 'Migrated Provider',
            baseUrl: parsedOld.baseUrl || 'https://api.openai.com/v1',
            apiKey: parsedOld.apiKey,
            modelName: 'gpt-4o-mini',
            isActive: true,
            createdAt: new Date().toISOString()
          };
          const newConfig: ExtendedApiConfig = {
            providers: [migratedProvider],
            activeProviderId: 'migrated-provider'
          };
          // Save the new config
          localStorage.setItem('llmConfig', JSON.stringify(newConfig));
          return newConfig;
        }
      } catch (e) {
        console.error('Error migrating apiConfig:', e);
      }
    }

    // Default empty config
    return {
      providers: [],
      activeProviderId: null
    };
  });

  // Persist assistants
  useEffect(() => {
    localStorage.setItem('assistants', JSON.stringify(assistants));
  }, [assistants]);

  // Persist legacy apiConfig
  useEffect(() => {
    localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
  }, [apiConfig]);

  // Persist llmConfig
  useEffect(() => {
    localStorage.setItem('llmConfig', JSON.stringify(llmConfig));
  }, [llmConfig]);

  // Assistant management
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

  // Legacy API config management
  const updateApiConfig = (config: ApiConfig) => {
    setApiConfig(config);
  };

  // Provider management
  const addProvider = (provider: LLMProvider) => {
    setLlmConfig((prev) => {
      // If this is the first provider, make it active
      const shouldBeActive = prev.providers.length === 0;
      const newProvider = { ...provider, isActive: shouldBeActive };

      return {
        ...prev,
        providers: [...prev.providers, newProvider],
        activeProviderId: shouldBeActive ? newProvider.id : prev.activeProviderId
      };
    });
  };

  const updateProvider = (id: string, data: Partial<LLMProvider>) => {
    setLlmConfig((prev) => ({
      ...prev,
      providers: prev.providers.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }));
  };

  const deleteProvider = (id: string) => {
    setLlmConfig((prev) => {
      const newProviders = prev.providers.filter((p) => p.id !== id);

      // If we deleted the active provider, select a new one
      let newActiveId = prev.activeProviderId;
      if (prev.activeProviderId === id) {
        newActiveId = newProviders.length > 0 ? newProviders[0].id : null;
        // Update the active flag on providers
        newProviders.forEach((p, idx) => {
          p.isActive = idx === 0;
        });
      }

      return {
        providers: newProviders,
        activeProviderId: newActiveId,
      };
    });
  };

  const setActiveProvider = (id: string) => {
    setLlmConfig((prev) => ({
      ...prev,
      activeProviderId: id,
      providers: prev.providers.map((p) => ({
        ...p,
        isActive: p.id === id,
      })),
    }));
  };

  const getActiveProvider = (): LLMProvider | null => {
    if (!llmConfig.activeProviderId) return null;
    return llmConfig.providers.find((p) => p.id === llmConfig.activeProviderId) || null;
  };

  return (
    <AppContext.Provider value={{
      assistants,
      addAssistant,
      deleteAssistant,
      updateAssistant,
      apiConfig,
      updateApiConfig,
      llmConfig,
      addProvider,
      updateProvider,
      deleteProvider,
      setActiveProvider,
      getActiveProvider
    }}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppContext.Provider>
  );
}
