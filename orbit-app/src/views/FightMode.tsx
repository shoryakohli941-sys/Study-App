import React, { useState, useRef } from 'react';
import { Camera, Loader2, Send } from 'lucide-react';
import { processImage } from '../lib/image';
import { analyzeImage, hasValidApiKey } from '../lib/gemini';
import type { GeminiResponse } from '../lib/gemini';
import { HintCard } from '../components/HintCard';

interface FightModeProps {
  onRequestSettings?: () => void;
}

export const FightMode: React.FC<FightModeProps> = ({ onRequestSettings }) => {
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [userNote, setUserNote] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geminiData, setGeminiData] = useState<GeminiResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tips = [
    "Analyzing reference frames...",
    "Scanning for constraint relations...",
    "Checking sign conventions...",
    "Looking for the trap..."
  ];
  const [tipIndex, setTipIndex] = useState(0);

  const handleCaptureClick = () => {
    if (!hasValidApiKey()) {
      onRequestSettings?.();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasValidApiKey()) {
      onRequestSettings?.();
      return;
    }

    try {
      setError(null);
      const processedBase64 = await processImage(file);
      setPendingImage(processedBase64);
      setUserNote('');
    } catch (err: any) {
      setError(err.message || "Failed to process image.");
    }
  };

  const handleSubmitForAnalysis = async () => {
    if (!pendingImage) return;

    try {
      setIsProcessing(true);
      setError(null);
      setGeminiData(null);
      setImage(pendingImage);

      const tipInterval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
      }, 1500);

      // Note is optional - if left blank, Gemini just analyzes the image as normal.
      const data = await analyzeImage(pendingImage, userNote);
      setGeminiData(data);

      clearInterval(tipInterval);
    } catch (err: any) {
      setError(err.message || "Failed to process image.");
    } finally {
      setIsProcessing(false);
      setPendingImage(null);
    }
  };

  const handleReset = () => {
    setPendingImage(null);
    setUserNote('');
    setImage(null);
    setGeminiData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!pendingImage && !image && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Log a Tricky Problem</h2>
          <p className="text-zinc-400 mb-8 max-w-sm">
            Snap a photo of a JEE problem you're stuck on. Our Socratic mentor will guide you without spoiling the answer.
          </p>

          <button
            onClick={handleCaptureClick}
            className="bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-8 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Capture Problem
          </button>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {pendingImage && !isProcessing && (
        <div className="flex flex-col gap-4">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
            <img src={pendingImage} alt="Selected problem" className="w-full h-full object-contain" />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Anything specific you got stuck on? <span className="text-zinc-600">(optional)</span>
            </label>
            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="e.g. I couldn't figure out which direction the friction acts in step 2..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors resize-none"
            />
            <p className="text-[11px] text-zinc-600 mt-1">
              Leave blank and it'll just analyze the problem as usual.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-lg border border-zinc-800 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitForAnalysis}
              className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Analyze
            </button>
          </div>
        </div>
      )}

      {image && !geminiData && isProcessing && (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <img src={image} alt="Problem thumbnail" className="w-full h-full object-cover opacity-50 blur-sm" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
              <p className="text-zinc-300 font-medium">{tips[tipIndex]}</p>
            </div>
          </div>
          <div className="h-40 bg-zinc-900/50 rounded-xl border border-zinc-800"></div>
          <div className="h-16 bg-zinc-900/50 rounded-xl border border-zinc-800"></div>
        </div>
      )}

      {error && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-300 mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="text-white hover:text-zinc-300 text-sm font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      {geminiData && image && (
        <div className="flex flex-col gap-6 fade-in">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-xl">
            <img src={image} alt="Problem thumbnail" className="w-full h-full object-contain" />
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-md px-3 py-1 text-xs font-semibold border border-zinc-800 flex items-center gap-2">
              <span className="text-white uppercase tracking-wider">
                {geminiData.subject}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{geminiData.chapter}</span>
            </div>
          </div>

          <HintCard data={geminiData} image={image} onReset={handleReset} />
        </div>
      )}
    </div>
  );
};
