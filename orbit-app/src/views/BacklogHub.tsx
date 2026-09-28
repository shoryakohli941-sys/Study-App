import React, { useState, useEffect } from 'react';
import {
  AI_MODELS,
  type AIModelKey,
  getSavedAIModel,
  saveAIModel,
  generateStudyPlan,
} from '../lib/gemini';

interface BacklogItem {
  id: string;
  topic: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  hours: number;
  completed: boolean;
  roadmap?: string;
}

export const BacklogHub: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<AIModelKey>(getSavedAIModel());
  const [backlogs, setBacklogs] = useState<BacklogItem[]>(() => {
    try {
      const stored = localStorage.getItem('orbit_backlogs');
      return stored
        ? JSON.parse(stored)
        : [
            {
              id: '1',
              topic: 'Rotational Dynamics & Moment of Inertia',
              subject: 'Physics',
              priority: 'High',
              hours: 6,
              completed: false,
            },
            {
              id: '2',
              topic: 'Chemical Equilibrium & Le Chatelier',
              subject: 'Chemistry',
              priority: 'Medium',
              hours: 4,
              completed: false,
            },
          ];
    } catch {
      return [];
    }
  });

  const [newTopic, setNewTopic] = useState('');
  const [newSubject, setNewSubject] = useState('Physics');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newHours, setNewHours] = useState(4);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('orbit_backlogs', JSON.stringify(backlogs));
  }, [backlogs]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextModel = e.target.value as AIModelKey;
    setSelectedModel(nextModel);
    saveAIModel(nextModel);
    setErrorMessage(null);
  };

  const handleAddBacklog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newItem: BacklogItem = {
      id: Date.now().toString(),
      topic: newTopic.trim(),
      subject: newSubject,
      priority: newPriority,
      hours: Number(newHours) || 3,
      completed: false,
    };

    setBacklogs((prev) => [newItem, ...prev]);
    setNewTopic('');
  };

  const handleToggleComplete = (id: string) => {
    setBacklogs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setBacklogs((prev) => prev.filter((item) => item.id !== id));
    if (activePlanId === id) setActivePlanId(null);
  };

  const handleGeneratePlan = async (item: BacklogItem) => {
    setLoadingId(item.id);
    setErrorMessage(null);

    try {
      const plan = await generateStudyPlan(item.topic, item.subject, selectedModel);
      setBacklogs((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, roadmap: plan } : b))
      );
      setActivePlanId(item.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setErrorMessage(
        `${msg}. If ${AI_MODELS[selectedModel].name} is experiencing spikes, switch to another model from the dropdown above.`
      );
    } finally {
      setLoadingId(null);
    }
  };

  const activeBacklog = backlogs.find((b) => b.id === activePlanId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-zinc-100">
      {/* Top Header & AI Model Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Backlog Hub</h1>
          <p className="text-sm text-zinc-400">
            Audit, decompose, and clear pending syllabus backlogs
          </p>
        </div>

        {/* Dynamic Model Dropdown */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <label
              htmlFor="ai-model-select"
              className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
            >
              AI Engine:
            </label>
          </div>

          <select
            id="ai-model-select"
            value={selectedModel}
            onChange={handleModelChange}
            className="bg-zinc-800 hover:bg-zinc-750 text-xs font-medium text-white px-2.5 py-1.5 rounded-lg border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {Object.entries(AI_MODELS).map(([key, model]) => (
              <option key={key} value={key} className="bg-zinc-900 text-white">
                {model.name} — {model.badge}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Traffic Spike Notice */}
      {errorMessage && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-sm flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-amber-100">AI Request Notice</p>
            <p className="mt-0.5 text-xs text-amber-300/90">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-amber-400 hover:text-amber-200 font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Form + List & Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Backlog List */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleAddBacklog}
            className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Log Unfinished Topic
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Chapter or Topic name..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>Priority:</span>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as 'High' | 'Medium' | 'Low')
                    }
                    className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>Est. Hours:</span>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-14 bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                + Add to Backlog
              </button>
            </div>
          </form>

          {/* List of Backlogs */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Active Queue ({backlogs.filter((b) => !b.completed).length})
            </h2>

            {backlogs.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-zinc-500 text-sm">
                No backlogs recorded. You're completely caught up!
              </div>
            ) : (
              backlogs.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.completed
                      ? 'bg-zinc-950/60 border-zinc-900 opacity-60'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleComplete(item.id)}
                      className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            item.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                          }`}
                        >
                          {item.topic}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {item.subject}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                        <span>
                          Priority:{' '}
                          <strong
                            className={
                              item.priority === 'High'
                                ? 'text-rose-400'
                                : item.priority === 'Medium'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {item.priority}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>{item.hours}h allotted</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleGeneratePlan(item)}
                      disabled={loadingId === item.id}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-indigo-300 border border-zinc-700 rounded-lg text-xs font-medium transition"
                    >
                      {loadingId === item.id
                        ? 'Generating...'
                        : item.roadmap
                        ? 'Re-plan (AI)'
                        : 'AI Plan'}
                    </button>

                    {item.roadmap && (
                      <button
                        onClick={() => setActivePlanId(item.id)}
                        className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 rounded-lg text-xs font-medium transition"
                      >
                        View Plan
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1.5 text-xs transition"
                      title="Delete item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Roadmap View */}
        <div className="lg:col-span-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sticky top-6 space-y-4 min-h-[400px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Action Roadmap
              </h2>
              <span className="text-[11px] text-zinc-500 font-mono">
                Model: {AI_MODELS[selectedModel].id}
              </span>
            </div>

            {activeBacklog?.roadmap ? (
              <div className="space-y-3">
                <div className="pb-2 border-b border-zinc-800/80">
                  <h3 className="text-base font-semibold text-white">
                    {activeBacklog.topic}
                  </h3>
                  <p className="text-xs text-zinc-400">{activeBacklog.subject}</p>
                </div>
                <div className="text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap font-sans">
                  {activeBacklog.roadmap}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500 text-xs px-4">
                <p>No active roadmap selected.</p>
                <p className="mt-1 text-zinc-600">
                  Select any backlog item and click <strong>AI Plan</strong> to construct a strategy using {AI_MODELS[selectedModel].name}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
