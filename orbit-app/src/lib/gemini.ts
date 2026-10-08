import { GoogleGenAI } from '@google/genai';

// Polyfill NodeJS namespace for browser environments
declare global {
  namespace NodeJS {
  }
}

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
    description: 'Battle-tested fallback with steady rate limits',
  },
} as const;

export type AIModelKey = keyof typeof AI_MODELS;
export const DEFAULT_AI_MODEL: AIModelKey = 'gemini-2.5-flash';

const MODEL_STORAGE_KEY = 'orbit_selected_ai_model';
const API_KEY_STORAGE = 'orbit_gemini_api_key';

export interface GeminiResponse {
  subject: "Physics" | "Chemistry" | "Mathematics" | string;
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

// Image processing: scale down and compress
async function processImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      const MAX_WIDTH = 800;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

      const base64Data = compressedDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
      resolve(base64Data);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

function parseGeminiJson(rawText: string): GeminiResponse {
  let parsedText = rawText;

  // Remove markdown fences
  parsedText = parsedText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  parsedText = parsedText.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

  let jsonParsed: any = {};
  try {
    const jsonMatch = parsedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
       jsonParsed = JSON.parse(jsonMatch[0]);
    } else {
       jsonParsed = JSON.parse(parsedText);
    }
  } catch (err) {
    console.error("Failed to parse JSON response:", err, parsedText);
  }

  return {
    subject: jsonParsed.subject || "Physics",
    chapter: jsonParsed.chapter || "General",
    subtopic: jsonParsed.subtopic || "Concept Analysis",
    the_trap: jsonParsed.the_trap || "Identify what commonly goes wrong here.",
    hint_1_lens: jsonParsed.hint_1_lens || "Think about the fundamental principle.",
    hint_2_setup: jsonParsed.hint_2_setup || "Set up the initial equation.",
    hint_3_pivot: jsonParsed.hint_3_pivot || "Solve the bottleneck.",
    key_formula: jsonParsed.key_formula || "Key Formula",
    full_solution: jsonParsed.full_solution || parsedText || "No solution provided.",
  };
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

export async function analyzeText(
  doubtText: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: modelId,
    contents: doubtText,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
    }
  });

  return parseGeminiJson(response.text || '');
}

export async function analyzeImage(
  imageData: string,
  doubtText?: string,
  _arg3?: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;
  const ai = new GoogleGenAI({ apiKey });

  const base64Data = await processImage(imageData);

  const contents: any[] = [
    {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg'
      }
    }
  ];

  if (doubtText) {
    contents.push(doubtText);
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
    }
  });

  return parseGeminiJson(response.text || '');
}

// Kept for compatibility if used elsewhere, but not strictly needed per spec
export async function generateStudyPlan(
  topic: string,
  subject: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }
  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;
  const ai = new GoogleGenAI({ apiKey });

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

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
  });

  return response.text || '';
}
