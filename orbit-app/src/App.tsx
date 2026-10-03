import { useState, useEffect } from 'react';
import { Settings, BrainCircuit } from 'lucide-react';
import FightMode from './views/FightMode';
import WarmupVault from './views/WarmupVault';
import ApiKeyModal from './components/ApiKeyModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'fight' | 'vault'>('fight');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowSettings(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold tracking-tight">Orbit</h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'fight' ? <FightMode apiKey={apiKey} /> : <WarmupVault />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm px-4 pb-safe pt-2">
        <div className="flex justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('fight')}
            className={`flex flex-col items-center p-2 min-w-[80px] ${
              activeTab === 'fight' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl mb-1 ${activeTab === 'fight' ? 'bg-indigo-400/10' : ''}`}>
               <span className="text-xl">⚔️</span>
            </div>
            <span className="text-xs font-medium">Fight Mode</span>
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex flex-col items-center p-2 min-w-[80px] ${
              activeTab === 'vault' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl mb-1 ${activeTab === 'vault' ? 'bg-indigo-400/10' : ''}`}>
               <span className="text-xl">🧠</span>
            </div>
            <span className="text-xs font-medium">Warmup Vault</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      {showSettings && (
        <ApiKeyModal
          currentKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => apiKey ? setShowSettings(false) : null}
          canClose={!!apiKey}
        />
      )}
    </div>
  );
}
