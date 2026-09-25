import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { PlannerTask } from '../db';
import { CheckSquare, Plus, Clock, Play, Square, RotateCcw, Target } from 'lucide-react';

const PRESETS = [
  { title: 'Solve 30 PYQs', subject: 'General' },
  { title: 'Revise Short Notes', subject: 'General' },
  { title: 'Analyze Last Test', subject: 'General' },
  { title: 'Mechanics Practice', subject: 'Physics' },
  { title: 'Organic Reaction Mech', subject: 'Chemistry' },
  { title: 'Calculus Revision', subject: 'Mathematics' }
] as const;

export const Planner: React.FC = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState<PlannerTask['subject']>('General');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Timer state (180 minutes = 10800 seconds)
  const [timeLeft, setTimeLeft] = useState(10800);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const tasks = useLiveQuery(
    () => db.plannerTasks.where('date').equals(filterDate).toArray(),
    [filterDate]
  ) || [];

  const handleAddTask = async (title: string, subject: PlannerTask['subject']) => {
    if (!title.trim()) return;
    await db.plannerTasks.add({
      date: filterDate,
      title: title.trim(),
      subject,
      completed: false,
      priority: 1,
      createdAt: Date.now()
    });
    setNewTaskTitle('');
  };

  const toggleTask = async (task: PlannerTask) => {
    await db.plannerTasks.update(task.id!, { completed: !task.completed });
  };

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            setCompletedSessions(s => s + 1);
            return 10800;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(10800);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* 3-Hour Focus Timer */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
          <div
            className="h-full bg-white transition-all duration-1000 ease-linear"
            style={{ width: `${((10800 - timeLeft) / 10800) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-zinc-500 mb-4">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">JEE Focus Block (3 Hours)</span>
        </div>

        <div className="text-6xl font-black text-white tracking-tighter tabular-nums mb-6 font-mono">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={toggleTimer}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isTimerRunning ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isTimerRunning ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-14 h-14 rounded-full border border-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-black px-3 py-1.5 rounded-full border border-zinc-800">
          <Target className="w-3 h-3" />
          Completed Sessions Today: {completedSessions}
        </div>
      </div>

      {/* Daily Planner */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <CheckSquare className="w-5 h-5" />
            Daily Planner
          </h2>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="bg-black border border-zinc-800 text-sm text-white rounded px-2 py-1 focus:outline-none"
          />
        </div>

        {/* Task Entry */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask(newTaskTitle, newTaskSubject)}
            placeholder="Add a new task..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-white transition-colors"
          />
          <select
            value={newTaskSubject}
            onChange={e => setNewTaskSubject(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-2 text-white text-xs focus:outline-none focus:border-white transition-colors"
          >
            {['General', 'Physics', 'Chemistry', 'Mathematics'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => handleAddTask(newTaskTitle, newTaskSubject)}
            className="bg-white text-black p-2 rounded-md hover:bg-zinc-200 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Presets (only show if today) */}
        {filterDate === todayStr && tasks.length < 5 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleAddTask(p.title, p.subject)}
                className="text-[10px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 rounded hover:text-white hover:bg-zinc-800 transition-colors"
              >
                + {p.title}
              </button>
            ))}
          </div>
        )}

        {/* Task List */}
        <div className="flex-1 space-y-2 overflow-y-auto mt-4">
          {tasks.length === 0 ? (
            <div className="text-center py-10 text-zinc-600 text-sm font-medium">No tasks for this day.</div>
          ) : (
            tasks.sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt).map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-md border transition-all ${
                  task.completed
                    ? 'bg-zinc-950/50 border-zinc-900 opacity-50'
                    : 'bg-black border-zinc-800'
                }`}
              >
                <button
                  onClick={() => toggleTask(task)}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                    task.completed
                      ? 'bg-white border-white'
                      : 'bg-transparent border-zinc-600 hover:border-white'
                  }`}
                >
                  {task.completed && <CheckSquare className="w-3 h-3 text-black" />}
                </button>
                <div className="flex-1 flex flex-col justify-center">
                  <span className={`text-sm font-medium transition-all ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                    {task.title}
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded">
                  {task.subject}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
