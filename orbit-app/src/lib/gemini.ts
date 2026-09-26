import { GoogleGenAI } from '@google/genai';

const STORAGE_KEY = 'orbit_gemini_api_key';

export const getApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  const savedKey = localStorage.getItem(STORAGE_KEY);
  if (savedKey && savedKey.trim().length > 0) {
    return savedKey.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return '';
};

export const setApiKey = (key: string): void => {
  localStorage.setItem(STORAGE_KEY, key.trim());
};

export const clearApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const hasValidApiKey = (): boolean => {
  return getApiKey().length > 0;
};

export const getGeminiClient = (): GoogleGenAI => {
  const key = getApiKey();
  if (!key) {
    throw new Error('API_KEY_MISSING');
  }
  return new GoogleGenAI({ apiKey: key });
};
