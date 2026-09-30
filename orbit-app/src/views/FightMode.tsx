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
import { db } from '../db';
import { Target, Sigma, Crosshair } from 'lucide-react';

const LOADING_TIPS = [
  "Drawing Free Body Diagram...",
  "Applying Conservation of Energy...",
  "Checking limiting cases...",
  "Identifying constraints...",
  "Looking for symmetric properties..."
];

export const FightMode: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<AIModelKey>(getSavedAIModel());
  const [doubtText, setDoubtText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GeminiResponse | null>(null);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const [showErrorVaultModal, setShowErrorVaultModal] = useState(false);
  const [errorVaultType, setErrorVaultType] = useState<"Concept Gap" | "Silly Slip" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with ~0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setSelectedImage(dataUrl);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
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

    const tipInterval = setInterval(() => {
      setLoadingTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2500);

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
      clearInterval(tipInterval);
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

  const handleAddToErrorVault = async () => {
    if (!analysisResult || !errorVaultType) return;

    try {
      await db.mistakes.add({
        imageData: selectedImage || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", // Fallback blank if pure text
        subject: analysisResult.subject as any || "Physics",
        chapter: analysisResult.chapter || "Unknown",
        subtopic: analysisResult.subtopic || "Unknown",
        theTrap: analysisResult.the_trap || "Unknown Trap",
        keyFormula: analysisResult.key_formula || "Basic Principles",
        errorType: errorVaultType,
        nextReviewDate: Date.now() + 86400000, // +1 day
        reviewStage: 0,
        createdAt: Date.now()
      });
      setToastMessage("Saved to Warmup Vault 📥");
      setTimeout(() => setToastMessage(null), 3000);
      setShowErrorVaultModal(false);
      handleReset(); // Reset after successful add
    } catch (err) {
      console.error("Failed to add to Error Vault", err);
      alert("Failed to save to Vault.");
    }
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

      {loading && !analysisResult ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
           <div className="relative flex items-center justify-center">
             <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
             <Target className="absolute w-6 h-6 text-indigo-400" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-white mb-2">Socratic Engine Active</h3>
             <p className="text-sm text-slate-400 animate-pulse">{LOADING_TIPS[loadingTipIndex]}</p>
           </div>
        </div>
      ) : !analysisResult ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
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
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-2 transition"
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

          <HintCard response={analysisResult} onReset={handleReset} />

          <div className="pt-4 flex gap-4">
             <button
               onClick={handleReset}
               className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 border border-slate-700"
             >
               Cracked It! 🎯
             </button>
             <button
               onClick={() => setShowErrorVaultModal(true)}
               className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
             >
               Add to Error Vault 📥
             </button>
          </div>
        </div>
      )}

      {/* Error Vault Quick Picker Modal */}
      {showErrorVaultModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={() => setShowErrorVaultModal(false)}>
           <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-4 text-center">Classify Mistake</h3>
              <div className="space-y-3">
                 <button
                   onClick={() => setErrorVaultType("Concept Gap")}
                   className={`w-full p-4 rounded-xl border transition-all text-left flex items-start gap-3 ${errorVaultType === 'Concept Gap' ? 'border-rose-500 bg-rose-500/10' : 'border-slate-800 hover:border-slate-600 bg-slate-950'}`}
                 >
                    <div className="bg-rose-500/20 p-2 rounded-lg shrink-0 mt-0.5"><Crosshair className="w-5 h-5 text-rose-500" /></div>
                    <div>
                       <div className="font-semibold text-white">Concept Gap</div>
                       <div className="text-xs text-slate-400 mt-1">Fundamental misunderstanding of the physics or math principle.</div>
                    </div>
                 </button>
                 <button
                   onClick={() => setErrorVaultType("Silly Slip")}
                   className={`w-full p-4 rounded-xl border transition-all text-left flex items-start gap-3 ${errorVaultType === 'Silly Slip' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 hover:border-slate-600 bg-slate-950'}`}
                 >
                    <div className="bg-amber-500/20 p-2 rounded-lg shrink-0 mt-0.5"><Sigma className="w-5 h-5 text-amber-500" /></div>
                    <div>
                       <div className="font-semibold text-white">Silly Slip</div>
                       <div className="text-xs text-slate-400 mt-1">Calculation error, wrong sign, or misread question.</div>
                    </div>
                 </button>
              </div>
              <div className="mt-6 flex gap-3">
                 <button onClick={() => setShowErrorVaultModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800">Cancel</button>
                 <button
                   onClick={handleAddToErrorVault}
                   disabled={!errorVaultType}
                   className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold disabled:opacity-50 hover:bg-slate-200"
                 >
                   Save & Continue
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-50 animate-in slide-in-from-bottom-5">
           {toastMessage}
        </div>
      )}
    </div>
  );
};
