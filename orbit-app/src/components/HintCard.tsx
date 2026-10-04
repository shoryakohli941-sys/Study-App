import React, { useState, useRef } from 'react';
import { Target, Download } from 'lucide-react';
import { type GeminiResponse } from '../lib/gemini';
import { db } from '../db';

export interface HintCardProps {
  response?: GeminiResponse;
  imageData?: string;
  onReset?: () => void;
}

export const HintCard: React.FC<HintCardProps> = ({ response, imageData, onReset }) => {
  const [step, setStep] = useState(1);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);
  const [isAddingToVault, setIsAddingToVault] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleHoldStart = () => {
    holdTimerRef.current = setTimeout(() => {
      setIsSolutionRevealed(true);
    }, 2000);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const addToVault = async (errorType: 'Concept Gap' | 'Silly Slip') => {
    if (!response) return;

    try {
      await db.mistakes.add({
        imageData: imageData || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
        subject: response.subject || 'Physics',
        chapter: response.chapter || 'General',
        subtopic: response.subtopic || 'General',
        theTrap: response.the_trap || 'Unknown trap',
        keyFormula: response.key_formula || 'N/A',
        errorType,
        nextReviewDate: Date.now() + 86400000, // +1 day
        reviewStage: 0,
        createdAt: Date.now()
      });

      setIsAddingToVault(false);
      setToastMessage("Added to Vault!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Failed to add to vault", err);
    }
  };

  if (!response) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-800 pb-4 flex flex-wrap gap-2">
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white text-black">
          {response.subject}
        </span>
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
          {response.chapter}
        </span>
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
          {response.subtopic}
        </span>
      </div>

      {/* The Trap */}
      {response.the_trap && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">The Trap</h4>
              <p className="text-sm text-red-200">{response.the_trap}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progressive Hints */}
      <div className="space-y-3">
        {step >= 1 && (
          <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl">
            <h4 className="text-xs font-semibold uppercase text-indigo-400 mb-2">Hint 1: The Core Lens</h4>
            <p className="text-sm text-indigo-100">{response.hint_1_lens}</p>
          </div>
        )}

        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition border border-slate-700"
          >
            Unlock Hint 2: Setup
          </button>
        )}

        {step >= 2 && (
          <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-semibold uppercase text-indigo-400 mb-2">Hint 2: Setup</h4>
            <p className="text-sm text-indigo-100">{response.hint_2_setup}</p>
          </div>
        )}

        {step === 2 && (
          <button
            onClick={() => setStep(3)}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition border border-slate-700"
          >
            Unlock Hint 3: The Bottleneck
          </button>
        )}

        {step >= 3 && (
          <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-semibold uppercase text-indigo-400 mb-2">Hint 3: The Bottleneck</h4>
            <p className="text-sm text-indigo-100">{response.hint_3_pivot}</p>
          </div>
        )}
      </div>

      {/* Full Solution */}
      {step >= 3 && !isSolutionRevealed && (
        <div className="pt-4 border-t border-slate-800">
          <button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className="w-full py-4 bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl border border-slate-700 transition active:scale-[0.98] active:bg-slate-700 select-none"
          >
            Hold 2s to Reveal Solution
          </button>
        </div>
      )}

      {isSolutionRevealed && (
        <div className="pt-6 border-t border-slate-800 space-y-4 animate-in fade-in duration-500">
          <div>
            <h4 className="text-xs font-semibold uppercase text-emerald-400 mb-2">Key Formula</h4>
            <p className="text-sm text-slate-200 font-mono bg-black p-3 rounded-lg border border-slate-800">
              {response.key_formula}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Full Solution</h4>
            <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans bg-black p-4 rounded-xl border border-slate-800">
              {response.full_solution}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="pt-4 flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-900/20"
        >
          Cracked It! 🎯
        </button>
        <div className="relative flex-1">
          <button
            onClick={() => setIsAddingToVault(!isAddingToVault)}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <Download className="w-4 h-4" />
            Add to Vault
          </button>

          {isAddingToVault && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl flex flex-col gap-2 animate-in slide-in-from-bottom-2">
              <button
                onClick={() => addToVault('Concept Gap')}
                className="py-2.5 px-4 text-sm font-medium text-left text-white hover:bg-slate-700 rounded-lg transition"
              >
                📥 Concept Gap
              </button>
              <button
                onClick={() => addToVault('Silly Slip')}
                className="py-2.5 px-4 text-sm font-medium text-left text-white hover:bg-slate-700 rounded-lg transition"
              >
                📥 Silly Slip
              </button>
            </div>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-full shadow-lg animate-in slide-in-from-bottom-4">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
