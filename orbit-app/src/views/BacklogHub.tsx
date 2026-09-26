import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { MANZIL_PLAYLISTS } from '../data/manzilPlaylists';
import type { ManzilLecture, ManzilPlaylist } from '../data/manzilPlaylists';
import { PlayCircle, CheckCircle2, Circle, ExternalLink } from 'lucide-react';

export const BacklogHub: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Load lecture progress from Dexie
  const progressLogs = useLiveQuery(() => db.lectureProgress.toArray()) || [];

  const toggleLecture = async (lecture: ManzilLecture) => {
    const existing = progressLogs.find(p => p.videoId === lecture.id);
    if (existing) {
      await db.lectureProgress.update(existing.id!, {
        completed: !existing.completed,
        updatedAt: Date.now()
      });
    } else {
      await db.lectureProgress.add({
        videoId: lecture.id,
        completed: true,
        subject: lecture.subject,
        updatedAt: Date.now()
      });
    }
  };

  const getProgressForPlaylist = (playlist: ManzilPlaylist) => {
    const total = playlist.lectures.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };

    let completed = 0;
    playlist.lectures.forEach(l => {
      const log = progressLogs.find(p => p.videoId === l.id);
      if (log && log.completed) completed++;
    });

    return { completed, total, percent: Math.round((completed / total) * 100) };
  };

  // Filter the playlists to show
  const displayPlaylists = activeFilter === 'All'
    ? MANZIL_PLAYLISTS
    : MANZIL_PLAYLISTS.filter(p => p.subject === activeFilter);

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Manzil Backlog Hub</h2>
        <p className="text-zinc-400 text-sm tracking-wide">Track your one-shot lectures directly from the official PW Manzil series.</p>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4 snap-x">
        {['All', ...MANZIL_PLAYLISTS.map(p => p.subject)].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${
              activeFilter === filter
                ? 'bg-white text-black border-white'
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-900'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {displayPlaylists.map(playlist => {
          const stats = getProgressForPlaylist(playlist);

          return (
            <div key={playlist.id} className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
              {/* Subject Header & Progress */}
              <div className="p-5 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-lg text-white uppercase tracking-tight">{playlist.subject} Backlog</h3>
                  <span className="text-xs font-bold font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded">
                    {stats.completed}/{stats.total} • {stats.percent}%
                  </span>
                </div>

                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-white transition-all duration-500 ease-out"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>

                <a
                  href={playlist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-md text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  <PlayCircle className="w-4 h-4" />
                  Open Full Playlist <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Lecture Cards */}
              <div className="divide-y divide-zinc-900 bg-black">
                {playlist.lectures.map((lecture, index) => {
                  const log = progressLogs.find(p => p.videoId === lecture.id);
                  const isCompleted = log ? log.completed : false;

                  // In a real app we'd use genuine YouTube thumbnails, e.g.:
                  // const thumbnailUrl = `https://img.youtube.com/vi/${lecture.id}/hqdefault.jpg`;
                  // But since we are using dummy IDs like 'P1', we'll use a placeholder styling block.

                  return (
                    <div key={lecture.id} className={`p-4 flex gap-4 transition-colors ${isCompleted ? 'bg-zinc-950/50' : 'hover:bg-zinc-950'}`}>
                      {/* Thumbnail Placeholder */}
                      <div className="relative w-28 h-16 bg-zinc-900 border border-zinc-800 rounded-md shrink-0 flex items-center justify-center overflow-hidden">
                        <span className="text-zinc-700 font-black text-2xl opacity-20 absolute -right-2 -bottom-2">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <PlayCircle className="w-6 h-6 text-zinc-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <h4 className={`font-semibold text-sm leading-tight transition-colors ${isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>
                          {lecture.title}
                        </h4>

                        <div className="flex items-center justify-between mt-2">
                          <a
                            href={playlist.url} // Redirecting to playlist since IDs are dummies, otherwise `https://youtu.be/${lecture.id}`
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-400 hover:text-white font-bold uppercase tracking-wider flex items-center gap-1"
                          >
                            Watch <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          <button
                            onClick={() => toggleLecture(lecture)}
                            className="flex items-center justify-center min-w-[44px] min-h-[44px] -m-2"
                            aria-label="Toggle completion"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : (
                              <Circle className="w-6 h-6 text-zinc-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
