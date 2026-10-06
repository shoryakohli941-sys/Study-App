import React, { useState, useRef } from 'react';
import { type GeminiResponse } from '../lib/gemini';
import { db } from '../db';
import { Check, Inbox, Target, Zap } from 'lucide-react';

export interface HintCardProps {
  response?: GeminiResponse;
  content?: string;
  image?: string | null;
  onReset?: () => void;
}

export const HintCard: React.FC<HintCardProps> = ({ response, content, image, onReset }) => {
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [showSolution, setShowSolution] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!response) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-zinc-100">
        <p className="text-sm text-zinc-400">{content}</p>
      </div>
    );
  }

  const handlePointerDown = () => {
    setIsHolding(true);
    holdTimerRef.current = setTimeout(() => {
      setShowSolution(true);
      setIsHolding(false);
    }, 2000);
  };

  const handlePointerUpOrLeave = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    setIsHolding(false);
  };

  const handleSaveToVault = async (errorType: "Concept Gap" | "Silly Slip") => {
    try {
      await db.mistakes.add({
        imageData: image || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", // Dummy image fallback
        subject: response.subject || "Physics",
        chapter: response.chapter || "Unknown",
        subtopic: response.subtopic || "Unknown",
        theTrap: response.the_trap || "Unknown Trap",
        keyFormula: response.key_formula || "Unknown Formula",
        errorType,
        nextReviewDate: Date.now() + 86400000,
        reviewStage: 0,
        createdAt: Date.now(),
      });
      setToastMsg(`Saved to Error Vault as ${errorType}`);
      setShowSaveModal(false);
      setTimeout(() => {
        setToastMsg(null);
        if (onReset) onReset();
      }, 2000);
    } catch (e) {
      console.error(e);
      setToastMsg('Failed to save to vault');
      setTimeout(() => setToastMsg(null), 2000);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl text-zinc-100 overflow-hidden">
      {/* Header Info */}
      <div className="bg-black/50 border-b border-zinc-800 p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-white text-black">
            {response.subject}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300">
            {response.chapter}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400">
            {response.subtopic}
          </span>
        </div>

        {response.the_trap && (
          <div className="mt-4 p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl flex items-start gap-3">
            <Target className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase text-rose-500 tracking-wider mb-1">The Trap</p>
              <p className="text-sm text-rose-200/90 leading-snug">{response.the_trap}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Hint 1: The Lens (Always visible) */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Hint 1: The Core Lens
          </h4>
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-300">
            {response.hint_1_lens}
          </div>
        </div>

        {/* Hint 2: Setup */}
        {hintLevel >= 2 ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Hint 2: Setup</h4>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-mono text-indigo-300">
              {response.hint_2_setup}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setHintLevel(2)}
            className="w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-dashed border-zinc-700 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Unlock Hint 2: Setup
          </button>
        )}

        {/* Hint 3: Pivot */}
        {hintLevel >= 2 && (
          hintLevel >= 3 ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Hint 3: The Bottleneck</h4>
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-emerald-300">
                {response.hint_3_pivot}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setHintLevel(3)}
              className="w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-dashed border-zinc-700 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Unlock Hint 3: The Bottleneck
            </button>
          )
        )}

        {/* Full Solution */}
        {hintLevel >= 3 && (
          showSolution ? (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Key Formula</h4>
                <div className="p-3 bg-black border border-zinc-800 rounded-lg text-sm font-mono text-white text-center">
                  {response.key_formula}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Full Solution</h4>
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {response.full_solution}
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4">
              <button
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUpOrLeave}
                onPointerLeave={handlePointerUpOrLeave}
                className="relative w-full py-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden group select-none touch-none"
              >
                <div
                  className={`absolute inset-0 bg-indigo-600/20 origin-left transition-transform duration-[2000ms] ease-linear ${isHolding ? 'scale-x-100' : 'scale-x-0 duration-150'}`}
                />
                <span className={`relative text-sm font-bold tracking-wide transition-colors ${isHolding ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                  Hold 2s to Reveal Solution
                </span>
              </button>
            </div>
          )
        )}
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-zinc-800 p-5 bg-black/30 flex gap-3">
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors text-zinc-300"
        >
          <Inbox className="w-4 h-4" />
          Add to Error Vault 📥
        </button>
        <button
          onClick={() => onReset?.()}
          className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Check className="w-4 h-4" />
          Cracked It! 🎯
        </button>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg text-white">Log Mistake</h3>
            <p className="text-xs text-zinc-400">Why did you miss this?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSaveToVault("Concept Gap")}
                className="py-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-xl text-sm font-semibold flex flex-col items-center gap-2 transition-colors"
              >
                <span className="text-rose-400 text-xl">🧠</span>
                Concept Gap
              </button>
              <button
                onClick={() => handleSaveToVault("Silly Slip")}
                className="py-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-xl text-sm font-semibold flex flex-col items-center gap-2 transition-colors"
              >
                <span className="text-amber-400 text-xl">🤦‍♂️</span>
                Silly Slip
              </button>
            </div>
            <button
              onClick={() => setShowSaveModal(false)}
              className="w-full py-3 mt-2 text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-4 z-20">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
