import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, X } from 'lucide-react';
import { getApiKey, setApiKey } from '../lib/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getApiKey());
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyInput.trim();
    if (!clean) {
      setError('Please enter a valid Gemini API key.');
      return;
    }
    setApiKey(clean);
    setError('');
    onClose();
  };

  const hasSavedKey = Boolean(getApiKey());

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={() => {
        // Only allow clicking outside to dismiss IF a key already exists
        if (hasSavedKey) onClose();
      }}
    >
      <div 
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
              <Key className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Gemini API Key
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Saved locally on this device
              </p>
            </div>
          </div>
          {hasSavedKey && (
            <button 
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4 font-mono">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
              Google AI Studio Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                if (error) setError('');
              }}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-[11px] text-red-400 mt-1.5 font-sans">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-sans">
            <span>Stored in device localStorage</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 underline hover:text-white"
            >
              Get free key ↗
            </a>
          </div>

          <div className="flex items-center gap-2 pt-1 font-sans">
            {hasSavedKey && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                Keep Existing
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
