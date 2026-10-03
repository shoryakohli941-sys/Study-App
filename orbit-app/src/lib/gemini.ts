import { GoogleGenAI } from '@google/genai';

export const analyzeImage = async (base64Image: string, apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey });

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
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg',
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No text returned from Gemini');
  }

  // Sanitize the output to remove any markdown code fences before parsing
  const sanitizedText = text.replace(/```json\n?/, '').replace(/```\n?/g, '');

  try {
    return JSON.parse(sanitizedText);
  } catch (err) {
    console.error("Failed to parse JSON:", sanitizedText);
    throw new Error("Failed to parse mentor response.");
  }
};
