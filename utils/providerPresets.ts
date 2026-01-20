export interface ProviderPreset {
  name: string;
  baseUrl: string;
  model: string;
  description: string;
}

export const PROVIDER_PRESETS: Record<string, ProviderPreset> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    description: 'Official OpenAI API endpoint',
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-sonnet',
    description: 'Unified API for multiple LLM providers',
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    description: 'Moonshot AI\'s Kimi chatbot API',
  },
  qianwen: {
    name: '千问 (通义千问)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    description: 'Alibaba\'s Tongyi Qianwen API',
  },
  zhipu: {
    name: '智谱清言 (GLM)',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    description: 'Zhipu AI\'s GLM API',
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    description: 'DeepSeek\'s API endpoint',
  },
};

export const getProviderPreset = (key: string): ProviderPreset | undefined => {
  return PROVIDER_PRESETS[key];
};

export const getProviderPresetKeys = (): string[] => {
  return Object.keys(PROVIDER_PRESETS);
};
