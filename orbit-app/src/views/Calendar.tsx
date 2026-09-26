import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { CalendarEvent, ScoreData } from '../db';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Clock, Edit2, List, Grid } from 'lucide-react';

const CATEGORIES = ['Mock Test', 'Study Block / Revision', 'Coaching Class', 'School / Holiday', 'Goal / Milestone', 'General'] as const;

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modals & Navigation
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);

  // Selection
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CalendarEvent['category']>('General');
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [details, setDetails] = useState('');

  // Scorecard State
  const [showScorecard, setShowScorecard] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData>({
    physics: { plus: 0, minus: 0 },
    chemistry: { plus: 0, minus: 0 },
    mathematics: { plus: 0, minus: 0 }
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const monthString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch broader range of events for Agenda view (e.g. current year to next year)
  const startOfYearStr = `${year}-01-01`;
  const endOfNextYearStr = `${year + 1}-12-31`;

  const allEvents = useLiveQuery(
    () => db.calendarEvents.where('date').between(startOfYearStr, endOfNextYearStr, true, true).toArray(),
    [startOfYearStr, endOfNextYearStr]
  ) || [];

  // Filter events just for current month for the grid rendering efficiency
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthEvents = allEvents.filter(e => e.date.startsWith(currentMonthPrefix));

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const jumpToDate = (y: number, m: number) => {
    setCurrentDate(new Date(y, m, 1));
    setShowMonthSelector(false);
  };

  const openAddEvent = (dateStr: string) => {
    setSelectedDate(dateStr);
    setTitle('');
    setCategory('General');
    setIsAllDay(true);
    setStartTime('09:00');
    setEndTime('10:00');
    setDetails('');
    setShowScorecard(false);
    setScoreData({
      physics: { plus: 0, minus: 0 },
      chemistry: { plus: 0, minus: 0 },
      mathematics: { plus: 0, minus: 0 }
    });
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setSelectedDate(event.date);
    setTitle(event.title);
    setCategory(event.category);
    setIsAllDay(event.isAllDay);
    setStartTime(event.startTime || '09:00');
    setEndTime(event.endTime || '10:00');
    setDetails(event.details || '');
    if (event.scoreData) {
      setShowScorecard(true);
      setScoreData(event.scoreData);
    } else {
      setShowScorecard(false);
    }
    setSelectedEvent(event);
    setShowEventDetailsModal(false);
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!selectedDate || !title) return;

    const eventPayload: CalendarEvent = {
      date: selectedDate,
      title,
      category,
      isAllDay,
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      details,
      scoreData: category === 'Mock Test' && showScorecard ? scoreData : undefined,
      createdAt: selectedEvent ? selectedEvent.createdAt : Date.now()
    };

    if (selectedEvent?.id) {
      await db.calendarEvents.update(selectedEvent.id, eventPayload);
    } else {
      await db.calendarEvents.add(eventPayload);
    }

    setShowEventModal(false);
  };

  const handleDeleteEvent = async (id: number) => {
    await db.calendarEvents.delete(id);
    setShowEventDetailsModal(false);
  };

  const calculateNetScore = (scores: ScoreData) => {
    const p = scores.physics.plus - scores.physics.minus;
    const c = scores.chemistry.plus - scores.chemistry.minus;
    const m = scores.mathematics.plus - scores.mathematics.minus;
    return p + c + m;
  };

  const calculateAccuracy = (scores: ScoreData) => {
    const totalAttempted =
      (scores.physics.plus / 4) + scores.physics.minus +
      (scores.chemistry.plus / 4) + scores.chemistry.minus +
      (scores.mathematics.plus / 4) + scores.mathematics.minus;

    if (totalAttempted === 0) return 0;

    const correctAttempts = (scores.physics.plus / 4) + (scores.chemistry.plus / 4) + (scores.mathematics.plus / 4);
    return Math.round((correctAttempts / totalAttempted) * 100);
  };

  const formatTimeStr = (timeStr?: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const getCategoryColor = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'Mock Test': return 'border-white text-black bg-white';
      case 'Goal / Milestone': return 'border-zinc-300 text-zinc-300 bg-zinc-900/50';
      case 'School / Holiday': return 'border-zinc-700 text-zinc-500 bg-transparent';
      case 'Study Block / Revision': return 'border-zinc-500 text-white bg-zinc-800';
      default: return 'border-zinc-700 text-zinc-300 bg-zinc-900';
    }
  };

  // Milestone logic (Placeholder for user setting, currently fixed logic for demo)
  const daysToJee = useMemo(() => {
    const target = new Date('2027-01-24');
    const diffTime = Math.abs(target.getTime() - currentDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [currentDate]);

  // Calendar Grid Cells
  const calendarCells = [];

  // Previous month trailing days
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    calendarCells.push(
      <div key={`prev-${d}`} className="h-28 border border-zinc-900 bg-zinc-950 opacity-40 p-1 flex flex-col pointer-events-none">
        <span className="text-xs font-medium text-zinc-600 px-1">{d}</span>
      </div>
    );
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayEvents = monthEvents.filter(e => e.date === dateStr).sort((a, b) => {
      if (a.isAllDay) return -1;
      if (b.isAllDay) return 1;
      return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
    });

    const isToday = dateStr === todayStr;

    calendarCells.push(
      <div
        key={`curr-${i}`}
        onClick={() => openAddEvent(dateStr)}
        className={`h-28 border p-1 cursor-pointer transition-colors overflow-hidden flex flex-col gap-1 active:bg-zinc-800
          ${isToday ? 'border-zinc-600 bg-zinc-950/80' : 'border-zinc-900 hover:bg-zinc-900 bg-black'}
        `}
      >
        <div className="flex justify-between items-center px-1">
          <span className={`flex items-center justify-center text-xs font-bold w-6 h-6 rounded-full ${
            isToday ? 'bg-white text-black' : 'text-zinc-400'
          }`}>
            {i}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1">
          {dayEvents.slice(0, 3).map(e => (
            <div
              key={e.id}
              onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(e); setShowEventDetailsModal(true); }}
              className={`text-[9px] px-1.5 py-0.5 rounded truncate font-medium border ${getCategoryColor(e.category)}`}
            >
              {!e.isAllDay && <span className="mr-1 opacity-75">{formatTimeStr(e.startTime)}</span>}
              {e.title}
            </div>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-[9px] text-zinc-500 font-bold px-1.5">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  }

  // Next month leading days to complete grid
  const totalCells = calendarCells.length;
  const remainingCells = 42 - totalCells; // Always 6 rows
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push(
      <div key={`next-${i}`} className="h-28 border border-zinc-900 bg-zinc-950 opacity-40 p-1 flex flex-col pointer-events-none">
        <span className="text-xs font-medium text-zinc-600 px-1">{i}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Milestone Banner */}
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex items-center justify-between shadow-md">
        <span className="text-white text-sm font-bold uppercase tracking-wider">JEE Main Session 1</span>
        <span className="text-white font-mono bg-black px-3 py-1 rounded border border-zinc-700">
          {daysToJee} Days Left
        </span>
      </div>

      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMonthSelector(true)}
            className="text-xl font-bold tracking-tight text-white hover:text-zinc-300 transition-colors flex items-center gap-2"
          >
            {monthString}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 rounded-md p-0.5 border border-zinc-800">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'month' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'agenda' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button onClick={handleToday} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-zinc-800 rounded-md hover:bg-zinc-900 text-white">
            Today
          </button>
          <button onClick={handlePrevMonth} className="p-1.5 border border-zinc-800 rounded-md hover:bg-zinc-900 min-w-[36px] min-h-[36px] flex items-center justify-center text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNextMonth} className="p-1.5 border border-zinc-800 rounded-md hover:bg-zinc-900 min-w-[36px] min-h-[36px] flex items-center justify-center text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Views */}
      {viewMode === 'month' ? (
        <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1 content-start">
            {calendarCells}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6 pb-6">
          {allEvents.filter(e => e.date >= todayStr).sort((a,b) => a.date.localeCompare(b.date)).length === 0 && (
            <div className="text-center py-20 text-zinc-500">No upcoming events scheduled.</div>
          )}
          {Object.entries(
            allEvents
              .filter(e => e.date >= todayStr)
              .sort((a,b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
              .reduce((acc, event) => {
                if (!acc[event.date]) acc[event.date] = [];
                acc[event.date].push(event);
                return acc;
              }, {} as Record<string, CalendarEvent[]>)
          ).map(([date, dayEvents]) => (
            <div key={date} className="flex gap-4">
              <div className="w-16 flex flex-col items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase">{new Date(date).toLocaleString('en-us', { weekday: 'short'})}</span>
                <span className={`text-xl font-bold ${date === todayStr ? 'bg-white text-black w-8 h-8 rounded-full flex items-center justify-center' : 'text-white'}`}>
                  {date.split('-')[2]}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                {dayEvents.map(e => (
                  <div
                    key={e.id}
                    onClick={() => { setSelectedEvent(e); setShowEventDetailsModal(true); }}
                    className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-white">{e.title}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded">
                        {e.category}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1">
                      {e.isAllDay ? 'All Day' : `${formatTimeStr(e.startTime)} - ${formatTimeStr(e.endTime)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-sm overflow-hidden relative shadow-2xl">
            <div className="flex justify-end p-2 border-b border-zinc-800 gap-2">
              <button onClick={() => openEditEvent(selectedEvent)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDeleteEvent(selectedEvent.id!)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedEvent.title}</h2>
              <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
                <CalendarIcon className="w-4 h-4" /> {selectedEvent.date}
                {!selectedEvent.isAllDay && <><Clock className="w-4 h-4 ml-2" /> {formatTimeStr(selectedEvent.startTime)} - {formatTimeStr(selectedEvent.endTime)}</>}
              </div>

              <div className="space-y-4">
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${getCategoryColor(selectedEvent.category)}`}>
                    {selectedEvent.category}
                  </span>
                </div>

                {selectedEvent.details && (
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedEvent.details}</p>
                )}

                {selectedEvent.scoreData && (
                  <div className="mt-4 p-4 border border-zinc-800 rounded-lg bg-black">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Score Card</h4>
                    <div className="space-y-2 mb-4">
                      {['physics', 'chemistry', 'mathematics'].map(sub => (
                        <div key={sub} className="flex justify-between text-sm">
                          <span className="text-zinc-400 capitalize">{sub}</span>
                          <span className="text-white font-mono">
                            <span className="text-zinc-500">+</span>{((selectedEvent.scoreData as any)[sub].plus)}
                            <span className="text-zinc-500 ml-2">-</span>{((selectedEvent.scoreData as any)[sub].minus)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Net Score</span>
                        <span className="text-lg font-bold text-white font-mono">{calculateNetScore(selectedEvent.scoreData)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Accuracy</span>
                        <span className="text-lg font-bold text-white font-mono">{calculateAccuracy(selectedEvent.scoreData)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button
              onClick={() => setShowEventModal(false)}
              className="absolute top-4 right-4 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight">
              {selectedEvent ? 'Edit Event' : 'Add Event'}
            </h2>

            <div className="space-y-5">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-black border-b-2 border-zinc-800 px-0 py-2 text-xl text-white font-bold focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600"
                  placeholder="Event Title"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={selectedDate || ''}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-md px-3 py-3 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-black border border-zinc-800 rounded-md px-3 py-3 text-white focus:outline-none focus:border-white appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-black border border-zinc-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">All-day</label>
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={e => setIsAllDay(e.target.checked)}
                    className="accent-white w-5 h-5"
                  />
                </div>

                {!isAllDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1 uppercase">Start</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1 uppercase">End</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-2 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-md px-3 py-3 text-white focus:outline-none focus:border-white min-h-[80px]"
                  placeholder="Add syllabus notes or details..."
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
                      className="accent-white w-5 h-5"
                    />
                  </div>

                  {showScorecard && (
                    <div className="space-y-4">
                      {['physics', 'chemistry', 'mathematics'].map((sub) => (
                        <div key={sub} className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{sub}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="+ Marks"
                              value={(scoreData as any)[sub].plus || ''}
                              onChange={e => setScoreData(prev => ({ ...prev, [sub]: { ...prev[sub as keyof ScoreData], plus: Number(e.target.value) } }))}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white placeholder:text-zinc-600"
                            />
                            <input
                              type="number"
                              placeholder="- Marks"
                              value={(scoreData as any)[sub].minus || ''}
                              onChange={e => setScoreData(prev => ({ ...prev, [sub]: { ...prev[sub as keyof ScoreData], minus: Number(e.target.value) } }))}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white placeholder:text-zinc-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSaveEvent}
                disabled={!title}
                className="w-full bg-white text-black font-bold uppercase tracking-widest min-h-[44px] rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-4"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Month/Year Selector Modal */}
      {showMonthSelector && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 max-w-sm w-full relative shadow-2xl">
            <button onClick={() => setShowMonthSelector(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Jump to Date</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[2024, 2025, 2026, 2027, 2028].map(y => (
                <button
                  key={y}
                  onClick={() => jumpToDate(y, month)}
                  className={`py-2 rounded font-bold text-sm border transition-colors ${year === y ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  {y}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                <button
                  key={m}
                  onClick={() => jumpToDate(year, i)}
                  className={`py-2 rounded font-bold text-sm border transition-colors ${month === i ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
