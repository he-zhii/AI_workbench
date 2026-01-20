import React, { useState, useEffect } from 'react';
import { X, Loader2, Globe, Key, Server, Box } from 'lucide-react';
import { LLMProvider, ConnectionTestResult } from '../types';
import { PROVIDER_PRESETS, getProviderPreset } from '../utils/providerPresets';
import { testConnection } from '../services/openaiCompatibleService';
import Button from './Button';

interface ProviderFormProps {
  providerToEdit?: LLMProvider | null;
  onSave: (provider: LLMProvider) => void;
  onCancel: () => void;
  existingProviders: LLMProvider[];
}

export default function ProviderForm({
  providerToEdit,
  onSave,
  onCancel,
  existingProviders,
}: ProviderFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form from provider to edit
  useEffect(() => {
    if (providerToEdit) {
      setName(providerToEdit.name);
      setBaseUrl(providerToEdit.baseUrl);
      setApiKey(providerToEdit.apiKey);
      setModelName(providerToEdit.modelName);

      // Try to find matching preset
      for (const [key, preset] of Object.entries(PROVIDER_PRESETS)) {
        if (preset.baseUrl === providerToEdit.baseUrl) {
          setSelectedPreset(key);
          break;
        }
      }
    }
  }, [providerToEdit]);

  // Handle preset selection
  useEffect(() => {
    if (selectedPreset && !providerToEdit) {
      const preset = getProviderPreset(selectedPreset);
      if (preset) {
        setName(preset.name);
        setBaseUrl(preset.baseUrl);
        setModelName(preset.model);
        setErrors({});
        setTestResult(null);
      }
    }
  }, [selectedPreset, providerToEdit]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Provider name is required';
    } else {
      // Check for duplicate names (excluding the current provider if editing)
      const isDuplicate = existingProviders.some(
        (p) => p.name === name && p.id !== providerToEdit?.id
      );
      if (isDuplicate) {
        newErrors.name = 'A provider with this name already exists';
      }
    }

    if (!baseUrl.trim()) {
      newErrors.baseUrl = 'Base URL is required';
    } else {
      try {
        new URL(baseUrl);
      } catch {
        newErrors.baseUrl = 'Please enter a valid URL';
      }
    }

    if (!apiKey.trim()) {
      newErrors.apiKey = 'API Key is required';
    } else if (apiKey.length < 5) {
      newErrors.apiKey = 'API Key seems too short';
    }

    if (!modelName.trim()) {
      newErrors.modelName = 'Model name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;

    setIsTesting(true);
    setTestResult(null);

    const testProvider: LLMProvider = {
      id: 'test',
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      modelName: modelName.trim(),
      isActive: false,
      createdAt: new Date().toISOString(),
    };

    const result = await testConnection(testProvider);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setIsSaving(true);

    const provider: LLMProvider = {
      id: providerToEdit?.id || `provider-${Date.now()}`,
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      modelName: modelName.trim(),
      isActive: providerToEdit?.isActive || false,
      createdAt: providerToEdit?.createdAt || new Date().toISOString(),
    };

    // Small delay for better UX
    setTimeout(() => {
      onSave(provider);
      setIsSaving(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {providerToEdit ? 'Edit Provider' : 'Add New Provider'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Preset Selection (only for new providers) */}
          {!providerToEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a Preset (Optional)
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
              >
                <option value="">-- Select a provider preset --</option>
                {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.name} - {preset.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecting a preset will auto-fill the form below
              </p>
            </div>
          )}

          {/* Provider Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Box size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: '' });
                }}
                placeholder="My OpenAI Provider"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Server size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrl(e.target.value);
                  setErrors({ ...errors, baseUrl: '' });
                }}
                placeholder="https://api.openai.com/v1"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow ${
                  errors.baseUrl ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.baseUrl && <p className="text-xs text-red-500 mt-1">{errors.baseUrl}</p>}
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key size={16} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setErrors({ ...errors, apiKey: '' });
                }}
                placeholder="sk-..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow ${
                  errors.apiKey ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.apiKey && <p className="text-xs text-red-500 mt-1">{errors.apiKey}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Your API key will be stored locally in your browser
            </p>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={modelName}
                onChange={(e) => {
                  setModelName(e.target.value);
                  setErrors({ ...errors, modelName: '' });
                }}
                placeholder="gpt-4o-mini"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow ${
                  errors.modelName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.modelName && <p className="text-xs text-red-500 mt-1">{errors.modelName}</p>}
          </div>

          {/* Test Connection Result */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border ${
                testResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    testResult.success ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    testResult.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                </span>
                {testResult.responseTime && (
                  <span className="text-xs text-gray-500">
                    ({testResult.responseTime}ms)
                  </span>
                )}
              </div>
              {testResult.details && (
                <p className="text-xs text-gray-600 mt-1">{testResult.details}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button onClick={onCancel} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleTestConnection}
            variant="secondary"
            disabled={isTesting || isSaving}
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Globe size={16} className="mr-2" />
                Test Connection
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Provider'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
