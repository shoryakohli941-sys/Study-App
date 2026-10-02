import { GoogleGenAI } from '@google/genai';

// Handpicked credit-efficient Flash models from Google AI Studio
export const AI_MODELS = {
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Fast & Smart',
    description: 'Fastest reasoning with lowest credit consumption',
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    badge: 'Reliable Fallback',
    description: 'Balanced performance, low latency fallback',
  },
} as const;

export type AIModelKey = keyof typeof AI_MODELS;
export const DEFAULT_AI_MODEL: AIModelKey = 'gemini-2.5-flash';

const MODEL_STORAGE_KEY = 'orbit_selected_ai_model';
const API_KEY_STORAGE = 'orbit_gemini_api_key';

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

const SYSTEM_INSTRUCTION = `You are an elite JEE Advanced Socratic mentor. Analyze the question image and return structured JSON matching:
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

function sanitizeJsonString(rawString: string): string {
  // Remove markdown code fences if they exist
  let sanitized = rawString.trim();
  if (sanitized.startsWith('```json')) {
    sanitized = sanitized.substring(7);
  } else if (sanitized.startsWith('```')) {
    sanitized = sanitized.substring(3);
  }

  if (sanitized.endsWith('```')) {
    sanitized = sanitized.substring(0, sanitized.length - 3);
  }

  return sanitized.trim();
}

function parseGeminiJson(rawText: string): GeminiResponse {
  try {
    const sanitized = sanitizeJsonString(rawText);
    const parsed = JSON.parse(sanitized);
    return {
      subject: parsed.subject || "Physics",
      chapter: parsed.chapter || "General",
      subtopic: parsed.subtopic || "Concept Analysis",
      the_trap: parsed.the_trap || "",
      hint_1_lens: parsed.hint_1_lens || "",
      hint_2_setup: parsed.hint_2_setup || "",
      hint_3_pivot: parsed.hint_3_pivot || "",
      key_formula: parsed.key_formula || "",
      full_solution: parsed.full_solution || rawText,
    };
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", rawText);
    return {
      subject: "Physics",
      chapter: "Error parsing response",
      subtopic: "Concept Analysis",
      the_trap: "",
      hint_1_lens: "",
      hint_2_setup: "",
      hint_3_pivot: "",
      key_formula: "",
      full_solution: rawText,
    };
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

  const response = await ai.models.generateContent({
    model: modelId,
    contents: doubtText,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    }
  });

  return parseGeminiJson(response.text || "");
}

// Image Analysis with optional accompanying text prompt
export async function analyzeImage(
  imageData: string,
  arg2?: string,
  _arg3?: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  let mimeType = 'image/jpeg';
  let base64Data = imageData;

  // Ensure data URL prefix is stripped before sending to the Gemini SDK
  const dataUrlPrefixMatch = imageData.match(/^data:image\/[a-z]+;base64,/);
  if (dataUrlPrefixMatch) {
    mimeType = imageData.substring(5, imageData.indexOf(';')); // e.g. image/jpeg
    base64Data = imageData.substring(imageData.indexOf(',') + 1);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;

  let textPrompt = arg2 || "Analyze this problem image.";

  const response = await ai.models.generateContent({
    model: modelId,
    contents: [
      {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: textPrompt }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    }
  });

  return parseGeminiJson(response.text || "");
}
