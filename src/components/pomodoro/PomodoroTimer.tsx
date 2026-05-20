import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Zap, Moon } from 'lucide-react';
import { usePomodoro } from '../../hooks/usePomodoro';
import { Task } from '../../types';

interface PomodoroTimerProps {
  tasks: Task[];
}

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PomodoroTimer({ tasks }: PomodoroTimerProps) {
  const {
    mode, switchMode, running,
    start, pause, reset,
    minutes, seconds, progress,
    sessions, sessionCount, activeTaskId, setActiveTaskId,
  } = usePomodoro();

  const incompleteTasks = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const modeConfig = {
    work: { label: 'Focus', color: 'text-blue-600 dark:text-blue-400', stroke: '#3b82f6', bg: 'bg-blue-500/10' },
    short_break: { label: 'Short Break', color: 'text-emerald-600 dark:text-emerald-400', stroke: '#10b981', bg: 'bg-emerald-500/10' },
    long_break: { label: 'Long Break', color: 'text-cyan-600 dark:text-cyan-400', stroke: '#06b6d4', bg: 'bg-cyan-500/10' },
  };

  const cfg = modeConfig[mode];

  const completedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions.filter(s => s.completed && new Date(s.started_at) >= today).length;
  }, [sessions]);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pomodoro Timer</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">ss{completedToday} sessions completed today &bull; {sessionCount} this session</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-1.5">
        {([
          { key: 'work', icon: Zap, label: 'Focus' },
          { key: 'short_break', icon: Coffee, label: 'Short Break' },
          { key: 'long_break', icon: Moon, label: 'Long Break' },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all ${
              mode === key
                ? `${modeConfig[key].bg} ${modeConfig[key].color} border border-current/20`
                : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="220" height="220" className="-rotate-90">
            <circle
              cx="110" cy="110" r={RADIUS}
              fill="none"
              stroke={document.documentElement.classList.contains('dark') ? '#1f2937' : '#e5e7eb'}
              strokeWidth="8"
            />
            <motion.circle
              cx="110" cy="110" r={RADIUS}
              fill="none"
              stroke={cfg.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className={`text-sm font-medium mt-1 ${cfg.color}`}>{cfg.label}</span>
            {running && <div className="mt-2 flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full`}
                  style={{ backgroundColor: cfg.stroke }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-600 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={running ? pause : start}
          className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 transition-all"
        >
          {running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </motion.button>
        <div className="w-12 h-12" />
      </div>

      {/* Task Selection */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Working on</label>
        <select
          value={activeTaskId ?? ''}
          onChange={e => setActiveTaskId(e.target.value || null)}
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">Select a task...</option>
          {incompleteTasks.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {/* Session History */}
      {sessions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Sessions</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sessions.slice(0, 10).map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.completed ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <span className="text-xs text-gray-700 dark:text-gray-300">{s.duration_minutes} min session</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(s.started_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
