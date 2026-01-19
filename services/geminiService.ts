import { GoogleGenAI } from "@google/genai";
import { Message, ApiConfig } from "../types";

// Using the recommended model for text tasks
const MODEL_NAME = 'gemini-3-flash-preview';

export const sendMessageToGemini = async (
  messages: Message[],
  systemInstruction: string | undefined,
  apiConfig: ApiConfig
): Promise<string> => {
  if (!apiConfig.apiKey) {
    return "Error: API Key is missing. Please configure it in Settings.";
  }

  try {
    // Instantiate dynamically to support changing keys/urls at runtime
    // Passing baseUrl allows support for third-party proxies
    const clientOptions: any = { apiKey: apiConfig.apiKey };
    if (apiConfig.baseUrl && apiConfig.baseUrl.trim() !== '') {
      clientOptions.baseUrl = apiConfig.baseUrl.trim();
    }
    
    const ai = new GoogleGenAI(clientOptions);

    // 1. Filter out system messages (handled via config)
    const filteredMessages = messages.filter((m) => m.role !== 'system');

    // 2. Normalize history to ensure no consecutive messages have the same role
    const normalizedContents = [];
    if (filteredMessages.length > 0) {
        let currentRole = filteredMessages[0].role;
        let currentContent = filteredMessages[0].content;

        for (let i = 1; i < filteredMessages.length; i++) {
            const msg = filteredMessages[i];
            if (msg.role === currentRole) {
                // Merge content if same role
                currentContent += "\n\n" + msg.content;
            } else {
                // Push previous message
                normalizedContents.push({
                    role: currentRole,
                    parts: [{ text: currentContent }]
                });
                // Start new
                currentRole = msg.role;
                currentContent = msg.content;
            }
        }
        // Push the last one
        normalizedContents.push({
            role: currentRole,
            parts: [{ text: currentContent }]
        });
    }

    // 3. Ensure conversation starts with 'user'
    if (normalizedContents.length > 0 && normalizedContents[0].role === 'model') {
      normalizedContents.shift();
    }

    if (normalizedContents.length === 0) {
      return "Unable to send message: Content is empty or invalid history.";
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: normalizedContents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "No response generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `Error connecting to AI: ${error.message || 'Unknown error'}`;
  }
};
