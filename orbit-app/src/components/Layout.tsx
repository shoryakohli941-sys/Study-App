import React from 'react';
import { Settings, Shield, BrainCircuit } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'fight' | 'vault';
  onTabChange: (tab: 'fight' | 'vault') => void;
  onSettingsClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onSettingsClick }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-screen-sm mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="font-bold text-white text-lg leading-none">O</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Orbit
            </h1>
          </div>
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="max-w-screen-sm mx-auto px-4 flex gap-4 border-t border-slate-800/50">
          <button
            onClick={() => onTabChange('fight')}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 flex justify-center items-center gap-2 transition-colors",
              activeTab === 'fight'
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
            )}
          >
            <Shield className="w-4 h-4" />
            Fight Mode
          </button>
          <button
            onClick={() => onTabChange('vault')}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 flex justify-center items-center gap-2 transition-colors",
              activeTab === 'vault'
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
            )}
          >
            <BrainCircuit className="w-4 h-4" />
            Warmup Vault
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-screen-sm w-full mx-auto p-4 overflow-y-auto pb-24">
        {children}
      </main>
    </div>
  );
};
