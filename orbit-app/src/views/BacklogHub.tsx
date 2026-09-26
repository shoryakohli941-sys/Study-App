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
  Search,
  Sparkles
} from 'lucide-react';
import { BACKLOG_CHAPTERS, PLAYLIST_LINKS, Chapter } from '../data/manzilPlaylists';
import { db } from '../db';

type SubjectFilter = 'All' | 'Physics' | 'Mathematics' | 'Physical Chemistry' | 'Organic Chemistry' | 'Inorganic Chemistry';

const ChapterThumbnail: React.FC<{ 
  videoId?: string; 
  title: string; 
  subject: string; 
  duration: string;
}> = ({ videoId, title, subject, duration }) => {
  const [loadError, setLoadError] = useState(false);

  // If a valid YouTube video ID exists, load the official high-res image
  if (videoId && videoId.length === 11 && !loadError) {
    return (
      <div className="relative w-28 h-20 shrink-0 rounded-md overflow-hidden bg-zinc-900 border border-zinc-800">
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={() => setLoadError(true)}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
          <PlayCircle className="w-5 h-5 text-white/90 drop-shadow" />
        </div>
      </div>
    );
  }

  // Guaranteed fallback card: Crisp OLED studio card
  const getSubjectCode = (sub: string) => {
    if (sub === 'Physics') return 'PHY';
    if (sub === 'Mathematics') return 'MATH';
    if (sub.includes('Organic')) return 'OC';
    if (sub.includes('Inorganic')) return 'IOC';
    return 'PC';
  };

  return (
    <div className="relative w-28 h-20 shrink-0 rounded-md bg-zinc-900 border border-zinc-800 flex flex-col justify-between p-2 select-none group-hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-300">
          {getSubjectCode(subject)}
        </span>
        <PlayCircle className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
      </div>
      <div>
        <div className="text-[10px] font-bold text-zinc-100 line-clamp-1 leading-tight">
          PW MANZIL
        </div>
        <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
          {duration}
        </div>
      </div>
    </div>
  );
};

export const BacklogHub: React.FC = () => {
  const [filter, setFilter] = useState<SubjectFilter>('All');
  const [classFilter, setClassFilter] = useState<'All' | 11 | 12>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('orbit_completed_backlog');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [addedGoals, setAddedGoals] = useState<Set<string>>(new Set());
  const [lastAddedTitle, setLastAddedTitle] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('orbit_completed_backlog', JSON.stringify(Array.from(completedIds)));
  }, [completedIds]);

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // One-tap injection into Dexie Planner targets
  const handleAddToDailyGoals = async (ch: Chapter, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      const today = new Date().toISOString().split('T')[0];
      const subjectGroup: 'Physics' | 'Chemistry' | 'Mathematics' = 
        ch.subject.includes('Chemistry') ? 'Chemistry' : (ch.subject as 'Physics' | 'Mathematics');

      const taskPayload = {
        date: today,
        title: `Manzil: ${ch.chapter}`,
        subject: subjectGroup,
        completed: false,
        priority: (ch.weightage === 'High' ? 'high' : 'medium') as 'high' | 'medium' | 'low',
        createdAt: Date.now()
      };

      // Safe write: handles both db.plannerTasks or fallback db.tasks table
      if ((db as any).plannerTasks) {
        await (db as any).plannerTasks.add(taskPayload);
      } else if ((db as any).tasks) {
        await (db as any).tasks.add(taskPayload);
      }

      setAddedGoals((prev) => new Set(prev).add(ch.id));
      setLastAddedTitle(ch.chapter);

      setTimeout(() => {
        setAddedGoals((prev) => {
          const next = new Set(prev);
          next.delete(ch.id);
          return next;
        });
      }, 3000);

      setTimeout(() => {
        setLastAddedTitle(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to add goal:', err);
    }
  };

  const filtered = BACKLOG_CHAPTERS.filter((item) => {
    const matchSub = filter === 'All' || item.subject === filter;
    const matchClass = classFilter === 'All' || item.classLevel === classFilter;
    const matchSearch = searchQuery.trim() === '' || 
      item.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSub && matchClass && matchSearch;
  });

  const completionPct = Math.round((completedIds.size / BACKLOG_CHAPTERS.length) * 100);

  return (
    <div className="min-h-screen bg-black text-white pb-32 pt-4 px-4 max-w-xl mx-auto space-y-4">
      
      {/* Station HUD */}
      <div className="border border-zinc-800 bg-zinc-950 p-4 rounded-xl space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              Backlog Mission Control
            </h1>
            <p className="text-[11px] text-zinc-500">
              {BACKLOG_CHAPTERS.length} Lectures • PW Manzil Archive
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

      {/* Floating Confirmation Toast */}
      {lastAddedTitle && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2 rounded-full shadow-2xl font-mono text-xs flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Added to Today's Goals: <strong>{lastAddedTitle}</strong></span>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search chapter or topic (e.g. Rotational, GOC, Integration)..."
          className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
        />
      </div>

      {/* Class Level Filter Pills */}
      <div className="flex gap-2 font-mono text-xs">
        {(['All', 11, 12] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setClassFilter(lvl)}
            className={`px-3 py-1 rounded border transition-colors ${
              classFilter === lvl 
                ? 'bg-white text-black font-semibold border-white' 
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
                ? 'bg-zinc-200 text-black font-bold border-zinc-200'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Direct YouTube Playlist Launcher */}
      {filter !== 'All' && PLAYLIST_LINKS[filter] && (
        <a
          href={PLAYLIST_LINKS[filter]}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-600 transition-all group"
        >
          <span className="flex items-center gap-2">
            <Film className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            Open Full {filter} Manzil Playlist on YouTube
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
        </a>
      )}

      {/* Interactive Chapter Cards Feed */}
      <div className="space-y-2.5">
        {filtered.map((item) => {
          const isDone = completedIds.has(item.id);
          const isAdded = addedGoals.has(item.id);
          const targetUrl = item.videoId
            ? `https://www.youtube.com/watch?v=${item.videoId}`
            : `https://www.youtube.com/results?search_query=PW+Manzil+JEE+${encodeURIComponent(item.chapter)}`;

          return (
            <div
              key={item.id}
              onClick={() => handleAddToDailyGoals(item)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between gap-2.5 ${
                isDone 
                  ? 'bg-zinc-950/40 border-zinc-900 opacity-60' 
                  : isAdded
                  ? 'bg-zinc-900 border-white/50'
                  : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-600 hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={(e) => toggleComplete(item.id, e)}
                  className="mt-1 text-zinc-500 hover:text-white transition-colors shrink-0"
                  aria-label="Toggle Complete"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                  )}
                </button>

                {/* Left Visual Thumbnail */}
                <div className="shrink-0">
                  <ChapterThumbnail
                    videoId={item.videoId}
                    title={item.chapter}
                    subject={item.subject}
                    duration={item.duration}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                      Class {item.classLevel}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                      {item.subject}
                    </span>
                    {item.weightage === 'High' && (
                      <span className="text-[9px] font-mono text-white bg-zinc-800 px-1.5 py-0.5 rounded font-semibold">
                        HIGH YIELD
                      </span>
                    )}
                  </div>

                  <h3 className={`text-xs font-semibold leading-snug line-clamp-2 ${isDone ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                    {item.chapter}
                  </h3>

                  {/* Runtime */}
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-zinc-400">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>~{item.duration} One-Shot</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900 font-mono text-xs">
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                >
                  Watch Lecture <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>

                <button
                  onClick={(e) => handleAddToDailyGoals(item, e)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all border ${
                    isAdded
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3 h-3 text-black" /> In Daily Goals
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
