import React from 'react';
import { Settings, Shield, BrainCircuit } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TabType = 'fight' | 'vault';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onRequestSettings: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onRequestSettings }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-screen-sm mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-slate-900">
              <span className="font-bold text-white text-lg leading-none">O</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mr-4">
              Orbit
            </h1>
          </div>

          {/* Top Navigation Tabs */}
          <div className="flex items-center gap-1 flex-1 px-4">
            <button
              onClick={() => onTabChange('fight')}
              className={cn(
                "flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all",
                activeTab === 'fight'
                  ? "bg-white/10 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm">Fight Mode</span>
            </button>
            <button
              onClick={() => onTabChange('vault')}
              className={cn(
                "flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all",
                activeTab === 'vault'
                  ? "bg-white/10 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <BrainCircuit className="w-4 h-4" />
              <span className="text-sm">Warmup Vault</span>
            </button>
          </div>

          <button
            onClick={onRequestSettings}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors ml-2"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-screen-sm w-full mx-auto p-4 pt-20 pb-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
