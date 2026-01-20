import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Check, RefreshCw, ChevronRight, Save, AlertCircle } from 'lucide-react';
import { sendOpenAICompatibleMessage } from '../services/openaiCompatibleService';
import { useApp } from '../App';
import { Message, Assistant, AppRoute } from '../types';
import Button from '../components/Button';
import MessageContent from '../components/MessageContent';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Generator() {
  const { addAssistant, getActiveProvider, generatorPrompt } = useApp();
  const navigate = useNavigate();

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hi! I'm here to help you build a new AI assistant. What kind of helper do you need today? (e.g., 'A Linux terminal expert' or 'A creative writing coach')",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Draft State
  const [draft, setDraft] = useState<Partial<Assistant>>({
    name: '',
    icon: '🤖',
    description: '',
    systemPrompt: '',
  });

  // Dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Extract config from response (tries __CONFIG__ tags first, falls back to JSON matching)
  const extractConfigFromResponse = (responseText: string): Partial<Assistant> | null => {
    // Try __CONFIG__ tags first
    const configMatch = responseText.match(/__CONFIG__\s*([\s\S]*?)\s*__CONFIG__/);
    if (configMatch) {
      try {
        return JSON.parse(configMatch[1]);
      } catch (e) {
        console.log('Failed to parse config from __CONFIG__ tags');
      }
    }

    // Fallback: try original JSON regex
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log('Failed to parse JSON from response');
      }
    }

    return null;
  };

  // Filter response for display (removes __CONFIG__ blocks)
  const filterResponseForDisplay = (responseText: string): string => {
    return responseText.replace(/__CONFIG__[\s\S]*?__CONFIG__/g, '').trim();
  };

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle User Send
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // Check for active provider
    const activeProvider = getActiveProvider();
    if (!activeProvider) {
      setProviderError('No AI provider configured. Please add a provider in Settings.');
      setTimeout(() => setProviderError(null), 5000);
      return;
    }

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setProviderError(null);

    // Call OpenAI-compatible service
    const responseText = await sendOpenAICompatibleMessage(
      [...messages, userMsg],
      generatorPrompt,
      activeProvider
    );

    setIsTyping(false);

    // Extract config using the new helper function
    const jsonData = extractConfigFromResponse(responseText);

    // Update draft with whatever fields we got
    if (jsonData) {
      setDraft((prev) => ({
        ...prev,
        name: jsonData.name || prev.name,
        icon: jsonData.icon || prev.icon,
        description: jsonData.description || prev.description,
        systemPrompt: jsonData.systemPrompt || prev.systemPrompt,
      }));
    }

    // Filter response for display (removes __CONFIG__ blocks)
    const displayContent = filterResponseForDisplay(responseText);

    setMessages((prev) => [
      ...prev,
      { role: 'model', content: displayContent, timestamp: Date.now() },
    ]);
  };

  const handleSave = () => {
    if (!draft.name || !draft.systemPrompt) {
      setShowSaveDialog(true);
      return;
    }
    createAssistant();
  };

  const createAssistant = () => {
    const newAssistant: Assistant = {
      id: crypto.randomUUID(),
      name: draft.name || 'New Assistant',
      icon: draft.icon || '🤖',
      description: draft.description || 'Generated Assistant',
      systemPrompt: draft.systemPrompt || 'You are a helpful assistant.',
      createdAt: new Date().toISOString(),
    };
    addAssistant(newAssistant);
    navigate(AppRoute.DASHBOARD);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left: Chat Area */}
      <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h2 className="font-semibold text-lg text-gray-800">Builder Chat</h2>
          <Button variant="ghost" size="sm" onClick={() => setMessages([messages[0]])}>
            <RefreshCw size={16} className="mr-1" /> Reset
          </Button>
        </div>

        {/* Provider Error Alert */}
        {providerError && (
          <div className="mx-4 mt-4 flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-200">
            <AlertCircle size={16} />
            <span className="flex-1">{providerError}</span>
            <button
              onClick={() => setProviderError(null)}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                <div className="text-sm leading-relaxed">
                  <MessageContent content={msg.content} isUser={msg.role === 'user'} />
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
               <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1 items-center shadow-sm">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your assistant..."
              disabled={isTyping}
              className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl transition-all outline-none shadow-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Preview & Edit Area */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white overflow-y-auto border-l border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-lg text-gray-800">Preview & Edit</h2>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Icon & Name</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={draft.icon}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                className="w-16 text-center text-2xl p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="🤖"
              />
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="flex-1 p-3 font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="Assistant Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 transition-shadow"
              placeholder="Short description..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Prompt</label>
            <textarea
              value={draft.systemPrompt}
              onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono h-[300px] resize-none transition-shadow"
              placeholder="The instruction that defines the AI's behavior..."
            />
            <p className="text-xs text-gray-400">
              The builder chat will automatically fill this. You can tweak it manually.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <Button onClick={handleSave} className="w-full py-3 shadow-md" size="lg">
            <Save className="mr-2 w-5 h-5" />
            Save Assistant
          </Button>
        </div>
      </div>

      {/* Validation Dialog */}
      <ConfirmDialog
        isOpen={showSaveDialog}
        type="warning"
        title="Incomplete Assistant"
        message="Please ensure at least a Name and System Prompt are generated or entered before saving."
        confirmText="Got it"
        cancelText=""
        onConfirm={() => setShowSaveDialog(false)}
        onCancel={() => setShowSaveDialog(false)}
      />
    </div>
  );
}
