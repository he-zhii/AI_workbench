import React, { useState } from 'react';
import { useApp } from '../App';
import { Trash2, AlertTriangle, ShieldCheck, Plus, Server } from 'lucide-react';
import Button from '../components/Button';
import ProviderCard from '../components/ProviderCard';
import ProviderForm from '../components/ProviderForm';
import { LLMProvider } from '../types';

export default function Settings() {
  const {
    assistants,
    llmConfig,
    addProvider,
    updateProvider,
    deleteProvider,
    setActiveProvider,
  } = useApp();

  // Provider form state
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState<LLMProvider | null>(null);

  const handleClearData = () => {
    if (confirm('Are you sure? This will delete all custom assistants.')) {
      localStorage.removeItem('assistants');
      // We do NOT clear apiConfig here to prevent locking the user out,
      // unless they explicitly want to via browser storage clearing.
      window.location.reload();
    }
  };

  const handleAddProvider = () => {
    setProviderToEdit(null);
    setShowProviderForm(true);
  };

  const handleEditProvider = (provider: LLMProvider) => {
    setProviderToEdit(provider);
    setShowProviderForm(true);
  };

  const handleSaveProvider = (provider: LLMProvider) => {
    if (providerToEdit) {
      updateProvider(provider.id, provider);
    } else {
      addProvider(provider);
    }
    setShowProviderForm(false);
    setProviderToEdit(null);
  };

  const handleDeleteProvider = (id: string) => {
    const provider = llmConfig.providers.find((p) => p.id === id);
    if (!provider) return;

    const message =
      provider.id === llmConfig.activeProviderId
        ? `Are you sure you want to delete "${provider.name}"? It is currently set as active. You will need to select another provider or add a new one.`
        : `Are you sure you want to delete "${provider.name}"?`;

    if (confirm(message)) {
      deleteProvider(id);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="space-y-8">
        {/* AI Model Providers Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Server className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">
                AI Model Providers
              </h2>
            </div>
            <Button onClick={handleAddProvider}>
              <Plus size={16} className="mr-2" />
              Add Provider
            </Button>
          </div>

          {llmConfig.providers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Server size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Providers Configured
              </h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                Add an AI provider to start chatting. Supports OpenAI, OpenRouter, Kimi, Qianwen,
                Zhipu, DeepSeek, and any OpenAI-compatible API.
              </p>
              <Button onClick={handleAddProvider} variant="primary">
                <Plus size={16} className="mr-2" />
                Add Your First Provider
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {llmConfig.providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isActive={provider.id === llmConfig.activeProviderId}
                  onSetActive={() => setActiveProvider(provider.id)}
                  onEdit={() => handleEditProvider(provider)}
                  onDelete={() => handleDeleteProvider(provider.id)}
                />
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> All providers use the OpenAI-compatible API format. You can add
              multiple providers and easily switch between them.
            </p>
          </div>
        </section>

        {/* Environment Info */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-green-500" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Provider Status</h2>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-600">
              <div
                className={`w-2 h-2 rounded-full ${
                  llmConfig.activeProviderId ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              Active Provider:{' '}
              {llmConfig.activeProviderId
                ? llmConfig.providers.find((p) => p.id === llmConfig.activeProviderId)?.name ||
                  'Unknown'
                : 'None selected'}
            </div>
            <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-600">
              <div
                className={`w-2 h-2 rounded-full ${
                  llmConfig.providers.length > 0 ? 'bg-blue-500' : 'bg-gray-400'
                }`}
              ></div>
              Total Providers: {llmConfig.providers.length}
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-500" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Data Management</h2>
          </div>
          <p className="text-gray-600 mb-6">
            You have {assistants.length} assistants stored in your browser's local storage. Clearing
            data will remove all assistants except the defaults.
          </p>

          <Button variant="danger" onClick={handleClearData}>
            <Trash2 className="w-4 h-4 mr-2" />
            Reset Application Data
          </Button>
        </section>

        <section className="text-center pt-8 border-t border-gray-200 pb-8">
          <p className="text-gray-400 text-sm">AI Assistant Dashboard v1.2.0</p>
        </section>
      </div>

      {/* Provider Form Modal */}
      {showProviderForm && (
        <ProviderForm
          providerToEdit={providerToEdit}
          onSave={handleSaveProvider}
          onCancel={() => {
            setShowProviderForm(false);
            setProviderToEdit(null);
          }}
          existingProviders={llmConfig.providers}
        />
      )}
    </div>
  );
}
