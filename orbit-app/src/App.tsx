import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { FightMode } from './views/FightMode';
import { WarmupVault } from './views/WarmupVault';
import { ApiKeyModal } from './components/ApiKeyModal';
import { getGeminiApiKey } from './lib/gemini';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'fight' | 'vault'>('fight');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!getGeminiApiKey()) {
      setShowSettings(true);
    }
  }, []);

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettingsClick={() => setShowSettings(true)}
      >
        {activeTab === 'fight' ? (
          <FightMode />
        ) : (
          <WarmupVault />
        )}
      </Layout>

      {showSettings && (
        <ApiKeyModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}

export default App;
