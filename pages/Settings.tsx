import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Trash2, AlertTriangle, ShieldCheck, Plus, Server, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import ProviderCard from '../components/ProviderCard';
import ProviderForm from '../components/ProviderForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { LLMProvider } from '../types';

export default function Settings() {
  const {
    assistants,
    llmConfig,
    addProvider,
    updateProvider,
    deleteProvider,
    setActiveProvider,
    generatorPrompt,
    updateGeneratorPrompt,
    resetGeneratorPrompt,
    generatorWelcomeMessage,
    updateGeneratorWelcomeMessage,
    resetGeneratorWelcomeMessage,
  } = useApp();

  // Provider form state
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState<LLMProvider | null>(null);

  // Generator prompt editor state
  const [promptEditorValue, setPromptEditorValue] = useState(generatorPrompt);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Generator welcome message editor state
  const [welcomeEditorValue, setWelcomeEditorValue] = useState(generatorWelcomeMessage);
  const [showResetWelcomeDialog, setShowResetWelcomeDialog] = useState(false);

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'danger' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleClearData = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Reset Application Data',
      message: `Are you sure? This will delete all custom assistants. You have ${assistants.length} assistant(s) stored.`,
      onConfirm: () => {
        localStorage.removeItem('assistants');
        window.location.reload();
      },
    });
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

    const isActive = provider.id === llmConfig.activeProviderId;
    const message = isActive
      ? `"${provider.name}" is currently set as active. Deleting it will require selecting another provider. Are you sure?`
      : `Are you sure you want to delete "${provider.name}"?`;

    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Delete Provider',
      message,
      onConfirm: () => deleteProvider(id),
    });
  };

  const handleSaveGeneratorPrompt = () => {
    updateGeneratorPrompt(promptEditorValue);
  };

  const handleResetGeneratorPrompt = () => {
    setShowResetDialog(true);
  };

  const handleSaveGeneratorWelcomeMessage = () => {
    updateGeneratorWelcomeMessage(welcomeEditorValue);
  };

  const handleResetGeneratorWelcomeMessage = () => {
    setShowResetWelcomeDialog(true);
  };

  // Sync editor value when prop changes
  useEffect(() => {
    setPromptEditorValue(generatorPrompt);
  }, [generatorPrompt]);

  // Sync welcome editor value when prop changes
  useEffect(() => {
    setWelcomeEditorValue(generatorWelcomeMessage);
  }, [generatorWelcomeMessage]);

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

        {/* Generator Prompt Configuration */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="text-purple-600" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Generator Prompt Template</h2>
                <p className="text-sm text-gray-500">Customize the system prompt used for the Assistant Builder</p>
              </div>
            </div>
            <Button onClick={handleResetGeneratorPrompt} variant="secondary" size="sm">
              <RefreshCw size={14} className="mr-2" />
              Reset to Default
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt Template
              </label>
              <textarea
                value={promptEditorValue}
                onChange={(e) => setPromptEditorValue(e.target.value)}
                className="w-full p-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-mono h-48 resize-y"
                placeholder="Enter the generator system prompt template..."
              />
              <p className="text-xs text-gray-500 mt-2">
                This template is used when building new AI assistants in the Generator. It guides the AI in creating appropriate system prompts.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${promptEditorValue !== generatorPrompt ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                <span className={promptEditorValue !== generatorPrompt ? 'text-amber-600' : 'text-gray-500'}>
                  {promptEditorValue !== generatorPrompt ? 'Unsaved changes' : 'Saved'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPromptEditorValue(generatorPrompt)}
                  variant="ghost"
                  disabled={promptEditorValue === generatorPrompt}
                >
                  Discard
                </Button>
                <Button
                  onClick={handleSaveGeneratorPrompt}
                  disabled={promptEditorValue === generatorPrompt}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Generator Welcome Message Configuration */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="text-green-600" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Generator Welcome Message</h2>
                <p className="text-sm text-gray-500">Customize the initial message users see in the Assistant Builder</p>
              </div>
            </div>
            <Button onClick={handleResetGeneratorWelcomeMessage} variant="secondary" size="sm">
              <RefreshCw size={14} className="mr-2" />
              Reset to Default
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message
              </label>
              <textarea
                value={welcomeEditorValue}
                onChange={(e) => setWelcomeEditorValue(e.target.value)}
                className="w-full p-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-sans h-24 resize-y"
                placeholder="Enter the welcome message..."
              />
              <p className="text-xs text-gray-500 mt-2">
                This is the first message users see when they open the Generator page.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${welcomeEditorValue !== generatorWelcomeMessage ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                <span className={welcomeEditorValue !== generatorWelcomeMessage ? 'text-amber-600' : 'text-gray-500'}>
                  {welcomeEditorValue !== generatorWelcomeMessage ? 'Unsaved changes' : 'Saved'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setWelcomeEditorValue(generatorWelcomeMessage)}
                  variant="ghost"
                  disabled={welcomeEditorValue === generatorWelcomeMessage}
                >
                  Discard
                </Button>
                <Button
                  onClick={handleSaveGeneratorWelcomeMessage}
                  disabled={welcomeEditorValue === generatorWelcomeMessage}
                >
                  Save Changes
                </Button>
              </div>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        type={confirmDialog.type}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.type === 'danger' ? 'Delete' : 'Confirm'}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Reset Generator Prompt Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        type="warning"
        title="Reset to Default Template"
        message="Are you sure you want to reset the generator prompt to the default template? This will replace your custom template."
        confirmText="Reset"
        onConfirm={() => {
          resetGeneratorPrompt();
          setShowResetDialog(false);
        }}
        onCancel={() => setShowResetDialog(false)}
      />

      {/* Reset Generator Welcome Message Dialog */}
      <ConfirmDialog
        isOpen={showResetWelcomeDialog}
        type="warning"
        title="Reset to Default Welcome Message"
        message="Are you sure you want to reset the welcome message to the default? This will replace your custom message."
        confirmText="Reset"
        onConfirm={() => {
          resetGeneratorWelcomeMessage();
          setShowResetWelcomeDialog(false);
        }}
        onCancel={() => setShowResetWelcomeDialog(false)}
      />
    </div>
  );
}
