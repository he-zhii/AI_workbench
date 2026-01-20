import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { ConnectionTestResult } from '../types';

interface ConnectionTestResultProps {
  result: ConnectionTestResult;
  providerName: string;
}

export default function ConnectionTestResultComponent({
  result,
  providerName,
}: ConnectionTestResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (result.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={16} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">Connection Successful</p>
            <p className="text-xs text-green-600 mt-0.5">
              Successfully connected to {providerName}
            </p>
          </div>
          {result.responseTime && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              <Clock size={12} />
              <span>{result.responseTime}ms</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-red-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <X size={16} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800">Connection Failed</p>
            <p className="text-xs text-red-600 mt-0.5 truncate">{result.message}</p>
          </div>
          {result.responseTime && (
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
              <Clock size={12} />
              <span>{result.responseTime}ms</span>
            </div>
          )}
          <button className="text-red-400 hover:text-red-600 transition-colors">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && result.details && (
        <div className="px-4 pb-4 border-t border-red-200">
          <div className="pt-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-red-700 mb-1">Troubleshooting</p>
              <p className="text-xs text-red-600">{result.details}</p>
            </div>
          </div>

          {/* Common Issues */}
          <div className="mt-3 p-2 bg-white/60 rounded">
            <p className="text-xs font-medium text-red-700 mb-1">Common Issues:</p>
            <ul className="text-xs text-red-600 space-y-0.5">
              <li>• Verify your API Key is correct</li>
              <li>• Check the Base URL is properly formatted</li>
              <li>• Ensure the model name is supported by the provider</li>
              <li>• Check if you have sufficient credits/quota</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
