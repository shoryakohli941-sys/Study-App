import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Target, Sigma, RotateCcw, Rocket, CheckCircle2 } from 'lucide-react';

export const WarmupVault: React.FC = () => {
  const currentReviewIndex = 0; // We always show the first due mistake because the array shifts automatically
  const [isFlipped, setIsFlipped] = useState(false);

  const dueMistakes = useLiveQuery(
    () => db.mistakes.where('nextReviewDate').belowOrEqual(Date.now()).toArray(),
    []
  );

  if (dueMistakes === undefined) {
    return <div className="flex justify-center py-20 text-slate-400">Loading vault...</div>;
  }

  if (dueMistakes.length === 0 || currentReviewIndex >= dueMistakes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">All caught up!</h2>
        <p className="text-slate-400 mb-8 max-w-sm">
          You've completed today's warmup. Back to problem solving 🚀
        </p>
      </div>
    );
  }

  const currentMistake = dueMistakes[currentReviewIndex];
  const daysElapsed = Math.floor((Date.now() - currentMistake.createdAt) / 86400000);

  const handleReview = async (quality: 'tough' | 'mastered') => {
    const intervals = [1, 3, 7, 21]; // stages 0, 1, 2, 3 in days

    let newStage = currentMistake.reviewStage;
    if (quality === 'mastered') {
      newStage = Math.min(newStage + 1, 3);
    } else {
      newStage = 0;
    }

    const nextIntervalDays = intervals[newStage];
    const nextReviewDate = Date.now() + nextIntervalDays * 86400000;

    await db.mistakes.update(currentMistake.id!, {
      reviewStage: newStage,
      nextReviewDate
    });

    setIsFlipped(false);
    // Do not increment currentReviewIndex here, because the useLiveQuery
    // will automatically remove the updated item from the dueMistakes array,
    // shifting the remaining items left.
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div className="flex items-center justify-between">
        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full flex items-center gap-2">
          <Rocket className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">
            Today's Warmup: {dueMistakes.length - currentReviewIndex} Cards Due
          </span>
        </div>
      </div>

      <div
        className={`relative w-full aspect-[4/5] perspective-1000 transition-all duration-500 cursor-pointer ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden backface-hidden flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative flex-1 bg-slate-900 overflow-hidden">
            <img
              src={currentMistake.imageData}
              alt="Problem"
              className="w-full h-full object-contain p-4"
            />
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300">
              Logged {daysElapsed}d ago
            </div>
          </div>

          <div className="p-6 bg-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                currentMistake.subject === 'Physics' ? 'bg-blue-500/20 text-blue-400' :
                currentMistake.subject === 'Chemistry' ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {currentMistake.subject}
              </span>
              <span className="text-slate-300 text-sm font-medium">{currentMistake.chapter}</span>
            </div>
            <p className="text-slate-400 text-xs">Tap to reveal the trap and key formula</p>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden flex flex-col p-6 [transform:rotateY(180deg)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex-1 space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-500 mb-1">The Trap</h3>
                  <p className="text-amber-200/90 text-sm">{currentMistake.theTrap}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sigma className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-400 mb-2">Key Formula / Setup</h3>
                  <p className="text-slate-300 text-sm font-mono bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {currentMistake.keyFormula}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700 flex gap-4 mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); handleReview('tough'); }}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Still Tough
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleReview('mastered'); }}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Mastered
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
