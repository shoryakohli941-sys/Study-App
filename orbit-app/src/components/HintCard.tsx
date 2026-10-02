import React, { useState, useEffect, useRef } from 'react';
import { type GeminiResponse } from '../lib/gemini';
import { Lock, Unlock, Zap, BookOpen, AlertTriangle } from 'lucide-react';

export interface HintCardProps {
  response?: GeminiResponse;
}

export const HintCard: React.FC<HintCardProps> = ({ response }) => {
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopHold = React.useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    if (!solutionRevealed) {
      setHoldProgress(0);
    }
  }, [solutionRevealed]);

  // Clear progress when unmounting
  useEffect(() => {
    return () => stopHold();
  }, [stopHold]);

  const startHold = () => {
    if (solutionRevealed) return;
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current!);
          setSolutionRevealed(true);
          return 100;
        }
        return prev + 5; // 2 seconds to reach 100 (5% every 100ms)
      });
    }, 100);
  };

  if (!response) {
    return null;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-zinc-100 space-y-6">
      {/* Header Info */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex gap-2 mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {response.subject}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {response.chapter}
          </span>
        </div>

        {/* The Trap */}
        {response.the_trap && (
          <div className="mt-4 p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">The Trap</p>
              <p className="text-sm text-rose-200">{response.the_trap}</p>
            </div>
          </div>
        )}
      </div>

      {/* Progressive Hints */}
      <div className="space-y-4">
        {/* Hint 1: Lens (Always visible) */}
        <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">Hint 1: Core Lens</h4>
          </div>
          <p className="text-sm text-indigo-100 leading-relaxed">{response.hint_1_lens}</p>
        </div>

        {/* Hint 2: Setup */}
        {hintLevel >= 2 ? (
          <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase text-emerald-400 tracking-wider">Hint 2: Setup</h4>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed">{response.hint_2_setup}</p>
          </div>
        ) : (
          <button
            onClick={() => setHintLevel(2)}
            className="w-full p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                Unlock Hint 2: Setup
              </span>
            </div>
            <Unlock className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-all" />
          </button>
        )}

        {/* Hint 3: Pivot */}
        {hintLevel >= 2 && (
          hintLevel >= 3 ? (
            <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-semibold uppercase text-amber-400 tracking-wider">Hint 3: The Bottleneck</h4>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed">{response.hint_3_pivot}</p>
            </div>
          ) : (
            <button
              onClick={() => setHintLevel(3)}
              className="w-full p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  Unlock Hint 3: The Bottleneck
                </span>
              </div>
              <Unlock className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          )
        )}
      </div>

      {/* Full Solution (Hold to Reveal) */}
      <div className="pt-4 border-t border-zinc-800 mt-6">
        {solutionRevealed ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div>
              <h4 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider mb-2">Key Formula</h4>
              <div className="p-3 bg-black rounded-lg border border-zinc-800 font-mono text-sm text-zinc-300">
                {response.key_formula}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider mb-2">Step-by-Step Solution</h4>
              <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                {response.full_solution}
              </div>
            </div>
          </div>
        ) : (
          <button
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            className="relative w-full py-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden group select-none"
          >
            {/* Progress Background */}
            <div
              className="absolute inset-y-0 left-0 bg-indigo-900/40 transition-all ease-linear"
              style={{ width: `${holdProgress}%`, transitionDuration: '100ms' }}
            />

            <div className="relative z-10 flex items-center justify-center gap-2">
              <Lock className={`w-4 h-4 transition-colors ${holdProgress > 0 ? 'text-indigo-400' : 'text-zinc-500'}`} />
              <span className={`text-sm font-semibold transition-colors ${holdProgress > 0 ? 'text-indigo-300' : 'text-zinc-400'}`}>
                Hold 2s to Reveal Solution
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
