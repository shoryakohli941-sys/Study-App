import { useState, useEffect } from 'react';
import { Settings, Save, X } from 'lucide-react';

interface ApiKeyModalProps {
  onClose: () => void;
  onSave: (key: string) => void;
}

export function ApiKeyModal({ onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('orbit_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('orbit_gemini_api_key', apiKey.trim());
    onSave(apiKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="mb-6">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
            <Settings className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">API Key Setup</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Orbit uses Google's Gemini AI to generate Socratic hints. Please enter your Gemini API key to continue.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
          <p className="text-center text-xs text-slate-500">
            Keys are stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
