import { useState, useEffect } from 'react';
import { Settings, BrainCircuit, Library, Orbit } from 'lucide-react';
import { ApiKeyModal } from './components/ApiKeyModal';
import FightMode from './views/FightMode';
import WarmupVault from './views/WarmupVault';

function App() {
  const [activeTab, setActiveTab] = useState<'fight' | 'vault'>('fight');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem('orbit_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    if (key) {
      setApiKey(key);
    } else {
      setShowSettings(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Orbit className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tight text-white">Orbit</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => setActiveTab('fight')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'fight'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span className="hidden sm:inline">Fight Mode</span>
              </button>
              <button
                onClick={() => setActiveTab('vault')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'vault'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Library className="w-4 h-4" />
                <span className="hidden sm:inline">Warmup Vault</span>
              </button>
            </nav>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24">
        {activeTab === 'fight' ? <FightMode apiKey={apiKey || ''} /> : <WarmupVault />}
      </main>

      {/* Modals */}
      {showSettings && (
        <ApiKeyModal
          onClose={() => setShowSettings(false)}
          onSave={(key) => setApiKey(key)}
        />
      )}
    </div>
  );
}

export default App;
