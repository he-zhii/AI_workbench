import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Check, RefreshCw, ChevronRight, Save } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { useApp } from '../App';
import { Message, Assistant, AppRoute } from '../types';
import { GENERATOR_SYSTEM_PROMPT } from '../constants';
import Button from '../components/Button';
import MessageContent from '../components/MessageContent';

export default function Generator() {
  const { addAssistant, apiConfig } = useApp();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Draft State
  const [draft, setDraft] = useState<Partial<Assistant>>({
    name: '',
    icon: '🤖',
    description: '',
    systemPrompt: '',
  });

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle User Send
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Gemini
    // We pass the full message history. The service layer handles normalization 
    // and ensuring the request starts with a 'user' role.
    const responseText = await sendMessageToGemini(
      [...messages, userMsg],
      GENERATOR_SYSTEM_PROMPT,
      apiConfig
    );

    setIsTyping(false);

    // Try to extract JSON from response
    try {
      // Regex to capture the first JSON object block in the text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Update draft with whatever fields we got
        setDraft((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          icon: parsed.icon || prev.icon,
          description: parsed.description || prev.description,
          systemPrompt: parsed.systemPrompt || prev.systemPrompt,
        }));
      }
    } catch (e) {
      // JSON parsing failed, just continue chat
      console.log('No structured JSON found in response or parse error', e);
    }

    setMessages((prev) => [
      ...prev,
      { role: 'model', content: responseText, timestamp: Date.now() },
    ]);
  };

  const handleSave = () => {
    if (!draft.name || !draft.systemPrompt) {
      alert("Please ensure at least a Name and System Prompt are generated or entered.");
      return;
    }
    const newAssistant: Assistant = {
      id: crypto.randomUUID(),
      name: draft.name,
      icon: draft.icon || '🤖',
      description: draft.description || 'Generated Assistant',
      systemPrompt: draft.systemPrompt,
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
    </div>
  );
}
