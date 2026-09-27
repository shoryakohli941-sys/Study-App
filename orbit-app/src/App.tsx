import { useState, useEffect } from 'react';
import { Layout, type TabType } from './components/Layout';
import { FightMode } from './views/FightMode';
import { WarmupVault } from './views/WarmupVault';
import { ApiKeyModal } from './components/ApiKeyModal';
import { getApiKey } from './lib/gemini';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('fight');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!getApiKey()) {
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
        {activeTab === 'fight' && <FightMode onRequestSettings={() => setShowSettings(true)} />}
        {activeTab === 'vault' && <WarmupVault />}
      </Layout>

      {showSettings && (
        <ApiKeyModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}

export default App;
