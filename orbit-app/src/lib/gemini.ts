import { GoogleGenAI } from '@google/genai';

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
    description: 'Balanced performance, battle-tested fallback',
  }
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

function getSystemInstruction(): string {
  return `You are an elite JEE Advanced Socratic mentor. Analyze the question image or text and return structured JSON matching:
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

async function callGenAIApi(
  contents: any[],
  modelKey: AIModelKey = getSavedAIModel()
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: modelId,
    contents: contents,
    config: {
      systemInstruction: getSystemInstruction(),
      responseMimeType: 'application/json',
    }
  });

  return response.text || '';
}

function parseGeminiJson(rawText: string): GeminiResponse {
  const defaultFallback: GeminiResponse = {
    subject: "Mathematics",
    chapter: "General",
    subtopic: "Concept Analysis",
    the_trap: "Missing specific details.",
    hint_1_lens: "Review fundamental concepts.",
    hint_2_setup: "Set up the basic equations.",
    hint_3_pivot: "Identify constraints.",
    key_formula: "Basic principles",
    full_solution: "Solution could not be generated.",
  };

  try {
    // Sanitize markdown fences if present
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }

    // Additional regex to try extract JSON block if not perfectly formatted
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanText);
    return { ...defaultFallback, ...parsed };
  } catch {
    return defaultFallback;
  }
}

// Direct Text / Doubt Analysis (No image required)
export async function analyzeText(
  doubtText: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  const prompt = doubtText;

  const text = await callGenAIApi([{ role: 'user', parts: [{ text: prompt }] }], modelKey);
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

  if (imageData.startsWith('data:')) {
    const parts = imageData.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
    base64Data = parts[1] || '';
  }

  let promptText = "Analyze this problem.";
  if (arg2) {
    if (arg2.includes('/')) {
      mimeType = arg2;
      if (arg3) promptText = arg3;
    } else {
      promptText = `Analyze this problem. Additional student note: ${arg2}`;
    }
  }

  const text = await callGenAIApi([{
    role: 'user',
    parts: [
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: promptText },
    ],
  }], modelKey);

  return parseGeminiJson(text);
}

export async function generateStudyPlan(
  topic: string,
  subject: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<string> {
  const prompt = `You are a high-yield study strategist for competitive exams.
Break down this backlog topic into an actionable, prioritized roadmap:
- Subject: ${subject}
- Backlog Chapter/Topic: ${topic}

Provide:
1. Core Prerequisite concepts to review first (max 3 bullets).
2. High-Yield Subtopics ranked by exam weightage.
3. 3-Phase Study Plan (Theory -> Problem Solving -> Error Review).
4. Estimated time required (in hours) and common pitfalls to avoid.

Keep it concise, actionable, and formatted in clean Markdown.`;

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }
  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }]}]
  });
  return response.text || '';
}
