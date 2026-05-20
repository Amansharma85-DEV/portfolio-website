import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthPage from './components/auth/AuthPage';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import KanbanBoard from './components/tasks/KanbanBoard';
import PomodoroTimer from './components/pomodoro/PomodoroTimer';
import Analytics from './components/analytics/Analytics';
import Settings from './components/settings/Settings';
import { useTasks, useCategories } from './hooks/useTasks';
import { View, Task } from './types';

function AppShell() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { tasks, addTask, updateTask, deleteTask, completeTask, moveTask } = useTasks();
  const { categories } = useCategories();

  const handleAddTask = (data: Partial<Task>) => {
    if (data.title) {
      addTask(data as Partial<Task> & { title: string });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Sidebar
        currentView={view}
        onViewChange={setView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        taskCount={tasks.filter(t => t.status !== 'done').length}
      />

      <main className="flex-1 overflow-auto">
        {view === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            onViewChange={(v) => setView(v)}
          />
        )}
        {view === 'tasks' && (
          <KanbanBoard
            tasks={tasks}
            categories={categories}
            onAdd={handleAddTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onComplete={completeTask}
            onMove={moveTask}
          />
        )}
        {view === 'pomodoro' && (
          <PomodoroTimer tasks={tasks} />
        )}
        {view === 'analytics' && (
          <Analytics tasks={tasks} />
        )}
        {view === 'settings' && (
          <Settings />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
