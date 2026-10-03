import { useState, useRef } from 'react';
import { Target, Lock, Unlock, Eye, Bookmark, CheckCircle } from 'lucide-react';
import { db, type Subject, type ErrorType } from '../db';

export interface AnalysisResult {
  subject: Subject;
  chapter: string;
  subtopic: string;
  the_trap: string;
  hint_1_lens: string;
  hint_2_setup: string;
  hint_3_pivot: string;
  key_formula: string;
  full_solution: string;
}

interface ProgressiveHintCardProps {
  analysis: AnalysisResult;
  imageData: string; // base64 string
  onReset: () => void;
}

export default function ProgressiveHintCard({ analysis, imageData, onReset }: ProgressiveHintCardProps) {
  const [unlockedHints, setUnlockedHints] = useState(1);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [showErrorPicker, setShowErrorPicker] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const holdTimeoutRef = useRef<number | null>(null);

  const handleHoldStart = () => {
    setIsPressing(true);
    holdTimeoutRef.current = window.setTimeout(() => {
      setSolutionVisible(true);
      setIsPressing(false);
    }, 2000);
  };

  const handleHoldEnd = () => {
    setIsPressing(false);
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
  };

  const saveToVault = async (errorType: ErrorType) => {
    try {
      await db.mistakes.add({
        imageData,
        subject: analysis.subject,
        chapter: analysis.chapter,
        subtopic: analysis.subtopic,
        theTrap: analysis.the_trap,
        keyFormula: analysis.key_formula,
        errorType,
        nextReviewDate: Date.now() + 86400000, // +1 day
        reviewStage: 0,
        createdAt: Date.now(),
      });
      setShowErrorPicker(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Failed to save to vault", err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header Info */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap gap-2 text-xs font-medium">
        <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg">{analysis.subject}</span>
        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg">{analysis.chapter}</span>
        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg">{analysis.subtopic}</span>
      </div>

      <div className="p-5 space-y-6">
        {/* The Trap */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400 mb-2 font-semibold text-sm">
            <Target className="w-4 h-4" />
            <span>The Trap</span>
          </div>
          <p className="text-red-200 text-sm">{analysis.the_trap}</p>
        </div>

        {/* Hints */}
        <div className="space-y-4">
          {/* Hint 1 */}
          <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/50">
            <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">Hint 1: The Core Lens</div>
            <p className="text-slate-200 text-sm leading-relaxed">{analysis.hint_1_lens}</p>
          </div>

          {/* Hint 2 */}
          <div className={`border rounded-xl transition-colors ${unlockedHints >= 2 ? 'border-slate-700 bg-slate-800/50' : 'border-slate-800 bg-slate-950/50'}`}>
            {unlockedHints >= 2 ? (
              <div className="p-4">
                <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">Hint 2: Setup</div>
                <p className="text-slate-200 text-sm leading-relaxed">{analysis.hint_2_setup}</p>
              </div>
            ) : (
              <button
                onClick={() => setUnlockedHints(2)}
                className="w-full p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Unlock Hint 2: Setup</span>
              </button>
            )}
          </div>

          {/* Hint 3 */}
          <div className={`border rounded-xl transition-colors ${unlockedHints >= 3 ? 'border-slate-700 bg-slate-800/50' : 'border-slate-800 bg-slate-950/50'}`}>
            {unlockedHints >= 3 ? (
              <div className="p-4">
                <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">Hint 3: The Bottleneck</div>
                <p className="text-slate-200 text-sm leading-relaxed">{analysis.hint_3_pivot}</p>
              </div>
            ) : (
              <button
                onClick={() => setUnlockedHints(3)}
                disabled={unlockedHints < 2}
                className="w-full p-4 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-400 disabled:opacity-50 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Unlock Hint 3: The Bottleneck</span>
              </button>
            )}
          </div>
        </div>

        {/* Key Formula */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
           <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Key Formula</div>
           <p className="text-slate-300 text-sm font-mono">{analysis.key_formula}</p>
        </div>

        {/* Full Solution */}
        <div className="pt-2">
          {solutionVisible ? (
             <div className="border border-green-500/20 bg-green-500/5 rounded-xl p-4">
               <div className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                 <Eye className="w-4 h-4" /> Full Solution
               </div>
               <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis.full_solution}</p>
             </div>
          ) : (
            <button
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
              className={`w-full py-4 rounded-xl font-medium text-sm transition-all relative overflow-hidden ${
                isPressing ? 'bg-slate-800 text-slate-200 scale-[0.98]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Unlock className="w-4 h-4" />
                Hold 2s to Reveal Solution
              </span>
              <div
                className={`absolute inset-0 bg-slate-700 origin-left transition-transform duration-[2000ms] ease-linear ${
                  isPressing ? 'scale-x-100' : 'scale-x-0 duration-200'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex gap-3 relative">
        <button
          onClick={onReset}
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          Cracked It! <span className="text-lg">🎯</span>
        </button>
        <button
          onClick={() => setShowErrorPicker(!showErrorPicker)}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Bookmark className="w-4 h-4" /> Add to Vault
        </button>

        {/* Quick Picker Dropup */}
        {showErrorPicker && (
          <div className="absolute bottom-full right-4 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 w-48 flex flex-col gap-1 z-20">
            <div className="text-xs text-slate-400 px-2 py-1 uppercase tracking-wider font-semibold">Error Type</div>
            <button
              onClick={() => saveToVault("Concept Gap")}
              className="text-left px-3 py-2 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition-colors"
            >
              🧠 Concept Gap
            </button>
            <button
              onClick={() => saveToVault("Silly Slip")}
              className="text-left px-3 py-2 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition-colors"
            >
              🤦 Silly Slip
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm z-50 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle className="w-4 h-4 text-green-400" />
          Saved to Warmup Vault
        </div>
      )}
    </div>
  );
}
