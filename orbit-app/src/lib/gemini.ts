// Polyfill NodeJS namespace for browser environments (resolves NodeJS.Timeout TS error)
declare global {
  namespace NodeJS {
    type Timeout = any;
  }
}

// Handpicked credit-efficient Flash models from Google AI Studio
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
  'gemini-3.5-flash-lite': {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    badge: 'Lightweight · Zero Spike',
    description: 'Ultra-lightweight endpoint with maximum RPM quota on the free tier',
  },
  'gemini-3.6-flash': {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    badge: 'Reliable · Free Tier',
    description: 'Stable price-to-performance ratio for consistent background prompts',
  },
  'gemini-3.5-flash': {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    badge: 'High Stability · Universal',
    description: 'Battle-tested fallback with steady rate limits and minimal latency',
  },
} as const;

export type AIModelKey = keyof typeof AI_MODELS;
export const DEFAULT_AI_MODEL: AIModelKey = 'gemini-3.8-flash';

const MODEL_STORAGE_KEY = 'orbit_selected_ai_model';
const API_KEY_STORAGE = 'orbit_gemini_api_key';

// Strictly typed without optional 'undefined' to satisfy strictNullChecks in HintCard
export interface GeminiResponse {
  answer: string;
  solution: string;
  explanation: string;
  hints: string[];
  steps: string[];
  topic: string;
  subtopic: string;
  difficulty: string;
  concepts: string[];
  rawText: string;
  question: string;
  title: string;
  keyFormula: string;
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
  body: Record<string, any>,
  modelKey: AIModelKey = getSavedAIModel()
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing. Please provide your key in settings.');
  }

  const modelId = AI_MODELS[modelKey]?.id || AI_MODELS[DEFAULT_AI_MODEL].id;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const msg = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

function parseGeminiJson(rawText: string, defaultTopic = 'General Doubt'): GeminiResponse {
  let parsed: GeminiResponse = {
    answer: rawText,
    solution: rawText,
    explanation: rawText,
    hints: [rawText],
    steps: [rawText],
    topic: defaultTopic,
    subtopic: 'Concept Analysis',
    difficulty: 'Medium',
    concepts: [],
    rawText: rawText,
    question: '',
    title: defaultTopic,
    keyFormula: '',
  };

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonParsed = JSON.parse(jsonMatch[0]);
      parsed = {
        ...parsed,
        ...jsonParsed,
        answer: jsonParsed.answer || parsed.answer,
        solution: jsonParsed.solution || parsed.solution,
        explanation: jsonParsed.explanation || parsed.explanation,
        hints: Array.isArray(jsonParsed.hints)
          ? jsonParsed.hints
          : [jsonParsed.hints || rawText],
        steps: Array.isArray(jsonParsed.steps)
          ? jsonParsed.steps
          : [jsonParsed.steps || rawText],
        concepts: Array.isArray(jsonParsed.concepts) ? jsonParsed.concepts : [],
        keyFormula: jsonParsed.keyFormula || '',
        title: jsonParsed.title || parsed.title,
        question: jsonParsed.question || parsed.question,
      };
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
  const prompt = `You are a precision STEM exam tutor and conceptual problem-solving coach.
Analyze this student's specific doubt or problem statement:
"""
${doubtText}
"""

Return a strictly valid JSON object (no markdown wrapping) containing:
{
  "title": "Short descriptive title of the concept/problem",
  "question": "${doubtText.replace(/"/g, "'").slice(0, 150)}",
  "topic": "Physics/Chemistry/Math/Biology topic name",
  "subtopic": "Specific subtopic",
  "difficulty": "Easy" | "Medium" | "Hard",
  "hints": ["Hint 1: Conceptual clue", "Hint 2: Relevant equation/property", "Hint 3: Execution direction"],
  "steps": ["Step 1 breakdown", "Step 2 breakdown", "Step 3 final resolution"],
  "answer": "Final concise answer or core conclusion",
  "solution": "Complete step-by-step rigorous solution and logic",
  "explanation": "Why this approach works and what mistake students commonly make here",
  "concepts": ["Key Concept 1", "Key Concept 2"],
  "keyFormula": "Primary formula or governing law"
}`;

  const text = await callGeminiApi(
    {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    },
    modelKey
  );

  return parseGeminiJson(text, 'Text Doubt');
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

  let prompt = `Analyze this problem image. Return a strictly valid JSON object with keys:
"title", "question", "topic", "subtopic", "difficulty", "hints" (array of progressive strings), "steps" (array of strings), "answer", "solution", "explanation", "concepts" (array), "keyFormula".`;

  if (arg2) {
    if (arg2.includes('/')) {
      mimeType = arg2;
      if (arg3) prompt = arg3;
    } else {
      prompt = `${prompt}\nAdditional student note: ${arg2}`;
    }
  }

  const text = await callGeminiApi(
    {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    },
    modelKey
  );

  return parseGeminiJson(text, 'Problem Breakdown');
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

  return callGeminiApi(
    {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    },
    modelKey
  );
}
