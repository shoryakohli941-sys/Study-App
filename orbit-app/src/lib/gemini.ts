import { GoogleGenAI } from '@google/genai';

// Polyfill NodeJS namespace for browser environments
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

export const AI_MODELS = {
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'High Performance · Universal',
    description: 'Fastest reasoning with latest capabilities',
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    badge: 'Battle-Tested · Stable',
    description: 'Reliable fallback model',
  },
} as const;

export type AIModelKey = keyof typeof AI_MODELS;
export const DEFAULT_AI_MODEL: AIModelKey = 'gemini-2.5-flash';

const MODEL_STORAGE_KEY = 'orbit_selected_ai_model';
const API_KEY_STORAGE = 'orbit_gemini_api_key';

export interface GeminiResponse {
  subject: string;
  chapter: string;
  subtopic: string;
  the_trap: string;
  hint_1_lens: string;
  hint_2_setup: string;
  hint_3_pivot: string;
  key_formula: string;
  full_solution: string;
}

export function getApiKey(): string {
  try {
    return (
      localStorage.getItem(API_KEY_STORAGE) ||
      (import.meta.env.VITE_GEMINI_API_KEY as string) ||
      ''
    );
  } catch {
    return (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
  }
}

export function setApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  } catch {
    // Ignore storage write errors
  }
}

export function hasValidApiKey(): boolean {
  const key = getApiKey();
  return Boolean(key && key.trim().length > 0);
}

export function getSavedAIModel(): AIModelKey {
  try {
    const saved = localStorage.getItem(MODEL_STORAGE_KEY) as AIModelKey;
    if (saved && saved in AI_MODELS) {
      return saved;
    }
  } catch {
    // Ignore storage read errors
  }
  return DEFAULT_AI_MODEL;
}

export function saveAIModel(modelKey: AIModelKey): void {
  try {
    localStorage.setItem(MODEL_STORAGE_KEY, modelKey);
  } catch {
    // Ignore storage write errors
  }
}

function getSystemInstruction() {
  return `You are an elite JEE Advanced Socratic mentor. Analyze the question image and return structured JSON matching:
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
}

function parseGeminiJson(rawText: string): GeminiResponse {
  try {
    const sanitized = rawText.replace(/```(json)?\n?|```/g, '').trim();
    return JSON.parse(sanitized);
  } catch (error) {
    console.error("Failed to parse Gemini response:", rawText, error);
    // Return a safe fallback
    return {
      subject: "Mathematics",
      chapter: "Unknown",
      subtopic: "Unknown",
      the_trap: "Unable to analyze the problem.",
      hint_1_lens: "Please review the fundamental concepts.",
      hint_2_setup: "Try writing down the given variables.",
      hint_3_pivot: "Check for any simplifications.",
      key_formula: "Basic principles apply.",
      full_solution: "The model was unable to provide a structured solution. Raw text: " + rawText,
    };
  }
}

export async function analyzeText(
  doubtText: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Gemini API Key missing.');

  const ai = new GoogleGenAI({ apiKey });
  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: doubtText,
    config: {
      systemInstruction: getSystemInstruction(),
      responseMimeType: 'application/json',
    },
  });

  return parseGeminiJson(response.text || '');
}

export async function analyzeImage(
  imageData: string,
  additionalText?: string,
  _arg3?: string, // Keeping signature compatible for now
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Gemini API Key missing.');

  const ai = new GoogleGenAI({ apiKey });
  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;

  let mimeType = 'image/jpeg';
  let base64Data = imageData;

  // Strip data URL prefix
  if (imageData.startsWith('data:')) {
    const parts = imageData.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
    base64Data = parts[1] || '';
  }

  const prompt = additionalText
    ? `Analyze this problem.\nAdditional student note: ${additionalText}`
    : `Analyze this problem image.`;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: getSystemInstruction(),
      responseMimeType: 'application/json',
    },
  });

  return parseGeminiJson(response.text || '');
}
