import { Assistant } from './types';

export const GENERATOR_SYSTEM_PROMPT = `You are an expert AI Prompt Engineer. Your goal is to help the user create a specialized "System Prompt" for a new AI Assistant.

Process:
1.  Ask the user what kind of assistant they want to build.
2.  Ask about specific tasks, tone, and constraints.
3.  Once you have enough info, generate a JSON block describing the assistant.

The JSON block must be strictly in this format (no markdown around it if possible, or inside a code block):
{
  "name": "Assistant Name",
  "icon": "Emoji",
  "description": "Short description",
  "systemPrompt": "The full, detailed system prompt..."
}

Keep your non-JSON responses helpful, guiding, and concise.`;

export const DEFAULT_ASSISTANTS: Assistant[] = [
  {
    id: 'default-1',
    name: 'CMD Helper',
    icon: '💻',
    description: 'Expert in Windows CMD and PowerShell commands.',
    systemPrompt: 'You are a Windows CMD and PowerShell expert. Provide accurate commands, explain what they do, and warn about risks. Keep answers concise.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-2',
    name: 'Python Reviewer',
    icon: '🐍',
    description: 'Reviews Python code for bugs and PEP-8 standards.',
    systemPrompt: 'You are a Senior Python Developer. Review code provided by the user. Point out bugs, suggest performance improvements, and ensure PEP-8 compliance. Be constructive.',
    createdAt: new Date().toISOString(),
  },
];
