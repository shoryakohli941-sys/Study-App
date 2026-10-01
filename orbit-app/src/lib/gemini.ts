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
  rawText?: string;
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

async function callGeminiApi(
  contents: string | Array<string | { inlineData: { mimeType: string; data: string } }>,
  modelKey: AIModelKey = getSavedAIModel(),
  systemInstruction?: string
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;

  const response = await ai.models.generateContent({
    model: modelId,
    contents,
    config: {
      responseMimeType: 'application/json',
      systemInstruction: systemInstruction,
    }
  });

  return response.text || '';
}

function parseGeminiJson(rawText: string): GeminiResponse {
  let parsed: GeminiResponse = {
    subject: "Physics",
    chapter: "Unknown Chapter",
    subtopic: "Unknown Subtopic",
    the_trap: "Unable to parse the trap.",
    hint_1_lens: "Unable to parse hint 1.",
    hint_2_setup: "Unable to parse hint 2.",
    hint_3_pivot: "Unable to parse hint 3.",
    key_formula: "Unknown formula",
    full_solution: "Unable to parse full solution.",
    rawText: rawText,
  };

  try {
    // Remove markdown code fences if present
    const cleanText = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonParsed = JSON.parse(jsonMatch[0]);
      parsed = { ...parsed, ...jsonParsed, rawText };
    }
  } catch {
    // Keep fallback plain-text structure
  }

  return parsed;
}

const FIGHT_MODE_SYSTEM_INSTRUCTION = `You are an elite JEE Advanced Socratic mentor. Analyze the question image and return structured JSON matching:
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
"""
`;

  const text = await callGeminiApi(
    [prompt],
    modelKey,
    FIGHT_MODE_SYSTEM_INSTRUCTION
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

  const prefixMatch = imageData.match(/^data:(image\/[a-z]+);base64,/);
  if (prefixMatch) {
    mimeType = prefixMatch[1];
    base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
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
    [
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ],
    modelKey,
    FIGHT_MODE_SYSTEM_INSTRUCTION
  );

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

  return callGeminiApi([prompt], modelKey);
}
