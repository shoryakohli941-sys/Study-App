import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ExternalLink, 
  Target, 
  Check, 
  Film, 
  CheckCircle2, 
  Circle, 
  PlayCircle 
} from 'lucide-react';
import { BACKLOG_CHAPTERS, PLAYLIST_LINKS, Chapter } from '../data/manzilPlaylists';
import { db } from '../db';

type SubjectFilter = 'All' | 'Physics' | 'Mathematics' | 'Physical Chemistry' | 'Organic Chemistry' | 'Inorganic Chemistry';

interface ThumbnailCardProps {
  videoId?: string;
  chapter: string;
  subject: string;
  duration: string;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ videoId, chapter, subject, duration }) => {
  const [imgFailed, setImgFailed] = useState(false);

  // If a valid 11-character videoId exists and hasn't errored out, try loading the thumbnail
  if (videoId && videoId.length === 11 && !imgFailed) {
    return (
      <div className="relative w-28 h-20 shrink-0 rounded bg-zinc-900 overflow-hidden border border-zinc-800">
        <img
          src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
          alt={chapter}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <PlayCircle className="w-5 h-5 text-white/90 drop-shadow" />
        </div>
      </div>
    );
  }

  // Guaranteed fallback card: Crisp monochrome visual block (no external network needed)
  const getSubjectCode = (sub: string) => {
    if (sub === 'Physics') return 'PHY';
    if (sub === 'Mathematics') return 'MTH';
    if (sub.includes('Organic')) return 'OC';
    if (sub.includes('Inorganic')) return 'IOC';
    return 'PC';
  };

  return (
    <div className="relative w-28 h-20 shrink-0 rounded bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 flex flex-col justify-between p-2 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400">
          {getSubjectCode(subject)}
        </span>
        <PlayCircle className="w-4 h-4 text-zinc-600" />
      </div>
      <div>
        <div className="text-[10px] font-bold text-zinc-200 line-clamp-1 leading-tight">
          {chapter}
        </div>
        <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
          {duration}
        </div>
      </div>
    </div>
  );
};

export const BacklogHub: React.FC = () => {
  const [filter, setFilter] = useState<SubjectFilter>('All');
  const [classFilter, setClassFilter] = useState<'All' | 11 | 12>('All');
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('orbit_completed_backlog');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [addedGoals, setAddedGoals] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('orbit_completed_backlog', JSON.stringify(Array.from(completedIds)));
  }, [completedIds]);

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
      }, 2000);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const filtered = BACKLOG_CHAPTERS.filter((item) => {
    const matchSub = filter === 'All' || item.subject === filter;
    const matchClass = classFilter === 'All' || item.classLevel === classFilter;
    return matchSub && matchClass;
  });

  const completionPct = Math.round((completedIds.size / (BACKLOG_CHAPTERS.length || 1)) * 100);

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

        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out" 
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Class Level Filters */}
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
          const targetUrl = item.videoId
            ? `https://www.youtube.com/watch?v=${item.videoId}`
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
                  title={`Watch ${item.chapter}`}
                  className="block shrink-0"
                >
                  <ThumbnailCard
                    videoId={item.videoId}
                    chapter={item.chapter}
                    subject={item.subject}
                    duration={item.duration}
                  />
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

                  {/* Duration Line */}
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>~{item.duration} One-Shot</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900/80 font-mono text-xs">
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                >
                  Watch <ExternalLink className="w-3 h-3 ml-0.5" />
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

    </div>
  );
};
