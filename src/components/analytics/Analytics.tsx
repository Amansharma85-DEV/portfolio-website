import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Task } from '../../types';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler
);

interface AnalyticsProps {
  tasks: Task[];
}

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#9ca3af', font: { size: 12 } } },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      borderWidth: 1,
      titleColor: '#f9fafb',
      bodyColor: '#9ca3af',
    },
  },
};

export default function Analytics({ tasks }: AnalyticsProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const overdue = tasks.filter(t =>
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
    ).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    const byPriority = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const completedByDay = last7.map(day => {
      const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      return tasks.filter(t =>
        t.completed_at &&
        new Date(t.completed_at) >= day &&
        new Date(t.completed_at) < nextDay
      ).length;
    });
    const dayLabels = last7.map(d => d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }));

    const createdByDay = last7.map(day => {
      const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      return tasks.filter(t =>
        new Date(t.created_at) >= day &&
        new Date(t.created_at) < nextDay
      ).length;
    });

    return { total, done, inProgress, todo, overdue, completionRate, byPriority, completedByDay, createdByDay, dayLabels };
  }, [tasks]);

  const statusData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{
      data: [stats.todo, stats.inProgress, stats.done],
      backgroundColor: ['#9ca3af', '#3b82f6', '#10b981'],
      borderColor: ['#d1d5db', '#60a5fa', '#34d399'],
      borderWidth: 1,
    }],
  };

  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [stats.byPriority.high, stats.byPriority.medium, stats.byPriority.low],
      backgroundColor: ['#f43f5e', '#f59e0b', '#10b981'],
      borderColor: ['#fb7185', '#fbbf24', '#34d399'],
      borderWidth: 1,
    }],
  };

  const activityData = {
    labels: stats.dayLabels,
    datasets: [
      {
        label: 'Completed',
        data: stats.completedByDay,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      },
      {
        label: 'Created',
        data: stats.createdByDay,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4,
      },
    ],
  };

  const barData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Total',
        data: [stats.byPriority.high, stats.byPriority.medium, stats.byPriority.low],
        backgroundColor: 'rgba(59,130,246,0.4)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Completed',
        data: [
          tasks.filter(t => t.priority === 'high' && t.status === 'done').length,
          tasks.filter(t => t.priority === 'medium' && t.status === 'done').length,
          tasks.filter(t => t.priority === 'low' && t.status === 'done').length,
        ],
        backgroundColor: 'rgba(16,185,129,0.4)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartCard = (title: string, children: React.ReactNode, delay = 0) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your productivity overview</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'text-gray-900 dark:text-white', bg: 'bg-gray-100 dark:bg-gray-800' },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Overdue', value: stats.overdue, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${item.bg} border border-gray-200 dark:border-gray-800 rounded-2xl p-4`}
          >
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {chartCard('Task Status Distribution', (
          <div className="h-48 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut
                data={statusData}
                options={{
                  ...CHART_DEFAULTS,
                  cutout: '65%',
                  plugins: { ...CHART_DEFAULTS.plugins, legend: { ...CHART_DEFAULTS.plugins.legend, position: 'right' as const } },
                }}
              />
            </div>
          </div>
        ), 0.1)}

        {chartCard('Priority Distribution', (
          <div className="h-48 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut
                data={priorityData}
                options={{
                  ...CHART_DEFAULTS,
                  cutout: '65%',
                  plugins: { ...CHART_DEFAULTS.plugins, legend: { ...CHART_DEFAULTS.plugins.legend, position: 'right' as const } },
                }}
              />
            </div>
          </div>
        ), 0.2)}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {chartCard('7-Day Activity', (
          <div className="h-48">
            <Line
              data={activityData}
              options={{
                ...CHART_DEFAULTS,
                scales: {
                  x: { ticks: { color: '#6b7280', maxRotation: 45 }, grid: { color: '#e5e7eb' } },
                  y: { ticks: { color: '#6b7280', stepSize: 1 }, grid: { color: '#e5e7eb' }, beginAtZero: true },
                },
              }}
            />
          </div>
        ), 0.3)}

        {chartCard('Completion by Priority', (
          <div className="h-48">
            <Bar
              data={barData}
              options={{
                ...CHART_DEFAULTS,
                scales: {
                  x: { ticks: { color: '#6b7280' }, grid: { color: '#e5e7eb' } },
                  y: { ticks: { color: '#6b7280', stepSize: 1 }, grid: { color: '#e5e7eb' }, beginAtZero: true },
                },
              }}
            />
          </div>
        ), 0.4)}
      </div>
    </div>
  );
}
