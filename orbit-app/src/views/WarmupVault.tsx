import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Mistake } from '../db';
import { Flame, BrainCircuit, Rocket, RotateCw, AlertTriangle, Lightbulb } from 'lucide-react';

export default function WarmupVault() {
  const [flipped, setFlipped] = useState(false);

  // Query due cards: nextReviewDate <= Date.now()
  const dueCards = useLiveQuery(
    () => db.mistakes.where('nextReviewDate').belowOrEqual(Date.now()).toArray(),
    []
  );

  const handleAction = async (mistake: Mistake, action: 'tough' | 'mastered') => {
    if (!mistake.id) return;

    let newStage = mistake.reviewStage;
    let nextReviewDate = Date.now();

    if (action === 'tough') {
      newStage = 0;
      nextReviewDate = Date.now() + 86400000; // +1 day
    } else {
      newStage = Math.min(mistake.reviewStage + 1, 3);
      if (newStage === 0) nextReviewDate = Date.now() + 86400000; // +1 day
      else if (newStage === 1) nextReviewDate = Date.now() + (3 * 86400000); // +3 days
      else if (newStage === 2) nextReviewDate = Date.now() + (7 * 86400000); // +7 days
      else if (newStage === 3) nextReviewDate = Date.now() + (21 * 86400000); // +21 days
    }

    try {
      await db.mistakes.update(mistake.id, {
        reviewStage: newStage,
        nextReviewDate
      });
      setFlipped(false); // reset for next card
    } catch (err) {
      console.error('Failed to update flashcard', err);
    }
  };

  if (dueCards === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (dueCards.length === 0) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-3xl mt-12 shadow-xl">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <Rocket className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 text-center">All caught up for today!</h2>
        <p className="text-sm text-slate-400 text-center mb-6 max-w-sm">
          You've reviewed all your spaced repetition flashcards. Back to problem solving 🚀
        </p>
      </div>
    );
  }

  const card = dueCards[0];
  const daysElapsed = Math.floor((Date.now() - card.createdAt) / 86400000);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Badge */}
      <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">Today's Warmup</h3>
            <p className="text-xs text-slate-400">{dueCards.length} Cards Due</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Stage {card.reviewStage}
          </span>
          <span className="text-xs text-slate-400">
            {card.errorType}
          </span>
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="relative perspective-1000 w-full min-h-[400px] cursor-pointer group"
        onClick={() => !flipped && setFlipped(true)}
      >
        <div className={`w-full h-full min-h-[400px] transition-transform duration-500 transform-style-preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>

          {/* Card Front */}
          <div className="absolute inset-0 backface-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 sm:p-8">
            <div className="absolute top-4 right-4 text-xs font-semibold text-slate-500">
              Logged {daysElapsed}d ago
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded-md border border-indigo-500/20">
                {card.subject}
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-md">
                {card.chapter}
              </span>
            </div>

            {card.imageData && (
              <div className="bg-black/50 p-2 rounded-xl border border-slate-800 max-w-full">
                <img src={card.imageData} alt="Problem" className="max-h-56 object-contain rounded-lg shadow-sm" />
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 group-hover:text-indigo-400 transition">
              <BrainCircuit className="w-5 h-5" />
              <span className="text-sm font-semibold">Tap to Reveal Trap & Formula</span>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col p-6 sm:p-8">
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">The Trap</h3>
                </div>
                <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl text-rose-200/90 text-sm leading-relaxed">
                  {card.theTrap}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Lightbulb className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Key Formula / Condition</h3>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-emerald-300 font-mono text-sm">
                  {card.keyFormula}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-800">
              <button
                onClick={(e) => { e.stopPropagation(); handleAction(card, 'tough'); }}
                className="py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <RotateCw className="w-4 h-4" />
                Still Tough 🔄
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAction(card, 'mastered'); }}
                className="py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/20"
              >
                <Rocket className="w-4 h-4" />
                Mastered 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
