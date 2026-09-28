import React, { useState, useRef, useEffect } from 'react';
import {
  analyzeImage,
  analyzeText,
  hasValidApiKey,
  getSavedAIModel,
  saveAIModel,
  AI_MODELS,
  type AIModelKey,
  type GeminiResponse,
} from '../lib/gemini';
import { HintCard } from '../components/HintCard';
import { processImage } from '../lib/image';

export const FightMode: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<AIModelKey>(getSavedAIModel());
  const [doubtText, setDoubtText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GeminiResponse | null>(null);

  // Practice Timer / Stopwatch
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as AIModelKey;
    setSelectedModel(next);
    saveAIModel(next);
    setError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await processImage(file);
        setSelectedImage(dataUrl);
      } catch {
        setError("Failed to process uploaded image.");
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            try {
              const dataUrl = await processImage(file);
              setSelectedImage(dataUrl);
            } catch {
              setError("Failed to process pasted image.");
            }
          }
          break;
        }
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasValidApiKey()) {
      setError('Gemini API key is not configured. Please add it in settings.');
      return;
    }

    if (!doubtText.trim() && !selectedImage) {
      setError('Please type your question or provide an image to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result: GeminiResponse;
      if (selectedImage) {
        // If image is present, pass doubtText as additional instruction
        result = await analyzeImage(selectedImage, doubtText.trim() || undefined, undefined, selectedModel);
      } else {
        // Direct Ask: No image, pure text doubt
        result = await analyzeText(doubtText.trim(), selectedModel);
      }
      setAnalysisResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating solution';
      setError(
        `${msg}. If ${AI_MODELS[selectedModel].name} is experiencing spikes, switch to another model above.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setSelectedImage(null);
    setDoubtText('');
    setError(null);
    setSeconds(0);
    setIsTimerRunning(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-zinc-100" onPaste={handlePaste}>
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Fight Mode</span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase font-semibold">
              Live Arena
            </span>
          </h1>
          <p className="text-sm text-zinc-400">
            Tackle difficult doubts and exam questions with step-by-step guidance
          </p>
        </div>

        {/* Controls: Timer & Model Switcher */}
        <div className="flex items-center gap-3">
          {/* Practice Timer */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-zinc-400">⏱ {formatTime(seconds)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
            >
              {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setSeconds(0);
              }}
              className="text-[11px] text-zinc-500 hover:text-zinc-300"
            >
              Reset
            </button>
          </div>

          {/* Model Switcher */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer"
            >
              {Object.entries(AI_MODELS).map(([key, model]) => (
                <option key={key} value={key} className="bg-zinc-900 text-white">
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Traffic Notice */}
      {error && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-sm flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-amber-100">Notice</p>
            <p className="mt-0.5 text-xs text-amber-300/90">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-amber-400 hover:text-amber-200 font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Arena (Direct Ask Bar + Optional Image) */}
      {!analysisResult ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Submit Problem or Concept Doubt
            </h2>
            <span className="text-xs text-zinc-500">
              Paste screenshot anytime (Ctrl+V)
            </span>
          </div>

          {/* Direct Text Ask Bar */}
          <div className="relative">
            <textarea
              rows={4}
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              placeholder="Direct Ask: Type your question, physics formula, math problem, or specific conceptual doubt here... (e.g., 'Why does entropy increase in an isolated system during irreversible expansion?')"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Image Preview if attached */}
          {selectedImage && (
            <div className="relative inline-block border border-zinc-700 rounded-lg overflow-hidden bg-black max-w-xs">
              <img
                src={selectedImage}
                alt="Problem preview"
                className="max-h-48 object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-1.5 right-1.5 bg-zinc-900/80 hover:bg-rose-600 text-white rounded-full p-1 text-xs w-6 h-6 flex items-center justify-center transition"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-medium flex items-center gap-2 transition"
              >
                <span>📷</span>
                <span>{selectedImage ? 'Change Image' : 'Attach Screenshot'}</span>
              </button>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={loading || (!doubtText.trim() && !selectedImage)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing with {AI_MODELS[selectedModel].name}...</span>
                </>
              ) : (
                <span>Solve Doubt →</span>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* HintCard & Result View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
            >
              ← Ask Another Question
            </button>
            <span className="text-xs text-zinc-500 font-mono">
              Engine: {AI_MODELS[selectedModel].id}
            </span>
          </div>

          <HintCard response={analysisResult} onReset={handleReset} imageUrl={selectedImage} />
        </div>
      )}
    </div>
  );
};
