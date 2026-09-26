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
  Link as LinkIcon
} from 'lucide-react';
import { BACKLOG_CHAPTERS, PLAYLIST_LINKS, Chapter } from '../data/manzilPlaylists';
import { db } from '../db';

type SubjectFilter = 'All' | 'Physics' | 'Mathematics' | 'Physical Chemistry' | 'Organic Chemistry' | 'Inorganic Chemistry';

// Bulletproof YouTube Thumbnail Component
const YouTubeThumbnail: React.FC<{ 
  videoId?: string; 
  title: string; 
  subject: string;
  duration: string;
}> = ({ videoId, title, subject, duration }) => {
  const [hasError, setHasError] = useState(false);

  // If no 11-char ID exists or loading failed, display architectural monochrome card
  if (!videoId || videoId.length !== 11 || hasError) {
    return (
      <div className="w-full h-full bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center p-2 text-center select-none group-hover:border-zinc-600 transition-colors">
        <PlayCircle className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors mb-1" />
        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
          PW MANZIL
        </span>
        <span className="text-[8px] font-mono text-zinc-600 mt-0.5">
          {duration}
        </span>
      </div>
    );
  }

  return (
    <img
      src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
      alt={title}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export const BacklogHub: React.FC = () => {
  const [filter, setFilter] = useState<SubjectFilter>('All');
  const [classFilter, setClassFilter] = useState<'All' | 11 | 12>('All');
  
  // Custom user video IDs attached locally
  const [customVideoIds, setCustomVideoIds] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('orbit_custom_video_ids');
    return saved ? JSON.parse(saved) : {};
  });

  // Track completed backlogs
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('orbit_completed_backlog');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [addedGoals, setAddedGoals] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');

  // Persist completed chapters
  useEffect(() => {
    localStorage.setItem('orbit_completed_backlog', JSON.stringify(Array.from(completedIds)));
  }, [completedIds]);

  // Persist custom user video mappings
  useEffect(() => {
    localStorage.setItem('orbit_custom_video_ids', JSON.stringify(customVideoIds));
  }, [customVideoIds]);

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveCustomUrl = (chapterId: string) => {
    const match = inputUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      setCustomVideoIds(prev => ({ ...prev, [chapterId]: match[1] }));
    } else if (inputUrl.trim().length === 11) {
      setCustomVideoIds(prev => ({ ...prev, [chapterId]: inputUrl.trim() }));
    }
    setEditingId(null);
    setInputUrl('');
  };

  // Directly injects the lecture into Dexie plannerTasks
  const handleAddToDailyGoals = async (ch: Chapter) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const subjectGroup: 'Physics' | 'Chemistry' | 'Mathematics' = 
        ch.subject.includes('Chemistry') ? 'Chemistry' : (ch.subject as 'Physics' | 'Mathematics');

      await db.plannerTasks.add({
        date: today,
        title: `Manzil: ${ch.chapter}`,
        subject: subjectGroup,
        completed: false,
        priority: ch.weightage === 'High' ? 'high' : 'medium',
        createdAt: Date.now()
      });

      setAddedGoals((prev) => new Set(prev).add(ch.id));
      setTimeout(() => {
        setAddedGoals((prev) => {
          const next = new Set(prev);
          next.delete(ch.id);
          return next;
        });
      }, 2500);
    } catch (err) {
      console.error("Failed to add task to planner:", err);
    }
  };

  const filtered = BACKLOG_CHAPTERS.filter((item) => {
    const matchSub = filter === 'All' || item.subject === filter;
    const matchClass = classFilter === 'All' || item.classLevel === classFilter;
    return matchSub && matchClass;
  });

  const completionPct = Math.round((completedIds.size / BACKLOG_CHAPTERS.length) * 100);

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
              {BACKLOG_CHAPTERS.length} Chapters • Manzil JEE Complete Archive
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-white tabular-nums">{completionPct}%</span>
            <span className="block text-[9px] uppercase tracking-widest text-zinc-500">Mastered</span>
          </div>
        </div>

        {/* Minimalist Progress Track */}
        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out" 
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Class Filters */}
      <div className="flex gap-2 font-mono text-xs">
        {(['All', 11, 12] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setClassFilter(lvl)}
            className={`px-3 py-1 rounded border transition-colors ${
              classFilter === lvl 
                ? 'bg-zinc-200 text-black font-semibold border-zinc-200' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {lvl === 'All' ? 'All Classes' : `Class ${lvl}`}
          </button>
        ))}
      </div>

      {/* Subject Filter Carousel */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Physics', 'Mathematics', 'Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'] as SubjectFilter[]).map((sub) => (
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

      {/* Direct Playlist Shortcut */}
      {filter !== 'All' && PLAYLIST_LINKS[filter] && (
        <a
          href={PLAYLIST_LINKS[filter]}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-600 transition-all group"
        >
          <span className="flex items-center gap-2">
            <Film className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            Open Full {filter} Playlist on YouTube
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
        </a>
      )}

      {/* Chapter Cards Feed */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isDone = completedIds.has(item.id);
          const isAdded = addedGoals.has(item.id);
          const activeVideoId = customVideoIds[item.id] || item.videoId;
          
          const targetUrl = activeVideoId
            ? `https://www.youtube.com/watch?v=${activeVideoId}`
            : `https://www.youtube.com/results?search_query=PW+Manzil+JEE+${encodeURIComponent(item.chapter)}`;

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

                {/* Left Thumbnail Box */}
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="relative w-28 h-20 shrink-0 rounded-md overflow-hidden border border-zinc-800 bg-zinc-900 group"
                  title={`Watch ${item.chapter}`}
                >
                  <YouTubeThumbnail 
                    videoId={activeVideoId} 
                    title={item.chapter} 
                    subject={item.subject} 
                    duration={item.duration}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                    <PlayCircle className="w-6 h-6 text-white/80 group-hover:text-white drop-shadow transition-transform group-hover:scale-110" />
                  </div>
                </a>

                {/* Chapter Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                      Class {item.classLevel}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      {item.subject}
                    </span>
                    {item.weightage === 'High' && (
                      <span className="text-[9px] font-mono text-white bg-zinc-800 px-1.5 py-0.5 rounded font-semibold">
                        HIGH YIELD
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-medium leading-snug line-clamp-2 ${isDone ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                    {item.chapter}
                  </h3>

                  {/* Duration Line Directly Below Title */}
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>~{item.duration} One-Shot</span>
                  </div>
                </div>
              </div>

              {/* URL Customizer Accordion */}
              {editingId === item.id ? (
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-900 font-mono text-xs">
                  <input
                    type="text"
                    placeholder="Paste YouTube link or Video ID"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveCustomUrl(item.id)}
                    className="px-2.5 py-1 bg-white text-black font-semibold rounded text-[11px]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 text-zinc-400 hover:text-white text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900/80 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    Watch <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>

                  {/* Quick-attach YouTube link if you ever want to link a specific video */}
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setInputUrl(activeVideoId ? `https://youtube.com/watch?v=${activeVideoId}` : '');
                    }}
                    className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-300 transition-colors text-[11px]"
                    title="Set Custom YouTube Link"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {activeVideoId ? "Edit link" : "Set link"}
                  </button>
                </div>

                {/* Direct Inject into Dexie Goals */}
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

    </div>
  );
};
