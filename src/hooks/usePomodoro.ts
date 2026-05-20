import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PomodoroSession } from '../types';

type TimerMode = 'work' | 'short_break' | 'long_break';

const DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export function usePomodoro() {
  const { user } = useAuth();
  const [mode, setMode] = useState<TimerMode>('work');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const sessionStartRef = useRef<string | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setSessions(data as PomodoroSession[] ?? []));
  }, [user]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const switchMode = useCallback((m: TimerMode) => {
    clearTimer();
    setRunning(false);
    setMode(m);
    setSecondsLeft(DURATIONS[m]);
  }, [clearTimer]);

  const handleComplete = useCallback(async () => {
    clearTimer();
    setRunning(false);

    if (mode === 'work' && user && currentSessionIdRef.current) {
      const ended = new Date().toISOString();
      await supabase
        .from('pomodoro_sessions')
        .update({ completed: true, ended_at: ended })
        .eq('id', currentSessionIdRef.current);
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      setSessions(prev => prev.map(s =>
        s.id === currentSessionIdRef.current ? { ...s, completed: true, ended_at: ended } : s
      ));
      currentSessionIdRef.current = null;
      // Auto switch to break
      switchMode(newCount % 4 === 0 ? 'long_break' : 'short_break');
    } else {
      switchMode('work');
    }
  }, [clearTimer, mode, sessionCount, switchMode, user]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [running, handleComplete, clearTimer]);

  const start = async () => {
    if (!user || mode !== 'work') {
      setRunning(true);
      return;
    }
    const started = new Date().toISOString();
    sessionStartRef.current = started;
    const { data } = await supabase
      .from('pomodoro_sessions')
      .insert({
        user_id: user.id,
        task_id: activeTaskId,
        duration_minutes: 25,
        completed: false,
        started_at: started,
      })
      .select()
      .single();
    if (data) {
      currentSessionIdRef.current = data.id;
      setSessions(prev => [data as PomodoroSession, ...prev]);
    }
    setRunning(true);
  };

  const pause = () => {
    clearTimer();
    setRunning(false);
  };

  const reset = () => {
    clearTimer();
    setRunning(false);
    setSecondsLeft(DURATIONS[mode]);
    currentSessionIdRef.current = null;
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / DURATIONS[mode];

  return {
    mode, switchMode, secondsLeft, running,
    start, pause, reset,
    minutes, seconds, progress,
    sessions, sessionCount, activeTaskId, setActiveTaskId,
  };
}