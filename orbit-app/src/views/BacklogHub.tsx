import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ExternalLink, 
  Target, 
  Check, 
  Film, 
  CheckCircle2, 
  Circle, 
  PlayCircle,
  RefreshCw,
  Key
} from 'lucide-react';
import { fetchPlaylistVideos, YouTubeVideo } from '../lib/youtube';
import { db } from '../db';

const PLAYLISTS: { subject: string; id: string }[] = [
  { subject: 'Physics', id: 'PLxyGaR3hEy3gYPGsrnKx-XAi3yV6rocEx' },
  { subject: 'Mathematics', id: 'PLxyGaR3hEy3hJnlzYRfM6-sFuIEj0WRoC' },
  { subject: 'Physical Chemistry', id: 'PLxyGaR3hEy3hVmPjmool3j3U78cTYxYq-' },
  { subject: 'Organic Chemistry', id: 'PLxyGaR3hEy3jWivnsFTb5uvzpHZK3qvDj' },
  { subject: 'Inorganic Chemistry', id: 'PLxyGaR3hEy3hUTwPWVhqBOR0l_1o3vyCs' }
];

export const BacklogHub: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('orbit_yt_api_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<string>('All');
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('orbit_completed_yt_videos');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [addedGoals, setAddedGoals] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('orbit_completed_yt_videos', JSON.stringify(Array.from(completedIds)));
  }, [completedIds]);

  // Load from cache or fetch with key
  const loadAllPlaylists = async (keyToUse: string, forceRefresh = false) => {
    if (!keyToUse) {
      setIsKeyModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    if (forceRefresh) {
      PLAYLISTS.forEach((p) => localStorage.removeItem(`orbit_yt_cache_${p.id}`));
    }

    try {
      const promises = PLAYLISTS.map((p) => fetchPlaylistVideos(keyToUse, p.id, p.subject));
      const results = await Promise.all(promises);
      const combined = results.flat();
      setVideos(combined);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load videos from YouTube.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      loadAllPlaylists(apiKey);
    } else {
      setIsKeyModalOpen(true);
    }
  }, [apiKey]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyInput.trim();
    if (!clean) return;
    localStorage.setItem('orbit_yt_api_key', clean);
    setApiKey(clean);
    setIsKeyModalOpen(false);
    loadAllPlaylists(clean, true);
  };

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddToDailyGoals = async (v: YouTubeVideo) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const subjectGroup: 'Physics' | 'Chemistry' | 'Mathematics' = 
        v.subject.includes('Chemistry') ? 'Chemistry' : (v.subject as 'Physics' | 'Mathematics');

      await db.plannerTasks.add({
        date: today,
        title: `Watch: ${v.title}`,
        subject: subjectGroup,
        completed: false,
        priority: 'high',
        createdAt: Date.now()
      });

      setAddedGoals((prev) => new Set(prev).add(v.id));
      setTimeout(() => {
        setAddedGoals((prev) => {
          const next = new Set(prev);
          next.delete(v.id);
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to add goal:', err);
    }
  };

  const filtered = videos.filter((v) => filter === 'All' || v.subject === filter);
  const completionPct = videos.length > 0 ? Math.round((completedIds.size / videos.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white pb-28 pt-4 px-4 max-w-xl mx-auto space-y-5">
      
      {/* HUD Header */}
      <div className="border border-zinc-800 bg-zinc-950 p-4 rounded-lg space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold uppercase tracking-wider text-white">
              Backlog Mission Control
            </h1>
            <p className="text-[11px] text-zinc-500">
              {videos.length} YouTube Lectures Synchronized
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAllPlaylists(apiKey, true)}
              disabled={loading}
              className="p-1.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
              title="Sync Playlists"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="p-1.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
              title="Configure YouTube API Key"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
            <div className="text-right">
              <span className="text-xl font-bold text-white tabular-nums">{completionPct}%</span>
              <span className="block text-[9px] uppercase tracking-widest text-zinc-500">Mastered</span>
            </div>
          </div>
        </div>

        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out" 
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs font-mono text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => setIsKeyModalOpen(true)}
            className="underline ml-2 hover:text-white"
          >
            Update Key
          </button>
        </div>
      )}

      {/* Subject Filter Carousel */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'Physics', 'Mathematics', 'Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'].map((sub) => (
          <button
            key={sub}
            onClick={() => setFilter(sub)}
            className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-colors border ${
              filter === sub
                ? 'bg-white text-black font-bold border-white'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Video Feed */}
      {loading && videos.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500">
          Syncing full playlists from YouTube API...
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isDone = completedIds.has(item.id);
            const isAdded = addedGoals.has(item.id);
            const targetUrl = `https://www.youtube.com/watch?v=${item.id}`;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between gap-3 ${
                  isDone 
                    ? 'bg-zinc-950/40 border-zinc-900 opacity-60' 
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className="mt-1 text-zinc-500 hover:text-white transition-colors shrink-0"
                    aria-label="Toggle Complete"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                    )}
                  </button>

                  {/* Thumbnail Box */}
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative w-28 h-20 shrink-0 rounded-md overflow-hidden border border-zinc-800 bg-zinc-900 group"
                    title={`Watch ${item.title}`}
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-white/90 drop-shadow transition-transform group-hover:scale-110" />
                    </div>
                  </a>

                  {/* Video Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      {item.subject}
                    </span>

                    <h3 className={`text-sm font-medium leading-snug line-clamp-2 ${isDone ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                      {item.title}
                    </h3>

                    {/* Duration Line */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{item.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900/80 font-mono text-xs">
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    Watch on YouTube <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>

                  <button
                    onClick={() => handleAddToDailyGoals(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all border ${
                      isAdded
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-600'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3" /> Added to Goals
                      </>
                    ) : (
                      <>
                        <Target className="w-3 h-3" /> + Add Goal
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* YouTube API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-white" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                YouTube Data API Key
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Enter a free Google Cloud API key with <strong>YouTube Data API v3</strong> enabled to pull video metadata directly.
            </p>
            <form onSubmit={handleSaveKey} className="space-y-4">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                autoFocus
              />
              <div className="flex gap-2">
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="flex-1 py-1.5 rounded border border-zinc-800 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded bg-white text-black font-semibold text-xs hover:bg-zinc-200"
                >
                  Save & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
