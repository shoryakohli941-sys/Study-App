import React, { useState } from 'react';
import { type GeminiResponse } from '../lib/gemini';

export interface HintCardProps {
  response?: GeminiResponse;
  content?: string;
  onReset?: () => void;
}

export const HintCard: React.FC<HintCardProps> = ({ response, content }) => {
  const [step, setStep] = useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);

  // Fallback to basic string content if full response isn't provided
  const displayContent = response?.full_solution || content || '';

  const hints: string[] = [];
  if (response) {
    if (response.hint_1_lens) hints.push(`${response.hint_1_lens}`);
    if (response.hint_2_setup) hints.push(`${response.hint_2_setup}`);
    if (response.hint_3_pivot) hints.push(`${response.hint_3_pivot}`);
  }
  const maxHints = hints.length;

  const handlePointerDown = () => {
    if (solutionRevealed) return;
    const timer = setTimeout(() => {
      setSolutionRevealed(true);
    }, 2000);
    setHoldTimer(timer);
  };

  const handlePointerUp = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-4">
      {/* Header Info */}
      {response && (
        <div className="border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-lg font-bold text-white">{response.subject}</h3>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {response.chapter}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {response.subtopic}
            </span>
          </div>
          {response.the_trap && (
            <p className="mt-4 text-sm text-amber-500/90 italic border-l-2 border-amber-500/50 pl-3">
              "Trap: {response.the_trap}"
            </p>
          )}
        </div>
      )}

      {/* Progressive Hints */}
      {maxHints > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase text-slate-500">Socratic Hints</h4>
          {hints.slice(0, step + 1).map((hint: string, idx: number) => (
            <div key={idx} className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-sm text-indigo-100">
              <span className="font-bold text-indigo-400 mr-2">Hint {idx + 1}:</span>
              {hint}
            </div>
          ))}
          
          {step < maxHints - 1 && (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-2 mt-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition border border-slate-700"
            >
              Reveal Hint {step + 2}
            </button>
          )}
        </div>
      )}

      {/* Key Formula (Revealed before full solution if available) */}
      {response && response.key_formula && (
        <div className="pt-4 border-t border-slate-800 mt-4 space-y-3 animate-in fade-in duration-500">
           <h4 className="text-xs font-semibold uppercase text-slate-500">Key Formula / Condition</h4>
           <div className="text-sm font-mono text-slate-300 bg-black p-3 rounded-md border border-slate-800">
             {response.key_formula}
           </div>
        </div>
      )}

      {/* Reveal Solution Button */}
      {(!response || !solutionRevealed) && (
         <button
           onPointerDown={handlePointerDown}
           onPointerUp={handlePointerUp}
           onPointerLeave={handlePointerUp}
           className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white text-xs font-semibold rounded-xl transition border border-slate-700 select-none touch-none"
         >
           Hold 2s to Reveal Solution
         </button>
      )}

      {/* Full Solution */}
      {solutionRevealed && (
        <div className="pt-4 border-t border-slate-800 mt-4 space-y-3 animate-in fade-in duration-500">
          <h4 className="text-xs font-semibold uppercase text-slate-500">Step-by-Step Solution</h4>
          <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
            {displayContent}
          </div>
        </div>
      )}
    </div>
  );
};
