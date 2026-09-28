import { GoogleGenerativeAI } from '@google/generative-ai';

// Handpicked credit-efficient, high-speed Flash models from Google AI Studio
export const AI_MODELS = {
  'gemini-3.8-flash': {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Ultra Fast · Minimal Credits',
    description: 'Fastest reasoning with lowest credit consumption',
  },
  'gemini-3.7-flash': {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    badge: 'High Throughput · Balanced',
    description: 'Balanced performance, low latency fallback during spikes',
  },
} as const;

export type AIModelKey = keyof typeof AI_MODELS;
export const DEFAULT_AI_MODEL: AIModelKey = 'gemini-3.8-flash';

const MODEL_STORAGE_KEY = 'orbit_selected_ai_model';
const API_KEY_STORAGE = 'orbit_gemini_api_key';

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

export function getApiKey(): string {
  return (
    localStorage.getItem(API_KEY_STORAGE) ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    ''
  );
}

export async function generateStudyPlan(
  topic: string,
  subject: string,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const selectedModelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: selectedModelId });

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
