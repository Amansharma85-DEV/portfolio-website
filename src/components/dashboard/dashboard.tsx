import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Flame, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Task } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardProps {
  tasks: Task[];
  onViewChange: (v: 'tasks' | 'pomodoro' | 'analytics') => void;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-start gap-4"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function Dashboard({ tasks, onViewChange }: DashboardProps) {
  const { user } = useAuth();
  const firstName = user?.email?.split('@')[0] ?? 'there';

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
    const high = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, overdue, high, rate };
  }, [tasks]);

  const upcoming = useMemo(() => {
    const now = new Date();
    const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return tasks
      .filter(t => t.due_date && new Date(t.due_date) <= soon && t.status !== 'done')
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);
  }, [tasks]);

  const recentlyCompleted = useMemo(() =>
    tasks
      .filter(t => t.status === 'done' && t.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 5),
  [tasks]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}, {firstName}!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {stats.done} of {stats.total} tasks completed today &mdash; keep it up!
        </p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Overall Progress</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.rate}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.rate}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
          />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Completed" value={stats.done} color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={Clock} label="In Progress" value={stats.inProgress} color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
        <StatCard icon={Flame} label="High Priority" value={stats.high} color="bg-rose-500/10 text-rose-600 dark:text-rose-400" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Upcoming Due
            </h2>
            <button
              onClick={() => onViewChange('tasks')}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              View all
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">No upcoming tasks</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(task => {
                const due = new Date(task.due_date!);
                const isOverdue = due < new Date();
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      task.priority === 'high' ? 'bg-rose-500' :
                      task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{task.title}</p>
                    </div>
                    <span className={`text-xs shrink-0 ${isOverdue ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500'}`}>
                      {due.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recently Completed */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Recently Completed
            </h2>
          </div>
          {recentlyCompleted.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">No completed tasks yet</p>
          ) : (
            <div className="space-y-3">
              {recentlyCompleted.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 dark:text-gray-300 line-through truncate">{task.title}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {new Date(task.completed_at!).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Start a Pomodoro', sub: 'Focus session', view: 'pomodoro' as const, color: 'from-rose-500/10 to-orange-500/10 border-rose-500/20 hover:border-rose-500/40', icon: Timer },
          { label: 'Add a Task', sub: 'Stay organized', view: 'tasks' as const, color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40', icon: CheckCircle2 },
          { label: 'View Analytics', sub: 'Track progress', view: 'analytics' as const, color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/40', icon: TrendingUp },
        ].map(({ label, sub, view, color, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`bg-gradient-to-br ${color} border rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.02]`}
          >
            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
          </button>
        ))}
      </motion.div>
    </div>
  );
}

function Timer({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

