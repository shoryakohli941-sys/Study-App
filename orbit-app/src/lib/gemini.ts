// Polyfill NodeJS namespace for browser environments (resolves NodeJS.Timeout TS error)

// Handpicked credit-efficient Flash models from Google AI Studio
export const AI_MODELS = {
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Ultra Fast · Next Gen',
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
  subject?: string;
  chapter?: string;
  subtopic?: string;
  the_trap?: string;
  hint_1_lens?: string;
  hint_2_setup?: string;
  hint_3_pivot?: string;
  key_formula?: string;
  full_solution?: string;
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

import { GoogleGenAI } from '@google/genai';

export function saveAIModel(modelKey: AIModelKey): void {
  try {
    localStorage.setItem(MODEL_STORAGE_KEY, modelKey);
  } catch {
    // Ignore storage write errors
  }
}

async function callGeminiApi(
  prompt: string,
  imageData?: { mimeType: string, base64Data: string },
  modelKey: AIModelKey = getSavedAIModel(),
  systemInstructionText?: string
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;

  const ai = new GoogleGenAI({ apiKey });

  const contents = [];
  if (imageData) {
    contents.push({
      inlineData: {
        data: imageData.base64Data,
        mimeType: imageData.mimeType,
      }
    });
  }
  contents.push(prompt);

  const response = await ai.models.generateContent({
    model: modelId,
    contents,
    config: {
      systemInstruction: systemInstructionText,
      responseMimeType: "application/json"
    }
  });

  return response.text || '';
}

function parseGeminiJson(rawText: string): GeminiResponse {
  try {
    // Remove markdown code fences if present (e.g. ```json \n ... \n ```)
    const sanitizedText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    const jsonMatch = sanitizedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as GeminiResponse;
    }
    return JSON.parse(sanitizedText) as GeminiResponse;
  } catch {
    return {
      full_solution: rawText,
      chapter: "Error parsing response"
    };
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

// Direct Text / Doubt Analysis (No image required)
export async function analyzeText(
  doubtText: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  const prompt = `Analyze this student's specific doubt or problem statement:
"""
${doubtText}
"""`;

  const text = await callGeminiApi(
    prompt,
    undefined,
    modelKey,
    systemInstruction
  );

  return parseGeminiJson(text);
}

// Image Analysis with optional accompanying text prompt
export async function analyzeImage(
  imageData: string,
  arg2?: string,
  arg3?: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  let mimeType = 'image/jpeg';
  let base64Data = imageData;

  // The instruction requires stripping `^data:image\/[a-z]+;base64,`
  const dataUrlRegex = /^data:image\/[a-z]+;base64,/;
  if (dataUrlRegex.test(imageData)) {
    const parts = imageData.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
    base64Data = parts[1] || '';
  }

  let prompt = `Analyze this problem image.`;

  if (arg2) {
    if (arg2.includes('/')) {
      mimeType = arg2;
      if (arg3) prompt = arg3;
    } else {
      prompt = `${prompt}\nAdditional student note: ${arg2}`;
    }
  }

  const text = await callGeminiApi(
    prompt,
    { mimeType, base64Data },
    modelKey,
    systemInstruction
  );

  return parseGeminiJson(text);
}
