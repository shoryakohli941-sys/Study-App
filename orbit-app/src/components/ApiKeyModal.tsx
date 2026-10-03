import { useState } from 'react';
import { Key, X } from 'lucide-react';

interface ApiKeyModalProps {
  currentKey: string | null;
  onSave: (key: string) => void;
  onClose: () => void;
  canClose: boolean;
}

export default function ApiKeyModal({ currentKey, onSave, onClose, canClose }: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState(currentKey || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim()) {
      onSave(keyInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Key className="w-5 h-5" />
            <h2 className="font-semibold">API Settings</h2>
          </div>
          {canClose && (
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300">
              Google AI Studio API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              Your key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors mt-6"
          >
            Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
}
