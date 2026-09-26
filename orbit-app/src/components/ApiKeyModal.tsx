import React, { useState, useEffect } from 'react';
import { Key, X } from 'lucide-react';

interface ApiKeyModalProps {
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [examName, setExamName] = useState('JEE Main');
  const [examDate, setExamDate] = useState('2027-01-24');

  useEffect(() => {
    const existingKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(existingKey);
    // Note: We use indexedDB for userSettings now, so we fetch it via dexie ideally,
    // but for simplicity in this modal we can leave it decoupled or update via db here.
    import('../db').then(({ db }) => {
      db.userSettings.toArray().then(settings => {
        if (settings.length > 0) {
          setExamName(settings[0].targetExamName);
          setExamDate(settings[0].targetExamDate);
        }
      });
    });
  }, []);

  const handleSave = async () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    const { db } = await import('../db');
    const settings = await db.userSettings.toArray();
    if (settings.length > 0) {
      await db.userSettings.update(settings[0].id!, { targetExamName: examName, targetExamDate: examDate });
    } else {
      await db.userSettings.add({ targetExamName: examName, targetExamDate: examDate, geminiApiKey: apiKey.trim() });
    }
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
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Orbit Settings</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Configure your AI mentor and target exam countdown.
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                  Target Exam
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. JEE Main"
                  className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2.5 text-white focus:outline-none focus:border-white transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                  Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2.5 text-white focus:outline-none focus:border-white transition-all text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-widest py-3 rounded-md transition-colors mt-2"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
