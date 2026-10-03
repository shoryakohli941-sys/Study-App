import { useState } from 'react';
import { RefreshCcw, Rocket, Target, Clock, AlertTriangle } from 'lucide-react';
import { db, type Mistake } from '../db';

interface FlashcardProps {
  mistake: Mistake;
  onComplete: () => void;
}

export default function Flashcard({ mistake, onComplete }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  const daysElapsed = Math.floor((Date.now() - mistake.createdAt) / 86400000);

  const handleReview = async (action: 'tough' | 'mastered') => {
    try {
      let newStage = mistake.reviewStage;
      let nextReviewOffset = 86400000; // 1 day

      if (action === 'mastered') {
        newStage = Math.min(mistake.reviewStage + 1, 3);
        switch (newStage) {
          case 0: nextReviewOffset = 86400000 * 1; break; // +1d
          case 1: nextReviewOffset = 86400000 * 3; break; // +3d
          case 2: nextReviewOffset = 86400000 * 7; break; // +7d
          case 3: nextReviewOffset = 86400000 * 21; break; // +21d
        }
      } else {
        // Still Tough -> reset
        newStage = 0;
        nextReviewOffset = 86400000 * 1; // +1d
      }

      await db.mistakes.update(mistake.id!, {
        reviewStage: newStage,
        nextReviewDate: Date.now() + nextReviewOffset
      });

      onComplete();
      setFlipped(false);
    } catch (err) {
      console.error("Failed to update mistake", err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative z-10 w-full min-h-[400px] flex flex-col transition-all">
      {!flipped ? (
        // Front of Card
        <div
          className="flex-1 flex flex-col cursor-pointer group"
          onClick={() => setFlipped(true)}
        >
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <div className="flex gap-2 text-xs font-medium">
               <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg">{mistake.subject}</span>
               <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg max-w-[120px] truncate">{mistake.chapter}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
               <Clock className="w-3 h-3" />
               {daysElapsed}d ago
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img
                src={`data:image/jpeg;base64,${mistake.imageData}`}
                alt="Problem"
                className="max-w-full max-h-[250px] object-contain p-2"
              />
            </div>

            <div className="mt-6 flex justify-center text-slate-500 text-sm animate-pulse group-hover:text-indigo-400 transition-colors">
              Tap to flip card
            </div>
          </div>
        </div>
      ) : (
        // Back of Card
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Analysis Review</span>
            <div className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-300">
              {mistake.errorType === 'Silly Slip' ? '🤦' : '🧠'} {mistake.errorType}
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-500 font-bold uppercase text-xs tracking-wider">
                <AlertTriangle className="w-4 h-4" /> The Trap
              </div>
              <p className="text-amber-100/90 text-sm leading-relaxed p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                {mistake.theTrap}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-xs tracking-wider">
                <Target className="w-4 h-4" /> Key Formula / Concept
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                 <p className="text-slate-300 font-mono text-sm">{mistake.keyFormula}</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-800 flex gap-3 bg-slate-950/50">
            <button
              onClick={() => handleReview('tough')}
              className="flex-1 flex flex-col items-center justify-center py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              <RefreshCcw className="w-5 h-5 mb-1 text-slate-400" />
              <span className="text-sm font-semibold">Still Tough</span>
              <span className="text-[10px] text-slate-500">Review tomorrow</span>
            </button>
            <button
              onClick={() => handleReview('mastered')}
              className="flex-1 flex flex-col items-center justify-center py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
            >
              <Rocket className="w-5 h-5 mb-1" />
              <span className="text-sm font-semibold">Mastered</span>
              <span className="text-[10px] text-indigo-200">
                Review in {mistake.reviewStage === 0 ? '3' : mistake.reviewStage === 1 ? '7' : '21'} days
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
