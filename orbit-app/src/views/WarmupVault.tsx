import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import Flashcard from '../components/Flashcard';
import { CheckCircle2, Rocket } from 'lucide-react';

export default function WarmupVault() {
  const dueCards = useLiveQuery(
    () => db.mistakes
      .where('nextReviewDate')
      .belowOrEqual(Date.now())
      .toArray()
  );

  if (dueCards === undefined) {
    return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;
  }

  const handleCardComplete = () => {
    // We don't advance the index because the array length changes due to LiveQuery updating
    // The next card will naturally become index 0
  };

  if (dueCards.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 h-[70vh]">
        <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">All caught up for today!</h2>
          <p className="text-slate-400 mt-2">Back to problem solving 🚀</p>
        </div>
      </div>
    );
  }

  const currentCard = dueCards[0]; // Always show the first due card

  return (
    <div className="p-4 max-w-lg mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Rocket className="w-5 h-5 text-indigo-400" />
          Warmup Vault
        </h2>
        <div className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold">
          {dueCards.length} Cards Due
        </div>
      </div>

      <div className="relative">
         {/* Stack effect */}
         {dueCards.length > 1 && (
            <div className="absolute top-2 left-2 right-2 bottom-0 bg-slate-800 rounded-2xl border border-slate-700 -z-10 translate-y-4 shadow-xl"></div>
         )}
         {dueCards.length > 2 && (
            <div className="absolute top-4 left-4 right-4 bottom-0 bg-slate-800/50 rounded-2xl border border-slate-700/50 -z-20 translate-y-8"></div>
         )}

         {currentCard && (
           <Flashcard
             key={currentCard.id}
             mistake={currentCard}
             onComplete={handleCardComplete}
           />
         )}
      </div>
    </div>
  );
}
