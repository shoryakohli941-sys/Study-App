import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { PlannerTask } from '../db';
import { Camera, Play, CheckCircle2, Zap, Calendar as CalendarIcon, CheckSquare, ListTodo, Plus, ChevronRight, Video } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import type { TabType } from '../components/Layout';
import { MANZIL_PLAYLISTS } from '../data/manzilPlaylists';

export const Home: React.FC<{ onNavigate: (tab: TabType) => void }> = ({ onNavigate }) => {
  const { toggleTimer, isTimerRunning, completedSessions } = useTimer();

  // Date Helpers
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  // Live Queries
  const userSettings = useLiveQuery(() => db.userSettings.toArray());
  const settings = userSettings?.[0] || { targetExamName: 'JEE MAIN SESSION 1', targetExamDate: '2027-01-24T00:00:00Z' };

  const dueMistakes = useLiveQuery(
    () => db.mistakes.where('nextReviewDate').belowOrEqual(Date.now()).toArray(),
    []
  );

  const todayEvents = useLiveQuery(
    () => db.calendarEvents.where('date').equals(todayStr).toArray(),
    [todayStr]
  );

  const todayTasks = useLiveQuery(
    () => db.plannerTasks.where('date').equals(todayStr).toArray(),
    [todayStr]
  );

  const allMistakes = useLiveQuery(() => db.mistakes.toArray());
  const allLectureProgress = useLiveQuery(() => db.lectureProgress.toArray());

  // Techy Live Ticking Countdown HUD State
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const targetDateStr = settings.targetExamDate.includes('T') ? settings.targetExamDate : `${settings.targetExamDate}T00:00:00`;
    const target = new Date(targetDateStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setCountdown({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [settings.targetExamDate]);

  // Calculations
  const trapsMastered = useMemo(() => {
    return allMistakes?.filter(m => m.reviewStage === 3).length || 0;
  }, [allMistakes]);

  const errorDist = useMemo(() => {
    if (!allMistakes || allMistakes.length === 0) return { p: 33, c: 33, m: 34 };
    const p = allMistakes.filter(m => m.subject === 'Physics').length;
    const c = allMistakes.filter(m => m.subject === 'Chemistry').length;
    const m = allMistakes.filter(m => m.subject === 'Mathematics').length;
    const total = p + c + m;
    return {
      p: Math.round((p / total) * 100) || 0,
      c: Math.round((c / total) * 100) || 0,
      m: Math.round((m / total) * 100) || 0,
    };
  }, [allMistakes]);

  const topTasks = todayTasks?.sort((a, b) => Number(a.completed) - Number(b.completed)).slice(0, 3) || [];

  const toggleTask = async (task: PlannerTask) => {
    await db.plannerTasks.update(task.id!, { completed: !task.completed });
  };

  const [quickTask, setQuickTask] = useState('');
  const handleAddQuickTask = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickTask.trim()) {
      await db.plannerTasks.add({
        date: todayStr,
        title: quickTask.trim(),
        subject: 'General',
        completed: false,
        priority: 1,
        createdAt: Date.now()
      });
      setQuickTask('');
    }
  };

  const formatTimeStr = (timeStr?: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  // Backlog Math
  const backlogStats = useMemo(() => {
    let totalLectures = 0;
    MANZIL_PLAYLISTS.forEach(p => totalLectures += p.lectures.length);

    if (totalLectures === 0 || !allLectureProgress) return { percent: 0, text: "0/0" };

    const completedLectures = allLectureProgress.filter(p => p.completed).length;
    return {
      percent: Math.round((completedLectures / totalLectures) * 100),
      text: `${completedLectures}/${totalLectures}`
    };
  }, [allLectureProgress]);

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* 1. Header & Live Techy Countdown */}
      <div className="flex flex-col gap-4 pt-2">
        <h2 className="text-3xl font-black tracking-tighter text-white">{greeting}</h2>

        {/* Architectural / Industrial HUD */}
        <div className="border border-zinc-800/80 bg-zinc-950 p-4 rounded-sm flex flex-col shadow-none">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800/80 pb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
            <span className="text-[10px] font-mono font-extralight tracking-widest text-zinc-400 uppercase">
              CHRONO // {settings.targetExamName.toUpperCase().replace(/\s+/g, '_')}
            </span>
          </div>

          <div className="flex justify-between items-stretch gap-px bg-zinc-800/80 p-px rounded-sm">
            {[
              { val: countdown.d, label: 'DAYS' },
              { val: countdown.h, label: 'HRS' },
              { val: countdown.m, label: 'MIN' },
              { val: countdown.s, label: 'SEC' }
            ].map((unit, i) => (
              <div key={i} className="flex-1 bg-zinc-950 flex flex-col items-center py-4">
                <span className="text-3xl sm:text-4xl font-mono font-extralight text-white tabular-nums tracking-widest">
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="mt-2 text-[10px] tracking-widest text-zinc-500 font-mono uppercase">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Quick Action Launchpad */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('fight')}
          className="col-span-2 bg-white text-black p-4 rounded-xl flex items-center justify-between hover:bg-zinc-200 transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2.5 rounded-full">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">Snap Question</h3>
              <p className="text-xs text-zinc-600 font-semibold tracking-wide">Enter Fight Mode</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-zinc-400" />
        </button>

        <button
          onClick={toggleTimer}
          className={`p-4 rounded-xl flex flex-col gap-3 transition-transform active:scale-[0.98] border ${
            isTimerRunning
              ? 'bg-zinc-900 border-zinc-700 animate-pulse'
              : 'bg-black border-zinc-800 hover:bg-zinc-900'
          }`}
        >
          <Play className={`w-6 h-6 ${isTimerRunning ? 'text-white fill-white' : 'text-zinc-400'}`} />
          <div className="text-left">
            <h3 className="font-bold text-sm text-white uppercase tracking-tight">
              {isTimerRunning ? 'Timer Running' : 'Start Focus'}
            </h3>
            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">3-Hour Block</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('backlog')}
          className="bg-black border border-zinc-800 hover:bg-zinc-900 p-4 rounded-xl flex flex-col gap-3 transition-transform active:scale-[0.98]"
        >
          <div className="flex justify-between w-full">
            <Video className="w-6 h-6 text-zinc-400" />
            <span className="text-[10px] font-bold font-mono text-zinc-400">{backlogStats.percent}%</span>
          </div>
          <div className="text-left w-full">
            <h3 className="font-bold text-sm text-white uppercase tracking-tight truncate">Backlog Hub</h3>
            <div className="w-full h-1 bg-zinc-900 rounded-full mt-1.5 overflow-hidden">
               <div className="h-full bg-white" style={{ width: `${backlogStats.percent}%` }}></div>
            </div>
          </div>
        </button>
      </div>

      {/* 3. Today's Orbit Glanceable Widgets */}
      <div className="flex flex-col gap-4">

        {/* A. Warmup Vault Status */}
        <div
          onClick={() => dueMistakes && dueMistakes.length > 0 && onNavigate('vault')}
          className={`p-5 rounded-xl border ${dueMistakes && dueMistakes.length > 0 ? 'bg-zinc-900 border-zinc-700 cursor-pointer hover:bg-zinc-800' : 'bg-black border-zinc-800'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${dueMistakes && dueMistakes.length > 0 ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
              {dueMistakes && dueMistakes.length > 0 ? <Zap className="w-6 h-6 fill-current" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-white font-bold tracking-tight mb-1">
                {dueMistakes === undefined ? 'Loading Vault...' :
                 dueMistakes.length > 0 ? `${dueMistakes.length} Traps Due for Review` :
                 'Vault cleared for today'}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {dueMistakes && dueMistakes.length > 0
                  ? 'Spend 8 mins before starting new topics to prime your memory.'
                  : 'No pending traps. Excellent memory maintenance.'}
              </p>
            </div>
          </div>
        </div>

        {/* B. Today's Schedule */}
        <div className="p-5 rounded-xl bg-black border border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-zinc-500" /> Today's Schedule
            </h3>
            <button onClick={() => onNavigate('calendar')} className="text-xs text-zinc-500 font-bold hover:text-white uppercase tracking-wider">View All</button>
          </div>
          <div className="space-y-3">
            {!todayEvents || todayEvents.length === 0 ? (
              <div className="text-xs text-zinc-500 italic py-2 border-l-2 border-zinc-800 pl-3">No scheduled events today • Free self-study day</div>
            ) : (
              todayEvents.sort((a,b) => (a.startTime||'').localeCompare(b.startTime||'')).slice(0, 3).map(e => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></div>
                  <div className="flex-1 truncate">
                    <span className="text-sm font-medium text-white mr-2">{e.title}</span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {e.isAllDay ? 'All Day' : formatTimeStr(e.startTime)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* C. Priority Battle List */}
        <div className="p-5 rounded-xl bg-black border border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-zinc-500" /> Priority Battle List
            </h3>
            <button onClick={() => onNavigate('planner')} className="text-xs text-zinc-500 font-bold hover:text-white uppercase tracking-wider">Plan</button>
          </div>

          <div className="space-y-3 mb-4">
            {!topTasks || topTasks.length === 0 ? (
              <div className="text-xs text-zinc-500 py-2">No active tasks. Add a target below.</div>
            ) : (
              topTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(task)}
                    className={`w-5 h-5 shrink-0 rounded flex items-center justify-center border transition-colors ${
                      task.completed ? 'bg-white border-white' : 'border-zinc-600 hover:border-white'
                    }`}
                  >
                    {task.completed && <CheckSquare className="w-3 h-3 text-black" />}
                  </button>
                  <span className={`text-sm truncate transition-colors ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>
                    {task.title}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="relative">
            <Plus className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={quickTask}
              onChange={(e) => setQuickTask(e.target.value)}
              onKeyDown={handleAddQuickTask}
              placeholder="Add quick target... (Press Enter)"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 4. Preparation Vital Signs */}
      <div className="bg-black border border-zinc-800 rounded-xl p-5 mt-2">
        <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Vital Signs</h3>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-3xl font-black text-white font-mono">{trapsMastered}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Traps Mastered</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white font-mono">{completedSessions * 3}<span className="text-lg text-zinc-600">h</span></div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Deep Work Today</div>
          </div>
        </div>

        {/* Error Distribution Bar */}
        <div>
          <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
            <span>Error Dist</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-white rounded-full"></span> Phy</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-zinc-500 rounded-full"></span> Chem</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-zinc-800 rounded-full"></span> Math</span>
            </div>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
            <div className="h-full bg-white transition-all duration-1000" style={{ width: `${errorDist.p}%` }}></div>
            <div className="h-full bg-zinc-500 transition-all duration-1000" style={{ width: `${errorDist.c}%` }}></div>
            <div className="h-full bg-zinc-800 transition-all duration-1000" style={{ width: `${errorDist.m}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
