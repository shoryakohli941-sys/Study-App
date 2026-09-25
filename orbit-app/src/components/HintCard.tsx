import React, { useState, useRef } from 'react';
import { Target, Lightbulb, Unlock, ChevronDown, Check, Inbox } from 'lucide-react';
import type { GeminiResponse } from '../lib/gemini';
import { db } from '../db';

interface HintCardProps {
  data: GeminiResponse;
  image: string;
  onReset: () => void;
}

export const HintCard: React.FC<HintCardProps> = ({ data, image, onReset }) => {
  const [unlockedHint2, setUnlockedHint2] = useState(false);
  const [unlockedHint3, setUnlockedHint3] = useState(false);
  const [revealedSolution, setRevealedSolution] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showSaveMenu, setShowSaveMenu] = useState(false);

  const startHold = () => {
    if (revealedSolution) return;
    setHoldProgress(0);
    const startTime = Date.now();
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 2000) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        setRevealedSolution(true);
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      }
    }, 50);
  };

  const endHold = () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    if (!revealedSolution) setHoldProgress(0);
  };

  const saveToVault = async (errorType: 'Concept Gap' | 'Silly Slip') => {
    try {
      await db.mistakes.add({
        imageData: image,
        subject: data.subject,
        chapter: data.chapter,
        subtopic: data.subtopic,
        theTrap: data.the_trap,
        keyFormula: data.key_formula,
        errorType,
        nextReviewDate: Date.now() + 86400000, // +1 day
        reviewStage: 0,
        createdAt: Date.now(),
      });
      alert('Saved to Vault!');
      onReset();
    } catch (err) {
      console.error(err);
      alert('Failed to save to vault.');
    }
  };

  return (
    <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden shadow-2xl">
      <div className="p-4 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-1 uppercase tracking-tight text-sm">The Trap</h3>
            <p className="text-zinc-400 text-sm">{data.the_trap}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Hint 1 */}
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <div className="flex items-center gap-2 mb-2 text-white">
            <Lightbulb className="w-4 h-4" />
            <h4 className="font-medium text-sm uppercase tracking-tight">Hint 1: The Core Lens</h4>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">{data.hint_1_lens}</p>
        </div>

        {/* Hint 2 */}
        {!unlockedHint2 ? (
          <button
            onClick={() => setUnlockedHint2(true)}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Unlock className="w-4 h-4" />
            Unlock Hint 2: Setup
          </button>
        ) : (
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 fade-in">
            <h4 className="font-medium text-sm text-white mb-2 uppercase tracking-tight">Hint 2: Setup</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">{data.hint_2_setup}</p>
          </div>
        )}

        {/* Hint 3 */}
        {unlockedHint2 && !unlockedHint3 && (
          <button
            onClick={() => setUnlockedHint3(true)}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium fade-in"
          >
            <Unlock className="w-4 h-4" />
            Unlock Hint 3: The Bottleneck
          </button>
        )}
        {unlockedHint3 && (
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 fade-in">
            <h4 className="font-medium text-sm text-white mb-2 uppercase tracking-tight">Hint 3: The Bottleneck</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">{data.hint_3_pivot}</p>
          </div>
        )}

        {/* Formula & Solution */}
        {unlockedHint3 && !revealedSolution && (
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className="relative w-full py-4 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-medium overflow-hidden select-none"
          >
            <div
              className="absolute inset-y-0 left-0 bg-white transition-all duration-75"
              style={{ width: `${holdProgress}%` }}
            />
            <span className="relative z-10 mix-blend-difference text-white">Hold 2s to Reveal Solution</span>
          </button>
        )}

        {revealedSolution && (
          <div className="space-y-4 fade-in">
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <h4 className="font-medium text-sm text-white mb-2 uppercase tracking-tight">Key Formula</h4>
              <p className="text-zinc-300 text-sm font-mono bg-black p-2 rounded border border-zinc-800">
                {data.key_formula}
              </p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <h4 className="font-medium text-sm text-white mb-2 uppercase tracking-tight">Full Solution</h4>
              <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                {data.full_solution}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Cracked It
        </button>

        <div className="relative flex-1">
          <button
            onClick={() => setShowSaveMenu(!showSaveMenu)}
            className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Inbox className="w-4 h-4" />
            Vault
            <ChevronDown className="w-4 h-4" />
          </button>

          {showSaveMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-10">
              <button
                onClick={() => { setShowSaveMenu(false); saveToVault('Concept Gap'); }}
                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-b border-zinc-800"
              >
                Concept Gap
              </button>
              <button
                onClick={() => { setShowSaveMenu(false); saveToVault('Silly Slip'); }}
                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Silly Slip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
