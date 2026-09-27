import { useState, useEffect } from 'react';
import { Layout, type TabType } from './components/Layout';
import { FightMode } from './views/FightMode';
import { WarmupVault } from './views/WarmupVault';
import { Calendar } from './views/Calendar';
import { Planner } from './views/Planner';
import { Home } from './views/Home';
import { BacklogHub } from './views/BacklogHub';
import { ApiKeyModal } from './components/ApiKeyModal';
import { hasValidApiKey } from './lib/gemini';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!hasValidApiKey()) {
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
        {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
        {activeTab === 'fight' && <FightMode onRequestSettings={() => setShowSettings(true)} />}
        {activeTab === 'vault' && <WarmupVault />}
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'planner' && <Planner />}
        {activeTab === 'backlog' && <BacklogHub />}
      </Layout>

      {showSettings && (
        <ApiKeyModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}

export default App;
