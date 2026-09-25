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
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Setup AI Mentor</h2>
          <p className="text-slate-400 text-sm mb-6">
            Orbit uses Google's Gemini to analyze problems. Enter your API key from Google AI Studio to get started.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-xs font-medium text-slate-400 mb-1">
                Gemini API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
