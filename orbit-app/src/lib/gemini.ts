import { GoogleGenAI } from '@google/genai';

const STORAGE_KEY = 'orbit_gemini_api_key';

export const getApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  const savedKey = localStorage.getItem(STORAGE_KEY);
  if (savedKey && savedKey.trim().length > 0) {
    return savedKey.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return '';
};

export const setApiKey = (key: string): void => {
  localStorage.setItem(STORAGE_KEY, key.trim());
};

export const clearApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const hasValidApiKey = (): boolean => {
  return getApiKey().length > 0;
};

export const getGeminiClient = (): GoogleGenAI => {
  const key = getApiKey();
  if (!key) {
    throw new Error('API_KEY_MISSING');
  }
  return new GoogleGenAI({ apiKey: key });
};

export interface GeminiResponse {
  subject: "Physics" | "Chemistry" | "Mathematics";
  chapter: string;
  subtopic: string;
  the_trap: string;
  hint_1_lens: string;
  hint_2_setup: string;
  hint_3_pivot: string;
  key_formula: string;
  full_solution: string;
}

export const analyzeImage = async (base64DataUrl: string): Promise<GeminiResponse> => {
  const ai = getGeminiClient();

  // Strip data URL prefix
  const base64 = base64DataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

  const systemInstruction = `You are an elite JEE Advanced Socratic mentor. Analyze the question image and return structured JSON matching:
{
  "subject": "Physics" | "Chemistry" | "Mathematics",
  "chapter": "string",
  "subtopic": "string",
  "the_trap": "1-sentence warning of where students miscalculate or pick the wrong approach",
  "hint_1_lens": "Fundamental governing principle or reference frame (NO equations)",
  "hint_2_setup": "First step equation, constraint relation, or FBD setup",
  "hint_3_pivot": "The algebraic or conceptual bottleneck",
  "key_formula": "Critical formula or condition in standard text format",
  "full_solution": "Concise step-by-step resolution"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType: 'image/jpeg',
            },
          },
          { text: "Analyze the image and provide the required structured JSON." }
        ],
      },
    ],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini API");
  }

  // Sanitize markdown code fences
  const sanitized = text.replace(/^```json/m, '').replace(/```$/m, '').trim();

  try {
    const data = JSON.parse(sanitized);
    return data as GeminiResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", sanitized);
    throw new Error("Invalid response format from AI");
  }
};
