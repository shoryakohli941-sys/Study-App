import React, { useState } from 'react';
import { type GeminiResponse } from '../lib/gemini';

export interface HintCardProps {
  response?: GeminiResponse;
  content?: string;
  onReset?: () => void;
}

export const HintCard: React.FC<HintCardProps> = ({ response, content, onReset }) => {
  const [step, setStep] = useState(0);

  // Fallback to basic string content if full response isn't provided
  const displayContent = response?.solution || content || '';
  const hints = response?.hints || [];
  const maxHints = hints.length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-zinc-100 space-y-4">
      {/* Header Info */}
      {response && (
        <div className="border-b border-zinc-800 pb-4 mb-4">
          <h3 className="text-lg font-bold text-white">{response.title || 'Analysis Result'}</h3>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {response.topic}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {response.difficulty}
            </span>
          </div>
          {response.question && (
            <p className="mt-4 text-sm text-zinc-300 italic border-l-2 border-indigo-500/50 pl-3">
              "{response.question}"
            </p>
          )}
        </div>
      )}

      {/* Progressive Hints */}
      {maxHints > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase text-zinc-500">Conceptual Hints</h4>
          {hints.slice(0, step + 1).map((hint, idx) => (
            <div key={idx} className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-sm text-indigo-100">
              <span className="font-bold text-indigo-400 mr-2">Hint {idx + 1}:</span>
              {hint}
            </div>
          ))}
          
          {step < maxHints - 1 && (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-2 mt-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition border border-zinc-700"
            >
              Reveal Next Hint
            </button>
          )}
        </div>
      )}

      {/* Full Solution (Revealed at the end or if no hints exist) */}
      {(!response || step >= maxHints - 1) && (
        <div className="pt-4 border-t border-zinc-800 mt-4 space-y-3 animate-in fade-in duration-500">
          <h4 className="text-xs font-semibold uppercase text-zinc-500">Step-by-Step Solution</h4>
          <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
            {displayContent}
          </div>
        </div>
      )}
    </div>
  );
};
