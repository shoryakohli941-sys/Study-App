import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { MANZIL_PLAYLISTS } from '../data/manzilPlaylists';
import type { ManzilPlaylist } from '../data/manzilPlaylists';
import { PlayCircle, CheckCircle2, Circle, ExternalLink, Plus, X } from 'lucide-react';

export const BacklogHub: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSubject, setAddSubject] = useState<string>('Physics');
  const [addChapter, setAddChapter] = useState<string>('');
  const [addUrl, setAddUrl] = useState<string>('');

  // Load lecture progress and custom lectures from Dexie
  const progressLogs = useLiveQuery(() => db.lectureProgress.toArray()) || [];
  const customLectures = useLiveQuery(() => db.customLectures.toArray()) || [];

  const toggleLecture = async (lectureId: string, subject: string) => {
    const existing = progressLogs.find(p => p.videoId === lectureId);
    if (existing) {
      await db.lectureProgress.update(existing.id!, {
        completed: !existing.completed,
        updatedAt: Date.now()
      });
    } else {
      await db.lectureProgress.add({
        videoId: lectureId,
        completed: true,
        subject: subject,
        updatedAt: Date.now()
      });
    }
  };

  const getProgressForPlaylist = (playlist: ManzilPlaylist) => {
    const customForSubject = customLectures.filter(c => c.subject === playlist.subject);
    const total = playlist.lectures.length + customForSubject.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };

    let completed = 0;
    playlist.lectures.forEach(l => {
      const log = progressLogs.find(p => p.videoId === l.id);
      if (log && log.completed) completed++;
    });
    customForSubject.forEach(c => {
       const log = progressLogs.find(p => p.videoId === `custom_${c.id}`);
       if (log && log.completed) completed++;
    });

    return { completed, total, percent: Math.round((completed / total) * 100) };
  };

  // Filter the playlists to show
  const displayPlaylists = activeFilter === 'All'
    ? MANZIL_PLAYLISTS
    : MANZIL_PLAYLISTS.filter(p => p.subject === activeFilter);

  const handleAddCustomLecture = async () => {
    if (!addChapter.trim() || !addUrl.trim()) return;

    const match = addUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : '';

    if (!videoId) {
      alert('Invalid YouTube URL or Video ID');
      return;
    }

    await db.customLectures.add({
      subject: addSubject,
      chapter: addChapter.trim(),
      videoId,
      createdAt: Date.now()
    });

    setAddChapter('');
    setAddUrl('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div className="flex flex-col gap-2 relative">
        <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Manzil Backlog Hub</h2>
        <p className="text-zinc-400 text-sm tracking-wide">Track your one-shot lectures directly from the official PW Manzil series.</p>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="absolute top-0 right-0 bg-white text-black text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform"
        >
          <Plus className="w-3.5 h-3.5" /> Add Lecture
        </button>
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
          const customForSubject = customLectures.filter(c => c.subject === playlist.subject);

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
                  Open Official Playlist (30+ Lectures) <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Lecture Cards */}
              <div className="divide-y divide-zinc-900 bg-black">
                {playlist.lectures.map((lecture, index) => {
                  const log = progressLogs.find(p => p.videoId === lecture.id);
                  const isCompleted = log ? log.completed : false;

                  return (
                    <div key={lecture.id} className={`p-4 flex gap-4 transition-colors ${isCompleted ? 'bg-zinc-950/50' : 'hover:bg-zinc-950'}`}>
                      {/* Thumbnail Placeholder / Image with Fallback */}
                      <div className="relative w-28 h-16 bg-zinc-900 border border-zinc-800 rounded-md shrink-0 flex items-center justify-center overflow-hidden group">
                         {lecture.videoId ? (
                            <img
                              src={`https://img.youtube.com/vi/${lecture.videoId}/hqdefault.jpg`}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              alt={lecture.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                             <PlayCircle className="w-5 h-5 text-zinc-600 mb-1" />
                             <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">{playlist.subject.slice(0,4)} L{index+1}</span>
                           </div>
                         )}
                        <span className="text-zinc-700 font-black text-2xl opacity-20 absolute -right-1 -bottom-2 pointer-events-none">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <h4 className={`font-semibold text-sm leading-tight transition-colors ${isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>
                          {lecture.title}
                        </h4>

                        <div className="flex items-center justify-between mt-2">
                          <a
                            href={lecture.videoId ? `https://youtu.be/${lecture.videoId}` : playlist.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-400 hover:text-white font-bold uppercase tracking-wider flex items-center gap-1"
                          >
                            Watch <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          <button
                            onClick={() => toggleLecture(lecture.id, playlist.subject)}
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

                {/* Custom Lectures */}
                {customForSubject.map((custom, index) => {
                  const logId = `custom_${custom.id}`;
                  const log = progressLogs.find(p => p.videoId === logId);
                  const isCompleted = log ? log.completed : false;

                  return (
                    <div key={`custom-${custom.id}`} className={`p-4 flex gap-4 transition-colors ${isCompleted ? 'bg-zinc-950/50' : 'hover:bg-zinc-950'}`}>
                      <div className="relative w-28 h-16 bg-zinc-900 border border-zinc-800 rounded-md shrink-0 flex items-center justify-center overflow-hidden group">
                        <img
                          src={`https://img.youtube.com/vi/${custom.videoId}/hqdefault.jpg`}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          alt={custom.chapter}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="text-zinc-700 font-black text-2xl opacity-20 absolute -right-1 -bottom-2 pointer-events-none">
                          C{String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Custom Entry</span>
                           <h4 className={`font-semibold text-sm leading-tight transition-colors ${isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>
                             {custom.chapter}
                           </h4>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <a
                            href={`https://youtu.be/${custom.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-400 hover:text-white font-bold uppercase tracking-wider flex items-center gap-1"
                          >
                            Watch <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          <button
                            onClick={() => toggleLecture(logId, playlist.subject)}
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

      {/* Add Custom Lecture Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="text-white font-bold tracking-tight">Add Custom Lecture</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Subject</label>
                <select
                  value={addSubject}
                  onChange={(e) => setAddSubject(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-zinc-500"
                >
                  {MANZIL_PLAYLISTS.map(p => (
                    <option key={p.subject} value={p.subject}>{p.subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Chapter Name</label>
                <input
                  type="text"
                  value={addChapter}
                  onChange={(e) => setAddChapter(e.target.value)}
                  placeholder="e.g. Thermodynamics 02"
                  className="w-full bg-black border border-zinc-800 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">YouTube URL or Video ID</label>
                <input
                  type="text"
                  value={addUrl}
                  onChange={(e) => setAddUrl(e.target.value)}
                  placeholder="e.g. https://youtu.be/dQw4w9WgXcQ"
                  className="w-full bg-black border border-zinc-800 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2 rounded-md font-bold text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomLecture}
                disabled={!addChapter.trim() || !addUrl.trim()}
                className="flex-1 py-2 rounded-md font-bold text-xs uppercase tracking-wider bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
