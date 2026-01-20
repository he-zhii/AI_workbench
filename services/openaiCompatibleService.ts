import { Message, LLMProvider, ConnectionTestResult } from '../types';

interface ChatCompletionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  error?: {
    message: string;
    type?: string;
    code?: string;
  };
}

/**
 * Convert internal Message format to OpenAI ChatCompletion format
 */
const convertToOpenAIMessages = (
  messages: Message[],
  systemInstruction: string | undefined
): ChatCompletionMessage[] => {
  const result: ChatCompletionMessage[] = [];

  if (systemInstruction) {
    result.push({
      role: 'system',
      content: systemInstruction,
    });
  }

  for (const msg of messages) {
    if (msg.role === 'model') {
      result.push({
        role: 'assistant',
        content: msg.content,
      });
    } else {
      result.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  return result;
};

/**
 * Send a message using OpenAI-compatible API
 */
export const sendOpenAICompatibleMessage = async (
  messages: Message[],
  systemInstruction: string | undefined,
  provider: LLMProvider
): Promise<string> => {
  if (!provider.apiKey) {
    return 'Error: API Key is missing. Please configure it in Settings.';
  }

  const startTime = Date.now();

  try {
    const requestPayload: ChatCompletionRequest = {
      model: provider.modelName,
      messages: convertToOpenAIMessages(messages, systemInstruction),
      max_tokens: 4096,
      temperature: 0.7,
    };

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    const elapsedTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      console.error(`OpenAI Compatible API Error (${response.status}):`, errorMessage);
      return `Error connecting to AI provider (${response.status}): ${errorMessage}`;
    }

    const data: ChatCompletionResponse = await response.json();

    if (data.error) {
      console.error('OpenAI Compatible API Error:', data.error);
      return `Error from AI provider: ${data.error.message}`;
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('Empty response from API:', data);
      return 'No response generated. The API returned an empty response.';
    }

    console.log(`OpenAI Compatible API call completed in ${elapsedTime}ms`);
    return content;
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime;
    console.error('OpenAI Compatible API Network Error:', error);
    return `Error connecting to AI provider: ${error.message || 'Unknown error'}`;
  }
};

/**
 * Test connection to an OpenAI-compatible API endpoint
 */
export const testConnection = async (
  provider: LLMProvider
): Promise<ConnectionTestResult> => {
  const startTime = Date.now();

  if (!provider.apiKey) {
    return {
      success: false,
      message: 'API Key is missing',
      details: 'Please provide an API Key for this provider',
      timestamp: startTime,
    };
  }

  try {
    const testPayload: ChatCompletionRequest = {
      model: provider.modelName,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    };

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const elapsedTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;

      let details = '';
      let troubleshooting = '';

      switch (response.status) {
        case 401:
          details = 'Authentication failed';
          troubleshooting = 'Please check that your API Key is correct';
          break;
        case 404:
          details = 'Endpoint not found';
          troubleshooting = 'Please verify the Base URL is correct';
          break;
        case 429:
          details = 'Rate limit exceeded';
          troubleshooting = 'Please wait a moment and try again';
          break;
        case 500:
        case 502:
        case 503:
          details = 'Server error';
          troubleshooting = 'The provider is experiencing issues. Please try again later';
          break;
        default:
          details = `HTTP ${response.status}`;
          troubleshooting = 'Please check your configuration and try again';
      }

      return {
        success: false,
        message: `Connection failed: ${errorMessage}`,
        details: `${details}. ${troubleshooting}`,
        responseTime: elapsedTime,
        timestamp: startTime,
      };
    }

    const data: ChatCompletionResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        message: `API Error: ${data.error.message}`,
        details: data.error.type || 'Unknown error type',
        responseTime: elapsedTime,
        timestamp: startTime,
      };
    }

    return {
      success: true,
      message: 'Connection successful',
      details: `Successfully connected to ${provider.name}`,
      responseTime: elapsedTime,
      timestamp: startTime,
    };
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime;
    const isNetworkError = error.name === 'TypeError' && error.message === 'Failed to fetch';

    return {
      success: false,
      message: 'Network error',
      details: isNetworkError
        ? 'Could not connect to the server. This might be due to CORS restrictions or network connectivity issues.'
        : error.message || 'Unknown error',
      responseTime: elapsedTime,
      timestamp: startTime,
    };
  }
};
