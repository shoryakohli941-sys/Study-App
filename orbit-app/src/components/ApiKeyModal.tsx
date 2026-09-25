import React, { useState, useEffect } from 'react';
import { Key, X } from 'lucide-react';

interface ApiKeyModalProps {
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const existingKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(existingKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-sm overflow-hidden shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Setup AI Mentor</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Orbit uses Google's Gemini to analyze problems. Enter your API key from Google AI Studio to get started.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                Gemini API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-black border border-zinc-800 rounded-md px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-all"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-2.5 rounded-md transition-colors"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
