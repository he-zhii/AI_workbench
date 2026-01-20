import React, { useState } from 'react';
import { Check, Zap, Trash2, Edit2, Globe, Loader2 } from 'lucide-react';
import { LLMProvider, ConnectionTestResult } from '../types';
import { testConnection } from '../services/openaiCompatibleService';
import Button from './Button';

interface ProviderCardProps {
  provider: LLMProvider;
  isActive: boolean;
  onSetActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProviderCard({
  provider,
  isActive,
  onSetActive,
  onEdit,
  onDelete,
}: ProviderCardProps) {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const result = await testConnection(provider);
    setTestResult(result);
    setIsTesting(false);
  };

  const getStatusIndicator = () => {
    if (isTesting) {
      return (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 size={14} className="animate-spin" />
          <span>Testing...</span>
        </div>
      );
    }

    if (testResult) {
      if (testResult.success) {
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Connected ({testResult.responseTime}ms)</span>
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>{testResult.message}</span>
          </div>
        );
      }
    }

    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        <span>Not tested</span>
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-lg border p-4 transition-all ${
        isActive
          ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
          : 'border-gray-200 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{provider.name}</h3>
            {isActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <Globe size={12} />
            <span className="font-mono truncate">{provider.modelName}</span>
          </div>
          {getStatusIndicator()}
        </div>
      </div>

      {/* Test Result Details */}
      {testResult && !testResult.success && testResult.details && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {testResult.details}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <Button
          size="sm"
          variant={isActive ? 'primary' : 'secondary'}
          onClick={onSetActive}
          disabled={isActive}
          className="flex-1"
        >
          {isActive ? <Check size={14} className="mr-1" /> : <Zap size={14} className="mr-1" />}
          {isActive ? 'Active' : 'Set Active'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleTestConnection}
          disabled={isTesting}
          className="flex-1"
        >
          {isTesting ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Globe size={14} className="mr-1" />}
          Test
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          title="Edit provider"
        >
          <Edit2 size={14} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          title="Delete provider"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}
