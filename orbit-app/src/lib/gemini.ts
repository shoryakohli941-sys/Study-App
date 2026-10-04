import { GoogleGenAI } from '@google/genai';

// Handpicked credit-efficient Flash models from Google AI Studio
export const AI_MODELS = {
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Ultra Fast · Minimal Credits',
    description: 'Fastest reasoning with lowest credit consumption',
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    badge: 'High Stability · Universal',
    description: 'Battle-tested fallback with steady rate limits and minimal latency',
  },
} as const;

export type AIModelKey = keyof typeof AI_MODELS;
export const DEFAULT_AI_MODEL: AIModelKey = 'gemini-2.5-flash';

const MODEL_STORAGE_KEY = 'orbit_selected_ai_model';
const API_KEY_STORAGE = 'orbit_gemini_api_key';

// Structured Output exactly as requested by instructions
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
  [key: string]: any; // Allow fallback properties for compatibility if needed
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

function parseGeminiJson(rawText: string): GeminiResponse {
  let textToParse = rawText.trim();
  // Strip markdown code fences if present
  if (textToParse.startsWith('```json')) {
    textToParse = textToParse.substring(7);
  } else if (textToParse.startsWith('```')) {
    textToParse = textToParse.substring(3);
  }
  if (textToParse.endsWith('```')) {
    textToParse = textToParse.substring(0, textToParse.length - 3);
  }
  textToParse = textToParse.trim();

  try {
    return JSON.parse(textToParse) as GeminiResponse;
  } catch (error) {
    console.error('Failed to parse Gemini response', error, rawText);
    throw new Error('Could not parse Gemini JSON response');
  }
}

// Direct Text / Doubt Analysis (No image required)
export async function analyzeText(
  doubtText: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;

  const prompt = `Solve this doubt: ${doubtText}`;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
    }
  });

  return parseGeminiJson(response.text || '{}');
}

// Image Analysis with optional accompanying text prompt
export async function analyzeImage(
  imageData: string,
  arg2?: string,
  _arg3?: string, // Ignoring unused arg3 to match signature
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;

  let mimeType = 'image/jpeg';
  let base64Data = imageData;

  // Strip data URL prefix completely to send raw base64 to the SDK
  if (base64Data.startsWith('data:')) {
    base64Data = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  }

  let promptText = "Analyze this problem.";
  if (arg2) {
    // If arg2 has a slash, it's a mimetype (from the old signature), else it's additional text.
    if (!arg2.includes('/')) {
      promptText = `${promptText}\nAdditional student note: ${arg2}`;
    }
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: [
      promptText,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        }
      }
    ],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
    }
  });

  return parseGeminiJson(response.text || '{}');
}
