import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Trash2, AlertTriangle, ShieldCheck, Server, Key, Save } from 'lucide-react';
import Button from '../components/Button';
import { ApiConfig } from '../types';

export default function Settings() {
  const { assistants, apiConfig, updateApiConfig } = useApp();
  
  // Local state for form
  const [configForm, setConfigForm] = useState<ApiConfig>({ apiKey: '', baseUrl: '' });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setConfigForm(apiConfig);
  }, [apiConfig]);

  const handleSaveConfig = () => {
    updateApiConfig(configForm);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearData = () => {
    if (confirm("Are you sure? This will delete all custom assistants.")) {
      localStorage.removeItem('assistants');
      // We do NOT clear apiConfig here to prevent locking the user out, 
      // unless they explicitly want to via browser storage clearing.
      window.location.reload();
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Custom API Configuration */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <div className="flex items-center gap-3 mb-6">
              <Server className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Custom API Configuration</h2>
           </div>
           
           <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={configForm.apiKey}
                    onChange={(e) => setConfigForm({...configForm, apiKey: e.target.value})}
                    placeholder="Enter your Gemini API Key"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Stored locally in your browser. Required for third-party endpoints.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Base URL (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Server size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={configForm.baseUrl}
                    onChange={(e) => setConfigForm({...configForm, baseUrl: e.target.value})}
                    placeholder="e.g., https://custom-proxy.example.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use the official Google Gemini endpoint. Use this for third-party proxies.
                </p>
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveConfig} disabled={!configForm.apiKey}>
                  {isSaved ? 'Saved!' : 'Save Configuration'}
                </Button>
              </div>
           </div>
        </section>

        {/* Environment Info */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-green-500" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Connection Status</h2>
           </div>
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-600">
               <div className={`w-2 h-2 rounded-full ${apiConfig.apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
               Status: {apiConfig.apiKey ? 'API Key Configured' : 'API Key Missing'}
             </div>
             <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-600">
               <div className={`w-2 h-2 rounded-full ${apiConfig.baseUrl ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
               Endpoint: {apiConfig.baseUrl ? apiConfig.baseUrl : 'Official Google Endpoint'}
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
             You have {assistants.length} assistants stored in your browser's local storage.
             Clearing data will remove all assistants except the defaults.
           </p>

           <Button variant="danger" onClick={handleClearData}>
             <Trash2 className="w-4 h-4 mr-2" />
             Reset Application Data
           </Button>
        </section>

        <section className="text-center pt-8 border-t border-gray-200 pb-8">
          <p className="text-gray-400 text-sm">AI Assistant Dashboard v1.1.0</p>
        </section>
      </div>
    </div>
  );
}
