import { GoogleGenAI } from '@google/genai';
import type { Subject } from '../db';

export interface GeminiResponse {
  subject: Subject;
  chapter: string;
  subtopic: string;
  the_trap: string;
  hint_1_lens: string;
  hint_2_setup: string;
  hint_3_pivot: string;
  key_formula: string;
  full_solution: string;
}

export async function analyzeImage(apiKey: string, base64DataUrl: string): Promise<GeminiResponse> {
  const ai = new GoogleGenAI({ apiKey });

  // Gemini API requires raw base64 data without the data URL prefix
  const base64Data = base64DataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

  const prompt = `You are an elite JEE Advanced Socratic mentor. Analyze the question image and return structured JSON matching:
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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        }
      }
    ],
    config: {
      responseMimeType: 'application/json',
    }
  });

  let rawJson = response.text || '';

  // Sanitize the output with a regex to remove any unexpected markdown code fences
  rawJson = rawJson.replace(/^```json/m, '').replace(/```$/m, '').trim();

  try {
    const parsed = JSON.parse(rawJson) as GeminiResponse;
    return parsed;
  } catch (err) {
    console.error('Failed to parse Gemini response:', rawJson);
    throw new Error('Failed to parse AI response');
  }
}
