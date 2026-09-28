import React, { useState, useRef } from 'react';
import { type GeminiResponse } from '../lib/gemini';
import { db } from '../db';
import { Target, Download, CheckCircle2 } from 'lucide-react';

export interface HintCardProps {
  response?: GeminiResponse;
  onReset?: () => void;
  imageUrl?: string | null;
}

export const HintCard: React.FC<HintCardProps> = ({ response, onReset, imageUrl }) => {
  const [hintLevel, setHintLevel] = useState(1);
  const [isRevealing, setIsRevealing] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [showErrorVaultPicker, setShowErrorVaultPicker] = useState(false);
  const [savedToVault, setSavedToVault] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!response) return null;

  const handleRevealStart = () => {
    setIsRevealing(true);
    timerRef.current = setTimeout(() => {
      setSolutionRevealed(true);
      setIsRevealing(false);
    }, 2000);
  };

  const handleRevealEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsRevealing(false);
  };

  const handleSaveToVault = async (errorType: 'Concept Gap' | 'Silly Slip') => {
    try {
      await db.mistakes.add({
        imageData: imageUrl || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", // Fallback to transparent pixel if no image
        subject: response.subject as any || "Physics",
        chapter: response.chapter || "General",
        subtopic: response.subtopic || "General",
        theTrap: response.the_trap || "",
        keyFormula: response.key_formula || "",
        errorType,
        nextReviewDate: Date.now() + 86400000, // +1 day
        reviewStage: 0,
        createdAt: Date.now()
      });
      setSavedToVault(true);
      setShowErrorVaultPicker(false);
      setTimeout(() => setSavedToVault(false), 3000);
    } catch (err) {
      console.error("Failed to save to vault", err);
    }
  };

  return (
    <div className="bg-slate-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-zinc-100 space-y-6">
      {/* Header Info */}
      <div className="border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white mb-2">{response.chapter || 'Analysis'}</h3>
        <div className="flex gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {response.subject}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {response.subtopic}
          </span>
        </div>
      </div>

      {/* Progressive Hints */}
      <div className="space-y-4">
        {/* Hint 1: Core Lens (Always Visible) */}
        {response.hint_1_lens && (
          <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Hint 1: The Core Lens</h4>
            <p className="text-indigo-100/90 leading-relaxed">{response.hint_1_lens}</p>
          </div>
        )}

        {/* Hint 2: Setup */}
        {response.hint_2_setup && (
          hintLevel >= 2 ? (
            <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Hint 2: Setup</h4>
              <p className="text-amber-100/90 font-mono text-xs">{response.hint_2_setup}</p>
            </div>
          ) : (
            <button
              onClick={() => setHintLevel(2)}
              className="w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-semibold text-zinc-400 transition-all flex items-center justify-center gap-2"
            >
              🔒 Unlock Hint 2: Setup
            </button>
          )
        )}

        {/* Hint 3: The Bottleneck */}
        {response.hint_3_pivot && hintLevel >= 2 && (
          hintLevel >= 3 ? (
            <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">Hint 3: The Bottleneck</h4>
              <p className="text-rose-100/90 leading-relaxed">{response.hint_3_pivot}</p>
            </div>
          ) : (
            <button
              onClick={() => setHintLevel(3)}
              className="w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-semibold text-zinc-400 transition-all flex items-center justify-center gap-2"
            >
              🔒 Unlock Hint 3: The Bottleneck
            </button>
          )
        )}
      </div>

      {/* Full Solution */}
      <div className="pt-4 border-t border-zinc-800">
        {solutionRevealed ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Full Solution</h4>
              <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
                {response.full_solution}
              </div>
            </div>
            {response.key_formula && (
              <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl">
                 <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Key Formula</h4>
                 <p className="text-sm font-mono text-zinc-200">{response.key_formula}</p>
              </div>
            )}
          </div>
        ) : (
          <button
            onMouseDown={handleRevealStart}
            onMouseUp={handleRevealEnd}
            onMouseLeave={handleRevealEnd}
            onTouchStart={handleRevealStart}
            onTouchEnd={handleRevealEnd}
            className={`w-full relative overflow-hidden py-4 border border-zinc-700 rounded-xl text-sm font-bold transition-all select-none ${isRevealing ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-white/10 transition-all ease-linear"
              style={{ width: isRevealing ? '100%' : '0%', transitionDuration: isRevealing ? '2000ms' : '0ms' }}
            />
            <span className="relative z-10">Hold 2s to Reveal Solution</span>
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onReset}
          className="flex-1 py-3 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <Target className="w-4 h-4" />
          Cracked It! 🎯
        </button>

        <div className="flex-1 relative">
          {!showErrorVaultPicker ? (
            <button
              onClick={() => setShowErrorVaultPicker(true)}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Add to Error Vault 📥
            </button>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 bg-zinc-950 border border-zinc-800 p-2 rounded-xl flex gap-2 animate-in slide-in-from-bottom-2 shadow-2xl">
              <button
                onClick={() => handleSaveToVault('Concept Gap')}
                className="flex-1 py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 rounded-lg text-xs font-semibold transition-colors border border-rose-900/50"
              >
                Concept Gap
              </button>
              <button
                onClick={() => handleSaveToVault('Silly Slip')}
                className="flex-1 py-2 bg-amber-950/30 hover:bg-amber-900/50 text-amber-300 rounded-lg text-xs font-semibold transition-colors border border-amber-900/50"
              >
                Silly Slip
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {savedToVault && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-900 text-emerald-100 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl border border-emerald-800 animate-in fade-in slide-in-from-bottom-4 z-50">
          <CheckCircle2 className="w-4 h-4" />
          Saved to Warmup Vault
        </div>
      )}
    </div>
  );
};
