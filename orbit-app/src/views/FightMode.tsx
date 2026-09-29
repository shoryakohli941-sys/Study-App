import { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, Inbox } from 'lucide-react';
import { analyzeImage, type GeminiResponse } from '../lib/gemini';
import { processImage } from '../lib/image';
import { db, type ErrorType } from '../db';

export default function FightMode({ apiKey }: { apiKey: string }) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [geminiRes, setGeminiRes] = useState<GeminiResponse | null>(null);

  const [hintLevel, setHintLevel] = useState(1);
  const [holdingSolution, setHoldingSolution] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tips = [
    "Read the question carefully...",
    "Check the units...",
    "Draw a clear FBD...",
    "Is friction static or kinetic?",
    "Verify the boundary conditions...",
    "Don't rush the first step!"
  ];
  const [tipIndex, setTipIndex] = useState(0);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processImage(file);
      setImagePreview(dataUrl);

      setLoading(true);
      setGeminiRes(null);
      setHintLevel(1);
      setSolutionRevealed(false);

      const tipInterval = setInterval(() => {
        setTipIndex((i) => (i + 1) % tips.length);
      }, 2000);

      const res = await analyzeImage(apiKey, dataUrl);
      clearInterval(tipInterval);
      setGeminiRes(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze image. Please try again.');
      setLoading(false);
    }
  };

  const handleHoldStart = () => {
    setHoldingSolution(true);
    holdTimeout.current = setTimeout(() => {
      setSolutionRevealed(true);
      setHoldingSolution(false);
    }, 2000);
  };

  const handleHoldEnd = () => {
    setHoldingSolution(false);
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setGeminiRes(null);
    setHintLevel(1);
    setSolutionRevealed(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveToVault = async (errorType: ErrorType) => {
    if (!geminiRes || !imagePreview) return;
    try {
      await db.mistakes.add({
        imageData: imagePreview,
        subject: geminiRes.subject,
        chapter: geminiRes.chapter,
        subtopic: geminiRes.subtopic,
        theTrap: geminiRes.the_trap,
        keyFormula: geminiRes.key_formula,
        errorType,
        nextReviewDate: Date.now() + 86400000,
        reviewStage: 0,
        createdAt: Date.now()
      });
      alert(`Saved to Error Vault as ${errorType}!`);
      reset();
    } catch (err) {
      console.error(err);
      alert('Failed to save to vault.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!imagePreview && !loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-3xl border-dashed">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
            <Camera className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 text-center">Capture a Problem</h2>
          <p className="text-sm text-slate-400 text-center mb-8 max-w-sm">
            Take a photo of a tricky JEE question to get step-by-step Socratic hints.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            <Upload className="w-5 h-5" />
            Upload / Take Photo
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-3xl">
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mb-6 opacity-50" />
          )}
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
          <p className="text-indigo-400 font-medium animate-pulse">{tips[tipIndex]}</p>
        </div>
      )}

      {geminiRes && !loading && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {imagePreview && (
              <div className="bg-black/50 p-4 border-b border-slate-800 flex justify-center">
                <img src={imagePreview} alt="Problem" className="max-h-48 object-contain rounded-lg" />
              </div>
            )}

            <div className="p-5 sm:p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded-md border border-indigo-500/20">
                  {geminiRes.subject}
                </span>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-md">
                  {geminiRes.chapter}
                </span>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-md">
                  {geminiRes.subtopic}
                </span>
              </div>

              {/* Hint 1 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Hint 1: The Core Lens</h3>
                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl text-slate-200">
                  {geminiRes.hint_1_lens}
                </div>
              </div>

              {/* Hint 2 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Hint 2: Setup</h3>
                {hintLevel >= 2 ? (
                  <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl text-slate-200">
                    {geminiRes.hint_2_setup}
                  </div>
                ) : (
                  <button
                    onClick={() => setHintLevel(2)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition border border-slate-700"
                  >
                    Unlock Hint 2: Setup
                  </button>
                )}
              </div>

              {/* Hint 3 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Hint 3: The Bottleneck</h3>
                {hintLevel >= 3 ? (
                  <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl text-slate-200">
                    {geminiRes.hint_3_pivot}
                  </div>
                ) : (
                  <button
                    onClick={() => setHintLevel(3)}
                    disabled={hintLevel < 2}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-xl text-sm font-semibold transition border border-slate-700"
                  >
                    Unlock Hint 3: The Bottleneck
                  </button>
                )}
              </div>

              {/* Solution */}
              {solutionRevealed ? (
                <div className="space-y-2 mt-8 pt-6 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Full Solution</h3>
                  <div className="bg-emerald-950/20 border border-emerald-900/50 p-5 rounded-xl text-slate-200 space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-emerald-500 block mb-1">Key Formula</span>
                      <code className="text-emerald-300 font-mono text-sm">{geminiRes.key_formula}</code>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-emerald-500 block mb-1">Solution</span>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{geminiRes.full_solution}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4">
                  <button
                    onMouseDown={handleHoldStart}
                    onMouseUp={handleHoldEnd}
                    onMouseLeave={handleHoldEnd}
                    onTouchStart={handleHoldStart}
                    onTouchEnd={handleHoldEnd}
                    className={`w-full py-4 rounded-xl text-sm font-bold transition-all relative overflow-hidden ${
                      holdingSolution ? 'bg-rose-600 text-white scale-[0.98]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <span className="relative z-10">
                      {holdingSolution ? 'Keep holding...' : 'Hold 2s to Reveal Solution'}
                    </span>
                    {holdingSolution && (
                      <div className="absolute inset-0 bg-rose-500/50 animate-[fill_2s_ease-in-out_forwards]" style={{ transformOrigin: 'left' }} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              Cracked It! 🎯
            </button>

            <div className="flex-1 flex gap-2">
              <button
                onClick={() => saveToVault('Concept Gap')}
                className="flex-1 py-3.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                <Inbox className="w-4 h-4" />
                Concept Gap
              </button>
              <button
                onClick={() => saveToVault('Silly Slip')}
                className="flex-1 py-3.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                <Inbox className="w-4 h-4" />
                Silly Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
