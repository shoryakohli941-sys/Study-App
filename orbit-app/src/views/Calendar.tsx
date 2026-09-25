import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { CalendarEvent, ScoreData } from '../db';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon } from 'lucide-react';

const CATEGORIES = ['Mock Test', 'Coaching / Class', 'School Holiday', 'Revision Target', 'General'] as const;

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Modal form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CalendarEvent['category']>('General');
  const [details, setDetails] = useState('');

  // Scorecard state
  const [showScorecard, setShowScorecard] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData>({
    physics: { plus: 0, minus: 0 },
    chemistry: { plus: 0, minus: 0 },
    mathematics: { plus: 0, minus: 0 }
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Start from Monday (adjusting JS Date where Sunday is 0)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const startOfMonthStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endOfMonthStr = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;

  const events = useLiveQuery(
    () => db.calendarEvents.where('date').between(startOfMonthStr, endOfMonthStr, true, true).toArray(),
    [startOfMonthStr, endOfMonthStr]
  ) || [];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleSaveEvent = async () => {
    if (!selectedDate || !title) return;

    await db.calendarEvents.add({
      date: selectedDate,
      title,
      category,
      details,
      scoreData: category === 'Mock Test' && showScorecard ? scoreData : undefined,
      createdAt: Date.now()
    });

    // Reset
    setTitle('');
    setCategory('General');
    setDetails('');
    setShowScorecard(false);
    setScoreData({
      physics: { plus: 0, minus: 0 },
      chemistry: { plus: 0, minus: 0 },
      mathematics: { plus: 0, minus: 0 }
    });
    setShowEventModal(false);
  };

  const handleDeleteEvent = async (id: number) => {
    await db.calendarEvents.delete(id);
  };

  const calculateNetScore = (scores: ScoreData) => {
    const p = scores.physics.plus - scores.physics.minus;
    const c = scores.chemistry.plus - scores.chemistry.minus;
    const m = scores.mathematics.plus - scores.mathematics.minus;
    return p + c + m;
  };

  // Render Days
  const days = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 border border-zinc-900 bg-zinc-950/50"></div>);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    const isToday = dateStr === todayStr;
    const isSelected = selectedDate === dateStr;

    days.push(
      <div
        key={`day-${i}`}
        onClick={() => handleDayClick(i)}
        className={`h-24 border p-1 cursor-pointer transition-colors overflow-hidden flex flex-col gap-1
          ${isToday ? 'border-white bg-zinc-900' : 'border-zinc-900 hover:bg-zinc-900'}
          ${isSelected && !isToday ? 'border-zinc-600 bg-zinc-900' : ''}
        `}
      >
        <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-zinc-500'} px-1`}>{i}</span>
        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1">
          {dayEvents.map(e => (
            <div key={e.id} className="text-[9px] bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded truncate font-medium">
              [{e.category.split(' ')[0]}] {e.title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const selectedDateEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {monthString}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 border border-zinc-800 rounded-md hover:bg-zinc-900">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={handleNextMonth} className="p-2 border border-zinc-800 rounded-md hover:bg-zinc-900">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden flex-1 flex flex-col">
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 content-start">
          {days}
        </div>
      </div>

      {/* Selected Day View */}
      {selectedDate && (
        <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">Events for {selectedDate}</h3>
            <button
              onClick={() => setShowEventModal(true)}
              className="bg-white text-black px-3 py-1.5 rounded-md text-xs font-bold tracking-wide uppercase flex items-center gap-1 hover:bg-zinc-200"
            >
              <Plus className="w-3 h-3" /> Add Event
            </button>
          </div>

          <div className="space-y-2">
            {selectedDateEvents.length === 0 ? (
              <p className="text-zinc-500 text-sm">No events scheduled.</p>
            ) : (
              selectedDateEvents.map(e => (
                <div key={e.id} className="bg-black border border-zinc-800 p-3 rounded-md flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] bg-zinc-800 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        {e.category}
                      </span>
                      <span className="font-semibold text-white text-sm">{e.title}</span>
                    </div>
                    {e.details && <p className="text-zinc-400 text-xs mt-1">{e.details}</p>}
                    {e.scoreData && (
                      <div className="mt-2 text-xs bg-zinc-900 border border-zinc-800 rounded p-2 inline-block">
                        <span className="font-bold text-white">Net Score: {calculateNetScore(e.scoreData)}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(e.id!)}
                    className="text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button
              onClick={() => setShowEventModal(false)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Add Event for {selectedDate}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g. Full Syllabus Mock 1"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white transition-colors appearance-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Details</label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white transition-colors min-h-[80px]"
                  placeholder="Syllabus covered, notes, etc."
                />
              </div>

              {category === 'Mock Test' && (
                <div className="border border-zinc-800 rounded-lg p-4 bg-black">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">Log Score Card</label>
                    <input
                      type="checkbox"
                      checked={showScorecard}
                      onChange={e => setShowScorecard(e.target.checked)}
                      className="accent-white"
                    />
                  </div>

                  {showScorecard && (
                    <div className="space-y-3">
                      {['physics', 'chemistry', 'mathematics'].map((sub) => (
                        <div key={sub} className="flex items-center gap-2">
                          <span className="w-20 text-xs font-medium text-zinc-400 capitalize">{sub}</span>
                          <input
                            type="number"
                            placeholder="+ Marks"
                            value={(scoreData as any)[sub].plus || ''}
                            onChange={e => setScoreData(prev => ({ ...prev, [sub]: { ...prev[sub as keyof ScoreData], plus: Number(e.target.value) } }))}
                            className="w-20 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white text-xs"
                          />
                          <input
                            type="number"
                            placeholder="- Marks"
                            value={(scoreData as any)[sub].minus || ''}
                            onChange={e => setScoreData(prev => ({ ...prev, [sub]: { ...prev[sub as keyof ScoreData], minus: Number(e.target.value) } }))}
                            className="w-20 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSaveEvent}
                disabled={!title}
                className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-4"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
