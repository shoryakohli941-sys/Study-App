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
    return <div className="flex justify-center py-20 text-zinc-500">Loading vault...</div>;
  }

  if (dueMistakes.length === 0 || currentReviewIndex >= dueMistakes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">All caught up for today!</h2>
        <p className="text-zinc-400 mb-8 max-w-sm">
          Back to problem solving 🚀
        </p>
      </div>
    );
  }

  const currentMistake = dueMistakes[currentReviewIndex];
  const daysElapsed = Math.floor((Date.now() - currentMistake.createdAt) / 86400000);

  const handleReview = async (quality: 'tough' | 'mastered') => {
    // interval maps to the days added based on stage
    // stages 0, 1, 2, 3 correspond to 1, 3, 7, 21 days
    const intervals = [1, 3, 7, 21];

    let newStage = currentMistake.reviewStage;
    if (quality === 'mastered') {
      newStage = Math.min(newStage + 1, 3);
    } else {
      newStage = 0; // Reset to stage 0 if still tough
    }

    const nextIntervalDays = intervals[newStage];
    const nextReviewDate = Date.now() + nextIntervalDays * 86400000;

    await db.mistakes.update(currentMistake.id!, {
      reviewStage: newStage,
      nextReviewDate
    });

    setIsFlipped(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div className="flex items-center justify-between">
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full flex items-center gap-2">
          <Rocket className="w-4 h-4 text-white" />
          <span className="text-xs font-semibold tracking-wider uppercase text-white">
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
          className="absolute inset-0 bg-black border border-zinc-800 rounded-xl shadow-2xl overflow-hidden backface-hidden flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative flex-1 bg-black overflow-hidden border-b border-zinc-800">
            <img
              src={currentMistake.imageData}
              alt="Problem"
              className="w-full h-full object-contain p-4"
            />
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
              Logged {daysElapsed}d ago
            </div>
          </div>

          <div className="p-6 bg-zinc-950 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white text-black">
                {currentMistake.subject}
              </span>
              <span className="text-white text-sm font-medium tracking-tight">{currentMistake.chapter}</span>
            </div>
            {currentMistake.subtopic && (
              <p className="text-zinc-400 text-xs mt-1">{currentMistake.subtopic}</p>
            )}
            <p className="text-zinc-500 text-xs mt-2 italic">Tap to reveal the trap and key formula</p>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 bg-black border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col p-6 [transform:rotateY(180deg)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex-1 space-y-6">
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-rose-400 mb-1 uppercase tracking-tight text-sm">The Trap</h3>
                  <p className="text-rose-200 text-sm leading-relaxed">{currentMistake.theTrap}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sigma className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-indigo-400 mb-2 uppercase tracking-tight text-sm">Key Formula / Condition</h3>
                  <p className="text-indigo-100 text-sm font-mono bg-black p-3 rounded-md border border-indigo-900/50">
                    {currentMistake.keyFormula}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex gap-4 mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); handleReview('tough'); }}
              className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-zinc-800"
            >
              <RotateCcw className="w-4 h-4" />
              Still Tough 🔄
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleReview('mastered'); }}
              className="flex-1 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              Mastered 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
