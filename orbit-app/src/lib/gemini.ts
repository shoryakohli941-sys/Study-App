import { GoogleGenAI } from '@google/genai';

export const getGeminiApiKey = () => {
  return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
};

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

export const analyzeImage = async (base64Image: string): Promise<GeminiResponse> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('No API key found');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Strip prefix
  const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

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
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg'
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = typeof (response as any).text === 'function' ? (response as any).text() : response.text;
  if (!text) {
    throw new Error("No text response from Gemini");
  }

  // Clean the output
  const jsonStr = String(text).replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(jsonStr) as GeminiResponse;
  } catch (err) {
    throw new Error("Failed to parse Gemini response as JSON: " + jsonStr);
  }
};
