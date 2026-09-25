import { useState, useEffect } from 'react';
import { Layout, type TabType } from './components/Layout';
import { FightMode } from './views/FightMode';
import { WarmupVault } from './views/WarmupVault';
import { Calendar } from './views/Calendar';
import { Planner } from './views/Planner';
import { ApiKeyModal } from './components/ApiKeyModal';
import { getGeminiApiKey } from './lib/gemini';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('fight');
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
        {activeTab === 'fight' && <FightMode />}
        {activeTab === 'vault' && <WarmupVault />}
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'planner' && <Planner />}
      </Layout>

      {showSettings && (
        <ApiKeyModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}

export default App;
