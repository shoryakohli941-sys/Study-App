import { useState, useRef } from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import ProgressiveHintCard, { type AnalysisResult } from '../components/ProgressiveHintCard';
import { analyzeImage } from '../lib/gemini';

interface FightModeProps {
  apiKey: string | null;
}

const MICRO_TIPS = [
  "Check dimensions. Do they match on both sides?",
  "FBDs save lives. Draw it again.",
  "Is the constraint equation correct?",
  "Signs matter: did you drop a negative?",
  "Look for symmetry to simplify."
];

export default function FightMode({ apiKey }: FightModeProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!apiKey) {
      setError("Please configure your API key first.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    // Cycle tips while loading
    const tipInterval = setInterval(() => {
      setTipIndex(i => (i + 1) % MICRO_TIPS.length);
    }, 2500);

    try {
      const compressedBase64 = await compressImage(file);
      setImageSrc(`data:image/jpeg;base64,${compressedBase64}`);

      const result = await analyzeImage(compressedBase64, apiKey);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image. Please try again.");
    } finally {
      clearInterval(tipInterval);
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const resetState = () => {
    setImageSrc(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Image compression utility inside the component for now
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = 800;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Get jpeg base64 and strip the data url prefix
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          const base64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
          resolve(base64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  return (
    <div className="p-4 max-w-lg mx-auto w-full">
      {!imageSrc ? (
        <div className="mt-8 flex flex-col items-center justify-center space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-100">Ready to Fight?</h2>
            <p className="text-slate-400">Upload a tricky JEE problem to get Socratic hints.</p>
          </div>

          <div className="w-full grid grid-cols-1 gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500/50 transition-all"
            >
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8" />
              </div>
              <span className="font-semibold text-slate-200">Capture Problem</span>
              <span className="text-sm text-slate-500 mt-1">or select from gallery</span>
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="space-y-6 pb-6">
          {/* Thumbnail */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-[4/3]">
            <img src={imageSrc} alt="Problem" className="w-full h-full object-contain" />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-20 bg-slate-700 rounded-xl w-full"></div>
                <div className="h-10 bg-slate-700 rounded-xl w-full"></div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm font-medium text-indigo-400">Mentor Tip</p>
                <p className="text-slate-300 mt-1 italic transition-opacity duration-500">{MICRO_TIPS[tipIndex]}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-red-200">{error}</p>
              <button onClick={resetState} className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-700">
                Try Again
              </button>
            </div>
          )}

          {/* Result State */}
          {analysis && !loading && !error && (
            <ProgressiveHintCard
              analysis={analysis}
              imageData={imageSrc.replace(/^data:image\/[a-z]+;base64,/, '')}
              onReset={resetState}
            />
          )}
        </div>
      )}
    </div>
  );
}
