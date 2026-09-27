import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Loader2, Send, Clipboard } from 'lucide-react';
import { processImage } from '../lib/image';
import { analyzeImage, hasValidApiKey } from '../lib/gemini';
import type { GeminiResponse } from '../lib/gemini';
import { HintCard } from '../components/HintCard';

declare global {
  interface Window {
    renderMathInElement?: (elem: HTMLElement, options?: object) => void;
  }
}

interface FightModeProps {
  onRequestSettings?: () => void;
}

export const FightMode: React.FC<FightModeProps> = ({ onRequestSettings }) => {
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [userNote, setUserNote] = useState('');
  const [responseLength, setResponseLength] = useState<'small' | 'medium' | 'long'>('medium');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geminiData, setGeminiData] = useState<GeminiResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mathContainerRef = useRef<HTMLDivElement>(null);
  const [katexReady, setKatexReady] = useState(
    typeof window !== 'undefined' && !!window.renderMathInElement
  );

  // Helper to process any image File or Blob (from input or clipboard)
  const handleIncomingImageFile = useCallback(async (file: File | Blob) => {
    if (!hasValidApiKey()) {
      onRequestSettings?.();
      return;
    }

    try {
      setError(null);
      const processedBase64 = await processImage(file as File);
      setPendingImage(processedBase64);
      setUserNote('');
    } catch (err: any) {
      setError(err.message || 'Failed to process image.');
    }
  }, [onRequestSettings]);

  // Global Clipboard (Ctrl+V / Cmd+V) Listener for screenshots
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isProcessing) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleIncomingImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isProcessing, handleIncomingImageFile]);

  // Direct clipboard button click
  const handlePasteClick = async () => {
    if (!hasValidApiKey()) {
      onRequestSettings?.();
      return;
    }

    try {
      if (!navigator.clipboard?.read) {
        setError('Direct clipboard reading is blocked by your browser. Press Ctrl+V (or Cmd+V) to paste.');
        return;
      }

      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], 'screenshot.png', { type: imageType });
          await handleIncomingImageFile(file);
          return;
        }
      }
      setError('No image found in your clipboard. Take a screenshot or copy an image first.');
    } catch {
      setError('Clipboard permission denied. Use Ctrl+V (or Cmd+V) to paste directly.');
    }
  };

  // Dynamically inject KaTeX without npm package installs
  useEffect(() => {
    if (window.renderMathInElement) {
      setKatexReady(true);
      return;
    }

    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
    }

    const loadScript = (src: string, id: string): Promise<void> => {
      return new Promise((resolve) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js', 'katex-js')
      .then(() =>
        loadScript(
          'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',
          'katex-autorender'
        )
      )
      .then(() => {
        setKatexReady(true);
      });
  }, []);

  // Format math inside HintCard and FightMode dynamically
  useEffect(() => {
    if (!katexReady || !mathContainerRef.current) return;

    const renderMath = () => {
      if (!mathContainerRef.current || !window.renderMathInElement) return;
      try {
        window.renderMathInElement(mathContainerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
          ],
          throwOnError: false,
        });
      } catch {
        // Fallback gracefully
      }
    };

    renderMath();

    let timeoutId: ReturnType<typeof setTimeout>;
    let isRendering = false;

    const observer = new MutationObserver(() => {
      if (isRendering) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!mathContainerRef.current) return;
        isRendering = true;
        observer.disconnect();
        renderMath();
        if (mathContainerRef.current) {
          observer.observe(mathContainerRef.current, { childList: true, subtree: true });
        }
        isRendering = false;
      }, 50);
    });

    observer.observe(mathContainerRef.current, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [katexReady, geminiData]);

  const tips = [
    'Analyzing reference frames...',
    'Scanning for constraint relations...',
    'Checking sign conventions...',
    'Looking for the trap...',
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
    await handleIncomingImageFile(file);
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

      const lengthInstructions = {
        small: 'Keep hints and explanations extremely concise, bite-sized, and quick to read (1-2 punchy lines per step).',
        medium: 'Provide a balanced, standard step-by-step guidance with clear milestones.',
        long: 'Provide a comprehensive, in-depth breakdown exploring the underlying principles, edge cases, and alternate approaches.',
      };

      const formattingDirective = `[Formatting & Tone Directive: Detail Level = "${responseLength.toUpperCase()}" (${lengthInstructions[responseLength]}). Make the explanation visually dynamic and vibrant by incorporating contextual emojis (e.g., 💡, ⚡, 🎯, ⚠️, 🚀, 🧠, 🔍) in headings, key observations, and steps. Avoid dry text, but preserve standard LaTeX delimiters ($...$ and $$...$$) for all math.]`;

      const promptPayload = userNote.trim()
        ? `${userNote.trim()}\n\n${formattingDirective}`
        : formattingDirective;

      const data = await analyzeImage(pendingImage, promptPayload);
      setGeminiData(data);

      clearInterval(tipInterval);
    } catch (err: any) {
      setError(err.message || 'Failed to process image.');
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
    <div ref={mathContainerRef} className="flex flex-col gap-6">
      {!pendingImage && !image && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Log a Tricky Problem</h2>
          <p className="text-zinc-400 mb-8 max-w-sm">
            Snap a photo, choose an image, or paste a screenshot (<kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-xs text-zinc-300 font-mono">Ctrl+V</kbd>).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCaptureClick}
              className="bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Capture / Upload
            </button>

            <button
              onClick={handlePasteClick}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium py-3 px-6 rounded-full transition-all active:scale-95 flex items-center gap-2"
            >
              <Clipboard className="w-4 h-4 text-zinc-400" />
              Paste Screenshot
            </button>
          </div>

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

          <div className="flex flex-col gap-3">
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
            </div>

            {/* Response Depth & Visual Style Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center justify-between">
                <span>Explanation Depth</span>
                <span className="text-[11px] text-zinc-500 font-normal">Includes expressive emojis ✨</span>
              </label>
              <select
                value={responseLength}
                onChange={(e) => setResponseLength(e.target.value as 'small' | 'medium' | 'long')}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
              >
                <option value="small">⚡ Small — Punchy & Quick hints</option>
                <option value="medium">🎯 Medium — Balanced step-by-step guidance</option>
                <option value="long">🧠 Long — Comprehensive deep-dive & edge cases</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
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
