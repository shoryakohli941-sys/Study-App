import React, { useState, useRef, useEffect } from 'react';
import { type GeminiResponse } from '../lib/gemini';
import { db } from '../db';
import { Target, Archive } from 'lucide-react';

export interface HintCardProps {
  response: GeminiResponse;
  originalImage: string | null;
  onReset: () => void;
}

export const HintCard: React.FC<HintCardProps> = ({ response, originalImage, onReset }) => {
  const [hintLevel, setHintLevel] = useState(1);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveType, setSaveType] = useState<"Concept Gap" | "Silly Slip">("Concept Gap");
  const [saveToast, setSaveToast] = useState(false);

  // Hold to reveal solution logic
  const handleHoldStart = () => {
    if (solutionRevealed) return;
    setHoldProgress(0);
    const step = 100 / (2000 / 50); // 2 seconds total, 50ms intervals

    holdTimerRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          if (holdTimerRef.current) clearInterval(holdTimerRef.current);
          setSolutionRevealed(true);
          return 100;
        }
        return next;
      });
    }, 50);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    if (!solutionRevealed) setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  const handleSaveToVault = async () => {
    try {
      await db.mistakes.add({
        imageData: originalImage || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
        subject: response.subject as any,
        chapter: response.chapter,
        subtopic: response.subtopic,
        theTrap: response.the_trap,
        keyFormula: response.key_formula,
        errorType: saveType,
        nextReviewDate: Date.now() + 86400000, // +1 day
        reviewStage: 0,
        createdAt: Date.now()
      });
      setShowSaveDialog(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (err) {
      console.error("Failed to save to vault", err);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-zinc-100 space-y-4">
      {/* Header Info */}
      <div className="border-b border-zinc-800 pb-4 mb-4">
        <h3 className="text-lg font-bold text-white">{response.subject} • {response.chapter}</h3>
        <div className="flex gap-2 mt-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {response.subtopic}
          </span>
        </div>
      </div>

      {/* Progressive Hints */}
      <div className="space-y-4">

        {/* Hint 1: Core Lens (Always visible) */}
        <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-sm text-indigo-100">
          <h4 className="font-bold text-indigo-400 mb-1 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">1</span>
            The Core Lens
          </h4>
          <p>{response.hint_1_lens}</p>
        </div>

        {/* Hint 2: Setup */}
        {hintLevel >= 2 ? (
          <div className="p-4 bg-purple-950/20 border border-purple-900/40 rounded-xl text-sm text-purple-100 animate-in fade-in">
            <h4 className="font-bold text-purple-400 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">2</span>
              Setup
            </h4>
            <p>{response.hint_2_setup}</p>
          </div>
        ) : (
          <button
            onClick={() => setHintLevel(2)}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold rounded-xl transition border border-zinc-700 flex justify-center items-center gap-2"
          >
            Unlock Hint 2: Setup
          </button>
        )}

        {/* Hint 3: The Bottleneck */}
        {hintLevel >= 3 ? (
          <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl text-sm text-rose-100 animate-in fade-in">
            <h4 className="font-bold text-rose-400 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">3</span>
              The Bottleneck
            </h4>
            <p>{response.hint_3_pivot}</p>
          </div>
        ) : (
          hintLevel >= 2 && (
            <button
              onClick={() => setHintLevel(3)}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold rounded-xl transition border border-zinc-700 flex justify-center items-center gap-2"
            >
              Unlock Hint 3: The Bottleneck
            </button>
          )
        )}

        {/* The Trap & Key Formula */}
        {(hintLevel >= 3 || solutionRevealed) && (
          <div className="mt-6 space-y-4 p-4 border border-zinc-700 rounded-xl bg-zinc-900/50">
            <div>
              <span className="text-xs font-bold uppercase text-amber-500">The Trap</span>
              <p className="text-sm text-zinc-300 mt-1">{response.the_trap}</p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-emerald-500">Key Formula / Condition</span>
              <p className="text-sm text-zinc-300 mt-1 font-mono bg-black p-2 rounded border border-zinc-800">{response.key_formula}</p>
            </div>
          </div>
        )}
      </div>

      {/* Full Solution Logic */}
      <div className="pt-4 border-t border-zinc-800 mt-6 space-y-3">
        {solutionRevealed ? (
          <div className="animate-in fade-in duration-500 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-2">Full Solution</h4>
            <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
              {response.full_solution}
            </div>
          </div>
        ) : (
          <button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className="relative w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition border border-zinc-700 overflow-hidden select-none"
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-indigo-600/30 transition-all duration-75"
              style={{ width: `${holdProgress}%` }}
            />
            <span className="relative z-10">Hold 2s to Reveal Solution</span>
          </button>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex gap-3 pt-4 border-t border-zinc-800">
        <button
          onClick={onReset}
          className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition border border-zinc-700 flex items-center justify-center gap-2"
        >
          <Target className="w-4 h-4" />
          Cracked It! 🎯
        </button>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          <Archive className="w-4 h-4" />
          Add to Error Vault 📥
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-white">Save to Warmup Vault</h3>
            <p className="text-xs text-zinc-400">Classify the mistake to track your patterns.</p>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition">
                <input
                  type="radio"
                  name="errorType"
                  value="Concept Gap"
                  checked={saveType === 'Concept Gap'}
                  onChange={() => setSaveType('Concept Gap')}
                  className="w-4 h-4 text-indigo-600 bg-zinc-900 border-zinc-700"
                />
                <span className="text-sm font-medium text-white">Concept Gap</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition">
                <input
                  type="radio"
                  name="errorType"
                  value="Silly Slip"
                  checked={saveType === 'Silly Slip'}
                  onChange={() => setSaveType('Silly Slip')}
                  className="w-4 h-4 text-indigo-600 bg-zinc-900 border-zinc-700"
                />
                <span className="text-sm font-medium text-white">Silly Slip</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToVault}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {saveToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-bottom-4">
          Saved to Warmup Vault! 🚀
        </div>
      )}
    </div>
  );
};
