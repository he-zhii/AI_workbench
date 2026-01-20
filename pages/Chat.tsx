import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Info, Trash2, X, AlertCircle } from 'lucide-react';
import { useApp } from '../App';
import { sendOpenAICompatibleMessage } from '../services/openaiCompatibleService';
import { Message, AppRoute } from '../types';
import MessageContent from '../components/MessageContent';

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assistants, getActiveProvider } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const assistant = assistants.find((a) => a.id === id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

  useEffect(() => {
    if (!assistant) {
      navigate(AppRoute.DASHBOARD);
    }
  }, [assistant, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !assistant) return;

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

    const response = await sendOpenAICompatibleMessage(
      [...messages, userMsg],
      assistant.systemPrompt,
      activeProvider
    );

    setMessages((prev) => [
      ...prev,
      { role: 'model', content: response, timestamp: Date.now() },
    ]);
    setIsTyping(false);
  };

  if (!assistant) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="h-16 px-4 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(AppRoute.DASHBOARD)}
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
            {assistant.icon}
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">{assistant.name}</h1>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Active
            </p>
          </div>
        </div>
        {/* Provider Error Alert */}
        {providerError && (
          <div className="flex-1 flex justify-center px-4">
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm border border-red-200">
              <AlertCircle size={16} />
              <span>{providerError}</span>
              <button
                onClick={() => setProviderError(null)}
                className="ml-2 text-red-400 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([])}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg transition-colors ${
              showInfo ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50 select-none">
                <span className="text-6xl mb-4 grayscale filter">{assistant.icon}</span>
                <p className="text-lg font-medium text-gray-600">Start a conversation with {assistant.name}</p>
                <p className="text-sm text-gray-400 mt-2 max-w-sm">{assistant.description}</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] lg:max-w-[70%] rounded-2xl px-5 py-3 shadow-sm text-sm md:text-base ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <MessageContent content={msg.content} isUser={msg.role === 'user'} />
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
            <div className="max-w-4xl mx-auto relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Message ${assistant.name}...`}
                disabled={isTyping}
                className="w-full pl-5 pr-14 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl transition-all outline-none shadow-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar (Desktop Overlay style for simplicity in this layout) */}
        {showInfo && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl z-20 p-6 overflow-y-auto transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Assistant Info</h3>
              <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Name</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-2xl">{assistant.icon}</span>
                  <span className="font-medium text-gray-900">{assistant.name}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">System Prompt</label>
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 text-xs font-mono text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {assistant.systemPrompt}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">ID</label>
                <code className="text-xs text-gray-400">{assistant.id}</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
