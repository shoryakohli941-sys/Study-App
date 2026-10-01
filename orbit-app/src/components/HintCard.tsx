import React, { useState, useRef, useEffect } from 'react';
import { type GeminiResponse } from '../lib/gemini';
import { db } from '../db';
import { Target, AlertTriangle } from 'lucide-react';

export interface HintCardProps {
  response?: GeminiResponse;
  content?: string;
  onReset?: () => void;
  imageData?: string;
}

export const HintCard: React.FC<HintCardProps> = ({ response, content, onReset, imageData }) => {
  // step 0: Hint 1 visible
  // step 1: Hint 2 visible
  // step 2: Hint 3 visible
  const [step, setStep] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showErrorPicker, setShowErrorPicker] = useState(false);

  // Hold-to-reveal states
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  const handlePointerDown = () => {
    setHoldProgress(0);
    const start = Date.now();
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min((elapsed / 2000) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setShowSolution(true);
      }
    }, 50);
  };

  const handlePointerUp = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    if (holdProgress < 100) {
      setHoldProgress(0);
    }
  };

  const handleSaveToVault = async (errorType: "Concept Gap" | "Silly Slip") => {
    if (!response) return;

    await db.mistakes.add({
      imageData: imageData || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
      subject: response.subject || "Physics",
      chapter: response.chapter || "Unknown",
      subtopic: response.subtopic || "Unknown",
      theTrap: response.the_trap || "No trap provided",
      keyFormula: response.key_formula || "No formula provided",
      errorType,
      nextReviewDate: Date.now() + 86400000,
      reviewStage: 0,
      createdAt: Date.now(),
    });

    setShowErrorPicker(false);
    if (onReset) onReset();
  };

  // Fallback to basic string content if full response isn't provided
  const displayContent = response?.full_solution || content || '';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-zinc-100 space-y-4">
      {/* Header Info */}
      {response && (
        <div className="border-b border-zinc-800 pb-4 mb-4">
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {response.subject}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {response.chapter}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {response.subtopic}
            </span>
          </div>
        </div>
      )}

      {/* Progressive Hints */}
      {response && (
        <div className="space-y-4">
          {/* Hint 1: Core Lens */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-sm text-indigo-100 animate-in fade-in slide-in-from-top-2">
            <span className="font-bold text-indigo-400 mr-2 block mb-1">Hint 1: The Core Lens</span>
            {response.hint_1_lens}
          </div>

          {/* Hint 2: Setup */}
          {step >= 1 ? (
            <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-sm text-indigo-100 animate-in fade-in slide-in-from-top-2">
              <span className="font-bold text-indigo-400 mr-2 block mb-1">Hint 2: Setup</span>
              {response.hint_2_setup}
            </div>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition border border-zinc-700 flex justify-center items-center gap-2"
            >
              Unlock Hint 2: Setup
            </button>
          )}

          {/* Hint 3: The Bottleneck */}
          {step >= 1 && (
            step >= 2 ? (
              <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-sm text-indigo-100 animate-in fade-in slide-in-from-top-2">
                <span className="font-bold text-indigo-400 mr-2 block mb-1">Hint 3: The Bottleneck</span>
                {response.hint_3_pivot}
              </div>
            ) : (
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition border border-zinc-700 flex justify-center items-center gap-2"
              >
                Unlock Hint 3: The Bottleneck
              </button>
            )
          )}
        </div>
      )}

      {/* Full Solution (Revealed manually) */}
      {!showSolution && response && step >= 2 && (
        <div className="pt-4 mt-4 animate-in fade-in duration-500">
           <button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative w-full py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-semibold overflow-hidden transition-colors"
          >
            <div
              className="absolute top-0 left-0 bottom-0 bg-indigo-600/30 transition-all duration-75"
              style={{ width: `${holdProgress}%` }}
            />
            <span className="relative z-10 text-zinc-300">
              Hold 2s to Reveal Solution
            </span>
          </button>
        </div>
      )}

      {showSolution && (
        <div className="pt-4 border-t border-zinc-800 mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4">
             <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-rose-400 mb-1 uppercase tracking-tight text-xs">The Trap</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">{response?.the_trap}</p>
                </div>
              </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
             <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-400 mb-1 uppercase tracking-tight text-xs">Key Formula</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">{response?.key_formula}</p>
                </div>
              </div>
          </div>

          <div>
             <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-2">Step-by-Step Solution</h4>
             <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
               {displayContent}
             </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-6 border-t border-zinc-800 mt-4 flex gap-3">
        {showErrorPicker ? (
           <div className="w-full flex gap-2 animate-in fade-in">
             <button
                onClick={() => handleSaveToVault('Concept Gap')}
                className="flex-1 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/30 rounded-xl text-xs font-semibold transition"
              >
                Concept Gap
              </button>
              <button
                onClick={() => handleSaveToVault('Silly Slip')}
                className="flex-1 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/30 rounded-xl text-xs font-semibold transition"
              >
                Silly Slip
              </button>
           </div>
        ) : (
          <>
            <button
              onClick={() => { if (onReset) onReset(); }}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition border border-zinc-700 text-sm"
            >
              Cracked It! 🎯
            </button>
            <button
              onClick={() => setShowErrorPicker(true)}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition shadow-lg shadow-indigo-600/20 text-sm"
            >
              Add to Error Vault 📥
            </button>
          </>
        )}
      </div>
    </div>
  );
};
