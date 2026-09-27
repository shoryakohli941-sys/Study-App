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

/**
 * Shape returned by analyzeImage(), consumed by FightMode.tsx and HintCard.tsx.
 */
export interface GeminiResponse {
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapter: string;
  subtopic: string;
  the_trap: string;
  hint_1_lens: string;
  hint_2_setup: string;
  hint_3_pivot: string;
  key_formula: string;
  full_solution: string;
}

const ANALYZE_PROMPT = `You are a Socratic JEE (Physics/Chemistry/Mathematics) mentor looking at a photo of a problem a student is stuck on.

Identify the subject, chapter and subtopic, then produce a staged hint sequence that helps the student find the solution themselves without giving it away immediately.

Respond with ONLY a raw JSON object (no markdown fences, no preamble) with exactly these keys:
{
  "subject": "Physics" | "Chemistry" | "Mathematics",
  "chapter": string (the JEE chapter this problem belongs to),
  "subtopic": string (specific concept/subtopic within the chapter),
  "the_trap": string (the common mistake or misconception this problem is designed to catch),
  "hint_1_lens": string (a gentle nudge toward the right way of looking at the problem, no numbers),
  "hint_2_setup": string (how to set up the equations/approach, still without solving),
  "hint_3_pivot": string (the key insight or step that unlocks the solution),
  "key_formula": string (the core formula(s) needed),
  "full_solution": string (the complete worked solution, step by step)
}`;

/**
 * Sends a base64-encoded image of a problem to Gemini and returns a
 * structured Socratic hint breakdown. Throws if the API key is missing
 * or the response can't be parsed as the expected JSON shape.
 */
export const analyzeImage = async (base64Image: string): Promise<GeminiResponse> => {
  const ai = getGeminiClient();

  const commaIndex = base64Image.indexOf(',');
  const rawBase64 = base64Image.startsWith('data:') && commaIndex !== -1
    ? base64Image.slice(commaIndex + 1)
    : base64Image;
  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: ANALYZE_PROMPT },
            { inlineData: { mimeType, data: rawBase64 } }
          ]
        }
      ]
    });
  } catch (err) {
    console.error('Gemini request failed:', err);
    throw new Error('Could not reach Gemini. Check your API key and connection.');
  }

  const text = response.text ?? '';
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned) as GeminiResponse;
    return parsed;
  } catch (err) {
    console.error('Failed to parse Gemini response as JSON:', text);
    throw new Error('Gemini returned an unexpected response. Please try again.');
  }
};
