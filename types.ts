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

// LLM Provider Configuration
export interface LLMProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  modelName: string;
  isActive: boolean;
  createdAt: string;
}

// Connection Test Result
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: string;
  responseTime?: number;
  timestamp: number;
}

// Extended API Configuration for multi-provider support
export interface ExtendedApiConfig {
  providers: LLMProvider[];
  activeProviderId: string | null;
}

export enum AppRoute {
  DASHBOARD = '/',
  GENERATOR = '/generator',
  CHAT = '/chat',
  SETTINGS = '/settings',
}
