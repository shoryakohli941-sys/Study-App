import React, { useState, useRef, useEffect } from 'react';
import { type GeminiResponse } from '../lib/gemini';
import { db } from '../db';
import { CheckCircle2, Save, Unlock } from 'lucide-react';

export interface HintCardProps {
  response?: GeminiResponse;
  content?: string;
  onReset?: () => void;
  selectedImage?: string | null;
}

export const HintCard: React.FC<HintCardProps> = ({ response, content, onReset, selectedImage }) => {
  const [hintLevel, setHintLevel] = useState(1);
  const [showSolution, setShowSolution] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [showVaultPicker, setShowVaultPicker] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Provide defaults mapping back to the expected schema if content string is provided
  const parsedResponse = response || {
    subject: "Physics",
    chapter: "General",
    subtopic: "General",
    the_trap: "General Analysis",
    hint_1_lens: content || "",
    hint_2_setup: "",
    hint_3_pivot: "",
    key_formula: "",
    full_solution: content || "",
  };

  useEffect(() => {
    if (isHolding) {
      progressIntervalRef.current = setInterval(() => {
        setHoldProgress((p) => Math.min(p + 5, 100)); // 2000ms / 50ms = 40 ticks, 100/40 = 2.5 per tick, wait lets do +5 per 100ms
      }, 100);

      holdTimerRef.current = setTimeout(() => {
        setShowSolution(true);
        setIsHolding(false);
        setHoldProgress(100);
      }, 2000);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (!showSolution) setHoldProgress(0);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [isHolding, showSolution]);

  const handleHoldStart = () => setIsHolding(true);
  const handleHoldEnd = () => setIsHolding(false);

  const handleSaveToVault = async (errorType: "Concept Gap" | "Silly Slip") => {
    try {
      await db.mistakes.add({
        imageData: selectedImage || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
        subject: parsedResponse.subject as any || "Physics",
        chapter: parsedResponse.chapter || "General",
        subtopic: parsedResponse.subtopic || "General",
        theTrap: parsedResponse.the_trap || "Unknown Trap",
        keyFormula: parsedResponse.key_formula || "N/A",
        errorType,
        nextReviewDate: Date.now() + 86400000, // +1 day
        reviewStage: 0,
        createdAt: Date.now(),
      });
      setShowVaultPicker(false);
      setToastMessage("Added to Vault successfully!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      setToastMessage("Failed to add to vault");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-zinc-100 space-y-6 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded shadow-lg animate-in fade-in slide-in-from-top-4 z-10">
          {toastMessage}
        </div>
      )}

      {/* Header Info */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white text-black">
            {parsedResponse.subject}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {parsedResponse.chapter}
          </span>
          {parsedResponse.subtopic && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {parsedResponse.subtopic}
            </span>
          )}
        </div>
      </div>

      {/* Progressive Hints */}
      <div className="space-y-4">
        {/* Hint 1: Core Lens (Always Visible) */}
        {parsedResponse.hint_1_lens && (
          <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-sm text-indigo-100 shadow-inner">
            <h4 className="text-xs font-bold uppercase text-indigo-400 mb-1 flex items-center gap-1">
              <Unlock className="w-3 h-3" /> Hint 1: The Core Lens
            </h4>
            <p className="leading-relaxed">{parsedResponse.hint_1_lens}</p>
          </div>
        )}

        {/* Hint 2: Setup */}
        {hintLevel >= 2 ? (
          parsedResponse.hint_2_setup && (
            <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl text-sm text-amber-100 shadow-inner animate-in fade-in">
              <h4 className="text-xs font-bold uppercase text-amber-400 mb-1 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Hint 2: Setup
              </h4>
              <p className="leading-relaxed font-mono text-[13px]">{parsedResponse.hint_2_setup}</p>
            </div>
          )
        ) : (
          <button
            onClick={() => setHintLevel(2)}
            className="w-full py-3 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl transition border border-zinc-800 border-dashed"
          >
            Unlock Hint 2: Setup
          </button>
        )}

        {/* Hint 3: The Bottleneck */}
        {hintLevel >= 3 ? (
          parsedResponse.hint_3_pivot && (
            <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl text-sm text-rose-100 shadow-inner animate-in fade-in">
              <h4 className="text-xs font-bold uppercase text-rose-400 mb-1 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Hint 3: The Bottleneck
              </h4>
              <p className="leading-relaxed">{parsedResponse.hint_3_pivot}</p>
            </div>
          )
        ) : hintLevel >= 2 ? (
          <button
            onClick={() => setHintLevel(3)}
            className="w-full py-3 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl transition border border-zinc-800 border-dashed"
          >
            Unlock Hint 3: The Bottleneck
          </button>
        ) : null}
      </div>

      {/* Full Solution (Hold to reveal) */}
      <div className="pt-4 border-t border-zinc-800 mt-4 space-y-4">
        {!showSolution ? (
          <button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className="relative w-full py-4 bg-zinc-900 overflow-hidden text-zinc-300 text-sm font-semibold rounded-xl transition border border-zinc-700 user-select-none touch-none"
            style={{ userSelect: 'none' }}
          >
            <div
              className="absolute top-0 left-0 bottom-0 bg-emerald-900/40 transition-all duration-100 ease-linear"
              style={{ width: `${holdProgress}%` }}
            />
            <span className="relative z-10">Hold 2s to Reveal Solution</span>
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            {parsedResponse.the_trap && (
              <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-lg">
                <h4 className="text-xs font-bold uppercase text-rose-500 mb-1">The Trap</h4>
                <p className="text-sm text-rose-200">{parsedResponse.the_trap}</p>
              </div>
            )}

            {parsedResponse.key_formula && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
                <h4 className="text-xs font-bold uppercase text-emerald-500 mb-1">Key Formula</h4>
                <p className="text-sm text-emerald-200 font-mono">{parsedResponse.key_formula}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-2">Step-by-Step Solution</h4>
              <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans bg-black/40 p-4 rounded-xl border border-zinc-800/50">
                {parsedResponse.full_solution}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-zinc-800 mt-4 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 border border-emerald-900"
        >
          <CheckCircle2 className="w-4 h-4" /> Cracked It! 🎯
        </button>

        <div className="flex-1 relative">
          <button
            onClick={() => setShowVaultPicker(!showVaultPicker)}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Add to Error Vault 📥
          </button>

          {showVaultPicker && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden flex flex-col z-20">
              <button
                onClick={() => handleSaveToVault("Concept Gap")}
                className="px-4 py-3 text-sm text-left hover:bg-zinc-700 text-white border-b border-zinc-700/50 font-medium"
              >
                Concept Gap 🤔
              </button>
              <button
                onClick={() => handleSaveToVault("Silly Slip")}
                className="px-4 py-3 text-sm text-left hover:bg-zinc-700 text-white font-medium"
              >
                Silly Slip 🤦
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
