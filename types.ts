export interface Assistant {
  id: string;
  name: string;
  icon: string;
  systemPrompt: string;
  description: string;
  createdAt: string;
}

export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  assistantId: string;
  messages: Message[];
}

export interface ApiConfig {
  apiKey: string;
  baseUrl: string;
}

export enum AppRoute {
  DASHBOARD = '/',
  GENERATOR = '/generator',
  CHAT = '/chat',
  SETTINGS = '/settings',
}
