import React from 'react';
import { Settings, Shield, BrainCircuit, Calendar as CalendarIcon, CheckSquare, Home } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TabType = 'home' | 'fight' | 'vault' | 'calendar' | 'planner' | 'backlog';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSettingsClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onSettingsClick }) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-screen-sm mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-black">
              <span className="font-bold text-white text-lg leading-none">O</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Orbit
            </h1>
          </div>
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-full hover:bg-zinc-900 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-screen-sm w-full mx-auto p-4 pt-20 pb-24 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 z-50 pb-safe">
        <div className="max-w-screen-sm mx-auto flex">
          <button
            onClick={() => onTabChange('home')}
            className={cn(
              "flex-1 py-4 flex flex-col justify-center items-center gap-1 transition-colors",
              activeTab === 'home'
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
          </button>
          <button
            onClick={() => onTabChange('fight')}
            className={cn(
              "flex-1 py-4 flex flex-col justify-center items-center gap-1 transition-colors",
              activeTab === 'fight'
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Fight</span>
          </button>
          <button
            onClick={() => onTabChange('vault')}
            className={cn(
              "flex-1 py-4 flex flex-col justify-center items-center gap-1 transition-colors",
              activeTab === 'vault'
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <BrainCircuit className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Vault</span>
          </button>
          <button
            onClick={() => onTabChange('calendar')}
            className={cn(
              "flex-1 py-4 flex flex-col justify-center items-center gap-1 transition-colors",
              activeTab === 'calendar'
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Plan</span>
          </button>
          <button
            onClick={() => onTabChange('planner')}
            className={cn(
              "flex-1 py-4 flex flex-col justify-center items-center gap-1 transition-colors",
              activeTab === 'planner'
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Tasks</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
