import { GoogleGenAI } from '@google/genai';

// Strictly use the models that GenAI SDK supports and are highly capable
export const AI_MODELS = {
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Ultra Fast · Capable',
    description: 'Fastest reasoning with lowest credit consumption',
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    badge: 'High Throughput · Balanced',
    description: 'Balanced performance, low latency fallback during spikes',
  },
} as const;

export type AIModelKey = keyof typeof AI_MODELS;
export const DEFAULT_AI_MODEL: AIModelKey = 'gemini-2.5-flash';

const MODEL_STORAGE_KEY = 'orbit_selected_ai_model';
const API_KEY_STORAGE = 'orbit_gemini_api_key';

// Strictly typed without optional 'undefined' to satisfy strictNullChecks in HintCard
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
  [key: string]: any;
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


function parseGeminiJson(rawText: string): GeminiResponse {
  let parsed: GeminiResponse = {
    subject: "Physics",
    chapter: "General",
    subtopic: "General",
    the_trap: "Error analyzing",
    hint_1_lens: rawText,
    hint_2_setup: "",
    hint_3_pivot: "",
    key_formula: "",
    full_solution: rawText,
  };

  try {
    // Clean markdown code fences if any
    const cleanedText = rawText.replace(/^```json\s*/m, '').replace(/```\s*$/m, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonParsed = JSON.parse(jsonMatch[0]);
      parsed = { ...parsed, ...jsonParsed };
    } else {
        const jsonParsed = JSON.parse(cleanedText);
        parsed = { ...parsed, ...jsonParsed };
    }
  } catch {
    // Keep fallback plain-text structure
  }

  return parsed;
}

// Direct Text / Doubt Analysis (No image required)
export async function analyzeText(
  doubtText: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  const prompt = `You are an elite JEE Advanced Socratic mentor. Analyze the doubt or problem statement:
"""
${doubtText}
"""
and return structured JSON matching:
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

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  return parseGeminiJson(response.text || "");
}

// Image Analysis with optional accompanying text prompt
export async function analyzeImage(
  imageData: string,
  arg2?: string,
  arg3?: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  let mimeType = 'image/jpeg';
  // Strip data prefix, eg: "data:image/jpeg;base64,"
  let base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

  if (imageData.startsWith('data:')) {
    const parts = imageData.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
    // base64Data is already stripped above, but if we need to be safe:
    base64Data = parts[1] || base64Data;
  }

  let prompt = `You are an elite JEE Advanced Socratic mentor. Analyze the question image and return structured JSON matching:
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

  if (arg2) {
    if (arg2.includes('/')) {
      mimeType = arg2;
      if (arg3) prompt = arg3;
    } else {
      prompt = `${prompt}\nAdditional student note: ${arg2}`;
    }
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: [
      {
        inlineData: {
          mimeType,
          data: base64Data,
        }
      },
      prompt
    ],
    config: {
      responseMimeType: "application/json",
    }
  });

  return parseGeminiJson(response.text || "");
}
