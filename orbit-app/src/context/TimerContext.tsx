import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../db';

interface TimerContextType {
  timeLeft: number;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  completedSessions: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(10800); // 180 minutes = 10800 seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load completed sessions for today
    const loadTodaySessions = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const sessions = await db.focusSessions.where('date').equals(todayStr).toArray();
      setCompletedSessions(sessions.length);
    };
    loadTodaySessions();
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);

            // Log session completion to DB
            const todayStr = new Date().toISOString().split('T')[0];
            db.focusSessions.add({
              date: todayStr,
              durationMinutes: 180,
              createdAt: Date.now()
            }).then(() => {
              setCompletedSessions(s => s + 1);
            });

            return 10800; // Reset
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

  return (
    <TimerContext.Provider value={{ timeLeft, isTimerRunning, toggleTimer, resetTimer, completedSessions }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
